// const prefixApi = '/api/export';
// import sanitize from "mongo-sanitize";
// import * as helper from '../../../helper/helper.js'
// import * as validator from '../../../helper/validator.js'
// import * as warehouse from '../../ControllerWarehouse/index.js'
// import * as fundbook from '../../ControllerFundBook/index.js'
// import { ModelUser } from '../../../models/User.js'
// import { ModelWarehouse } from '../../../models/Warehouse.js'
// import { ModelFundBook } from '../../../models/FundBook.js'
// import { ModelExportForm } from '../../../models/ExportForm.js'
// import { ModelProduct } from '../../../models/Product.js'
// import { ModelSubCategory } from '../../../models/SubCategory.js'
// import { ModelDebt } from '../../../models/Debt.js'
// import { ModelReceive } from '../../../models/Receive.js'

// export const management = async (app)=>{
//     app.get(prefixApi,helper.authenToken, async (req, res)=>{
//         try {
            
//             if(!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
//             let query = {}
//             if (validator.isDefine(req.query.id_warehouse) && validator.ObjectId.isValid(req.query.id_warehouse)) {
//                 query = {
//                     ...query,
//                     id_warehouse: validator.ObjectId(req.query.id_warehouse),
//                 }
//             }
//             if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
//                 query = {
//                     ...query,
//                     $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } },{ createdAt: { $lte:validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay  } }]
//                 }
//             }
//             if (validator.isDefine(req.query.export_form_type)) {
//                 query = {
//                     ...query,
//                     export_form_type:req.query.export_form_type
//                 }
//             }
//             if (validator.isDefine(req.query.key)) {
//                 query = {
//                     ...query,
//                     $or: [{ "user.user_fullname":{$regex:".*"+req.query.key+".*", $options:"i"}},{"user.user_phone":{$regex:".*"+req.query.key+".*", $options:"i"}},{"export_form_product.subcategory_name":{$regex:".*"+req.query.key+".*", $options:"i"}}]
//                 }
//             }
//             if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
//                 query = {_id: validator.ObjectId(req.query.key)}
                    
//             }
//             const datas = await ModelExportForm.aggregate([
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "id_user",
//                         foreignField: "_id",
//                         as:"user"
//                     }
//                 }, {
//                     $unwind: {
//                         path: "$user",
//                     }
//                 },
//                 {
//                     $match:query
//                 },
//                 {
//                     $sort: {
//                         _id:-1
//                     }
//                 }
//             ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))

//             const count = await ModelExportForm.aggregate([
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "id_user",
//                         foreignField: "_id",
//                         as:"user"
//                     }
//                 }, {
//                     $unwind: {
//                         path: "$user",
//                     }
//                 },
//                 {
//                     $match:query
//                 },
//                 {
//                     $count:"count"
//                 }
               
//             ])
//             await Promise.all(datas.map( async data => {
//                 data.fundbook_name = ""
//                 data.receive_form_money = 0
//                 data.user_fullname = data.user.user_fullname
//                 data.user_phone = data.user.user_phone
//                 data.user_address = data.user.user_address
//                 delete data.user
//                 if (data.export_form_status_paid) {
//                     const dataReceive = await ModelReceive.findOne({ id_form: data._id });
//                     if (dataReceive) {
//                         const data_fundbook = await ModelFundBook.findById(dataReceive.id_fundbook)
//                         if (data_fundbook) {
                            
//                             data.fundbook_name = data_fundbook.fundbook_name
//                             data.receive_form_money = dataReceive.receive_money   
//                         }
//                     }
//                 }
                
//             }))
     
//             return res.json({data:datas, count:count.length>0?count[0].count:0})
//         }
//         catch (e) {
//             console.log(e)
//             return res.status(500).send("Thất bại! Có lỗi xảy ra")
//         }
//     })
// }
// export const update = async (app)=>{
//     app.put(prefixApi,helper.authenToken, async (req, res)=>{
//         try{
//             if (!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
         
//             const is_payment_zero = req.body.is_payment_zero==='true'
//             const arrProduct = JSON.parse(req.body.arrProduct) // mảng sản phẩm mới
//             const id_export = req.body.id_export  // id phiếu nhập cần update
//             const receive_form_money = validator.tryParseInt(req.body.receive_form_money) //tiền khách thanh toán
//             const id_fundbook = req.body.id_fundbook  // sổ quỹ
//             const export_form_note = req.body.export_form_note  // ghi chú mới + ghi chú cũ
//             const dataExport = await ModelExportForm.findById(id_export)  
//             if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")
//             const dataDebt = await ModelDebt.findOne({ id_form: dataExport._id })
//             if(!dataDebt) return res.status(400).send("Thất bại! Không tìm thầy công nợ cũ")
//             if(arrProduct.length != dataExport.export_form_product.length) return res.status(400).send("Thất bại! Dữ liệu không khớp xin hãy load lại trang")
//             const data_fundbook = await ModelFundBook.findById(id_fundbook)
//             if(!data_fundbook) return res.status(400).send("Thất bại! Không tìm thấy hình thức thanh toán phù hợp")
        
//             for(let i = 0;i<arrProduct.length;i++ ){
//                 await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, {
//                     product_warranty:arrProduct[i].product_warranty
//                 })
//             }
      
//             let isPayment = false
//             if (receive_form_money > 0 || is_payment_zero) {
//                 const insertReceive= new ModelReceive({
//                     id_user: dataExport.id_user,
//                     receive_money: receive_form_money,
//                     id_employee: req.body._caller._id,
//                     id_branch: req.body._caller.id_branch_login,
//                     id_form:dataExport._id,
//                     receive_note: export_form_note,
//                     receive_content:"61fe7f6b50262301a2a39fd4", // "Chi trả nhập hàng từ nhà cung cấp",
//                     id_fundbook: id_fundbook,
//                     receive_type: "export",
//                 }).save()
//                 isPayment = true
//             }
            
//             const total = validator.calculateMoneyExport(arrProduct)
//             await ModelDebt.findByIdAndUpdate(dataDebt._id, {
//                 debt_money_export: total,
//                 debt_money_receive:receive_form_money
//             })
//             const updateImport = await ModelExportForm.findByIdAndUpdate(dataExport._id, {  // 
//                 export_form_status_paid: isPayment, 
//                 export_form_product: arrProduct,
//                 export_form_note:export_form_note
//             })
//             // chỗ này thiếu chỗ phải cập nhập giá ở các phiếu xuất
            
//             return res.json(updateImport)
            
//         }
//         catch (e) {
//             console.log(e)
//             return res.status(500).send("Thất bại! Có lỗi xảy ra")
//         }
//     })
// }
