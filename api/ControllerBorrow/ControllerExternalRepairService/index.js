const prefixApi = '/api/external-repair-service';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import * as warehouse from './../ControllerWarehouse/index.js'

import {ModelExternalRepairService} from '../../models/ExternalRepairService.js'

import { ModelUser } from '../../models/User.js'
import { ModelWarehouse } from '../../models/Warehouse.js'
import { ModelFundBook } from '../../models/FundBook.js'
import { ModelPayment } from '../../models/Payment.js'

import { ModelProduct } from '../../models/Product.js'
import { ModelSubCategory } from '../../models/SubCategory.js'
import { ModelDebt } from '../../models/Debt.js'
import { ModelReceive } from '../../models/Receive.js'
import  {checkCodeDiscount , checkCodeDiscountReturnError} from './../ControllerVoucher/index.js'
import  {checkPoint , checkPointReturnZero} from './../ControllerPoint/index.js'
import { ModelExportForm } from './../../models/ExportForm.js'
import { ModelImportForm } from './../../models/ImportForm.js'
import {update_status_voucher} from './../ControllerVoucher/index.js'
import { update_part } from './../ControllerPart/index.js'
import { createAndUpdateReport} from './../ControllerReportInventory/index.js'
import { ModelHistoryProduct } from './../../models/HistoryProduct.js'

export const checkPermission = async (app)=>{
    app.get(prefixApi+"/checkPermission",helper.authenToken, async (req, res)=>{
        try {
            const warehouses = await warehouse.getWarehouse(req.body._caller.id_branch_login)
            return res.json({warehouses:warehouses})
           
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const management = async (app)=>{
    app.get(prefixApi,helper.authenToken, async (req, res)=>{
        try {
            if (!await helper.checkPermission("62e49056ac23489afdaabf01", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            get_data(req,res)
           
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
export const update = async (app)=>{
    app.put(prefixApi,helper.authenToken, async (req, res)=>{
        try{
           
            
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const insert = async (app)=>{
    app.post(prefixApi,helper.authenToken, async (req, res)=>{
        try{
            if (!await helper.checkPermission("62e49056ac23489afdaabf01", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            create_form(req,res)
        }
        catch(e){
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const insert_import = async (app)=>{
    app.post(prefixApi+"/import",helper.authenToken, async (req, res)=>{
        try{
            if (!await helper.checkPermission("62e49056ac23489afdaabf01", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            create_form_import(req,res)
        }
        catch(e){
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

const create_form = async (req, res) => {
    try {
        const id_branch = req.body._caller.id_branch_login
        const id_user = req.body.id_user
        const type_export = req.body.type_export
        const point_number = validator.tryParseInt(req.body.point_number)
        const voucher_code = req.body.voucher_code
        const export_form_note = req.body.export_form_note
        const receive_money = validator.tryParseInt(req.body.receive_money)
        const arrProduct = JSON.parse(req.body.arrProduct)
        const id_fundbook = req.body.id_fundbook
        const id_employee = req.body._caller._id
        const id_employee_setting = req.body.id_employee_setting
        const dataUser = await ModelUser.findById(id_user)
        if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")

        const employee_name = req.body._caller.employee_fullname

        const dataFundbook = await ModelFundBook.findById(id_fundbook)
        if(!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ") 
        if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất một sản phẩm")
        for (let i = 0; i < arrProduct.length; i++){  // kiểm tra xem có bị trùng lặp id sản phẩm ko
            for (let j = i + 1; j < arrProduct.length; j++){
                if (arrProduct[i].id_product == arrProduct[j].id_product) return res.status(400).send(`Thất bại! Mã sản phẩm ${arrProduct[j].id_product} bị lặp trùng`)
            }
        }
        var id_warehouse = null
        var totalPointPlus = 0
        var totalPart = 0;
        // bắt đầu tìm kiếm sản phẩm và kiểm tra
        for (let i = 0; i < arrProduct.length; i++){  // kiểm tra xem có bị trùng lặp id sản phẩm ko
            const product = await ModelProduct.findById(arrProduct[i].id_product)
            if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
            if (product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} đã được xuất kho`)

            if(i == 0) id_warehouse = product.id_warehouse
            const sub_category = await ModelSubCategory.findById(product.id_subcategory)
            if (!sub_category) return res.status(400).send(`Thất bại! Không tìm thấy tên của sản phẩm ${product._id}`)
            if (product.id_warehouse.toString() != id_warehouse.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${product._id} không cùng kho với các sản phẩm khác `) 
            arrProduct[i].id_product2 = product.id_product2
            arrProduct[i].id_subcategory = product.id_subcategory
            arrProduct[i].subcategory_name = sub_category.subcategory_name
            arrProduct[i].subcategory_part = sub_category.subcategory_part
            arrProduct[i].subcategory_point = sub_category.subcategory_point
            arrProduct[i].product_import_price = validator.totalMoney(product.product_import_price, 0, product.product_ck)
            arrProduct[i].id_form_import = product.id_import_form
            arrProduct[i].status_repair = false

            totalPointPlus += sub_category.subcategory_point
            if (validator.ObjectId.isValid(arrProduct[i].id_employee)) {
                totalPart += sub_category.subcategory_part
            }
        }
        const total = validator.calculateMoneyExport(arrProduct)
        var money_voucher_code = 0
        var money_point = 0

        if (voucher_code) {  // tính tiền mã giảm giá
            money_voucher_code = await checkCodeDiscountReturnError(voucher_code, total)
            if(isNaN(money_voucher_code)) return res.status(400).send(money_voucher_code)
        }

        if (point_number > 0) { // tính tiền từ đổi điểm
            money_point = await checkPointReturnZero(dataUser._id, point_number)
            if(isNaN(money_point)) return res.status(400).send(money_point)
        }
        const data_warehouse = await ModelWarehouse.findById(id_warehouse)
        if (!data_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của sản phẩm")
      
        if(data_warehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho của sản phâm không thuộc chi nhánh này")
        var is_payment = false // trạng thái đã thanh toán chưa của phiếu xuất
        if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
            is_payment = true
        }
        
        const insertFormExport = await new ModelExportForm({  // tạo phiếu xuất trước
            id_warehouse: data_warehouse._id,
            id_employee: id_employee,
            id_user: dataUser._id,
            export_form_status_paid:is_payment,
            export_form_product:  arrProduct,
            export_form_note:export_form_note,
            export_form_type:type_export,
            voucher_code: voucher_code,
            money_voucher_code:  money_voucher_code,
            point_number: point_number,
            money_point: money_point,
            id_employee_setting:id_employee_setting
            // createdAt: validator.dateTimeZone().currentTime
        }).save()

        const insertDebt = await new ModelDebt({  // tạo công nợ
                id_user: dataUser._id,// tên nhân viên
                id_branch: id_branch,
                id_employee: id_employee,
                debt_money_receive: receive_money + money_point+ money_voucher_code,
                debt_money_export: total ,
                debt_note: export_form_note,
                debt_type:"export",
                id_form: insertFormExport._id,
        }).save()
        if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
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
        }
        if (voucher_code) await update_status_voucher(voucher_code)
            

        await new ModelExternalRepairService({
            id_export_form: insertFormExport._id,
            id_warehouse:data_warehouse._id,
            external_repair_service_product: arrProduct,
            id_employee:id_employee,
            id_user: dataUser._id,
            external_repair_service_note: export_form_note
        }).save()

        for (let i = 0; i < arrProduct.length; i++){
            await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, {$set:{ product_status: true, product_warranty: arrProduct[i].product_warranty, id_export_form: insertFormExport._id },$push:{product_note:`${insertFormExport._id.toString()}`}})
            await ModelImportForm.findByIdAndUpdate(arrProduct[i].id_import_form,{import_form_status_paid:true})

            await new ModelHistoryProduct({
                product_id:arrProduct[i].id_product,
                content: `Xuất hàng sửa chữa ngoài, Mã phiếu xuất: ${insertFormExport._id} bởi nhân viên ${employee_name} từ kho ${data_warehouse.warehouse_name}, Khách hàng: ${dataUser.user_fullname} (${dataUser._id}) , giá vốn: ${arrProduct[i].product_import_price}, giá xuất : ${arrProduct[i].product_export_price}`
            }).save()
        }
     
        if ((receive_money + money_point + money_voucher_code) == total) { // cộng điểm cho khách
            await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: { user_point: (totalPointPlus - point_number) }})
        }
        else {
            await ModelUser.findByIdAndUpdate(dataUser._id,{$inc:(-point_number)})
        }        
        return res.json(insertFormExport)
    }
    catch(e) {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
    
}


const get_data = async (req, res) =>{
    try{
        let query = {}
            
        if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
            query = {
                ...query,
                ...validator.query_createdAt(req.query.fromdate , req.query.todate)
            }
        }


        if (validator.isDefine(req.query.key)) {
            query = {
                ...query,
                $or: [{ "user.user_fullname":{$regex:".*"+req.query.key+".*", $options:"i"}},{"user.user_phone":{$regex:".*"+req.query.key+".*", $options:"i"}},{"export_form_product.subcategory_name":{$regex:".*"+req.query.key+".*", $options:"i"}}]
            }
        }
        if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
            query = {id_export_form: validator.ObjectId(req.query.key)}
                
        }
        if (validator.isDefine(req.query.id_warehouse) && validator.ObjectId.isValid(req.query.id_warehouse)) {
            query = {
                ...query,
                id_warehouse: validator.ObjectId(req.query.id_warehouse),
            }
        }

        const datas = await ModelExternalRepairService.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as:"user"
                }
            }, {
                $unwind: {
                    path: "$user",
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

        const count = await ModelExternalRepairService.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as:"user"
                }
            }, {
                $unwind: {
                    path: "$user",
                }
            },
            {
                $match:query
            },
            {
                $count:"count"
            }
           
        ])
        await Promise.all(datas.map( async data => {
            data.fundbook_name = ""
            data.receive_form_money = 0
            data.user_fullname = data.user.user_fullname
            data.user_phone = data.user.user_phone
            data.user_address = data.user.user_address
            delete data.user
  
        }))

        return res.json({data:datas, count:count.length>0?count[0].count:0})
    }
    catch(e){

    }
}

export const create_form_import = async (req, res) => {
    try {
        const employee_name = req.body._caller.employee_fullname

        const id_branch = req.body._caller.id_branch_login
        const id_user = req.body.id_user
        const type_import = validator.TYPE_IMPORT_EXTERNAL_REPAIR_SERVICE
        // const point_number = validator.tryParseInt(req.body.point_number)
        // const voucher_code = req.body.voucher_code
        const import_form_note = req.body.import_form_note
        const payment_money = validator.tryParseInt(req.body.payment_money)
        const arrProduct = JSON.parse(req.body.arrProduct)
        const id_fundbook = req.body.id_fundbook
        const id_employee = req.body._caller._id
        const id_warehouse = req.body.id_warehouse
        const dataUser = await ModelUser.findById(id_user)
        if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")

        const dataFundbook = await ModelFundBook.findById(id_fundbook)
        if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ") 

        const dataWarehouse = await ModelWarehouse.findById(id_warehouse)
        if (!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ") 
        if(dataWarehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho hiện tại không thuộc chi nhánh đang đăng nhập , vui lòng chọn kho khác.")
        if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất một sản phẩm")
        for (let i = 0; i < arrProduct.length; i++){  // kiểm tra xem có bị trùng lặp id sản phẩm ko
            for (let j = i + 1; j < arrProduct.length; j++){
                if (arrProduct[i].id_product == arrProduct[j].id_product) return res.status(400).send(`Thất bại! Mã sản phẩm ${arrProduct[j].id_product} bị lặp trùng.`)
            }
        }

        var totalPointNeg = 0
        var totalPart = 0;
        // bắt đầu tìm kiếm sản phẩm và kiểm tra
        for (let i = 0; i < arrProduct.length; i++){  // kiểm tra xem có bị trùng lặp id sản phẩm ko
            const product = await ModelProduct.findById(arrProduct[i].id_product)
            if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
            if (!product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} chưa xuất kho.`)

           
            const sub_category = await ModelSubCategory.findById(product.id_subcategory)
            if (!sub_category) return res.status(400).send(`Thất bại! Không tìm thấy tên của sản phẩm ${product._id}.`)

            // const dataExport = await ModelExportForm.findById(product.id_export_form)  // phiếu xuất trước đó
            // if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất trước đó.")    
            arrProduct[i].id_product2 = product.id_product2
            arrProduct[i].id_subcategory = product.id_subcategory
            arrProduct[i].subcategory_name = sub_category.subcategory_name

            const dataExternal = await ModelExternalRepairService.findOne({$and:[
                    {
                        id_warehouse:dataWarehouse._id
                    },
                    {
                        id_user:dataUser._id
                    },
                    {
                        "external_repair_service_product.id_product":product._id
                    }
                ]    
            })
            if(!dataExternal) return res.status(400).send(`Thất bại! Không tìm thấy phiếu xuất Dịch vụ sửa chữa ngoài của sản phẩm ${product._id} hoặc không đúng khách hàng`)
            for(let j =0;j<dataExternal.external_repair_service_product.length;j++){
                if(dataExternal.external_repair_service_product[j].id_product.toString() == product._id.toString()){
                    if(dataExternal.external_repair_service_product[j].status_repair) return res.status(400).send(`Thất bại! Sản phẩm có mã ${product._id} đang ở trạng thái đã nhận lại`)
                    arrProduct[i].id_external_repair_service = dataExternal._id
                    break
                }
            }
            

        }
        const import_form_status_paid = payment_money > 0?true:false
        const insertImport = await new ModelImportForm({
            id_warehouse: dataWarehouse._id,
            id_employee: id_employee,
            id_user: dataUser._id,
            import_form_product: arrProduct,
            import_form_note: import_form_note,
            import_form_type: validator.TYPE_IMPORT_EXTERNAL_REPAIR_SERVICE,
            import_form_status_paid :import_form_status_paid
        }).save()

        for (let i = 0; i < arrProduct.length; i++){
            await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, {
                $set:{
                    product_warranty: arrProduct[i].product_warranty,
                    product_status: false,
                    id_warehouse:dataWarehouse._id,
                    product_import_price:arrProduct[i].product_import_price_return
                },
                $push:{
                    product_note:insertImport._id.toString()
                }
            })

            await ModelImportForm.findByIdAndUpdate(arrProduct[i].id_import_form,{import_form_status_paid:true})
            await createAndUpdateReport(dataWarehouse._id, arrProduct[i].id_subcategory, arrProduct[i].product_quantity, arrProduct[i].product_import_price)

            const dataExternal = await ModelExternalRepairService.findById(arrProduct[i].id_external_repair_service)
            for(let j =0;j<dataExternal.external_repair_service_product.length;j++){
                if(dataExternal.external_repair_service_product[j].id_product.toString() == arrProduct[i].id_product.toString()){
                    dataExternal.external_repair_service_product[j].status_repair = true
                    break
                }
            }
            await ModelExternalRepairService.findByIdAndUpdate(dataExternal._id,{
                external_repair_service_product: dataExternal.external_repair_service_product
            })

            await new ModelHistoryProduct({
                product_id:arrProduct[i].id_product,
                content: `Nhập hàng sửa chữa ngoài, Mã phiếu nhập: ${insertImport._id} bởi nhân viên ${employee_name} vào kho kho ${dataWarehouse.warehouse_name}, Khách hàng: ${dataUser.user_fullname} (${dataUser._id}) , giá nhập: ${arrProduct[i].product_import_price}, giá vốn khi xuất : ${arrProduct[i].product_import_price_return}`
            }).save()
        }

        const total = validator.calculateMoneyImport(insertImport.import_form_product);

        const insertDebt = await new ModelDebt({  // tạo công nợ
                id_user: dataUser._id,// tên nhân viên
                id_branch: id_branch,
                id_employee: id_employee,
                debt_money_payment: 0 , // phải để payment = 0 vì lúc xuất nó tạo công nợ rồi , bù lại lúc đó , còn tổng chi buộc phải bỏ ra
                debt_money_import: total ,
                debt_note: import_form_note,
                debt_type:"import",
                id_form: insertImport._id,
        }).save()

        if (payment_money > 0) { // tạo phiếu chi 
            const insertPayment = new ModelPayment({
                id_user: dataUser._id,
                payment_money: payment_money,
                id_employee:id_employee,
                id_branch: id_branch,
                id_form: insertImport._id,
                payment_note: import_form_note,
                payment_content: "62e269ea30d13cfa47ec062e", // "Chi trả dịch vụ sửa chữa ngoài",
                id_fundbook: id_fundbook,
                payment_type: "import",
            }).save()
        }
        await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: { user_point: -totalPointNeg } })
        await update_part(id_branch, -totalPart)

        for (let i = 0; i < arrProduct.length; i++){  // kiểm tra xem có bị trùng lặp id sản phẩm ko
            const product = await ModelProduct.findById(arrProduct[i].id_product)
            const dataExport = await ModelExportForm.findById(product.id_export_form)  // phiếu xuất trước đó
          
            for (let j = 0; j < dataExport.export_form_product.length; j++){
                
                if (dataExport.export_form_product[j].id_product.toString() == product._id.toString()) {
                    dataExport.export_form_product[j].id_import_return = insertImport._id
                }
            }
            await ModelExportForm.findByIdAndUpdate(dataExport._id,{
                export_form_product:dataExport.export_form_product
            })
        }
        return res.json(insertImport)
    }
    catch(e) {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
    
}

