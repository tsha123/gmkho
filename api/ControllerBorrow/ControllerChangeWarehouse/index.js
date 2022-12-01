const prefixApi = "/api/change-warehouse"
import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"


import { ModelSubCategory } from "../../models/SubCategory.js"
import { ModelUser } from "../../models/User.js"
import { ModelImportForm} from "../../models/ImportForm.js"
import { ModelExportForm} from "../../models/ExportForm.js"
import { ModelFundBook} from "../../models/FundBook.js"
import { ModelWarehouse} from "../../models/Warehouse.js"
import { ModelProduct} from "../../models/Product.js"
import { ModelHistoryProduct } from "../../models/HistoryProduct.js"

import {ModelChangeWarehouse} from "../../models/ChangeWarehouse.js"

import * as warehouse from './../ControllerWarehouse/index.js'
import * as fundbook from './../ControllerFundBook/index.js'


export const checkPermission = async (app) => {
    app.get(prefixApi +"/check-permission" , helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("62e4904cac23489afdaabeff", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const warehouses = await warehouse.getWarehouseByBranch(req.body._caller.id_branch_login)
            const fundbooks = await fundbook.getFundbookByBranch(req.body._caller.id_branch_login)
            return res.json({warehouses: warehouses,fundbooks:fundbooks})
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const management = async (app) => {
    app.get(prefixApi , helper.authenToken, async (req, res) => {
        try {

            if (!(await helper.checkPermission("62e4904cac23489afdaabeff", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_fromwarehouse = req.query.id_fromwarehouse
            const id_towarehouse = req.query.id_towarehouse
            const key = req.query.key
            let query = {}
            
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    ...validator.query_createdAt(req.query.fromdate , req.query.todate)
                }
            }
            if(key && validator.ObjectId.isValid(key)){
                query = {
                    ...query,
                    id_export_form:validator.ObjectId(key)
                }
            }
            if(id_fromwarehouse && validator.ObjectId.isValid(id_fromwarehouse)) query = {
                ...query,
                id_fromwarehouse:validator.ObjectId(id_fromwarehouse)
            }

            if(id_towarehouse && validator.ObjectId.isValid(id_towarehouse)) query = {
                ...query,
                id_towarehouse:validator.ObjectId(id_towarehouse)
            }
            

            const data = await ModelChangeWarehouse.find(query)
            const count = await ModelChangeWarehouse.countDocuments(query)

            for(let i =0;i<data.length;i++){
                const dataExport = await ModelExportForm.findById(data[i].id_export_form)
                data[i].export_form_product = dataExport.export_form_product
                data[i].export_form_note = dataExport.export_form_note

                const dataFrom_w = await ModelWarehouse.findById(data[i].id_fromwarehouse)
                if(dataFrom_w) data[i].from_warehouse_name = dataFrom_w.warehouse_name

                const dataFrom_t = await ModelWarehouse.findById(data[i].id_towarehouse)
                if(dataFrom_t) data[i].to_warehouse_name = dataFrom_t.warehouse_name
            }
            return res.json({data:data, count:count})
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const insert = async (app) => {
    app.post(prefixApi , helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("62e4904cac23489afdaabeff", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_branch = req.body._caller.id_branch_login
            const id_warehouse_to = req.body.id_warehouse

            const employee_name = req.body._caller.employee_fullname
            const type_export = validator.TYPE_EXPORT_CHANGE_WAREHOUSE
            const point_number = validator.tryParseInt(req.body.point_number)
            const voucher_code = req.body.voucher_code
            const export_form_note = req.body.export_form_note
            const receive_money = validator.tryParseInt(req.body.receive_money)
            const arrProduct = JSON.parse(req.body.arrProduct)
            const id_fundbook = req.body.id_fundbook
            const id_employee = req.body._caller._id
            const id_employee_setting = req.body.id_employee_setting

            const dataUser = await ModelUser.findById(id_branch)
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
                arrProduct[i].product_import_price = validator.totalMoney(product.product_import_price, 0,0)
                arrProduct[i].id_form_import = product.id_import_form
                arrProduct[i].product_index = i
           
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
          
            const data_warehouse_to = await ModelWarehouse.findById(id_warehouse_to)
            if (!data_warehouse_to) return res.status(400).send("Thất bại! Không tìm thấy kho tới")

            if(data_warehouse.id_branch.toString() != id_branch.toString() || data_warehouse.id_branch.toString() != data_warehouse_to.id_branch.toString()) return res.status(400).send("Không thể đổi kho khác chi nhánh")

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

            for(let i =0;i<arrProduct.length;i++){
                arrProduct[i].product_import_price = arrProduct[i].product_export_price
                delete arrProduct[i].product_export_price 
            }
            const insertImport = await new ModelImportForm({
                id_warehouse: data_warehouse_to._id,
                id_employee: id_employee,
                id_user: dataUser._id,
                import_form_product: arrProduct,
                import_form_note: export_form_note,
                import_form_type:  validator.TYPE_IMPORT_CHANGE_WAREHOUSE,
                import_form_status_paid :false
            }).save()

          
            for (let i = 0; i < arrProduct.length; i++){
                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, 
                    {
                        $set:{ 
                            product_import_price:arrProduct[i].product_import_price,
                            product_vat:arrProduct[i].product_vat,
                            product_ck:arrProduct[i].product_ck,
                            id_warehouse:data_warehouse_to._id,
                            product_warranty: arrProduct[i].product_warranty, 
                            id_export_form: insertFormExport._id 
                        },
                        $push:{
                            product_note:[`${insertFormExport._id.toString()}`,`${insertImport._id.toString()}`]
                        }
                    })
                await new ModelHistoryProduct({
                    product_id:arrProduct[i].id_product,
                    content: `Xuất và nhập hàng chuyển kho, Mã phiếu xuất: ${insertFormExport._id}, mã phiếu nhập ${insertImport._id} bởi nhân viên ${employee_name} từ kho ${data_warehouse.warehouse_name} tới kho ${data_warehouse_to.warehouse_name}, giá vốn: ${arrProduct[i].product_import_price}`
                }).save()
            }
            await new ModelChangeWarehouse({
                id_export_form: insertFormExport._id,
                id_import_form: insertImport._id,
                id_fromwarehouse: data_warehouse._id,
                id_towarehouse: data_warehouse_to._id,
                id_employee:id_employee,
            }).save()
            return res.json(insertFormExport)
           
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

