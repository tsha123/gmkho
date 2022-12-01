const prefixApi = '/api/order/admin';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelDebt} from '../../models/Debt.js'
import {ModelWarehouse} from '../../models/Warehouse.js'
import {ModelProduct} from '../../models/Product.js'
import {ModelUser} from '../../models/User.js'
import {ModelEmployee} from '../../models/Employee.js'
import {ModelSubCategory} from '../../models/SubCategory.js'
import {ModelOrder} from '../../models/Order.js'
import {ModelExportForm} from '../../models/ExportForm.js'
import {ModelReceive} from '../../models/Receive.js'
import {ModelFundBook} from '../../models/FundBook.js'
import {getWarehouseByBranch , getWarehouseOtherBranch} from './../ControllerWarehouse/index.js'
import {get_employee } from './../ControllerEmployee/index.js'
import { getFundbookByBranch } from './../ControllerFundBook/index.js'
import {checkCodeDiscountReturnError , update_status_voucher} from '../ControllerVoucher/index.js'
import {checkPointReturnZero, update_point_user} from '../ControllerPoint/index.js'
import {ModelNotificationUser} from '../../models/Notification_User.js'


export const management = async (app)=>{
    app.get(prefixApi,  helper.authenToken, async (req, res)=>{
        try
        {
            const id_branch = validator.ObjectId(req.body._caller.id_branch_login)
            let query = {}
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } },{ createdAt: { $lte:validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay  } }]
                }
            }
            
            if (validator.isDefine(req.query.order_status)) {
                query = {
                    ...query,
                    order_status:req.query.order_status
                }
            }
            if (validator.isDefine(req.query.key)) {
                query = {
                    ...query,
                    $or: [{ "user.user_fullname":{$regex:".*"+req.query.key+".*", $options:"$i"}},{"user.user_phone":{$regex:".*"+req.query.key+".*", $options:"$i"}},{"order_product.subcategory_name":{$regex:".*"+req.query.key+".*", $options:"$i"}}]
                }
            }
            if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
                query = {_id: validator.ObjectId(req.query.key)}
                    
            }
            query = {
                ...query,
                id_branch: id_branch
            }

            const data = await ModelOrder.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as:"user"
                    }
                }, 
                {
                    $match:query
                },
                {
                    $sort: {
                        _id:-1
                    }
                }
            ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))

            const count = await ModelOrder.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as:"user"
                    }
                }, {
                    $match:query
                },
                {
                    $count:"count"
                }
            ])
           
            await Promise.all( data.map(async order => {
                
                order.user_fullname = order.user[0].user_fullname
                order.user_phone = order.user[0].user_phone
                order.fundbook_name = ""
                order.receive_money = 0
                delete order.user

                if (validator.ObjectId.isValid(order.id_export_form)) {
                    const dataExport = await ModelExportForm.findById(order.id_export_form)
                    if (dataExport && dataExport.export_form_status_paid) {
                        const dataReceive = await ModelReceive.findOne({ id_form: dataExport._id })
                        if (dataReceive) {
                            order.receive_money = dataReceive.receive_money
                            const dataFund = await ModelFundBook.findById(dataReceive.id_fundbook)
                            if(dataFund) order.fundbook_name = dataFund.fundbook_name
                        }
                    }
                }

                if(order.id_export_form){
                    const dataExport = await ModelExportForm.findById(order.id_export_form)
                  
                    if(dataExport){              
                        order.id_employee_manager = dataExport.id_employee_manager
                    }
                }
            }))
            var employees = null
           
            if(validator.isDefine(req.query.get_other) && req.query.get_other === 'true'){
                employees = await get_employee(id_branch)
            }

            return res.json({data:data , count: count.length > 0?count[0].count:0, employees:employees})
            
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const checkPermissionExport = async(app)=>{
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi+"/checkPermission/export" , helper.authenToken, async (req, res)=>{
        try
        {
            if (!await helper.checkPermission("621ee03865df76e0f9fecc0b", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const fundbooks = await getFundbookByBranch(req.body._caller.id_branch_login)
            const id_order = req.query.id_order
            if (!validator.ObjectId.isValid(id_order)) return res.status(400).send("Thất bại! Không tìm thấy đơn đề xuất")
            const dataOrder = await ModelOrder.findById(id_order)
            if (!dataOrder) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            if (dataOrder.order_status != "Chưa xử lý") return res.status(400).send("Thất bại! Phiếu này đã được xử lý, không thể xuất thêm")
            const dataUser = await ModelUser.findById(dataOrder.id_user)
            if (!dataOrder) return res.status(400).send("Thất bại! Không tìm thấy khách hàng")
            dataOrder.user_fullname = dataUser.user_fullname
            dataOrder.user_phone = dataUser.user_phone
            dataOrder.user_address = dataUser.user_address
            dataOrder.user_point = dataUser.user_point
            return res.json({fundbooks:fundbooks, dataOrder:dataOrder})
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        } 
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng

}

export const confirmExport = async (app) => {
    app.post(prefixApi +"/export", helper.authenToken, async (req, res)=>{
        try
        {
            if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
          
            const id_order = req.body.id_order
            if (!validator.ObjectId.isValid(id_order)) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            const dataOrder = await ModelOrder.findById(id_order)
            if (!dataOrder) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            if(dataOrder.order_status != "Chưa xử lý") return res.status(400).send("Thất bại! Đơn này đã được xử lý, không thể xuất")
         
            const id_branch = req.body._caller.id_branch_login
            const id_user = req.body.id_user
            const type_export = req.body.type_export
            const point_number = validator.tryParseInt(req.body.point_number)
            const id_employee_setting = req.body.id_employee_setting
            const export_form_note = req.body.export_form_note
            const receive_money = validator.tryParseInt(req.body.receive_money)
            const arrProduct = JSON.parse(req.body.arrProduct)
            const id_fundbook = req.body.id_fundbook
            const id_employee = req.body._caller._id
            const dataUser = await ModelUser.findById(id_user)
            if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")



            const dataFundbook = await ModelFundBook.findById(id_fundbook)
            if(!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ") 
            if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất một sản phẩm")
            for (let i = 0; i < arrProduct.length; i++){  // kiểm tra xem có bị trùng lặp id sản phẩm ko
                for (let j = i + 1; j < arrProduct.length; j++){
                    if (arrProduct[i].id_product == arrProduct[j].id_product) return res.status(400).send(`Thất bại! Mã sản phẩm ${arrProduct[j].id_product} bị lặp trùng`)
                }
            }
            var id_warehouse = null
            let totalPoint = 0
            // bắt đầu tìm kiếm sản phẩm và kiểm tra
            for (let i = 0; i < arrProduct.length; i++){  // kiểm tra xem có bị trùng lặp id sản phẩm ko
                const product = await ModelProduct.findById(arrProduct[i].id_product)
                if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
                if (product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} đã được xuất kho`)

                if (i == 0) id_warehouse = product.id_warehouse
          
                const sub_category = await ModelSubCategory.findById(product.id_subcategory)
                if (!sub_category) return res.status(400).send(`Thất bại! Không tìm thấy tên của sản phẩm ${product._id}`)
                if (product.id_warehouse.toString() != id_warehouse.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${product._id} không cùng kho được đê xuất `) 
                arrProduct[i].id_product2 = product.id_product2
                arrProduct[i].id_subcategory = product.id_subcategory
                arrProduct[i].subcategory_name = sub_category.subcategory_name
                arrProduct[i].subcategory_part = sub_category.subcategory_part
                arrProduct[i].subcategory_point = sub_category.subcategory_point
                arrProduct[i].product_import_price = product.product_import_price

                if(validator.ObjectId.isValid(dataOrder.order_product[0].id_employee))
                    arrProduct[i].id_employee = dataOrder.order_product[0].id_employee
                totalPoint += sub_category.subcategory_point
            }
            const total = validator.calculateMoneyExport(arrProduct)
            const money_voucher_code = dataOrder.money_voucher_code
            const money_point = dataOrder.money_point
            const data_warehouse = await ModelWarehouse.findById(id_warehouse)
            if (!data_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của sản phẩm")
        
            if(data_warehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho của sản phâm không thuộc chi nhánh này")
            const is_payment = true // trạng thái đã thanh toán chưa của phiếu xuất
          
            
            const insertFormExport = await new ModelExportForm({  // tạo phiếu xuất trước
                id_warehouse: data_warehouse._id,
                id_employee: id_employee,
                id_user: dataUser._id,
                export_form_status_paid:is_payment,
                export_form_product:  arrProduct,
                export_form_note:export_form_note,
                export_form_type:type_export,
                point_number: point_number,
                voucher_code: dataOrder.voucher_code,
                money_voucher_code: money_voucher_code,
                money_point: money_point,
                id_employee_setting:id_employee_setting,
                id_employee_create:arrProduct[0].id_employee,
                export_status:validator.ObjectId.isValid(id_employee_setting)? validator.ARRAY_STATUS_EXPORT[2]:validator.ARRAY_STATUS_EXPORT[1] // chờ lấy hàng là đã xuất hàng, còn lại là chờ lắp đ
                // createdAt: validator.dateTimeZone().currentTime
            }).save()

            const insertDebt = await new ModelDebt({  // tạo công nợ
                    id_user: dataUser._id,// tên nhân viên
                    id_branch: id_branch,
                    id_employee: id_employee,
                    debt_money_receive: receive_money + money_point + money_voucher_code ,
                    debt_money_export: total,
                    debt_note: export_form_note,
                    debt_type:"export",
                    id_form: insertFormExport._id,
            }).save()
           
                const receive = await ModelReceive({
                    id_user: dataUser._id,// người dùng
                    receive_money: receive_money,
                    receive_type:"export", // loại chi từ : import (phiếu nhập ), export(phiếu xuất)
                    id_employee: id_employee,
                    id_branch: id_branch,
                    receive_content: "61fe7ec950262301a2a39fcc",
                    id_form: insertFormExport._id, // id từ mã phiếu tạo (phiếu nhập , xuất . ..)
                    receive_note: export_form_note, // ghi chú
                    id_fundbook: dataFundbook._id,
                }).save()
            
            
                
            for (let i = 0; i < arrProduct.length; i++){
                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product,{
                    $set:{
                        product_status:true, product_warranty: arrProduct[i].product_warranty ,id_export_form: insertFormExport._id
                    },
                    $push:{
                        product_note:`${insertFormExport._id}`
                    }
                })
            }
        
            if (total <= (money_point + money_voucher_code + receive_money)) {
                await ModelUser.findByIdAndUpdate(id_user,{$inc:{user_point: totalPoint}})
            }
            await ModelOrder.findByIdAndUpdate(dataOrder._id, {
                order_status: validator.ARRAY_STATUS_ORDER[1],
                id_export_form: insertFormExport._id,
                order_product:arrProduct
            })

            await new ModelNotificationUser({
                notification_title:"Thông báo",
                notification_content:`Đơn hàng của bạn đang được lắp đặt. Mã đơn hàng của bạn là ${dataOrder._id}`,
                notification_time: new Date(),
                id_from:dataOrder._id,
                notification_type:"Order",
                notification_topic: dataOrder.order_phone,
                id_user: dataUser._id
            }).save()
            validator.notifyTopic(dataUser.user_phone,"Thông báo",`Đơn hàng của bạn đang được lắp đặt. Mã đơn hàng của bạn là ${dataOrder._id}`)
            return res.json(insertFormExport)

            }
            catch(e)
            {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            } 
    })
}
export const updateStatus = async(app)=>{
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.put(prefixApi+"/status" , helper.authenToken, async (req, res)=>{
        try
        {
            if (!await helper.checkPermission("621ee03865df76e0f9fecc0b", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
           
            const id_order = req.body.id_order
            if (!validator.ObjectId.isValid(id_order)) return res.status(400).send("Thất bại! Không tìm thấy đơn hàng")
            const dataOrder = await ModelOrder.findById(id_order)
            if (!dataOrder) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            if (dataOrder.order_status != "Đang giao hàng") return res.status(400).send("Thất bại! Phiếu này chưa xuất hàng, không thể chuyển sang hoàn thành")
            const dataUser = await ModelUser.findById(dataOrder.id_user)
            const updateS = await ModelOrder.findByIdAndUpdate(dataOrder._id, {
                order_status:"Hoàn thành"
            })
            await new ModelNotificationUser({
                notification_title:"Thông báo",
                notification_content:`Đơn hàng của bạn đã hoàn thành. Mã đơn hàng của bạn là ${dataOrder._id}`,
                notification_time: new Date(),
                id_from:dataOrder._id,
                notification_type:"Order",
                notification_topic: dataOrder.order_phone,
                id_user: dataUser._id
            }).save()
            validator.notifyTopic(dataUser.user_phone,"Thông báo",`Đơn hàng của bạn đã hoàn thành. Mã đơn hàng của bạn là ${dataOrder._id}`)
            return res.json(updateS)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        } 
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng

}

export const insert = async (app) => {
    app.post(prefixApi,  helper.authenToken, async (req, res)=>{
        try
        {
      
            console.log(req.body)
            const id_user = req.body.id_user
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy khách hàng")
            const arrProduct = JSON.parse(req.body.arrProduct)
            const voucher_code = req.body.voucher_code === 'null'?null:req.body.voucher_code
            const point_number = validator.tryParseInt(req.body.point_number)
            const note = req.body.note
            const id_employee = req.body._caller._id
            var money_voucher_code = 0
            var money_point = 0
            if (arrProduct.length == 0) return res.status(400).send("Hãy thêm ít nhất 1 sản phẩm")
        
           const arrOrderProduct = []
            for (let i = 0; i < arrProduct.length; i++){
             
                const dataSub = await ModelSubCategory.findById(arrProduct[i].id_subcategory)
                if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")
                for (let j = 0; j < arrProduct[i].product_quantity; j++){
                    arrOrderProduct.push({
                        id_subcategory: dataSub._id,
                        subcategory_name: dataSub.subcategory_name,
                        subcategory_image: dataSub.subcategory_images,
                        product_export_price: arrProduct[i].product_export_price,
                        product_vat: arrProduct[i].product_vat,
                        product_ck: arrProduct[i].product_ck,
                        product_discount:arrProduct[i].product_discount,
                        product_warranty:arrProduct[i].subcategory_warranty,
                        subcategory_point:  dataSub.subcategory_point,
                        subcategory_part: dataSub.subcategory_part,
                        product_quantity:1,
                        id_employee: id_employee
                    })
                }
                
            }
            const totalMoney = validator.calculateMoneyExport(arrOrderProduct)
            if (voucher_code && voucher_code.length > 0) {
                money_voucher_code = await checkCodeDiscountReturnError(voucher_code, totalMoney)
                if(isNaN(money_voucher_code)) return res.status(400).send(money_voucher_code)
            }
            if (point_number > 0) {
                money_point = await checkPointReturnZero(id_user, point_number)
                if(isNaN(money_point)) return res.status(400).send(money_point)
            }

            const insertOrder = await new ModelOrder({
                id_branch: req.body._caller.id_branch_login,
                id_user: dataUser._id,
                order_product: arrOrderProduct,
                order_status: "Chưa xử lý",
                voucher_code: voucher_code,
                point_number: point_number,
                money_voucher_code: money_voucher_code,
                money_point: money_point,
                order_address: dataUser.user_address,
                order_phone: dataUser.user_phone,
                order_note:note
            }).save()

            if (voucher_code && voucher_code.length > 0) {
                await update_status_voucher(voucher_code)
            }
            if (point_number > 0) {
                await ModelUser.findByIdAndUpdate(id_user, {
                    $inc: { user_point: -point_number }
                })
            }
           
            return res.json(insertOrder)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}

export const tranfer_employee = async (app) => {
    app.put(prefixApi +"/tranfer-employee-manager",  helper.authenToken, async (req, res)=>{
        try
        {        
            const id_employee = req.body.id_employee
            const id_order = req.body.id_order

            const dataOrder = await ModelOrder.findById(id_order)
            if(!dataOrder) return res.status(400).send("Thất bại! không tìm thấy đơn đặt hàng")

            if(dataOrder.order_status == validator.ARRAY_STATUS_ORDER[0]) return res.status(400).send(`Phiếu này chưa xuất hàng! Không thể chuyển giao.`)
            if( !dataOrder.id_export_form && !validator.ObjectId.isValid(dataOrder.id_export_form)) return res.status(400).send(`Thất bại! Phiếu chưa xuất, không thể chuyển giao.`)

            const dataExport = await ModelExportForm.findById(dataOrder.id_export_form)
            if(!dataExport) return res.status(400).send(`Thất bại! Không tìm thấy phiếu xuất của đơn hàng`)

            const dataEm = await ModelEmployee.findById(id_employee)
            if(!dataEm) return res.status(400).send(`Thất bại! không tìm thấy nhân viên cần chuyển giao`)
            if(!dataEm.employee_status) return res.status(400).send(`Thất bại! Nhân viên này không còn hoạt đông, Không thể chuyển giao`)
            
            const dataUpdate =  await ModelExportForm.findByIdAndUpdate(dataExport._id,{
                id_employee_manager:id_employee
            })
            return res.json(dataUpdate)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}

export const get_order_by_type_employee = async (app) => {
    app.get(prefixApi+"/creater",  helper.authenToken, async (req, res)=>{
        get_order_by_employee_creater(req, res)
    })
    app.get(prefixApi+"/manager",  helper.authenToken, async (req, res)=>{
        get_order_by_employee(req, res, "id_employee_manager")
    })
    app.get(prefixApi+"/installer",  helper.authenToken, async (req, res)=>{
        get_order_by_employee(req, res, "id_employee_setting")
    })
    app.get(prefixApi+"/shipper",  helper.authenToken, async (req, res)=>{
        get_order_by_employee(req, res, "id_employee_tranfer")
    })

}
export const update_action = async (app) => {
    app.put(prefixApi+"/tranfer-to-employee-setting",  helper.authenToken, async (req, res)=>{
        tranfer_to_employee_setting(req, res)
    })
    app.put(prefixApi+"/tranfer-to-employee-transport",  helper.authenToken, async (req, res)=>{
        tranfer_to_employee_transport(req, res)
    })
    app.put(prefixApi+"/update-status-admin",  helper.authenToken, async (req, res)=>{
        update_status_admin(req, res)
    })
}

// const get_order_by_employee_manager = async (req, res) =>{
//     get_order_by_employee(req, res)
// }


const get_order_by_employee_creater = async (req, res) =>{
    try
    {        
        const id_employee = req.body._caller._id
        const status = req.query.status
        const fromdate = req.query.fromdate
        const todate = req.query.todate

        let query = {
                "order_product.id_employee": validator.ObjectId(id_employee),
                ...validator.query_createdAt(fromdate, todate),
            }
        if(validator.isDefine(status) && status.length > 0){
            query = {
                ...query,
                order_status:status
            }
        }
        const key = req.query.key
        let query_key = {}
        if(validator.isDefine(key)){
            query_key = {
                $or:[
                    {"user.user_fullname":{$regex:".*"+key+".*",$options:"$i"}},
                    {order_address:{$regex:".*"+key+".*",$options:"$i"}},
                    {order_phone:{$regex:".*"+key+".*"}},
                    {order_note:{$regex:".*"+key+".*",$options:"$i"}},
                ] 
            }
        }
        let sort = {_id:-1}
        const data = await ModelOrder.aggregate([
            {
                $match:query
            },
            {
                $lookup:{
                    from:"users",
                    localField:"id_user",
                    foreignField:"_id",
                    as:"user"
                }
            },{
                $unwind:{
                    path:"$user"
                }
            },{
                $match:query_key
            },
            {
                $sort: sort
            }
        ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))
        for(let i =0;i<data.length;i++){

            data[i].user_fullname = ""
            if(data[i].user){
                data[i].user_fullname = data[i].user.user_fullname
            }
            delete data[i].user

            data[i].total_money = validator.calculateMoneyExport(data[i].order_product)
        }
        return res.json(data)
    }
    catch(e)
    {
        console.error(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}

const get_order_by_employee = async (req, res ,condition)=>{
    try
    {     
        const id_employee = req.body._caller._id
        const status = req.query.status
        const fromdate = req.query.fromdate
        const todate = req.query.todate
       
        let query = {
            [condition]: validator.ObjectId(id_employee),
            ...validator.query_createdAt(fromdate, todate),
        }
        let query_status = {}
        if(validator.isDefine(status) && status.length > 0){
            query_status = {
                ...query_status,
                export_status:status
            }
        }
        const key = req.query.key
        let query_key = {}
        if(validator.isDefine(key)){
            query_key = {
                $or:[
                    {"user.user_fullname":{$regex:".*"+key+".*",$options:"$i"}},
                    {"order.order_address":{$regex:".*"+key+".*",$options:"$i"}},
                    {"order.order_phone":{$regex:".*"+key+".*"}},
                    {"order.order_note":{$regex:".*"+key+".*",$options:"$i"}},
                ] 
            }
        }
 
        let sort = {_id:-1}
        
        const data = await ModelExportForm.aggregate([
            {
                $match:{
                    ...query,
                    ...query_status
                }
            },
            {
                $lookup:{
                    from:"orders",
                    localField:"_id",
                    foreignField:"id_export_form",
                    as:"order"
                }
            },
            {
                $unwind:{
                    path:"$order"
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"id_user",
                    foreignField:"_id",
                    as:"user"
                }
            },
            {
                $unwind:{
                    path:"$user"
                }
            },
            {
                $match:query_key
            },
            {
                $sort: sort
            }
        ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))
        for(let i =0;i<data.length;i++){
            data[i].user_fullname = ""        
            if(data[i].user){
                data[i].user_fullname = data[i].user.user_fullname
            }
            delete data[i].user

            data[i].order_address = ""        
            data[i].order_phone = ""        
            data[i].order_note = ""        
            if(data[i].order){
                data[i].order_address = data[i].order.order_address
                data[i].order_phone = data[i].order.order_phone
                data[i].order_note = data[i].order.order_note
            }
            delete data[i].order

            data[i].total_money = validator.calculateMoneyExport(data[i].export_form_product)

            for(let j = 0;j<data[i].export_form_product.length;j++){
                data[i].export_form_product[j].subcategory_image = []
                const dataSub = await ModelSubCategory.findById(data[i].export_form_product[j].id_subcategory)
                if(dataSub){
                    data[i].export_form_product[j].subcategory_image = dataSub.subcategory_images
                }
                
            }
        }
        return res.json(data)
    }
    catch(e)
    {
        console.error(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}

const tranfer_to_employee_setting = async (req, res )=>{
    try
    {     
       const id_export = req.body.id_export // _id phiếu xuất
       const id_emplooyee_manager = req.body._caller._id
       const id_employee = req.body.id_employee // id nhân viên cần chuyển đến
       const dataExport = await ModelExportForm.findById(id_export)
       if(!dataExport) return res.status(400).send(`Thất bại! Không tìm thấy phiếu xuất`)

       if(dataExport.id_employee_manager.toString() != id_emplooyee_manager.toString()) return res.status(400).send(`Thất bại! Bạn không thuộc quyền quản lý của đơn này.`)
       
       if(dataExport.export_status != validator.ARRAY_STATUS_EXPORT[1]){
           return res.status(400).send(`Thất bại! Đơn hàng ${dataExport.export_status} không thể chuyển giao tiếp`)
       }
       const dataEm = await ModelEmployee.findById(id_employee)
       if(!dataEm) return res.status(400).send(`Thất bại! Không tìm thấy nhân viên`)

       const dataUpate = await ModelExportForm.findByIdAndUpdate(dataExport._id,{
            id_employee_setting:dataEm._id,
            export_status: validator.ARRAY_STATUS_EXPORT[2]
       })
       return res.json("Chuyển giao thành công")
    }
    catch(e)
    {
        console.error(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}

const tranfer_to_employee_transport = async (req, res )=>{
    try
    {     
       const id_export = req.body.id_export // _id phiếu xuất
       const id_emplooyee_manager = req.body._caller._id
       const id_employee = req.body.id_employee // id nhân viên cần chuyển đến
       const dataExport = await ModelExportForm.findById(id_export)
       if(!dataExport) return res.status(400).send(`Thất bại! Không tìm thấy phiếu xuất`)

       if(dataExport.id_employee_manager.toString() != id_emplooyee_manager.toString()) return res.status(400).send(`Thất bại! Bạn không thuộc quyền quản lý của đơn này.`)
       
       if(dataExport.export_status != validator.ARRAY_STATUS_EXPORT[1] &&  dataExport.export_status != validator.ARRAY_STATUS_EXPORT[4]){
           return res.status(400).send(`Thất bại! Đơn hàng ${dataExport.export_status} không thể chuyển giao tiếp`)
       }
       const dataEm = await ModelEmployee.findById(id_employee)
       if(!dataEm) return res.status(400).send(`Thất bại! Không tìm thấy nhân viên`)

       const dataUpate = await ModelExportForm.findByIdAndUpdate(dataExport._id,{
        id_employee_tranfer:dataEm._id,
            export_status: validator.ARRAY_STATUS_EXPORT[5]
       })
       return res.json("Chuyển giao thành công")
    }
    catch(e)
    {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}
// function result_error_status_export(status){
//     if(status == validator.ARRAY_STATUS_EXPORT[])
// }
// 

export const insert_from_mobile = async (app) => {
    app.post(`${prefixApi}/mobile`,  helper.authenToken, async (req, res)=>{
        try
        {
            console.log(req.body)

            const user_fullname = req.body.user_fullname
            const user_phone = req.body.user_phone
            const user_address = req.body.user_address
            const order_note = req.body.order_note
            const order_time_trafer = req.body.order_time_trafer
            var id_user = req.body.id_user

            if(!validator.isDefine(id_user) || !validator.ObjectId.isValid(id_user)){
                const dataUser1 = await ModelUser.findOne({user_phone:user_phone})
                if(!dataUser1){
                    const datainsert_user = await new ModelUser({
                        user_fullname:user_fullname,
                        user_phone:user_phone,
                        user_address:user_address
                    }).save()
                    id_user = datainsert_user._id
                }
                else{
                    id_user = dataUser1._id
                }
            }
            
            
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy khách hàng")


            const arrProduct = JSON.parse(req.body.arrProduct)
            const voucher_code = req.body.voucher_code === 'null'?null:req.body.voucher_code
            const point_number = validator.tryParseInt(req.body.point_number)

            const id_employee = req.body._caller._id
            const dataEm = await ModelEmployee.findById(id_employee)

            var money_voucher_code = 0
            var money_point = 0
            if (arrProduct.length == 0) return res.status(400).send("Hãy thêm ít nhất 1 sản phẩm")
        
          
           const arrOrderProduct = []
            for (let i = 0; i < arrProduct.length; i++){
             
                const dataSub = await ModelSubCategory.findById(arrProduct[i].id_subcategory)
                if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")
                for (let j = 0; j < arrProduct[i].product_quantity; j++){
                    arrOrderProduct.push({
                        id_subcategory: dataSub._id,
                        subcategory_name: dataSub.subcategory_name,
                        subcategory_image: dataSub.subcategory_images,
                        product_export_price: arrProduct[i].product_export_price,
                        product_vat: arrProduct[i].product_vat,
                        product_ck: arrProduct[i].product_ck,
                        product_discount:arrProduct[i].product_discount,
                        product_warranty:arrProduct[i].subcategory_warranty,
                        subcategory_point:  dataSub.subcategory_point,
                        subcategory_part: dataSub.subcategory_part,
                        product_quantity:1,
                        id_employee: id_employee
                    })
                }
                
            }
           
            const totalMoney = validator.calculateMoneyExport(arrOrderProduct)
            if (voucher_code && voucher_code.length > 0) {
                money_voucher_code = await checkCodeDiscountReturnError(voucher_code, totalMoney)
                if(isNaN(money_voucher_code)) return res.status(400).send(money_voucher_code)
            }
            if (point_number > 0) {
                money_point = await checkPointReturnZero(id_user, point_number)
                if(isNaN(money_point)) return res.status(400).send(money_point)
            }

            const insertOrder = await new ModelOrder({
                id_branch: dataEm.id_branch,
                id_user: dataUser._id,
                order_product: arrOrderProduct,
                order_status: "Chưa xử lý",
                voucher_code: voucher_code,
                point_number: point_number,
                money_voucher_code: money_voucher_code,
                money_point: money_point,
                order_address: user_address,
                order_phone: dataUser.user_phone,
                order_note:order_note,
                order_time_trafer:order_time_trafer

            }).save()

            if (voucher_code && voucher_code.length > 0) {
                await update_status_voucher(voucher_code)
            }
            if (point_number > 0) {
                await ModelUser.findByIdAndUpdate(id_user, {
                    $inc: { user_point: -point_number }
                })
            }
           
            return res.json(insertOrder)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}

export const count_employee = async (app) => {
    app.get(`${prefixApi}/list-employee`,  helper.authenToken, async (req, res)=>{
        try
        {
            const key = req.query.key
            let query = {}
            if(validator.isDefine(key)){
                query = {
                    $or:[{employee_fullname:{$regex:".*"+key+".*", $options:"$i"}},{employee_phone:{$regex:".*"+key+".*", $options:"$i"}}]
                }
            }
           const data = await ModelEmployee.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
           const arrData = []
           for(let i =0;i<data.length;i++){
            

                const count_setting = await ModelExportForm.countDocuments({$and:[{id_employee_setting: data[i]._id},{export_status:validator.ARRAY_STATUS_EXPORT[3]}]})
                const count_tranfer = await ModelExportForm.countDocuments({$and:[{id_employee_tranfer: data[i]._id},{$or:[{export_status:validator.ARRAY_STATUS_EXPORT[5]},{export_status:validator.ARRAY_STATUS_EXPORT[6]}]}]})

                arrData.push({
                    _id:data[i]._id,
                    employee_fullname:data[i].employee_fullname,
                    employee_image:data[i].employee_image,
                    count_setting:count_setting,
                    count_tranfer:count_tranfer,
                })
            }
            return res.json(arrData)
        }
        catch(e)
        {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}

export const update_status_admin = async (req, res) =>{
    try{
        const id_export = req.body.id_export
        const dataExport = await ModelExportForm.findById(id_export)
        if(!dataExport) return res.status(400).send(`Thất bại! Không tìm thấy phiếu xuất`)

        const status = req.body.status

        if(validator.ARRAY_STATUS_EXPORT.indexOf(status) == -1) return res.status(400).send(`Thất bại! Trạng thái đơn của bạn không tồn tại`) 
        let status_order = null
        if(status == validator.ARRAY_STATUS_EXPORT[3]){ //đang lắp ráp, trạng thái hiện tại phải là chờ lắp ráp
            if(dataExport.export_status != validator.ARRAY_STATUS_EXPORT[2]){  // 
                return res.status(400).send(`Phiếu đang ${dataExport.export_status}, Không thể thao tác nghiệp vụ khác`)
            }
        }
        else if(status == validator.ARRAY_STATUS_EXPORT[4]){ //đã lắp đặt xong , trạng thái hiện tại sẽ là Đang lắp ráp
            if(dataExport.export_status != validator.ARRAY_STATUS_EXPORT[3]){  // 
                return res.status(400).send(`Phiếu đang ${dataExport.export_status}, Không thể thao tác nghiệp vụ khác`)
            }
        }

        else if(status == validator.ARRAY_STATUS_EXPORT[6]){ // Đang giao hàng , trạng thái hiện tại phải là  Chờ giao hàng
            
            if(dataExport.export_status != validator.ARRAY_STATUS_EXPORT[5]){  // 
                return res.status(400).send(`Phiếu đang ${dataExport.export_status}, Không thể thao tác nghiệp vụ khác`)
            }
            status_order = validator.ARRAY_STATUS_ORDER[2] // đang giao hàng
        }
        else if(status == validator.ARRAY_STATUS_EXPORT[7]){ // Hoàn thành , trạng thái hiện tại phải là  Đang giao hàng hoặc đã xuất kho
            if(dataExport.export_status != validator.ARRAY_STATUS_EXPORT[1] && dataExport.export_status != validator.ARRAY_STATUS_EXPORT[6]){  // 
                return res.status(400).send(`Phiếu đang ${dataExport.export_status}, Không thể thao tác nghiệp vụ khác`)
            }
            status_order = validator.ARRAY_STATUS_ORDER[3] // đã hoàn thành
        }
        else{
            return res.status(400).send(`Thất bại! Trạng thái đơn của bạn không phù hợp`) 
        }
        await ModelExportForm.findByIdAndUpdate(dataExport._id, {
            export_status:status
        })
        if(status_order){
            await ModelOrder.updateOne({id_export_form:dataExport._id},{
                $set:{
                    order_status: status_order
                }
            })
        }
        return res.json("success")
    }
    catch(e)
    {
        console.error(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}