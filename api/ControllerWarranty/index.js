const prefixApi = '/api/warranty';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelWarehouse} from '../../models/Warehouse.js'
import {ModelSubCategory} from '../../models/SubCategory.js'
import {ModelProduct} from '../../models/Product.js'
import {ModelUser} from '../../models/User.js'
import {ModelWarranty} from '../../models/Warranty.js'
import {ModelExportForm} from '../../models/ExportForm.js'
import {ModelImportForm} from '../../models/ImportForm.js'
import {getWarehouse} from '../ControllerWarehouse/index.js'
import { createAndUpdateReport} from '../ControllerReportInventory/index.js'

export const checkPermission = async (app)=>{
   
        app.get(prefixApi + "/checkPermission", helper.authenToken, async (req, res) => {
            try {
                if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
                const dataWarehouse = await getWarehouse(req.body._caller.id_branch_login)
                return res.json(dataWarehouse)
            }
            catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
           
        })
    
  
}

export const management = async (app)=>{
    
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try
        {
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            let query1 = {}
            let query2 = {}
            let query3 = {}
            let query4 = {}

            query1 = {
                ...query1,
                ...validator.query_createdAt(req.query.fromdate , req.query.todate),
                id_warehouse:validator.ObjectId(req.query.id_warehouse)
            }
            if(validator.isDefine(req.query.name_customer)){
                query2 = {
                    ...query2,
                    "user.user_fullname":{$regex:".*"+req.query.name_customer+".*", $options:"i"}
                }
            }
            if(validator.isDefine(req.query.phone_customer)){
                query2 = {
                    ...query2,
                    "user.user_phone":{$regex:".*"+req.query.phone_customer+".*", $options:"i"}
                }
            }
            if(validator.isDefine(req.query.status_send_supplier)){
               
                query3 = {
                    ...query3,
                    "warranty_product.status_send_supplier":validator.tryParseBoolean(req.query.status_send_supplier)
                }
            }
            if(validator.isDefine(req.query.status_receive_supplier)){
                query3 = {
                    ...query3,
                    "warranty_product.status_receive_supplier":validator.tryParseBoolean(req.query.status_receive_supplier)
                }
            }
            if(validator.isDefine(req.query.status_change_supplier)){
                if(req.query.status_change_supplier === 'true'){
                    query3 = {
                        ...query3,
                        "warranty_product.status_change_supplier":{$ne:null}
                    }
                }
                else{
                    query3 = {
                        ...query3,
                        "warranty_product.status_change_supplier":null
                    }
                } 
            }

            if(validator.isDefine(req.query.status_change_customer)){
                if(req.query.status_change_customer === 'true'){
                    query3 = {
                        ...query3,
                        "warranty_product.status_change_customer":{$ne:null}
                    }
                }
                else{
                    query3 = {
                        ...query3,
                        "warranty_product.status_change_customer":null
                    }
                } 
            }
            if(validator.isDefine(req.query.status_return_customer)){
                query3 = {
                    ...query3,
                    "warranty_product.status_return_customer":validator.tryParseBoolean(req.query.status_return_customer)
                }
            }
            if(validator.isDefine(req.query.id_product)){
                query3 = {
                    ...query3,
                    $or:[{"warranty_product.id_product":req.query.id_product.trim()},{"warranty_product.id_product2":req.query.id_product2.trim()}]
                }
            }
            if(validator.isDefine(req.query.subcategory_name)){
                query3 = {
                    ...query3,
                    "warranty_product.subcategory_name":{$regex:".*"+req.query.subcategory_name+".*",$options:"i"}
                }
            }
            if(validator.isDefine(req.query.date_send_supplier)){
                query3 = {
                    ...query3,
                    $and:[{"warranty_product.date_send_supplier":{$gte: new Date(req.query.date_send_supplier+" 00:00:00")}},{"warranty_product.date_send_supplier":{$lte: new Date(req.query.date_send_supplier+" 23:59:59")}}]
                }
            }
            if(validator.isDefine(req.query.supplier_name)){
                query4 = {
                    ...query4,
                    $or:[{"supplier.user_fullname":{$regex:".*"+req.query.supplier_name+".*",$options:"i"}},{"supplier.user_phone":{$regex:".*"+req.query.supplier_name+".*"}}]
                }
            }

            const data = await ModelWarranty.aggregate([
                {
                    $match: query1
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
                    $match: query2
                },
                {
                    $unwind:{
                        path:"$warranty_product"
                    }
                },
                {
                    $match: query3
                },
                {
                    $lookup:{
                        from:"users",
                        localField:"warranty_product.id_supplier",
                        foreignField:"_id",
                        as:"supplier"
                    }
                },
                {
                    $unwind:{
                        path:"$supplier"
                    }
                },
                {
                    $match: query4
                },
                {
                    $project:{
                        _id:-1,
                        id_warehouse:1,
                        id_import_form:1,
                        id_user:1,
                        id_employee:1,
                        user_fullname:"$user.user_fullname",
                        user_phone:"$user.user_phone",
                        user_address:"$user.user_address",
                        id_product: "$warranty_product.id_product",
                        date_export: "$warranty_product.date_export" ,
                        warranty: "$warranty_product.warranty" ,
                        id_export_form: "$warranty_product.id_export_form" ,
                        product_quantity: "$warranty_product.product_quantity" ,
                        id_proudct2: "$warranty_product.id_proudct2" ,
                        id_subcategory: "$warranty_product.id_subcategory" ,
                        id_supplier: "$warranty_product.id_supplier" ,
                        subcategory_name: "$warranty_product.subcategory_name" ,
                        status_send_supplier: "$warranty_product.status_send_supplier" ,
                        status_receive_supplier: "$warranty_product.status_receive_supplier" ,
                        status_change_supplier: "$warranty_product.status_change_supplier" ,
                        status_return_customer: "$warranty_product.status_return_customer" ,
                        status_change_customer: "$warranty_product.status_change_customer" ,
                        date_send_supplier: "$warranty_product.date_send_supplier" ,
                        date_receive_supplier: "$warranty_product.date_receive_supplier" ,
                        date_return_customer: "$warranty_product.date_return_customer" ,
                        note: "$warranty_product.note" ,
                        createdAt:1,
                        updatedAt:1,
                        supplier_name:"$supplier.user_fullname",
                        supplier_phone:"$supplier.user_phone",
                        supplier_address:"$supplier.user_address",
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                }
            ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))

            for(let i =0;i<data.length;i++){
                const dataExport = await ModelExportForm.findById(data[i].id_export_form)
                if(dataExport){
                    for(let i =0;i<dataExport.export_form_product.length;i++){
                        if(dataExport.export_form_product[i].id_product.toString() == data[i].id_product.toString()){
                            data[i].product_warranty = dataExport.export_form_product[i].product_warranty
                            data[i].date_export = dataExport.createdAt
                            break
                        }
                    }
                }
                
            }

            const count = await ModelWarranty.aggregate([
                {
                    $match: query1
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
                    $match: query2
                },
                {
                    $unwind:{
                        path:"$warranty_product"
                    }
                },
                {
                    $match: query3
                },
                {
                    $lookup:{
                        from:"users",
                        localField:"warranty_product.id_supplier",
                        foreignField:"_id",
                        as:"supplier"
                    }
                },
                {
                    $unwind:{
                        path:"$supplier"
                    }
                },
                {
                    $match: query4
                },
                {
                    $count:"count"
                }
            ])
            return res.json({data:data, count: count.length > 0?count[0].count:0})
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
   
}

export const insert = async (app)=>{
   
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try
        {
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này.")
            const id_employee = req.body._caller._id
            const id_user = req.body.id_user
            const id_warehouse = req.body.id_warehouse
            const arrProduct = JSON.parse(req.body.arrProduct)
            if(!id_user || !id_warehouse || !validator.ObjectId.isValid(id_user) || !validator.ObjectId.isValid(id_warehouse) ) return res.status(400).send("Thất bại! Kho hoặc khách hàng không phù hợp.")
            
            if(arrProduct.length == 0) return res.status(400).send("Thất bại! Hãy nhập ít nhất một sản phẩm")
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy khách hàng")

            const dataWarehouse = await ModelWarehouse.findById(id_warehouse)
            if(!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho nhập vào")

            const id_branch = req.body._caller.id_branch_login
            if(id_branch.toString() != dataWarehouse.id_branch) return res.status(400).send("Thất bại! Kho nhập vào không thuộc chi nhánh bạn đang đăng nhập.")

            for(let i =0;i<arrProduct.length;i++){
                for(let j =i+1; j<arrProduct.length ;j++){
                    if(arrProduct[i].id_product == arrProduct[j].id_product){
                        return res.status(400).send(`Thất bại! Không thể nhập bảo hành cùng 1 mã 2 lần với mã sản phẩm ${arrProduct[j].id_product}`)
                    }
                }
            }
            const arrProductImport = [] // mảng sản phẩm cho phiếu nhập
            for(let i =0;i<arrProduct.length;i++){
                if(!arrProduct[i].id_product || !validator.ObjectId.isValid(arrProduct[i].id_product)) return res.status(400).send(`Thất bại! sản phẩm tại dòng ${i+1} không phù hợp.`)
                const dataProduct = await ModelProduct.findById(arrProduct[i].id_product)
                if(!dataProduct) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm tại dòng ${i+1}.`)
                if(!dataProduct.product_status) return res.status(400).send(`Thất bại! Sản phẩm có mã ${dataProduct._id} chưa xuất kho`)
                const dataSub = await ModelSubCategory.findById(dataProduct.id_subcategory)
                if(!dataSub) return res.status(400).send(`Thất bại! Lỗi dòng 153 Không tìm thấy sản phẩm tại dòng ${i+1}.`)

                if(!arrProduct[i].id_supplier || !validator.ObjectId.isValid(arrProduct[i].id_supplier)) return res.status(400).send(`Thất bại! Không tìm thấy nhà cung cấp tại dòng ${i+1}`)
                const dataSupplier = await ModelUser.findById(arrProduct[i].id_supplier)
                if(!dataSupplier) return res.status(400).send(`Thất bại! Không tìm thấy nhà cung cấp tại dòng ${i+1}`)
                arrProduct[i] = {
                    ...arrProduct[i],
                    id_product:dataProduct._id,
                    subcategory_name:dataSub.subcategory_name,
                    id_export_form:validator.ObjectId(arrProduct[i].id_export_form),
                    id_product2:dataProduct.id_product2,
                    id_subcategory:dataSub._id,
                    id_supplier: dataSupplier._id,
                    product_quantity:1
                }
                arrProductImport.push({
                    id_subcategory: dataSub._id,
                    id_product2: dataProduct.id_product2,
                    id_product: dataProduct._id,
                    subcategory_name: dataSub.subcategory_name,
                    product_import_price: 0,
                    product_import_price_return: 0,
                    product_export_price: 0,
                    product_vat: 0,
                    product_ck: 0,
                    product_discount: 0,
                    product_quantity: 1,
                    product_warranty: 0,
                    product_index: 0,
                    subcategory_point: 0,
                    subcategory_part: 0,
                })
                // const dataSupplier = await

            }
            const insertImport = await new ModelImportForm({
                id_warehouse:dataWarehouse._id,
                id_employee:id_employee,
                id_user:dataUser._id,
                import_form_type:validator.TYPE_IMPORT_WARRANTY,
                import_form_product:arrProductImport
            }).save()

            const insert_warranty = await new ModelWarranty({
                id_employee:id_employee,
                id_warehouse:dataWarehouse._id,
                id_import_form:insertImport._id,
                id_user:dataUser._id,
                warranty_product: arrProduct
            }).save()

            for(let i =0;i<arrProductImport.length;i++){
                await ModelProduct.findByIdAndUpdate(arrProductImport[i].id_product,{
                    $set:{
                        id_warehouse:dataWarehouse._id,
                        product_status:false,
                    },
                    $push:{
                        product_note: `${new Date()} nhập bảo hành vào kho ${dataWarehouse.warehouse_name} từ khách hàng ${dataUser.user_fullname}, mã phiếu nhập ${insertImport._id}`
                    }
                })
                await createAndUpdateReport(dataWarehouse._id, arrProductImport[i].id_subcategory, arrProductImport[i].product_quantity, arrProductImport[i].product_import_price)
            }
            return res.json("Success")
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}


export const find_product = async (app)=>{
   
    app.get(prefixApi +"/find-product", helper.authenToken, async (req, res) => {
        try
        {
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này.")
            const id_user = req.query.id_supplier
            const id_warehouse = req.query.id_warehouse
            const type = req.query.type
           
            let query = {}
            if(type == "send_supplier"){
                query = {
                    "warranty_product.id_supplier":validator.ObjectId(id_user),
                    "warranty_product.status_send_supplier":false,
                    "warranty_product.status_return_customer":false,
                    "warranty_product.status_receive_supplier":false,

                }
            }
            if(type == "receive_supplier"){
                query = {
                    "warranty_product.id_supplier":validator.ObjectId(id_user),
                    "warranty_product.status_send_supplier":true,
                    "warranty_product.status_receive_supplier":false,
                    "warranty_product.status_return_customer":false,
                    "warranty_product.status_change_supplier":null,
                }
            }
            if(type == "return_customer"){
                query = {
                    id_user:validator.ObjectId(id_user),
                    "warranty_product.status_return_customer":false,
                    "warranty_product.status_change_customer":null,
                }
            }
    
           
    
            const data = await ModelWarranty.aggregate([
                {
                    $match:{
                        id_warehouse:validator.ObjectId(id_warehouse)
                    }
                },
                {
                    $unwind:{
                        path:"$warranty_product"
                    }
                },
                {
                    $match:query
                },
                {
                    $project:{
                        _id:1,
                        id_user:1,
                        id_import_form:1,
                        id_product:"$warranty_product.id_product" ,
                        subcategory_name:"$warranty_product.subcategory_name" ,
                        date_export:"$warranty_product.date_export" ,
                        warranty:"$warranty_product.warranty" ,
                        id_export_form:"$warranty_product.id_export_form" ,
                        product_quantity:"$warranty_product.product_quantity" ,
                        id_proudct2:"$warranty_product.id_proudct2" ,
                        id_subcategory:"$warranty_product.id_subcategory" ,
                        id_supplier:"$warranty_product.id_supplier" ,
                        status_send_supplier:"$warranty_product.status_send_supplier" ,
                        status_receive_supplier:"$warranty_product.status_receive_supplier" ,
                        status_change_supplier:"$warranty_product.status_change_supplier" ,
                        status_return_customer:"$warranty_product.status_return_customer" ,
                        status_change_customer:"$warranty_product.status_change_customer" ,
                        status_failed:"$warranty_product.status_failed" ,
                        status_success:"$warranty_product.status_success" ,
                        date_send_supplier:"$warranty_product.date_send_supplier" ,
                        date_receive_supplier:"$warranty_product.date_receive_supplier" ,
                        date_return_customer:"$warranty_product.date_return_customer" ,
                        note:"$warranty_product.note",
                        createdAt:1
                    }
                }
            ])

            for(let i =0;i<data.length;i++){
                const dataUser = await ModelUser.findById(data[i].id_user)
                if(dataUser){
                    data[i].user_fullname = dataUser.user_fullname
                    data[i].user_phone = dataUser.user_phone
                    data[i].user_address = dataUser.user_address
                }

                const dataSupplier = await ModelUser.findById(data[i].id_supplier)
                if(dataSupplier ){
                    data[i].supplier_fullname = dataSupplier.user_fullname
                    data[i].supplier_phone = dataSupplier.user_phone
                    data[i].supplier_address = dataSupplier.user_address
                }

            }
            return res.json(data)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}


export const send_supplier = async (app)=>{
   
    app.post(prefixApi +"/send_supplier", helper.authenToken, async (req, res) => {
        try
        {
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này.")
            const id_employee = req.body._caller._id
            const id_user = req.body.id_user
            const id_warehouse = req.body.id_warehouse
            const note = req.body.note
            const arrProduct = JSON.parse(req.body.arrProduct)

            for(let i =0;i<arrProduct.length;i++){
                if(!arrProduct[i].checked){
                    arrProduct.splice(i,1)
                    i--
                }
            }
            if(arrProduct.length == 0) return res.status(400).send(`Thất bại! Phải gửi ít nhất một sản phẩm`)
            if(!validator.ObjectId.isValid(id_user) || !validator.ObjectId.isValid(id_warehouse) ) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")

            const dataWarehouse = await ModelWarehouse.findById(id_warehouse)
            if(!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho")

            const arr_export = []
            for(let i =0;i< arrProduct.length;i++){
                const dataProduct = await ModelProduct.findById(arrProduct[i].id_product)
                if(!dataProduct) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
                if(dataProduct.product_status) return res.status(400).send(`Thất bại! Sản phẩm có mã  ${dataProduct._id} đã được xuất kho`)
                if(dataProduct.id_warehouse.toString() != dataWarehouse._id.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${dataProduct._id} không còn tồn trong kho`)

                const dataWarranty = await ModelWarranty.findById(arrProduct[i]._id)
                if(!dataWarranty) return res.status(400).send(`Thất bại! Không tìm thấy phiếu bảo hành của sản phẩm có mã ${dataProduct._id}`)

                const dataSub = await ModelSubCategory.findById(dataProduct.id_subcategory)
                if(!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm gốc có mã ${dataProduct._id}`)
                arr_export.push({
                    id_subcategory:  dataSub._id,
                    id_product: dataProduct._id,
                    id_product2: dataProduct.id_product2,
                    subcategory_name: dataSub.subcategory_name,
                    product_import_price: dataProduct.product_import_price,
                    product_import_price_return: 0,
                    product_export_price: dataProduct.product_import_price,
                    product_vat: 0,
                    product_ck: 0,
                    product_discount: 0,
                    product_quantity: 1,
                    product_warranty: 0,
                    product_index: i,
                    subcategory_point: 0,
                    subcategory_part: 0,
                })
            }
            const imsert_export = await new ModelExportForm({
                id_warehouse:dataWarehouse._id,
                id_employee: id_employee,
                id_user:dataUser._id,
                export_form_status_paid:false,
                export_form_product: arr_export,
                export_form_note:note,
                export_form_type:validator.TYPE_EXPORT_WARRANTY
            }).save()

            for(let i =0;i<arrProduct.length;i++){
                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product,{
                    $set:{
                        product_status: true,
                    },
                    $push:{
                        product_note:`${new Date()} xuất bảo hành gửi nhà cung cấp từ kho ${dataWarehouse.warehouse_name} mã phiếu xuất ${imsert_export._id} , mã phiếu bảo hành ${arrProduct[i]._id}`
                    }
                })
                const dataWarranty = await ModelWarranty.findById(arrProduct[i]._id)
                for(let j =0;j<dataWarranty.warranty_product.length;j++){
                    if(dataWarranty.warranty_product[j].id_product.toString() == arrProduct[i].id_product.toString()){
                        dataWarranty.warranty_product[j].status_send_supplier = true
                        dataWarranty.warranty_product[j].date_send_supplier = new Date()

                    }
                }
                await ModelWarranty.findByIdAndUpdate(dataWarranty._id,{
                    warranty_product: dataWarranty.warranty_product
                })
            }
            return res.json(imsert_export._id)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}

export const receive_supplier = async (app)=>{
   
    app.post(prefixApi +"/receive_supplier", helper.authenToken, async (req, res) => {
        try
        {
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này.")
            const id_employee = req.body._caller._id
            const id_user = req.body.id_user
            const id_warehouse = req.body.id_warehouse
            const note = req.body.note
            const arrProduct = JSON.parse(req.body.arrProduct)

            for(let i =0;i<arrProduct.length;i++){
                if(!arrProduct[i].checked){
                    arrProduct.splice(i,1)
                    i--
                }
            }
            if(arrProduct.length == 0) return res.status(400).send(`Thất bại! Phải gửi ít nhất một sản phẩm`)
            if(!validator.ObjectId.isValid(id_user) || !validator.ObjectId.isValid(id_warehouse) ) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")

            const dataWarehouse = await ModelWarehouse.findById(id_warehouse)
            if(!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho")

            const arr_import = []
            for(let i =0;i< arrProduct.length;i++){
                const dataProduct = await ModelProduct.findById(arrProduct[i].id_product)
                if(!dataProduct) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
                if(!dataProduct.product_status) return res.status(400).send(`Thất bại! Sản phẩm có mã  ${dataProduct._id} chưa được xuất kho`)
                // if(dataProduct.id_warehouse.toString() != dataWarehouse._id.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${dataProduct._id} không còn tồn trong kho`)

                const dataWarranty = await ModelWarranty.findById(arrProduct[i]._id)
                if(!dataWarranty) return res.status(400).send(`Thất bại! Không tìm thấy phiếu bảo hành của sản phẩm có mã ${dataProduct._id}`)

                const dataSub = await ModelSubCategory.findById(dataProduct.id_subcategory)
                if(!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm gốc có mã ${dataProduct._id}`)
                arr_import.push({
                    id_subcategory:  dataSub._id,
                    id_product: dataProduct._id,
                    id_product2: dataProduct.id_product2,
                    subcategory_name: dataSub.subcategory_name,
                    product_quantity: 1,
                })
            }
            const imsert_import = await new ModelImportForm({
                id_warehouse:dataWarehouse._id,
                id_employee: id_employee,
                id_user:dataUser._id,
                import_form_status_paid:false,
                import_form_product: arr_import,
                import_form_note:note,
                import_form_type:validator.TYPE_IMPORT_WARRANTY
            }).save()

            for(let i =0;i<arrProduct.length;i++){
                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product,{
                    $set:{
                        product_status: false,
                        id_warehouse:dataWarehouse._id
                    },
                    $push:{
                        product_note:`${new Date()} nhận lại bảo hành từ nhà cung cấp vào kho ${dataWarehouse.warehouse_name} mã phiếu nhập ${imsert_import._id} , mã phiếu bảo hành ${arrProduct[i]._id}`
                    }
                })
                const dataWarranty = await ModelWarranty.findById(arrProduct[i]._id)
                for(let j =0;j<dataWarranty.warranty_product.length;j++){
                    if(dataWarranty.warranty_product[j].id_product.toString() == arrProduct[i].id_product.toString()){
                        dataWarranty.warranty_product[j].status_receive_supplier = true
                        dataWarranty.warranty_product[j].date_receive_supplier = new Date()
                    }
                }
                await ModelWarranty.findByIdAndUpdate(dataWarranty._id,{
                    warranty_product: dataWarranty.warranty_product
                })
            }
            return res.json(imsert_import._id)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}
function time_warranty_new(time, warranty){
    const date1 = new Date(time);
    const date2 = Date.now();
    const diffTime = date2- date1
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if(isNaN(parseInt(warranty))) parseInt(warranty) = 0;
    const dateWarranty = parseInt(warranty)*30; // quy số tháng bảo hành ra ngày
    const currentWarranty = dateWarranty - diffDays;  // lấy số ngày bảo hành trừ đi ngày đã sử dụng
    if(currentWarranty <= 0) return 0;

    if(currentWarranty < 30 && currentWarranty > 0)  return 1// nếu nhỏ 30 thì in ra số ngày thôi
    return parseInt(currentWarranty/30);
}
export const return_customer = async (app)=>{
   
    app.post(prefixApi +"/return-customer", helper.authenToken, async (req, res) => {
        try
        {
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này.")
            const id_employee = req.body._caller._id
            const id_user = req.body.id_user
            const id_warehouse = req.body.id_warehouse
            const note = req.body.note
            const arrProduct = JSON.parse(req.body.arrProduct)

            for(let i =0;i<arrProduct.length;i++){
                if(!arrProduct[i].checked){
                    arrProduct.splice(i,1)
                    i--
                }
            }
            if(arrProduct.length == 0) return res.status(400).send(`Thất bại! Phải gửi ít nhất một sản phẩm`)
            if(!validator.ObjectId.isValid(id_user) || !validator.ObjectId.isValid(id_warehouse) ) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")

            const dataWarehouse = await ModelWarehouse.findById(id_warehouse)
            if(!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho")

            const arr_export = []
            for(let i =0;i< arrProduct.length;i++){
                const dataProduct = await ModelProduct.findById(arrProduct[i].id_product)
                if(!dataProduct) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
                if(dataProduct.product_status) return res.status(400).send(`Thất bại! Sản phẩm có mã  ${dataProduct._id} đã được xuất kho`)
                if(dataProduct.id_warehouse.toString() != dataWarehouse._id.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${dataProduct._id} không còn tồn trong kho`)

                const dataWarranty = await ModelWarranty.findById(arrProduct[i]._id)
                if(!dataWarranty) return res.status(400).send(`Thất bại! Không tìm thấy phiếu bảo hành của sản phẩm có mã ${dataProduct._id}`)

                const dataSub = await ModelSubCategory.findById(dataProduct.id_subcategory)
                if(!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm gốc có mã ${dataProduct._id}`)
                arr_export.push({
                    id_subcategory:  dataSub._id,
                    id_product: dataProduct._id,
                    id_product2: dataProduct.id_product2,
                    subcategory_name: dataSub.subcategory_name,
                    product_import_price: dataProduct.product_import_price,
                    product_import_price_return: 0,
                    product_export_price: dataProduct.product_import_price,
                    product_vat: 0,
                    product_ck: 0,
                    product_discount: 0,
                    product_quantity: 1,
                    product_warranty: time_warranty_new(new Date(),0),
                    product_index: i,
                    subcategory_point: 0,
                    subcategory_part: 0,
                })
            }
            const imsert_export = await new ModelExportForm({
                id_warehouse:dataWarehouse._id,
                id_employee: id_employee,
                id_user:dataUser._id,
                export_form_status_paid:false,
                export_form_product: arr_export,
                export_form_note:note,
                export_form_type:validator.TYPE_EXPORT_WARRANTY
            }).save()

            for(let i =0;i<arrProduct.length;i++){
                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product,{
                    $set:{
                        product_status: true,
                    },
                    $push:{
                        product_note:`${new Date()} xuất trả bảo hành khách hàng từ kho ${dataWarehouse.warehouse_name} mã phiếu xuất ${imsert_export._id} , mã phiếu bảo hành ${arrProduct[i]._id}`
                    }
                })
                const dataWarranty = await ModelWarranty.findById(arrProduct[i]._id)
                for(let j =0;j<dataWarranty.warranty_product.length;j++){
                    if(dataWarranty.warranty_product[j].id_product.toString() == arrProduct[i].id_product.toString()){
                        dataWarranty.warranty_product[j].status_return_customer = true
                        dataWarranty.warranty_product[j].date_return_customer = new Date()

                    }
                }
                await ModelWarranty.findByIdAndUpdate(dataWarranty._id,{
                    warranty_product: dataWarranty.warranty_product
                })
            }
            return res.json(imsert_export._id)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}

export const change_supplier_new = async (app)=>{
   
    app.post(prefixApi +"/change-new/supplier", helper.authenToken, async (req, res) => {
        try
        {
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này.")
            const id_user = req.body.id_user
            const id_subcategory = req.body.id_subcategory
            const id_product2 = req.body.id_product2
            const id_warranty = req.body.id_warranty
            const id_product = req.body.id_product
            const id_employee = req.body._caller._id
            const note = req.body.note
            if(!validator.ObjectId.isValid(id_user) || !validator.ObjectId.isValid(id_subcategory) || !validator.ObjectId.isValid(id_warranty) ||  !validator.ObjectId.isValid(id_product) ) return res.status(400).send("Thất bại! Có lỗi xảy ra")
            
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")
         
            const dataProduct = await ModelProduct.findById(id_product)
            if(!dataProduct) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần đổi")

            if(!dataProduct.product_status) return res.status(400).send("Thất bại! Sản phẩm này chưa xuất kho, không thể đổi")

            const dataSub = await ModelSubCategory.findById(id_subcategory)
            if(!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần đổi")

            const dataProduct2 = await ModelProduct.findOne({id_product2:id_product2})
            if(dataProduct2) return res.status(400).send(`Thất bại! Mã phụ ${id_product2} đã tồn tại`)

            if(validator.ObjectId.isValid(id_product2)) return res.status(400).send("Thất bại! Mã phụ của sản phẩm không phù hợp")

            const dataWarranty = await ModelWarranty.findById(id_warranty)
            if(!dataWarranty) return res.status(400).send("Thất bại! Không tìm thấy phiếu bảo hành của sản phẩm")

            const dataWarehouse = await ModelWarehouse.findById(dataWarranty.id_warehouse)
            if(!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho bảo hành của sản phẩm")



            var warranty = dataProduct.product_warranty

            for(let i =0;i<dataWarranty.warranty_product.length;i++){
                if(dataWarranty.warranty_product[i].id_product.toString() == dataProduct._id.toString()){
                  
                    if( validator.ObjectId.isValid(dataWarranty.warranty_product[i].status_change_supplier)) return res.status(400).send("Thất bại! Sản phẩm này đã đổi rồi")
                    if(! dataWarranty.warranty_product[i].status_send_supplier) return res.status(400).send("Thất bại! Sản phẩm này chưa gửi nhà cung cấp")
                    if(dataWarranty.warranty_product[i].status_receive_supplier) return res.status(400).send("Thất bại! Sản phẩm này đã được nhận lại từ nhà cung cấp")

                    if(dataWarranty.warranty_product[i].id_export_form && validator.ObjectId.isValid(dataWarranty.warranty_product[i].id_export_form)){
                        const dataExport = await ModelExportForm.findById(dataWarranty.warranty_product[i].id_export_form)
                        if(dataExport){
                            for(let j =0;j<dataExport.export_form_product.length; j++){
                                if(dataExport.export_form_product[j].id_product.toString() == dataProduct._id.toString()){
                                    warranty = dataExport.export_form_product[j].product_warranty
                                }
                            }
                        }
                    }
                }
            }
            const insert_import = await new ModelImportForm({
                id_warehouse: dataWarehouse._id,
                id_employee: id_employee,
                id_user: dataUser._id,
                import_form_status_paid: false,
                import_form_product: [
                    {
                        id_subcategory: dataSub._id,
                        id_product2: id_product2,
                        subcategory_name: dataSub.subcategory_name,
                        product_import_price: dataProduct.product_import_price,
                        product_import_price_return: 0,
                        product_export_price: 0,
                        product_vat: 0,
                        product_ck: 0,
                        product_discount: 0,
                        product_quantity: 0,
                        product_warranty: warranty,
                        product_index: 0, 
                    }
                ],
                import_form_note: note,
                import_form_type: validator.TYPE_IMPORT_WARRANTY,
            }).save()
            await createAndUpdateReport(dataWarehouse._id, dataSub._id, 1, dataProduct.product_import_price)
            const new_product= await new ModelProduct({
                id_product2: id_product2,
                id_subcategory: dataSub._id,
                subcategory_name: dataSub.subcategory_name,
                product_index: 0,
                product_vat: 5,
                product_ck: 0,
                id_warehouse: dataWarehouse._id,
                id_import_form: insert_import._id,
                product_status: false,
                product_import_price: dataProduct.product_import_price,
                product_warranty: warranty,
                product_note: [
                    `${new Date()} nhập đổi bảo hành từ nhà cung cấp cho sản phẩm có mã ${dataProduct._id}, mã phiếu nhập ${insert_import._id} vào kho ${dataWarehouse.warehouse_name}`
                ],
            }).save()

            for(let i =0;i<dataWarranty.warranty_product.length;i++){
                if(dataWarranty.warranty_product[i].id_product.toString() == dataProduct._id.toString()){
                    dataWarranty.warranty_product[i].status_change_supplier = new_product._id
                    dataWarranty.warranty_product[i].date_receive_supplier = new Date()
                }
            }
            await ModelWarranty.findByIdAndUpdate(dataWarranty._id, {
                warranty_product: dataWarranty.warranty_product
            })

            return res.json({product:new_product, insertImport: insert_import})

        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}


export const change_supplier_other = async (app)=>{
   
    app.post(prefixApi +"/change-other/supplier", helper.authenToken, async (req, res) => {
        try
        {
          
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này.")
            const id_user = req.body.id_user
            const id_product_change = req.body.id_product_change
          
            const id_warranty = req.body.id_warranty
            const id_product = req.body.id_product
            const id_employee = req.body._caller._id
            const note = req.body.note
    
            if(!validator.ObjectId.isValid(id_user) || !validator.ObjectId.isValid(id_product_change) || !validator.ObjectId.isValid(id_warranty) ||  !validator.ObjectId.isValid(id_product) ) return res.status(400).send("Thất bại! Có lỗi xảy ra")
            
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")
         
            const dataProduct = await ModelProduct.findById(id_product)
            if(!dataProduct) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần đổi")

            if(!dataProduct.product_status) return res.status(400).send("Thất bại! Sản phẩm này chưa xuất kho, không thể đổi")

            const dataProduct_change = await ModelProduct.findById(id_product_change)
            if(!dataProduct_change) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần đổi")

            if(!dataProduct_change.product_status) return res.status(400).send("Thất bại! Sản phẩm này chưa xuất kho, không thể đổi")

            const dataSub = await ModelSubCategory.findById(dataProduct_change.id_subcategory)
            if(!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần đổi")

            const dataWarranty = await ModelWarranty.findById(id_warranty)
            if(!dataWarranty) return res.status(400).send("Thất bại! Không tìm thấy phiếu bảo hành của sản phẩm")

            const dataWarehouse = await ModelWarehouse.findById(dataWarranty.id_warehouse)
            if(!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho bảo hành của sản phẩm")

            if(dataProduct_change._id.toString() == dataProduct._id.toString()) return res.status(400).send("Thất bại! Không thể đổi trùng mã sản phẩm")

            var warranty = dataProduct.product_warranty
            for(let i =0;i<dataWarranty.warranty_product.length;i++){
                if(dataWarranty.warranty_product[i].id_product.toString() == dataProduct._id.toString()){
                  
                    if( validator.ObjectId.isValid(dataWarranty.warranty_product[i].status_change_supplier)) return res.status(400).send("Thất bại! Sản phẩm này đã đổi rồi")
                    if(! dataWarranty.warranty_product[i].status_send_supplier) return res.status(400).send("Thất bại! Sản phẩm này chưa gửi nhà cung cấp")
                    if(dataWarranty.warranty_product[i].status_receive_supplier) return res.status(400).send("Thất bại! Sản phẩm này đã được nhận lại từ nhà cung cấp")

                    if(dataWarranty.warranty_product[i].id_export_form && validator.ObjectId.isValid(dataWarranty.warranty_product[i].id_export_form)){
                        const dataExport = await ModelExportForm.findById(dataWarranty.warranty_product[i].id_export_form)
                        if(dataExport){
                            for(let j =0;j<dataExport.export_form_product.length; j++){
                                if(dataExport.export_form_product[j].id_product.toString() == dataProduct._id.toString()){
                                    warranty = dataExport.export_form_product[j].product_warranty
                                }
                            }
                        }
                    }
                }
            }


            const insert_import = await new ModelImportForm({
                id_warehouse: dataWarehouse._id,
                id_employee: id_employee,
                id_user: dataUser._id,
                import_form_status_paid: false,
                import_form_product: [
                    {
                        id_subcategory: dataSub._id,
                        id_product2: dataProduct_change.id_product2,
                        id_product:dataProduct_change._id,
                        subcategory_name: dataSub.subcategory_name,
                        product_import_price: dataProduct_change.product_import_price,
                        product_import_price_return: 0,
                        product_export_price: 0,
                        product_vat: 0,
                        product_ck: 0,
                        product_discount: 0,
                        product_quantity: 0,
                        product_warranty: warranty,
                        product_index: 0, 
                    }
                ],
                import_form_note: note,
                import_form_type: validator.TYPE_IMPORT_WARRANTY,
            }).save()
            await createAndUpdateReport(dataWarehouse._id, dataSub._id, 1, dataProduct.product_import_price)
           
            await ModelProduct.findByIdAndUpdate(dataProduct_change._id,{
                $set:{
                    id_warehouse:dataWarehouse._id,
                    product_status:false
                },
                $push:{
                    product_note:`Nhập đổi bảo hành vào kho ${dataWarehouse.warehouse_name} cho sản phẩm ${dataProduct._id}. mã nhập ${insert_import._id}`
                }
                
            })
            for(let i =0;i<dataWarranty.warranty_product.length;i++){
                if(dataWarranty.warranty_product[i].id_product.toString() == dataProduct._id.toString()){
                    dataWarranty.warranty_product[i].status_change_supplier = dataProduct_change._id
                    dataWarranty.warranty_product[i].date_receive_supplier = new Date()
                }
            }
            await ModelWarranty.findByIdAndUpdate(dataWarranty._id, {
                warranty_product: dataWarranty.warranty_product
            })

            return res.json(insert_import._id)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}


export const change_customer_other = async (app)=>{
   
    app.post(prefixApi +"/change-other/customer", helper.authenToken, async (req, res) => {
        try
        {
          
            if (!await helper.checkPermission("621f17d0b9f68165f3b88e59", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này.")
            const id_user = req.body.id_user
            const id_product_change = req.body.id_product_change
          
            const id_warranty = req.body.id_warranty
            const id_product = req.body.id_product
            const id_employee = req.body._caller._id
            const note = req.body.note
    
            if(!validator.ObjectId.isValid(id_user) || !validator.ObjectId.isValid(id_product_change) || !validator.ObjectId.isValid(id_warranty) ||  !validator.ObjectId.isValid(id_product) ) return res.status(400).send("Thất bại! Có lỗi xảy ra")
            
            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")
         
            const dataProduct = await ModelProduct.findById(id_product)
            if(!dataProduct) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần đổi")

            const dataProduct_change = await ModelProduct.findById(id_product_change)
            if(!dataProduct_change) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần đổi")

            if(dataProduct_change.product_status) return res.status(400).send("Thất bại! Sản phẩm này đã xuất kho, không thể đổi")

            const dataSub = await ModelSubCategory.findById(dataProduct_change.id_subcategory)
            if(!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần đổi")

            const dataWarranty = await ModelWarranty.findById(id_warranty)
            if(!dataWarranty) return res.status(400).send("Thất bại! Không tìm thấy phiếu bảo hành của sản phẩm")

            const dataWarehouse = await ModelWarehouse.findById(dataWarranty.id_warehouse)
            if(!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho bảo hành của sản phẩm")

            if(dataProduct_change.id_warehouse.toString() != dataWarehouse._id.toString()) return res.status(400).send(`Thất bại! Sản phẩm đổi không thuộc kho đang bảo hành.`)
            if(dataProduct_change._id.toString() == dataProduct._id.toString()) return res.status(400).send("Thất bại! Không thể đổi trùng mã sản phẩm")

            var warranty = dataProduct.product_warranty
            for(let i =0;i<dataWarranty.warranty_product.length;i++){
                if(dataWarranty.warranty_product[i].id_product.toString() == dataProduct._id.toString()){
                  
                    if( validator.ObjectId.isValid(dataWarranty.warranty_product[i].status_change_customer)) return res.status(400).send("Thất bại! Sản phẩm này đã đổi rồi")
                    if(dataWarranty.warranty_product[i].status_return_customer) return res.status(400).send("Thất bại! Sản phẩm này đã trả bảo hành")
                }
            }


            const insert_export = await new ModelExportForm({
                id_warehouse: dataWarehouse._id,
                id_employee: id_employee,
                id_user: dataUser._id,
                export_form_status_paid: false,
                export_form_product: [
                    {
                        id_product:  dataProduct_change._id,
                        id_product2: dataProduct_change.id_product2,
                        id_subcategory: dataSub._id,
                        subcategory_name: dataSub.subcategory_name,
                        product_export_price: dataProduct_change.product_import_price,
                        product_vat: 0,
                        product_ck: 0,
                        product_discount: 0,
                        product_quantity: 1,
                        product_warranty: time_warranty_new(new Date(),0) ,
                        product_import_price: dataProduct_change.product_import_price,
                        subcategory_point: 0,
                        subcategory_part: 0,          
                    }
                ],
                export_form_note: note,
                export_form_type: validator.TYPE_EXPORT_WARRANTY,
            }).save()
          
           
            await ModelProduct.findByIdAndUpdate(dataProduct_change._id,{
                $set:{
                    id_export_form:insert_export._id,
                    product_status:true
                },
                $push:{
                    product_note:`Xuất đổi trả bảo hành kh từ kho ${dataWarehouse.warehouse_name} cho sản phẩm ${dataProduct._id}. mã xuất ${insert_export._id}`
                }
                
            })
            for(let i =0;i<dataWarranty.warranty_product.length;i++){
                if(dataWarranty.warranty_product[i].id_product.toString() == dataProduct._id.toString()){
                    dataWarranty.warranty_product[i].status_change_customer = dataProduct_change._id
                    dataWarranty.warranty_product[i].date_return_customer = new Date()
                }
            }
            await ModelWarranty.findByIdAndUpdate(dataWarranty._id, {
                warranty_product: dataWarranty.warranty_product
            })

            return res.json(insert_export._id)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}
