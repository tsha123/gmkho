const prefixApi = '/api/import/import-period';
import sanitize from "mongo-sanitize";
import * as helper from '../../../helper/helper.js'
import * as validator from '../../../helper/validator.js'
import * as warehouse from '../../ControllerWarehouse/index.js'
import * as fundbook from '../../ControllerFundBook/index.js'
import { ModelUser } from '../../../models/User.js'
import { ModelWarehouse } from '../../../models/Warehouse.js'
import { ModelFundBook } from '../../../models/FundBook.js'
import { ModelImportForm } from '../../../models/ImportForm.js'
import { ModelProduct } from '../../../models/Product.js'
import { ModelSubCategory } from '../../../models/SubCategory.js'
import { ModelDebt } from '../../../models/Debt.js'
import { ModelPayment } from '../../../models/Payment.js'
import { createAndUpdateReport} from '../../ControllerReportInventory/index.js'

// export const checkPermission = async (app)=>{
//     app.get(prefixApi,helper.authenToken, async (req, res)=>{
//         try{
//             if(!await helper.checkPermission("61ee7394fc3b22e001d48eae", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
//             const warehouses = await warehouse.getWarehouseByBranch(req.body._caller.id_branch_login)
//             const fundbooks = await fundbook.getFundbookByBranch(req.body._caller.id_branch_login)
//             return res.json({warehouses: warehouses,fundbooks:fundbooks})
//         }
//         catch(e){
//             return res.status(500).send("Thất bại! Có lỗi xảy ra")
//         }
//     })
// }
export const insert = async (app)=>{
    app.post(prefixApi,helper.authenToken, async (req, res)=>{
        try{
            if(!await helper.checkPermission("61ee7394fc3b22e001d48eae", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const dataReturn = await createFormImport(req, res)
            return res.json(dataReturn)

        }
        catch(e){
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
export const createFormImport = async (req, res) => {
    try {
        const id_user = req.body.id_user // id nhà cung cấp
        const id_warehouse = req.body.id_warehouse // id kho cần nhập vào
        // const id_fundbook = req.body.id_fundbook // hình thức thanh toán
        const import_form_type = req.body.type_import  // hình thức nhập (Nhập hàng từ nhà cung cấp / Nhập hàng tồn đầu kì)
        // const payment_form_money = req.body.payment_form_money  // số tiền khách thanh toán
        const import_form_note = req.body.import_form_note  // ghi chú của phiếu
        const id_employee = req.body._caller._id
        const dataUser = await ModelUser.findById(id_user)
        if (!dataUser) return res.status(400).send("Thất bại! Nhà cung cấp không tồn tại")
        const dataWarehouse = await ModelWarehouse.findById(id_warehouse)
        if (!dataWarehouse) return res.status(400).send("Thất bại! Kho không tồn tại")
        // const dataFundBook = await ModelFundBook.findById(id_fundbook)
        // if (!dataFundBook) return res.status(400).send("Thất bại! Không tồn tại hình thưc thanh toán")
        
        const arrProduct = JSON.parse(req.body.arrProduct)
     
        for (let i = 0; i < arrProduct.length; i++){ // kiểm tra trùng mã sp phụ trong mảng
            for (let j = 0; j < arrProduct.length; j++){
                if (j != i) {
                    if (arrProduct[i].id_product2  && arrProduct[j].id_product2 && arrProduct[i].id_product2.trim() == arrProduct[j].id_product2.trim()) {
                        return res.status(400).send(`Thất bại! Mã phụ ${arrProduct[i].id_product2 } đã tồn tại trong danh sách sản phẩm hiện tại`)
                    }
                }
                
            }
        }
        var arrProductFormImport = [] // mảng sp này danh cho phiếu nhập
     
        for (let i = 0; i < arrProduct.length; i++){
            if (arrProduct[i].id_product2) {
                const dataProduct = await ModelProduct.findOne({ id_product2: arrProduct[i].id_product2 })
                if(dataProduct) return res.status(400).send(`Mã phụ ${arrProduct[i].id_product2} đã tồn tại với sản phẩm có mã ${dataProduct._id}`)
            }
            const dataSub = await ModelSubCategory.findById(arrProduct[i].id_subcategory)
            if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần nhập")
            arrProductFormImport.push({
                id_product2: arrProduct[i].id_product2,
                id_subcategory: dataSub._id,
                subcategory_name: dataSub.subcategory_name,
                product_index: i,
                product_warranty: arrProduct[i].product_warranty,
                product_import_price: arrProduct[i].product_import_price,
                product_vat: arrProduct[i].product_vat,
                product_ck: arrProduct[i].product_ck,
                product_discount: arrProduct[i].product_discount,
                product_quantity: arrProduct[i].product_quantity
            })
        }   
        try {
            const insertImport = await new ModelImportForm({
                id_warehouse: dataWarehouse._id,
                id_employee: id_employee,
                id_user: dataUser._id,
                import_form_product: arrProductFormImport,
                import_form_note: import_form_note,
                import_form_type:import_form_type
            }).save()
           
            var arrProductForModal = [] // mảng này là dùng để insert product many
            if (!insertImport) return res.status(400).send("Thất bại! Không thể thêm phiếu")
            for (let i = 0; i < arrProductFormImport.length; i++){
                for(let j = 0;j<arrProductFormImport[i].product_quantity;j++){
                    arrProductForModal.push(
                        new ModelProduct({
                            ... arrProductFormImport[i],
                            id_import_form: insertImport._id,
                            id_warehouse: dataWarehouse._id,
                            product_note:[`${insertImport._id.toString()}`],
                            product_status:false
                        })
                    )
                }
                await createAndUpdateReport(dataWarehouse._id, arrProductFormImport[i].id_subcategory,  arrProductFormImport[i].product_quantity, validator.calculateMoneyImport(arrProductFormImport[i]) )
            }
            const insertProducts = await ModelProduct.insertMany(arrProductForModal)
            const totalMoney = validator.calculateMoneyImport(insertImport.import_form_product);
            return {insertImport:insertImport, insertProducts:insertProducts, totalMoney:totalMoney}
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    }
    catch (e) {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
   
}




export const insertMore = async (app)=>{
    app.post(prefixApi+"/add/more",helper.authenToken, async (req, res)=>{
        try{
            if (!await helper.checkPermission("61ee7394fc3b22e001d48eae", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_import = req.body.id_import
            const dataImport = await ModelImportForm.findById(id_import)
            if (!dataImport) return res.status(400).send("Thất bại! Không tìm thấy phiếu nhập")
            if (dataImport.import_form_status_paid) return res.status(400).send("Thất bại! Phiếu xuất đã thanh toán, không thể xuất thêm")
         
            const id_fundbook = req.body.id_fundbook // hình thức thanh toán
           
            const import_form_note = req.body.import_form_note  // ghi chú của phiếu
            const arrProduct = JSON.parse(req.body.arrProduct)
        
            for (let i = 0; i < arrProduct.length; i++){ // kiểm tra trùng mã sp phụ trong mảng
                for (let j = 0; j < arrProduct.length; j++){
                    if (j != i) {
                        if (arrProduct[i].id_product2  && arrProduct[j].id_product2 && arrProduct[i].id_product2.trim() == arrProduct[j].id_product2.trim()) {
                            return res.status(400).send(`Thất bại! Mã phụ ${arrProduct[i].id_product2 } đã tồn tại trong danh sách sản phẩm hiện tại`)
                        }
                    }
                    
                }
            }
            var indexProduct = dataImport.import_form_product.length;
            var arrProductFormImport = [] // mảng sp này danh cho phiếu nhập
            for (let i = 0; i < arrProduct.length; i++){
                if (arrProduct[i].id_product2) {
                    const dataProduct = await ModelProduct.findOne({ id_product2: arrProduct[i].id_product2 })
                    if(dataProduct) return res.status(400).send(`Mã phụ ${arrProduct[i].id_product2} đã tồn tại với sản phẩm có mã ${dataProduct._id}`)
                }
                const dataSub = await ModelSubCategory.findById(arrProduct[i].id_subcategory)
                if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm cần nhập")
                arrProductFormImport.push({
                    id_product2: arrProduct[i].id_product2,
                    id_subcategory: dataSub._id,
                    subcategory_name: dataSub.subcategory_name,
                    product_index: indexProduct ++,
                    product_warranty: arrProduct[i].product_warranty,
                    product_import_price: arrProduct[i].product_import_price,
                    product_vat: arrProduct[i].product_vat,
                    product_ck: arrProduct[i].product_ck,
                    product_discount: arrProduct[i].product_discount,
                    product_quantity: arrProduct[i].product_quantity
                })
            } 
           
            var arrProductForModal = [] // mảng này là dùng để insert product many
            for (let i = 0; i < arrProductFormImport.length; i++){
                for(let j = 0;j<arrProductFormImport[i].product_quantity;j++){
                    arrProductForModal.push(
                        new ModelProduct({
                            ... arrProductFormImport[i],
                            id_import_form: dataImport._id,
                            id_warehouse: dataImport.id_warehouse,
                        
                        })
                    )
                }
            }
            try {
                const insertProducts = await ModelProduct.insertMany(arrProductForModal)
                const dataImportUpdate = await ModelImportForm.findByIdAndUpdate(dataImport._id, {
                    $push: {
                        import_form_product: arrProductFormImport
                    },
                    $set: {
                        import_form_note:import_form_note
                    }    
                    
                }).lean()
                for (let i = 0; i < arrProductFormImport.length; i++){
                    await createAndUpdateReport(
                        dataImport.id_warehouse,
                        arrProductFormImport[i].id_subcategory,
                        arrProductFormImport[i].product_quantity,
                        validator.calculateMoneyImport(arrProductFormImport[i]),
                    )
                }
                return  res.json({insertImport:dataImportUpdate, insertProducts:insertProducts})
            }
            catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
            

        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
