const prefixApi = '/api/internal-order';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelWarehouse } from '../../models/Warehouse.js'
import { ModelSubCategory } from '../../models/SubCategory.js'
import { ModelInternalOrder } from '../../models/InternalOrder.js'
import { ModelEmployee } from '../../models/Employee.js'
import { getWarehouseByBranch, getWarehouseOtherBranch } from './../ControllerWarehouse/index.js'
import { getFundbookByBranch } from './../ControllerFundBook/index.js'
import * as warehouse from './../ControllerWarehouse/index.js'
import * as fundbook from './../ControllerFundBook/index.js'
import { ModelUser } from '../../models/User.js'

import { ModelFundBook } from '../../models/FundBook.js'
import { ModelExportForm } from '../../models/ExportForm.js'
import { ModelImportForm } from '../../models/ImportForm.js'

import { ModelProduct } from '../../models/Product.js'
import { ModelDebt } from '../../models/Debt.js'
import { ModelReceive } from '../../models/Receive.js'
import { ModelPayment } from '../../models/Payment.js'

export const checkPermission = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi + "/checkPermission", helper.authenToken, async(req, res) => {
            try {
                if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
                const warehouses = await getWarehouseOtherBranch(req.body._caller.id_branch_login)
                const warehouses_of_branch = await getWarehouseByBranch(req.body._caller.id_branch_login)
                const fundbooks = await getFundbookByBranch(req.body._caller.id_branch_login)
                return res.json({ warehouses: warehouses, warehouses_of_branch: warehouses_of_branch, fundbooks: fundbooks })
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        })
        //#endregion api lấy danh sách chức năng và nhóm người dùng

}

export const checkPermissionExport = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi + "/checkPermission/export", helper.authenToken, async(req, res) => {
            try {
                if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
                const warehouses = await warehouse.getWarehouseByBranch(req.body._caller.id_branch_login)
                const fundbooks = await fundbook.getFundbookByBranch(req.body._caller.id_branch_login)
                const id_internal_order = req.query.id_internal_order
                if (!validator.ObjectId.isValid(id_internal_order)) return res.status(400).send("Thất bại! Không tìm thấy đơn đề xuất")
                const dataInternal = await ModelInternalOrder.findById(id_internal_order)
                if (!dataInternal) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
                if (dataInternal.interal_order_status != "Chưa xử lý") return res.status(400).send("Thất bại! Phiếu này đã được xử lý, không thể xuất thêm")

                const fromwarehouse = await ModelWarehouse.findById(dataInternal.from_warehouse)
                if (!fromwarehouse) return res.status(400).send(`Thất bại! Không tìm thấy kho đề xuất`)

                const dataUser = await ModelUser.findById(fromwarehouse.id_branch)
                if (dataUser) {
                    dataInternal.user_fullname = dataUser.user_fullname
                    dataInternal.user_phone = dataUser.user_phone
                    dataInternal.user_address = dataUser.user_address
                    dataInternal.from_user = dataUser._id
                } else {
                    dataInternal.user_fullname = null
                    dataInternal.user_phone = null
                    dataInternal.user_address = null
                }
                return res.json({ warehouses: warehouses, fundbooks: fundbooks, dataInternal: dataInternal })
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        })
        //#endregion api lấy danh sách chức năng và nhóm người dùng

}

export const management = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async(req, res) => {
            try {
                if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
                let query = {}
                if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                    query = {
                        ...query,
                        $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } }, { createdAt: { $lte: validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay } }]
                    }
                }
                if (validator.isDefine(req.query.from_warehouse)) {
                    query = {
                        ...query,
                        from_warehouse: validator.ObjectId(req.query.from_warehouse)
                    }
                }
                if (validator.isDefine(req.query.to_warehouse)) {
                    query = {
                        ...query,
                        to_warehouse: validator.ObjectId(req.query.to_warehouse)
                    }
                }
                if (validator.isDefine(req.query.interal_order_status)) {
                    query = {
                        ...query,
                        interal_order_status: req.query.interal_order_status
                    }
                }
                if (validator.isDefine(req.query.key)) {
                    query = {
                        ...query,
                        $or: [
                            { "fromWarehouse.warehouse_name": { $regex: ".*" + req.query.key.trim() + ".*", $options: "i" } },
                            { "toWarehouse.warehouse_name": { $regex: ".*" + req.query.key.trim() + ".*", $options: "i" } },
                        ]
                    }
                }
                if (validator.ObjectId.isValid(req.query.key)) {
                    query = {
                        $or: [
                            { _id: validator.ObjectId(req.query.key.trim()) },
                            { id_import_form: validator.ObjectId(req.query.key.trim()) },
                            { id_export_form: validator.ObjectId(req.query.key.trim()) },
                        ]
                    }
                }
                const data = await ModelInternalOrder.aggregate([{
                        $lookup: {
                            from: "warehouses",
                            localField: "from_warehouse",
                            foreignField: "_id",
                            as: "fromWarehouse"
                        }
                    },
                    {
                        $lookup: {
                            from: "warehouses",
                            localField: "to_warehouse",
                            foreignField: "_id",
                            as: "toWarehouse"
                        }
                    },
                    {
                        $match: query
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }

                ])
                const count = await ModelInternalOrder.aggregate([{
                        $lookup: {
                            from: "warehouses",
                            localField: "from_warehouse",
                            foreignField: "_id",
                            as: "fromWarehouse"
                        }
                    },
                    {
                        $lookup: {
                            from: "warehouses",
                            localField: "to_warehouse",
                            foreignField: "_id",
                            as: "toWarehouse"
                        }
                    },
                    {
                        $match: query
                    },
                    {
                        $count: "count"
                    }
                ])
                for (let i = 0; i < data.length; i++) {
                    data[i].from_employee_name = ""
                    data[i].to_employee_name = ""
                    if (validator.ObjectId.isValid(data[i].from_employee)) {
                        const dataEm = await ModelEmployee.findById(data[i].from_employee)
                        if (dataEm) data[i].from_employee_name = dataEm.employee_fullname
                    }
                    if (validator.ObjectId.isValid(data[i].to_employee)) {
                        const dataEm = await ModelEmployee.findById(data[i].to_employee)
                        if (dataEm) data[i].to_employee_name = dataEm.employee_fullname
                    }

                    const to_ware = await ModelWarehouse.findById(data[i].to_warehouse)
                    const dataUser = await ModelUser.findById(to_ware.id_branch)
                    if (dataUser) {
                        data[i].temp_to_user_fullname = dataUser.user_fullname
                        data[i].temp_to_user_id = dataUser._id
                    }
                }

                return res.json({ data: data, count: count.length > 0 ? count[0].count : 0 })
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        })
        //#endregion api lấy danh sách chức năng và nhóm người dùng


}

export const insert = async(app) => {
    app.post(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const arrProduct = JSON.parse(req.body.arrProduct)
            const from_warehouse = req.body.from_warehouse
            const to_warehouse = req.body.to_warehouse
            const internal_order_note = req.body.internal_order_note
            if (!validator.ObjectId.isValid(from_warehouse) || !validator.ObjectId.isValid(to_warehouse)) return res.status(400).send("Hãy chọn kho phù hợp")
            const data_from_warehouse = await ModelWarehouse.findById(from_warehouse)
            const data_to_warehouse = await ModelWarehouse.findById(to_warehouse)
            if (!data_from_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho muốn đề xuất")
            if (!data_to_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho muốn đề xuất")

            if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất 1 Sản phẩm")
            for (let i = 0; i < arrProduct.length; i++) {
                if (!validator.ObjectId.isValid(arrProduct[i].id_subcategory)) return res.status(400).send(`Thất bại! Sản phẩm ở dòng số ${i+1} không phù hợp`)
                const dataSub = await ModelSubCategory.findById(arrProduct[i].id_subcategory)
                if (!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm dòng ${i + 1}`)
                arrProduct[i] = {
                    ...arrProduct[i],
                    subcategory_name: dataSub.subcategory_name
                }
            }
            try {
                const insertNew = await new ModelInternalOrder({
                    from_warehouse: data_from_warehouse._id,
                    to_warehouse: data_to_warehouse._id,
                    interal_order_product: arrProduct,
                    from_employee: req.body._caller._id,
                    internal_order_note: internal_order_note,
                    interal_order_status: "Chưa xử lý"
                }).save()
                return res.json(insertNew)
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }

        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const update_product = async(app) => {
    app.put(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const arrProduct = JSON.parse(req.body.arrProduct)
            const id_internal_order = req.body.id_internal_order
            if (!validator.ObjectId.isValid(id_internal_order)) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            const dataInternal = await ModelInternalOrder.findById(id_internal_order)
            if (!dataInternal) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")

            if (dataInternal.interal_order_status != "Chưa xử lý") return res.status(400).send("Thất bại! Đơn này đã được xử lý, không thể chỉnh sửa thêm")

            if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất 1 Sản phẩm")
            for (let i = 0; i < arrProduct.length; i++) {
                if (!validator.ObjectId.isValid(arrProduct[i].id_subcategory)) return res.status(400).send(`Thất bại! Sản phẩm ở dòng số ${i+1} không phù hợp`)
                const dataSub = await ModelSubCategory.findById(arrProduct[i].id_subcategory)
                if (!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm dòng ${i + 1}`)
                arrProduct[i] = {
                    ...arrProduct[i],
                    subcategory_name: dataSub.subcategory_name
                }
            }
            try {
                const updateNew = await ModelInternalOrder.findByIdAndUpdate(dataInternal._id, {
                    interal_order_product: arrProduct,
                })
                return res.json(updateNew)
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }

        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const remove = async(app) => {
    app.delete(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const id_internal_order = req.body.id_internal_order
            if (!validator.ObjectId.isValid(id_internal_order)) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            const dataInternal = await ModelInternalOrder.findById(id_internal_order)
            if (!dataInternal) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            if (dataInternal.interal_order_status != "Chưa xử lý") return res.status(400).send("Thất bại! Đơn này đã được xử lý, không thể xóa")

            try {
                const deleteNew = await ModelInternalOrder.findByIdAndDelete(dataInternal._id)
                return res.json(deleteNew)
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }

        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const confirmExport = async(app) => {
    app.post(prefixApi + "/export", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const id_internal_order = req.body.id_internal_order
            if (!validator.ObjectId.isValid(id_internal_order)) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            const dataInternal = await ModelInternalOrder.findById(id_internal_order)
            if (!dataInternal) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            if (dataInternal.interal_order_status != "Chưa xử lý") return res.status(400).send("Thất bại! Đơn này đã được xử lý, không thể xuất")

            const id_branch = req.body._caller.id_branch_login
            const id_user = req.body.id_user
            const type_export = req.body.type_export
            const point_number = validator.tryParseInt(req.body.point_number)

            const export_form_note = req.body.export_form_note
            const receive_money = validator.tryParseInt(req.body.receive_money)
            const arrProduct = JSON.parse(req.body.arrProduct)
            const id_fundbook = req.body.id_fundbook
            const id_employee = req.body._caller._id
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
            const id_warehouse = dataInternal.to_warehouse

            // bắt đầu tìm kiếm sản phẩm và kiểm tra
            for (let i = 0; i < arrProduct.length; i++) { // kiểm tra xem có bị trùng lặp id sản phẩm ko
                const product = await ModelProduct.findById(arrProduct[i].id_product)
                if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${arrProduct[i].id_product}`)
                if (product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} đã được xuất kho`)


                const sub_category = await ModelSubCategory.findById(product.id_subcategory)
                if (!sub_category) return res.status(400).send(`Thất bại! Không tìm thấy tên của sản phẩm ${product._id}`)
                if (product.id_warehouse.toString() != id_warehouse.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${product._id} không cùng kho được đê xuất `)
                arrProduct[i].id_product2 = product.id_product2
                arrProduct[i].id_subcategory = product.id_subcategory
                arrProduct[i].subcategory_name = sub_category.subcategory_name
                arrProduct[i].subcategory_part = 0
                arrProduct[i].subcategory_point = sub_category.subcategory_point
            }
            const total = validator.calculateMoneyExport(arrProduct)

            const data_warehouse = await ModelWarehouse.findById(id_warehouse)
            if (!data_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của sản phẩm")

            if (data_warehouse.id_branch.toString() != id_branch.toString()) return res.status(400).send("Kho của sản phâm không thuộc chi nhánh này")
            var is_payment = false // trạng thái đã thanh toán chưa của phiếu xuất
            if (receive_money > 0) { // tạo phiếu thu 
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
                point_number: point_number,
                voucher_code: null,
                money_voucher_code: 0,
                money_point: 0
                    // createdAt: validator.dateTimeZone().currentTime
            }).save()

            const insertDebt = await new ModelDebt({ // tạo công nợ
                id_user: dataUser._id, // tên nhân viên
                id_branch: id_branch,
                id_employee: id_employee,
                debt_money_receive: receive_money,
                debt_money_export: total,
                debt_note: export_form_note,
                debt_type: "export",
                id_form: insertFormExport._id,
            }).save()
            if (receive_money > 0) { // tạo phiếu thu 
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


            for (let i = 0; i < arrProduct.length; i++) {
                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, { product_status: true, product_warranty: arrProduct[i].product_warranty, id_export_form: insertFormExport._id })
            }

            await ModelInternalOrder.findByIdAndUpdate(dataInternal._id, {
                interal_order_status: "Đã xuất",
                id_export_form: insertFormExport._id,
                to_user: dataUser._id
            })
            return res.json(insertFormExport)

        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const confirmImport = async(app) => {
    app.post(prefixApi + "/import", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62148d3bfa02d1423dd506f0", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_employee = req.body._caller._id

            const id_internal_order = req.body.id_internal_order
            if (!validator.ObjectId.isValid(id_internal_order)) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            const dataInternal = await ModelInternalOrder.findById(id_internal_order)
            if (!dataInternal) return res.status(400).send("Thất bại! Không tìm thấy phiếu đề xuất")
            if (dataInternal.interal_order_status != "Đã xuất") return res.status(400).send("Thất bại! Đơn này đã được được nhập")
            const id_warehouse = dataInternal.from_warehouse
            if (!id_warehouse) return res.status(400).send("Thấy bại! Không tìm thay kho")
            const id_branch = req.body._caller.id_branch_login
            const id_user = req.body.id_user
            const dataUser = await ModelUser.findById(id_user)
            if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy nhà cung cấp phù hợp")
            const id_fundbook = req.body.id_fundbook
            const dataFundbook = await ModelFundBook.findById(id_fundbook)
            if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")

            if (!validator.ObjectId.isValid(dataInternal.id_export_form)) return res.status(400).send("Thất bại! Sản phẩm chưa xuất kho, không thể nhập")
            const dataExport = await ModelExportForm.findById(dataInternal.id_export_form)
            if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")

            const import_form_note = req.body.import_form_note
            const payment_money = validator.tryParseInt(req.body.payment_money)
            const is_payment = payment_money > 0 ? true : false

            const arrProduct = []

            for (let i = 0; i < dataExport.export_form_product.length; i++) {
                const product = await ModelProduct.findById(dataExport.export_form_product[i].id_product)
                if (!product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${dataExport.export_form_product[i].id_product}`)
                if (!product.product_status) return res.status(400).send(`Thất bại! Sản phẩm ${product._id} chưa xuất kho`)
                const dataSub = await ModelSubCategory.findById(product.id_subcategory)
                if (!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm gốc có mã ${product._id}`)

                arrProduct.push({
                    id_subcategory: dataSub._id,
                    id_product2: product.id_product2,
                    id_product: product._id,
                    subcategory_name: dataSub.subcategory_name,
                    product_import_price: dataExport.export_form_product[i].product_export_price,
                    product_vat: dataExport.export_form_product[i].product_vat,
                    product_ck: dataExport.export_form_product[i].product_ck,
                    product_discount: dataExport.export_form_product[i].product_discount,
                    product_quantity: 1,
                    product_warranty: dataExport.export_form_product[i].product_warranty,
                    product_index: product.product_index,
                })
            }
            const total = validator.calculateMoneyImport(arrProduct)
            const insertNewImport = await new ModelImportForm({
                id_warehouse: dataInternal.from_warehouse,
                id_employee: id_employee,
                id_user: dataUser._id,
                import_form_status_paid: is_payment,
                import_form_product: arrProduct,
                import_form_note: import_form_note,
                import_form_type: "Nhập hàng từ nhà cung cấp",

            }).save()

            await new ModelDebt({
                id_user: dataUser._id, // tên nhân viên
                id_branch: id_branch,
                id_employee: id_employee,
                debt_money_payment: payment_money,
                debt_money_import: total,
                debt_note: import_form_note,
                debt_type: "import",
                id_form: insertNewImport._id,
            }).save()
            if (payment_money > 0) {
                const insertPayment = new ModelPayment({
                    id_user: dataUser._id,
                    payment_money: payment_money,
                    id_employee: id_employee,
                    id_branch: id_branch,
                    id_form: insertNewImport._id,
                    payment_note: import_form_note,
                    payment_content: "61fe7f6b50262301a2a39fd4", // "Chi trả nhập hàng từ nhà cung cấp",
                    id_fundbook: id_fundbook,
                    payment_type: "import",
                }).save()
            }
            for (let i = 0; i < arrProduct.length; i++) {
                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, {
                    id_warehouse: id_warehouse,
                    product_status: false,
                    product_import_price: arrProduct[i].product_import_price,
                    product_vat:arrProduct[i].product_vat,
                    product_ck:arrProduct[i].product_ck,
                })
            }
            await ModelInternalOrder.findByIdAndUpdate(dataInternal._id, {
                id_import_form: insertNewImport._id,
                from_user: dataUser._id,
                interal_order_status: "Hoàn thành"
            })
            return res.json(insertNewImport)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
