const prefixApi = '/api/import/import-return';
import sanitize from "mongo-sanitize";
import * as helper from '../../../helper/helper.js'
import * as validator from '../../../helper/validator.js'
import * as warehouse from '../../ControllerWarehouse/index.js'
import * as fundbook from '../../ControllerFundBook/index.js'
import { ModelUser } from '../../../models/User.js'
import { ModelWarehouse } from '../../../models/Warehouse.js'
import { ModelFundBook } from '../../../models/FundBook.js'

import { ModelProduct } from '../../../models/Product.js'
import { ModelSubCategory } from '../../../models/SubCategory.js'
import { ModelDebt } from '../../../models/Debt.js'
import { ModelReceive } from '../../../models/Receive.js'
import { checkCodeDiscount } from './../../ControllerVoucher/index.js'
import { checkPoint } from './../../ControllerPoint/index.js'
import { ModelExportForm } from './../../../models/ExportForm.js'
import { ModelImportForm } from './../../../models/ImportForm.js'
import { update_status_voucher } from './../../ControllerVoucher/index.js'
import { update_part } from './../../ControllerPart/index.js'
import { ModelPayment } from '../../../models/Payment.js'
import { createAndUpdateReport } from '../../ControllerReportInventory/index.js'
import { ModelHistoryProduct } from './../../../models/HistoryProduct.js'

export const checkPermission = async(app) => {
    app.get(prefixApi + "/checkPermission", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const warehouses = await warehouse.getWarehouseByBranch(req.body._caller.id_branch_login)
            const fundbooks = await fundbook.getFundbookByBranch(req.body._caller.id_branch_login)
            return res.json({ warehouses: warehouses, fundbooks: fundbooks })
        } catch (e) {
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const insert = async(app) => {
    app.post(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            create_form(req, res)
        } catch (e) {
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const create_form = async(req, res) => {
    try {
        const employee_name = req.body._caller.employee_fullname
        const id_branch = req.body._caller.id_branch_login
        const id_user = req.body.id_user
        const type_import = req.body.type_import
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
        if (dataWarehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho hiện tại không thuộc chi nhánh đang đăng nhập , vui lòng chọn kho khác.")
        if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất một sản phẩm")
        for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
            for (let j = i + 1; j < arrProduct.length; j++) {
                if (arrProduct[i].id_product == arrProduct[j].id_product) return res.status(400).send(`Thất bại! Mã sản phẩm ${arrProduct[j].id_product} bị lặp trùng.`)
            }
        }


        var totalPointNeg = 0
        var totalPart = 0;
        // bắt đầu tìm kiếm sản phẩm và kiểm tra
        for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
            const product = await ModelProduct.findById(arrProduct[i].id_product)
            if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
            if (!product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} chưa xuất kho.`)


            const sub_category = await ModelSubCategory.findById(product.id_subcategory)
            if (!sub_category) return res.status(400).send(`Thất bại! Không tìm thấy tên của sản phẩm ${product._id}.`)

            const dataExport = await ModelExportForm.findById(product.id_export_form) // phiếu xuất trước đó
            if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất trước đó.")

            for (let j = 0; j < dataExport.export_form_product.length; j++) {

                if (dataExport.export_form_product[j].id_product.toString() == product._id.toString()) {
                    arrProduct[i].subcategory_point = dataExport.export_form_product[j].subcategory_point
                        // arrProduct[i].id_employee = dataExport.export_form_product[j].id_employee
                        // arrProduct[i].id_employee_setting = dataExport.id_employee_setting
                    arrProduct[i].subcategory_part = dataExport.export_form_product[j].subcategory_part
                    arrProduct[i].subcategory_name = sub_category.subcategory_name
                    arrProduct[i].id_form_export = dataExport._id
                    arrProduct[i].id_product2 = product.id_product2
                    arrProduct[i].id_subcategory = product.id_subcategory,
                        arrProduct[i].product_export_price = validator.totalMoney(dataExport.export_form_product[j].product_export_price, 0, dataExport.export_form_product[j].product_ck, dataExport.export_form_product[j].product_discount)

                    // arrProduct[i].product_import_price_return = validator.totalMoney(product.product_import_price,0,product.product_ck) // giá nhập của sản phẩm
                    arrProduct[i].id_import_form = product.id_import_form // gán lại id phiếu nhập đầu tiên của để tí update thành đã thanh toán để ko sửa giá nhập nữa
                    totalPointNeg += dataExport.export_form_product[j].subcategory_point // trừ điểm đã cộng cho khách
                    if (dataExport.export_form_product[j].id_employee && validator.ObjectId.isValid(dataExport.export_form_product[j].id_employee)) { // trừ bạc nhân viên
                        totalPart += dataExport.export_form_product[j].subcategory_part
                    }

                    break
                }
            }


        }
        const import_form_status_paid = payment_money > 0 ? true : false
        const insertImport = await new ModelImportForm({
            id_warehouse: dataWarehouse._id,
            id_employee: id_employee,
            id_user: dataUser._id,
            import_form_product: arrProduct,
            import_form_note: import_form_note,
            import_form_type: "Nhập hàng khách trả lại",
            import_form_status_paid: import_form_status_paid
        }).save()

        for (let i = 0; i < arrProduct.length; i++) {
            await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, {
                $set:
                {
                    product_warranty: arrProduct[i].product_warranty,
                    product_status: false,
                    id_warehouse: dataWarehouse._id,
                    product_import_price: arrProduct[i].product_import_price_return,
                },
                $push:{
                    product_note:insertImport._id.toString()
                }
            })


            await ModelImportForm.findByIdAndUpdate(arrProduct[i].id_import_form, { import_form_status_paid: true })
            await createAndUpdateReport(dataWarehouse._id, arrProduct[i].id_subcategory, arrProduct[i].product_quantity, arrProduct[i].product_import_price)
            await new ModelHistoryProduct({
                product_id:arrProduct[i].id_product,
                content: `Nhập hàng khách trả lại, mã phiếu :${insertImport._id} bởi nhân viên ${employee_name} ,Kho nhập: ${dataWarehouse.warehouse_name} bảo hành :${arrProduct[i].product_warranty} giá nhập lại: ${arrProduct[i].product_import_price} giá vốn: ${arrProduct[i].product_import_price_return}, giá lúc xuất đi: ${arrProduct[i].product_export_price}`
            }).save()
        }

        const total = validator.calculateMoneyImport(insertImport.import_form_product);

        const insertDebt = await new ModelDebt({ // tạo công nợ
            id_user: dataUser._id, // tên nhân viên
            id_branch: id_branch,
            id_employee: id_employee,
            debt_money_payment: payment_money,
            debt_money_import: total,
            debt_note: import_form_note,
            debt_type: "import",
            id_form: insertImport._id,
        }).save()

        if (payment_money > 0) { // tạo phiếu thu 
            const insertPayment = new ModelPayment({
                id_user: dataUser._id,
                payment_money: payment_money,
                id_employee: id_employee,
                id_branch: id_branch,
                id_form: insertImport._id,
                payment_note: import_form_note,
                payment_content: "61fe7f7950262301a2a39fdc", // "Chi trả nhập hàng từ nhà cung cấp",
                id_fundbook: id_fundbook,
                payment_type: "import",
            }).save()
        }
        await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: { user_point: -totalPointNeg } })
        await update_part(id_branch, -totalPart)

        for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
            const product = await ModelProduct.findById(arrProduct[i].id_product)
            const dataExport = await ModelExportForm.findById(product.id_export_form) // phiếu xuất trước đó

            for (let j = 0; j < dataExport.export_form_product.length; j++) {

                if (dataExport.export_form_product[j].id_product.toString() == product._id.toString()) {
                    dataExport.export_form_product[j].id_import_return = insertImport._id
                }
            }
            await ModelExportForm.findByIdAndUpdate(dataExport._id, {
                export_form_product: dataExport.export_form_product
            })
        }
        return res.json(insertImport)
    } catch (e) {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }

}