const prefixApi = '/api/export/export-sale';
import sanitize from "mongo-sanitize";
import * as helper from '../../../helper/helper.js'
import * as validator from '../../../helper/validator.js'
import * as warehouse from '../../ControllerWarehouse/index.js'
import * as fundbook from '../../ControllerFundBook/index.js'
import { ModelUser } from '../../../models/User.js'
import { ModelWarehouse } from '../../../models/Warehouse.js'
import { ModelFundBook } from '../../../models/FundBook.js'
import { ModelEmployee } from '../../../models/Employee.js'

import { ModelProduct } from '../../../models/Product.js'
import { ModelSubCategory } from '../../../models/SubCategory.js'
import { ModelDebt } from '../../../models/Debt.js'
import { ModelReceive } from '../../../models/Receive.js'
import { checkCodeDiscount, checkCodeDiscountReturnError } from './../../ControllerVoucher/index.js'
import { checkPoint, checkPointReturnZero } from './../../ControllerPoint/index.js'
import { ModelExportForm } from './../../../models/ExportForm.js'
import { ModelImportForm } from './../../../models/ImportForm.js'
import { update_status_voucher } from './../../ControllerVoucher/index.js'
import { update_part } from './../../ControllerPart/index.js'
import { createAndUpdateReport } from '../../ControllerReportInventory/index.js'
import { ModelHistoryProduct } from './../../../models/HistoryProduct.js'

export const checkPermission = async (app) => {
    app.get(prefixApi + "/checkPermission", helper.authenToken, async (req, res) => {

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


export const insert = async (app) => {
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            create_form(req, res)
        } catch (e) {
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const insert_by_mobile = async (app) => {
    app.post(prefixApi + "/by-app", helper.authenToken, async (req, res) => {
        try {
            // if (!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            create_form_mobile(req, res)
        } catch (e) {
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const create_form = async (req, res) => {
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
        const employee_name = req.body._caller.employee_fullname

        const id_employee_setting = req.body.id_employee_setting
        const dataUser = await ModelUser.findById(id_user)
        if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")
        const dataFundbook = await ModelFundBook.findById(id_fundbook)
        if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
        if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất một sản phẩm")
        for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
            for (let j = i + 1; j < arrProduct.length; j++) {
                if (arrProduct[i].id_product == arrProduct[j].id_product) return res.status(400).send(`Thất bại! Mã sản phẩm ${arrProduct[j].id_product} bị lặp trùng`)
            }
        }
        var id_warehouse = null
        var totalPointPlus = 0
        var totalPart = 0;
        // bắt đầu tìm kiếm sản phẩm và kiểm tra
        for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
            const product = await ModelProduct.findById(arrProduct[i].id_product)
            if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
            if (product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} đã được xuất kho`)

            if (i == 0) id_warehouse = product.id_warehouse
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

            totalPointPlus += sub_category.subcategory_point
            // if (validator.ObjectId.isValid(arrProduct[i].id_employee)) {
            //     totalPart += sub_category.subcategory_part
            // }
        }
        const total = validator.calculateMoneyExport(arrProduct)
        var money_voucher_code = 0
        var money_point = 0

        if (voucher_code) { // tính tiền mã giảm giá
            money_voucher_code = await checkCodeDiscountReturnError(voucher_code, total)
            if (isNaN(money_voucher_code)) return res.status(400).send(money_voucher_code)
        }

        if (point_number > 0) { // tính tiền từ đổi điểm
            money_point = await checkPointReturnZero(dataUser._id, point_number)
            if (isNaN(money_point)) return res.status(400).send(money_point)
        }
        const data_warehouse = await ModelWarehouse.findById(id_warehouse)
        if (!data_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của sản phẩm")

        if (data_warehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho của sản phâm không thuộc chi nhánh này")
        var is_payment = false // trạng thái đã thanh toán chưa của phiếu xuất
        if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
            is_payment = true
        }

        const insertFormExport = await new ModelExportForm({ // tạo phiếu xuất trước
            id_warehouse: data_warehouse._id,
            id_employee: id_employee,
            id_user: dataUser._id,
            export_form_status_paid: is_payment,
            export_form_product: arrProduct,
            export_form_note: export_form_note,
            export_form_type: type_export,
            voucher_code: voucher_code,
            money_voucher_code: money_voucher_code,
            point_number: point_number,
            money_point: money_point,
            id_employee_setting: id_employee_setting
            // createdAt: validator.dateTimeZone().currentTime
        }).save()

        const insertDebt = await new ModelDebt({ // tạo công nợ
            id_user: dataUser._id, // tên nhân viên
            id_branch: id_branch,
            id_employee: id_employee,
            debt_money_receive: receive_money + money_point + money_voucher_code,
            debt_money_export: total,
            debt_note: export_form_note,
            debt_type: "export",
            id_form: insertFormExport._id,
        }).save()
        if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
            const receive = await ModelReceive({
                id_user: dataUser._id, // người dùng
                receive_money: receive_money,
                receive_type: "export", // loại chi từ : import (phiếu nhập ), export(phiếu xuất)
                id_employee: id_employee,
                id_branch: id_branch,
                receive_content: "61fe7ec950262301a2a39fcc",
                id_form: insertFormExport._id, // id từ mã phiếu tạo (phiếu nhập , xuất . ..)
                receive_note: export_form_note, // ghi chú
                id_fundbook: dataFundbook._id,
            }).save()
        }
        if (voucher_code) await update_status_voucher(voucher_code)

        for (let i = 0; i < arrProduct.length; i++) {
            await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, { $set: { product_status: true, product_warranty: arrProduct[i].product_warranty, id_export_form: insertFormExport._id }, $push: { product_note: `${insertFormExport._id.toString()}` } })
            await ModelImportForm.findByIdAndUpdate(arrProduct[i].id_import_form, { import_form_status_paid: true })

            await new ModelHistoryProduct({
                product_id: arrProduct[i].id_product,
                content: `Xuất hàng ${type_export} bởi nhân viên ${employee_name} từ kho ${data_warehouse.warehouse_name}, khách hàng: ${dataUser.user_fullname} (${dataUser._id}) , mã phiếu xuất : ${insertFormExport._id},giá xuất: ${arrProduct[i].product_export_price} giá vốn: ${arrProduct[i].product_import_price}`
            }).save()
        }

        if ((receive_money + money_point + money_voucher_code) == total) { // cộng điểm cho khách
            await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: { user_point: (totalPointPlus - point_number) } })
        } else {
            await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: (-point_number) })
        }
        // await update_part(id_branch, totalPart)

        return res.json(insertFormExport)
    } catch (e) {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }

}

export const insertMore = async (app) => {
    app.post(prefixApi + "/more", helper.authenToken, async (req, res) => {
        try {

            const id_export = req.body.id_export
            if (!validator.ObjectId.isValid(id_export)) return res.status(400).send("Thất bại! Mã phiếu không đúng")
            const dataExport = await ModelExportForm.findById(id_export)
            if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")
            if (dataExport.export_form_status_paid) return res.status(400).send("Thất bại! Phiếu xuất đã được thanh toán, không thể xuất thêm")


            const dataDebt = await ModelDebt.findOne({ id_from: dataExport._id })
            if (!dataDebt) return res.status(400).send("Thất bại! Không tìm thấy công nợ trước đó")

            const id_branch = req.body._caller.id_branch_login
            const id_user = dataExport.id_user
            const dataUser = await ModelUser.findById(id_user)
            const point_number = validator.tryParseInt(req.body.point_number)
            const voucher_code = req.body.voucher_code == '' ? null : req.body.voucher_code
            const export_form_note = req.body.export_form_note
            const receive_money = validator.tryParseInt(req.body.receive_money)

            const arrProduct = JSON.parse(req.body.arrProduct)


            const id_fundbook = req.body.id_fundbook
            const id_employee = req.body._caller._id
            const employee_name = req.body._caller.employee_fullname

            const dataFundbook = await ModelFundBook.findById(id_fundbook)
            if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
            if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất một sản phẩm")
            for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
                for (let j = i + 1; j < arrProduct.length; j++) {
                    if (arrProduct[i].id_product == arrProduct[j].id_product) return res.status(400).send(`Thất bại! Mã sản phẩm ${arrProduct[j].id_product} bị lặp trùng`)
                }
            }
            var id_warehouse = dataExport.id_warehouse
            var totalPointPlus = 0
            var totalPart = 0;
            // bắt đầu tìm kiếm sản phẩm và kiểm tra
            for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
                const product = await ModelProduct.findById(arrProduct[i].id_product)
                if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
                if (product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} đã được xuất kho`)


                const sub_category = await ModelSubCategory.findById(product.id_subcategory)
                if (!sub_category) return res.status(400).send(`Thất bại! Không tìm thấy tên của sản phẩm ${product._id}`)
                if (product.id_warehouse.toString() != id_warehouse.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${product._id} không cùng kho với các sản phẩm khác `)
                arrProduct[i].id_product2 = product.id_product2
                arrProduct[i].id_subcategory = product.id_subcategory
                arrProduct[i].subcategory_name = sub_category.subcategory_name
                arrProduct[i].subcategory_part = sub_category.subcategory_part
                arrProduct[i].subcategory_point = sub_category.subcategory_point
                arrProduct[i].product_import_price = product.product_import_price
                arrProduct[i].id_form_import = product.id_import_form

                totalPointPlus += sub_category.subcategory_point

                if (validator.ObjectId.isValid(arrProduct[i].id_employee)) {
                    totalPart += sub_category.subcategory_part
                }
            }
            const total = validator.calculateMoneyExport(arrProduct) + validator.calculateMoneyExport(dataExport.export_form_product) // tổng tiền = tổng mới + tổng cũ

            var money_voucher_code = 0
            var money_point = 0

            if (voucher_code) { // tính tiền mã giảm giá
                money_voucher_code = await checkCodeDiscountReturnError(voucher_code, total)
                if (isNaN(money_voucher_code)) return res.status(400).send(money_voucher_code)

            }

            if (point_number > 0) { // tính tiền từ đổi điểm
                money_point = await checkPointReturnZero(dataUser._id, point_number, res)
                if (isNaN(money_point)) return res.status(400).send(money_point)

            }
            const data_warehouse = await ModelWarehouse.findById(id_warehouse)
            if (!data_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của sản phẩm")

            if (data_warehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho của sản phâm không thuộc chi nhánh này")
            var is_payment = false // trạng thái đã thanh toán chưa của phiếu xuất
            if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
                is_payment = true
            }

            const updateExport = await ModelExportForm.findByIdAndUpdate(dataExport._id, { // tạo phiếu xuất trước
                $set: {
                    export_form_status_paid: is_payment,
                    export_form_note: export_form_note,
                    voucher_code: voucher_code,
                    money_voucher_code: money_voucher_code,
                    point_number: point_number,
                    money_point: money_point,

                },
                $push: {
                    export_form_product: { $each: arrProduct } // push thêm mảng mới vào mảng sp cũ
                }

            })

            const insertDebt = await ModelDebt.findByIdAndUpdate(dataDebt._id, { // tạo công nợ
                debt_money_receive: receive_money + money_point + money_voucher_code,
                debt_money_export: total,
            })
            if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
                const receive = await ModelReceive({
                    id_user: dataUser._id, // người dùng
                    receive_money: receive_money,
                    receive_type: "export", // loại chi từ : import (phiếu nhập ), export(phiếu xuất)
                    id_employee: id_employee,
                    id_branch: id_branch,
                    receive_content: "61fe7ec950262301a2a39fcc",
                    id_form: dataExport._id, // id từ mã phiếu tạo (phiếu nhập , xuất . ..)
                    receive_note: export_form_note, // ghi chú
                    id_fundbook: dataFundbook._id,
                }).save()
            }
            if (voucher_code) await update_status_voucher(voucher_code)

            for (let i = 0; i < arrProduct.length; i++) {

                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, { $set: { product_status: true, product_warranty: arrProduct[i].product_warranty, id_export_form: dataExport._id } })
                await ModelImportForm.findByIdAndUpdate(arrProduct[i].id_import_form, { import_form_status_paid: true })
                await new ModelHistoryProduct({
                    product_id: arrProduct[i].id_product,
                    content: `Xuất hàng (xuất thêm) ${dataExport.export_form_type} bởi nhân viên ${employee_name} từ kho ${data_warehouse.warehouse_name}, khách hàng: ${dataUser.user_fullname} (${dataUser._id}) , mã phiếu xuất : ${insertFormExport._id},giá xuất: ${arrProduct[i].product_export_price} giá vốn: ${arrProduct[i].product_import_price}`
                }).save()
            }

            if ((receive_money + money_point + money_voucher_code) == total) { // cộng điểm cho khách
                await ModelUser.findByIdAndUpdate(id_user, { $inc: { user_point: (totalPointPlus - point_number) } })
            } else {
                await ModelUser.findByIdAndUpdate(id_user, { $inc: { user_point: (-point_number) } })
            }
            await update_part(id_branch, totalPart)
            return res.json(updateExport)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const checkPermissionMore = async (app) => {
    app.get(prefixApi + "/checkPermission/more", helper.authenToken, async (req, res) => {

        try {
            if (!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const warehouses = await warehouse.getWarehouseByBranch(req.body._caller.id_branch_login)
            const fundbooks = await fundbook.getFundbookByBranch(req.body._caller.id_branch_login)
            const dataExport = await ModelExportForm.findById(req.query.id_export)
            if (!dataExport) return res.status(400).send("Không tìm thấy phiếu xuất")

            const dataUser = await ModelUser.findById(dataExport.id_user)
            if (!dataUser) return res.status(400).send("Thất bại, Không tìm phiếu người dùng/khách hàng")
            dataExport.user_fullname = dataUser.user_fullname
            dataExport.user_phone = dataUser.user_phone
            dataExport.user_address = dataUser.address
            dataExport.user_point = dataUser.user_point

            return res.json({ warehouses: warehouses, fundbooks: fundbooks, dataExport: dataExport })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


// export const insert_by_mobile = async (app) => {
//     app.post(prefixApi + "/by-employee", helper.authenToken, async (req, res) => {
//         try {
//             create_form_mobile(req, res)
//         } catch (e) {
//             return res.status(500).send("Thất bại! Có lỗi xảy ra")
//         }
//     })
// }

// const create_form_mobile = async (req, res) => {
//     try {

//         const id_branch = req.body._caller.id_branch
//         const id_user = req.body.id_user
//         const type_export = validator.TYPE_EXPORT
//         const point_number = validator.tryParseInt(req.body.point_number)
//         const voucher_code = req.body.voucher_code
//         const export_form_note = req.body.export_form_note
//         const receive_money = validator.tryParseInt(req.body.receive_money)
//         const arrProduct = JSON.parse(req.body.arrProduct)
//         const id_fundbook = req.body.id_fundbook
//         const id_employee = req.body._caller._id
//         const id_employee_setting = req.body.id_employee_setting
//         const dataUser = await ModelUser.findById(id_user)
//         if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp")
//         const dataFundbook = await ModelFundBook.findById(id_fundbook)
//         if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
//         if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất một sản phẩm")
//         for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
//             for (let j = i + 1; j < arrProduct.length; j++) {
//                 if (arrProduct[i].id_product == arrProduct[j].id_product) return res.status(400).send(`Thất bại! Mã sản phẩm ${arrProduct[j].id_product} bị lặp trùng`)
//             }
//         }
//         // console.log("đầu tiên_________",req.body.arrProduct)
//         var id_warehouse = null
//         var totalPointPlus = 0
//         var totalPart = 0;
//         // bắt đầu tìm kiếm sản phẩm và kiểm tra
//         for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
//             const product = await ModelProduct.findById(arrProduct[i].id_product)
//             if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
//             if (product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} đã được xuất kho`)

//             if (i == 0) id_warehouse = product.id_warehouse
//             const sub_category = await ModelSubCategory.findById(product.id_subcategory)
//             if (!sub_category) return res.status(400).send(`Thất bại! Không tìm thấy tên của sản phẩm ${product._id}`)
//             if (product.id_warehouse.toString() != id_warehouse.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${product._id} không cùng kho với các sản phẩm khác `)
//             arrProduct[i].id_product2 = product.id_product2
//             arrProduct[i].id_subcategory = product.id_subcategory
//             arrProduct[i].subcategory_name = sub_category.subcategory_name
//             arrProduct[i].subcategory_part = sub_category.subcategory_part
//             arrProduct[i].subcategory_point = sub_category.subcategory_point
//             arrProduct[i].product_import_price = validator.totalMoney(product.product_import_price, 0, product.product_ck)
//             arrProduct[i].id_form_import = product.id_import_form,
//                 arrProduct[i].id_employee = id_employee

//             totalPointPlus += sub_category.subcategory_point
//             if (validator.ObjectId.isValid(arrProduct[i].id_employee)) {
//                 totalPart += sub_category.subcategory_part
//             }
//         }
//         const total = validator.calculateMoneyExport(arrProduct)
//         var money_voucher_code = 0
//         var money_point = 0

//         if (voucher_code) { // tính tiền mã giảm giá
//             money_voucher_code = await checkCodeDiscountReturnError(voucher_code, total)
//             if (isNaN(money_voucher_code)) return res.status(400).send(money_voucher_code)
//         }

//         if (point_number > 0) { // tính tiền từ đổi điểm
//             money_point = await checkPointReturnZero(dataUser._id, point_number)
//             if (isNaN(money_point)) return res.status(400).send(money_point)
//         }
//         const data_warehouse = await ModelWarehouse.findById(id_warehouse)
//         if (!data_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của sản phẩm")

//         if (data_warehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho của sản phâm không thuộc chi nhánh này")
//         var is_payment = false // trạng thái đã thanh toán chưa của phiếu xuất
//         if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
//             is_payment = true
//         }
//         // console.log(arrProduct)
//         const insertFormExport = await new ModelExportForm({ // tạo phiếu xuất trước
//             id_warehouse: data_warehouse._id,
//             id_employee: id_employee,
//             id_user: dataUser._id,
//             export_form_status_paid: is_payment,
//             export_form_product: arrProduct,
//             export_form_note: export_form_note,
//             export_form_type: type_export,
//             voucher_code: voucher_code,
//             money_voucher_code: money_voucher_code,
//             point_number: point_number,
//             money_point: money_point,
//             id_employee_setting: id_employee_setting
//             // createdAt: validator.dateTimeZone().currentTime
//         }).save()

//         const insertDebt = await new ModelDebt({ // tạo công nợ
//             id_user: dataUser._id, // tên nhân viên
//             id_branch: id_branch,
//             id_employee: id_employee,
//             debt_money_receive: receive_money + money_point + money_voucher_code,
//             debt_money_export: total,
//             debt_note: export_form_note,
//             debt_type: "export",
//             id_form: insertFormExport._id,
//         }).save()
//         if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
//             const receive = await ModelReceive({
//                 id_user: dataUser._id, // người dùng
//                 receive_money: receive_money,
//                 receive_type: "export", // loại chi từ : import (phiếu nhập ), export(phiếu xuất)
//                 id_employee: id_employee,
//                 id_branch: id_branch,
//                 receive_content: "61fe7ec950262301a2a39fcc",
//                 id_form: insertFormExport._id, // id từ mã phiếu tạo (phiếu nhập , xuất . ..)
//                 receive_note: export_form_note, // ghi chú
//                 id_fundbook: dataFundbook._id,
//             }).save()
//         }
//         if (voucher_code) await update_status_voucher(voucher_code)

//         for (let i = 0; i < arrProduct.length; i++) {
//             await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, { $set: { product_status: true, product_warranty: arrProduct[i].product_warranty, id_export_form: insertFormExport._id }, $push: { product_note: `${insertFormExport._id.toString()}` } })
//             await ModelImportForm.findByIdAndUpdate(arrProduct[i].id_import_form, { import_form_status_paid: true })
//         }

//         if ((receive_money + money_point + money_voucher_code) == total) { // cộng điểm cho khách
//             await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: { user_point: (totalPointPlus - point_number) } })
//         } else {
//             await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: (-point_number) })
//         }
//         // await update_part(id_branch, totalPart)

//         return res.json(insertFormExport._id)
//     } catch (e) {
//         console.log(e)
//         return res.status(500).send("Thất bại! Có lỗi xảy ra")
//     }

// }


export const create_form_mobile = async (req, res) => {
    try {


        let id_user = null

        const user_fullname = req.body.user_fullname
        const user_phone = req.body.user_phone
        if (!user_phone) return res.status(400).send(`Thất bại! Số điện thoại khách hàng không được để trống`)
        var dataUser = await ModelUser.findOne({ $and: [{ user_fullname: user_fullname }, { user_phone: user_phone }] })

        if (!dataUser) {
            const checkPhone_user = await ModelUser.findOne({ user_phone: user_phone })
            if (checkPhone_user) return res.status(400).send(`Thất bại! Số điện thoại đã được tạo với tên khách hàng ${checkPhone_user.user_fullname}`)

            dataUser = await new ModelUser({
                user_fullname: user_fullname,
                user_phone: user_phone
            }).save()
            id_user = dataUser._id
        }


        const type_export = validator.TYPE_EXPORT
        const point_number = validator.tryParseInt(req.body.point_number)
        const voucher_code = req.body.voucher_code
        const export_form_note = req.body.export_form_note
        const receive_money = validator.tryParseInt(req.body.receive_money)
        const arrProduct = JSON.parse(req.body.arrProduct)

        const id_fundbook = req.body.id_fundbook
        const id_employee = req.body._caller._id
        const employee_name = req.body._caller.employee_fullname
        const data_Employee = await ModelEmployee.findById(id_employee)
        if (!data_Employee) return res.status(400).send(`Thất bại! Không tìm thấy nhân viên`)

        const id_branch = data_Employee.id_branch
        const id_employee_setting = req.body.id_employee_setting

        const dataFundbook = await ModelFundBook.findById(id_fundbook)
        if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
        if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất một sản phẩm")
        for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
            for (let j = i + 1; j < arrProduct.length; j++) {
                if (arrProduct[i].id_product == arrProduct[j].id_product) return res.status(400).send(`Thất bại! Mã sản phẩm ${arrProduct[j].id_product} bị lặp trùng`)
            }
        }
        var id_warehouse = null
        var totalPointPlus = 0
        var totalPart = 0;
        // bắt đầu tìm kiếm sản phẩm và kiểm tra
        for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
            const product = await ModelProduct.findById(arrProduct[i].id_product)
            if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
            if (product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} đã được xuất kho`)

            if (i == 0) id_warehouse = product.id_warehouse
            const sub_category = await ModelSubCategory.findById(product.id_subcategory)
            if (!sub_category) return res.status(400).send(`Thất bại! Không tìm thấy tên của sản phẩm ${product._id}`)
            if (product.id_warehouse.toString() != id_warehouse.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${product._id} không cùng kho với các sản phẩm khác `)
            arrProduct[i].id_product2 = product.id_product2
            arrProduct[i].id_subcategory = product.id_subcategory
            arrProduct[i].subcategory_name = sub_category.subcategory_name
            arrProduct[i].subcategory_part = sub_category.subcategory_part
            arrProduct[i].subcategory_point = sub_category.subcategory_point
            arrProduct[i].product_import_price = validator.totalMoney(product.product_import_price, 0, product.product_ck)
            arrProduct[i].id_form_import = product.id_import_form,
                arrProduct[i].id_employee = id_employee


            totalPointPlus += sub_category.subcategory_point
            // if (validator.ObjectId.isValid(arrProduct[i].id_employee)) {
            //     totalPart += sub_category.subcategory_part
            // }
        }
        const total = validator.calculateMoneyExport(arrProduct)
        var money_voucher_code = 0
        var money_point = 0

        if (voucher_code) { // tính tiền mã giảm giá
            money_voucher_code = await checkCodeDiscountReturnError(voucher_code, total)
            if (isNaN(money_voucher_code)) return res.status(400).send(money_voucher_code)
        }

        if (point_number > 0) { // tính tiền từ đổi điểm
            money_point = await checkPointReturnZero(dataUser._id, point_number)
            if (isNaN(money_point)) return res.status(400).send(money_point)
        }
        const data_warehouse = await ModelWarehouse.findById(id_warehouse)
        if (!data_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của sản phẩm")

        if (data_warehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho của sản phâm không thuộc chi nhánh của bạn")
        var is_payment = false // trạng thái đã thanh toán chưa của phiếu xuất
        if ((receive_money + money_point + money_voucher_code) > 0) { // tạo phiếu thu 
            is_payment = true
        }

        const insertFormExport = await new ModelExportForm({ // tạo phiếu xuất trước
            id_warehouse: data_warehouse._id,
            id_employee: id_employee,
            id_user: dataUser._id,
            export_form_status_paid: is_payment,
            export_form_product: arrProduct,
            export_form_note: export_form_note,
            export_form_type: type_export,
            voucher_code: voucher_code,
            money_voucher_code: money_voucher_code,
            point_number: point_number,
            money_point: money_point,
            id_employee_setting: id_employee_setting,
            export_status_by_app: false,
            payment_temp: receive_money,
            id_fundbook_temp: id_fundbook,
            export_source: "app"
            // createdAt: validator.dateTimeZone().currentTime
        }).save()


        if (voucher_code) await update_status_voucher(voucher_code)

        for (let i = 0; i < arrProduct.length; i++) {
            await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, { $set: { product_status: true, product_warranty: arrProduct[i].product_warranty, id_export_form: insertFormExport._id }, $push: { product_note: `${insertFormExport._id.toString()}` } })
            await ModelImportForm.findByIdAndUpdate(arrProduct[i].id_import_form, { import_form_status_paid: true })

            await new ModelHistoryProduct({
                product_id: arrProduct[i].id_product,
                content: `Xuất hàng ${type_export} bởi nhân viên ${employee_name} từ kho ${data_warehouse.warehouse_name}, khách hàng: ${dataUser.user_fullname} (${dataUser._id}) , mã phiếu xuất : ${insertFormExport._id},giá xuất: ${arrProduct[i].product_export_price} giá vốn: ${arrProduct[i].product_import_price}`
            }).save()
        }

        if ((receive_money + money_point + money_voucher_code) == total) { // cộng điểm cho khách
            await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: { user_point: (totalPointPlus - point_number) } })
        } else {
            await ModelUser.findByIdAndUpdate(dataUser._id, { $inc: (-point_number) })
        }
        // await update_part(id_branch, totalPart)

        return res.json(insertFormExport._id)
    } catch (e) {
        console.error(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }

}