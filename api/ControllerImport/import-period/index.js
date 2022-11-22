const prefixApi = '/api/import/import-period';
import sanitize from "mongo-sanitize";
import * as helper from '../../../helper/helper.js'
import * as validator from '../../../helper/validator.js'
import * as warehouse from '../../ControllerWarehouse/index.js'
import * as fundbook from '../../ControllerFundBook/index.js'
import { ModelUser } from '../../../models/User.js'
import { ModelWarehouse } from '../../../models/Warehouse.js'
import { ModelFundBook } from '../../../models/FundBook.js'
import { ModelExportForm } from '../../../models/ExportForm.js'
import { ModelImportForm } from '../../../models/ImportForm.js'
import { ModelProduct } from '../../../models/Product.js'
import { ModelSubCategory } from '../../../models/SubCategory.js'
import { ModelDebt } from '../../../models/Debt.js'
import { ModelPayment } from '../../../models/Payment.js'

export const management = async (app)=>{
    app.get(prefixApi,helper.authenToken, async (req, res)=>{
        try{
            if(!await helper.checkPermission("61ee7394fc3b22e001d48eae", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            let query = {}
            if (validator.isDefine(req.query.id_warehouse) && validator.ObjectId.isValid(req.query.id_warehouse)) {
                query = {
                    ...query,
                    id_warehouse: validator.ObjectId(req.query.id_warehouse),
                }
            }
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } },{ createdAt: { $lte:validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay  } }]
                }
            }
            if (validator.isDefine(req.query.import_form_type)) {
                query = {
                    ...query,
                    import_form_type:req.query.import_form_type
                }
            }
            if (validator.isDefine(req.query.key)) {
                query = {
                    ...query,
                    $or: [{ "user.user_fullname":{$regex:".*"+req.query.key+".*", $options:"i"}},{"user.user_phone":{$regex:".*"+req.query.key+".*", $options:"i"}},{"import_form_product.subcategory_name":{$regex:".*"+req.query.key+".*", $options:"i"}}]
                }
            }
            if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
                query = {_id: validator.ObjectId(req.query.key)}
                    
            }
            const datas = await ModelImportForm.aggregate([
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
               
            ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))

            const count = await ModelImportForm.aggregate([
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
                data.payment_form_money = 0
                data.user_fullname = data.user.user_fullname
                data.user_phone = data.user.user_phone
                data.user_address = data.user.user_address
                delete data.user
                if (data.import_form_status_paid) {
                    const dataPayment = await ModelPayment.findOne({ id_form: data._id });
                    if (dataPayment) {
                        const data_fundbook = await ModelFundBook.findById(dataPayment.id_fundbook)
                        
                        if (data_fundbook) {
                            
                            data.fundbook_name = data_fundbook.fundbook_name
                            data.payment_form_money = dataPayment.payment_money   
                        }
                    }
                }
                
            }))
            
            return res.json({data:datas, count:count.length>0?count[0].count:0})
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
            if(!await helper.checkPermission("61ee7394fc3b22e001d48eae", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
           
            const arrProduct = JSON.parse(req.body.arrProduct) // mảng sản phẩm mới
            const id_import = req.body.id_import  // id phiếu nhập cần update

            const dataImport = await ModelImportForm.findById(id_import)  
            if (!dataImport) return res.status(400).send("Thất bại! Không tìm thấy phiếu nhập")
           
            if(arrProduct.length != dataImport.import_form_product.length) return res.status(400).send("Thất bại! Dữ liệu không khớp xin hãy load lại trang")
          
           
            const dataProducts = await ModelProduct.find({id_import_form:dataImport._id})
            var isSame  = 0; // đây là biến xác định đã trùng hết mã sp hay chưa
            for(let i = 0;i<arrProduct.length;i++ ){
                for(let j = 0;j<dataProducts.length;j++){
                    if(arrProduct[i].product_index == dataProducts[j].product_index){ // nếu cùng index sẽ được thay đổi
                        isSame ++
                        dataProducts[j] = {
                            ...dataProducts[j],
                            product_warranty:arrProduct[i].product_warranty, // cập nhập lại mỗi bảo hành thôi , còn cái khác láy từ phiếu nhập ra,
                            old_import_price:dataProducts[j].product_import_price,
                            product_import_price:arrProduct[i].product_import_price,
                        }
                    }
                }
            }
            // console.log(dataProducts)
            if(isSame != dataProducts.length) return res.status(400).send("Thất bại! Có sản phẩm không phù hợp")

            for(let i =0;i<dataProducts.length;i++){
            
                await ModelProduct.findByIdAndUpdate(dataProducts[i]._id,dataProducts[i]) // cập nhập lại sản phẩm cũ với bảo hành mới
                if(dataProducts[i].product_import_price != dataProducts[i].old_import_price){
                    console.log( dataProducts[i])
                    const dataExport = await ModelExportForm.find({type:"Xuất hàng để bán","export_form_product.id_product":dataProducts[i]._id})
                    for(let j = 0;j<dataExport.length;j++){
                        for(let g = 0;g<dataExport[j].export_form_product.length;g++){
                            if(dataExport[j].export_form_product[g].id_product.toString() == dataProducts[i]._id.toString()){
                                dataExport[j].export_form_product[g].product_import_price = dataProducts[i].product_import_price
                                break
                            }
                        }
                        await ModelExportForm.findByIdAndUpdate(dataExport[j]._id,{
                            export_form_product:dataExport[j].export_form_product
                        })
                    }
                }
            }

            const updateImport = await ModelImportForm.findByIdAndUpdate(dataImport._id, {  // 
                import_form_product: arrProduct,
            })
            return res.json(updateImport)
            
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
