const prefixApi = '/api/export';
import sanitize from "mongo-sanitize";
import * as helper from '../../../helper/helper.js'
import * as validator from '../../../helper/validator.js'
import * as warehouse from '../../ControllerWarehouse/index.js'
import * as category from '../../ControllerCategory/index.js'
import * as fundbook from '../../ControllerFundBook/index.js'
import { ModelUser } from '../../../models/User.js'
import { ModelOrder } from '../../../models/Order.js'
import { ModelWarehouse } from '../../../models/Warehouse.js'
import { ModelFundBook } from '../../../models/FundBook.js'
import { ModelExportForm } from '../../../models/ExportForm.js'
import { ModelImportForm } from '../../../models/ImportForm.js'
import { ModelProduct } from '../../../models/Product.js'
import { ModelSubCategory } from '../../../models/SubCategory.js'
import { ModelDebt } from '../../../models/Debt.js'
import { ModelReceive } from '../../../models/Receive.js'
import { ModelEmployee } from '../../../models/Employee.js'
import { createAndUpdateReport } from '../../ControllerReportInventory/index.js'
import { get_branch_ById } from '../../ControllerBranch/index.js'

export const management = async(app) => {
    app.get(prefixApi, helper.authenToken, async(req, res) => {
        try {

            // if(!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            let query = {}

            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    ...validator.query_createdAt(req.query.fromdate, req.query.todate)
                }
            }

            if (validator.isDefine(req.query.export_form_type)) {
                query = {
                    ...query,
                    export_form_type: req.query.export_form_type
                }
            }
            if (validator.isDefine(req.query.key)) {
                query = {
                    ...query,
                    $or: [{ "user.user_fullname": { $regex: ".*" + req.query.key + ".*", $options: "i" } }, { "user.user_phone": { $regex: ".*" + req.query.key + ".*", $options: "i" } }, { "export_form_product.subcategory_name": { $regex: ".*" + req.query.key + ".*", $options: "i" } }]
                }
            }
            if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
                query = { _id: validator.ObjectId(req.query.key) }

            }
            if (validator.isDefine(req.query.id_warehouse) && validator.ObjectId.isValid(req.query.id_warehouse)) {
                query = {
                    ...query,
                    id_warehouse: validator.ObjectId(req.query.id_warehouse),
                }
            }

            const datas = await ModelExportForm.aggregate([{
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $unwind: {
                        path: "$user",
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
            ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))

            const count = await ModelExportForm.aggregate([{
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                }, {
                    $unwind: {
                        path: "$user",
                    }
                },
                {
                    $match: query
                },
                {
                    $count: "count"
                }

            ])
            await Promise.all(datas.map(async data => {
                data.fundbook_name = ""
                data.receive_form_money = 0
                data.user_fullname = data.user.user_fullname
                data.user_phone = data.user.user_phone
                data.user_address = data.user.user_address
                data.id_fundbook = null
                delete data.user
                if (data.export_form_status_paid) {
                    const dataReceive = await ModelReceive.findOne({ id_form: data._id });
                    if (dataReceive) {

                        data.receive_form_money = dataReceive.receive_money
                        data.id_fundbook = dataReceive.id_fundbook
                        const data_fundbook = await ModelFundBook.findById(dataReceive.id_fundbook)
                        if (data_fundbook) {
                            data.fundbook_name = data_fundbook.fundbook_name

                        }
                    }
                }
                const dataEm = await ModelEmployee.findById(data.id_employee)
                if (dataEm) {
                    data.employee_fullname = dataEm.employee_fullname
                }

                for (let i = 0; i < data.export_form_product.length; i++) {
                    data.export_form_product[i].employee_fullname = ""
                    data.export_form_product[i].employee_setting_fullname = ""
                    if (data.export_form_product[i].id_employee && validator.ObjectId.isValid(data.export_form_product[i].id_employee)) {
                        const dataEm2 = await ModelEmployee.findById(data.export_form_product[i].id_employee)
                        if (dataEm2) {
                            data.export_form_product[i].employee_fullname = dataEm2.employee_fullname
                        }
                    }
                    
                    if (data.export_form_product[i].id_employee_setting && validator.ObjectId.isValid(data.export_form_product[i].id_employee_setting)) {
                        const dataEm3 = await ModelEmployee.findById(data.export_form_product[i].id_employee_setting)
                        if (dataEm3) {
                            data.export_form_product[i].employee_setting_fullname = dataEm3.employee_fullname
                        }
                    }
                }

            }))

            return res.json({ data: datas, count: count.length > 0 ? count[0].count : 0 })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
export const update = async(app) => {
    app.put(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const is_payment_zero = req.body.is_payment_zero === 'true'
            const arrProduct = JSON.parse(req.body.arrProduct) // mảng sản phẩm mới

            const id_export = req.body.id_export // id phiếu nhập cần update
            const receive_form_money = validator.tryParseInt(req.body.receive_form_money) //tiền khách thanh toán
            const id_fundbook = req.body.id_fundbook // sổ quỹ
            const export_form_note = req.body.export_form_note // ghi chú mới + ghi chú cũ
            const dataExport = await ModelExportForm.findById(id_export)
            if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")
            const dataDebt = await ModelDebt.findOne({ id_form: dataExport._id })
            if (!dataDebt) return res.status(400).send("Thất bại! Không tìm thầy công nợ cũ")
            if (arrProduct.length != dataExport.export_form_product.length) return res.status(400).send("Thất bại! Dữ liệu không khớp xin hãy load lại trang")
            const data_fundbook = await ModelFundBook.findById(id_fundbook)
            if (!data_fundbook) return res.status(400).send("Thất bại! Không tìm thấy hình thức thanh toán phù hợp")

            for (let i = 0; i < arrProduct.length; i++) {
                if (validator.ObjectId.isValid(arrProduct[i].id_import_return)) {
                    const dataImReturn = await ModelImportForm.findById(arrProduct[i].id_import_return)
                    if (!dataImReturn) return res.status(400).send("Thất bại! Lỗi dòng 154 không cập nhập được phiếu nhập trả")
                    for (let j = 0; j < dataImReturn.import_form_product.length; j++) {
                        if (dataImReturn.import_form_product[j].id_product.toString() == arrProduct[i].id_product.toString()) {
                            dataImReturn.import_form_product[j].product_export_price = arrProduct[i].product_export_price
                        }
                    }
                    await ModelImportForm.findByIdAndUpdate(dataImReturn._id, {
                        import_form_product: dataImReturn.import_form_product
                    })
                }

                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, {
                    product_warranty: arrProduct[i].product_warranty
                })
            }

            let isPayment = false
            if (receive_form_money > 0 || is_payment_zero) {
                const insertReceive = new ModelReceive({
                    id_user: dataExport.id_user,
                    receive_money: receive_form_money,
                    id_employee: req.body._caller._id,
                    id_branch: req.body._caller.id_branch_login,
                    id_form: dataExport._id,
                    receive_note: export_form_note,
                    receive_content: "61fe7ec950262301a2a39fcc", // "Chi trả nhập hàng từ nhà cung cấp",
                    id_fundbook: id_fundbook,
                    receive_type: "export",
                }).save()
                isPayment = true

            }

            const total = validator.calculateMoneyExport(arrProduct)
            await ModelDebt.findByIdAndUpdate(dataDebt._id, {
                debt_money_export: total,
                debt_money_receive: receive_form_money
            })

            const updateExport = await ModelExportForm.findByIdAndUpdate(dataExport._id, { // 
                export_form_status_paid: isPayment,
                export_form_product: arrProduct,
                export_form_note: export_form_note
            })

            return res.json(updateExport)

        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const revenue_product_checkpermission = async(app) => {
    app.get(prefixApi + "/revenue_product/checkPermission", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62552cb84173457d1adca31d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_branch = req.body._caller.id_branch_login
            const dataWarehouse = await warehouse.getWarehouseByBranch(id_branch)
            const dataCategory = await category.get_array_category()
            return res.json({ warehouses: dataWarehouse, categories: dataCategory })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const revenue_product = async(app) => {
    app.get(prefixApi + "/revenue_product", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62552cb84173457d1adca31d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const fromdate = req.query.fromdate
            const todate = req.query.todate
            const id_warehouse = req.query.id_warehouse
            let query = validator.query_createdAt(fromdate, todate)
            if (validator.ObjectId.isValid(id_warehouse)) {
                query = {
                    ...query,
                    id_warehouse: validator.ObjectId(id_warehouse),
                }
            }

            const dataExport = await ModelExportForm.aggregate([{
                    $match: {
                        export_form_type: "Xuất hàng để bán",
                        ...query
                    }
                },
                {
                    $unwind: {
                        path: "$export_form_product"
                    }
                },
                {
                    $project: {
                        id_subcategory: "$export_form_product.id_subcategory",
                        product_quantity: "$export_form_product.product_quantity",
                        revenue: {
                            $multiply: [{
                                    $subtract: [{
                                            $subtract: [{
                                                    $subtract: [
                                                        "$export_form_product.product_export_price",
                                                        {
                                                            $multiply: [{
                                                                    $divide: [
                                                                        "$export_form_product.product_export_price",
                                                                        100
                                                                    ]
                                                                },
                                                                "$export_form_product.product_ck"
                                                            ]
                                                        }
                                                    ]
                                                },
                                                "$export_form_product.product_discount"
                                            ]
                                        },
                                        "$export_form_product.product_import_price"
                                    ]
                                },
                                "$export_form_product.product_quantity"
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$id_subcategory",
                        product_quantity: { $sum: "$product_quantity" },
                        revenue: { $sum: "$revenue" }
                    }
                }
            ])

            // const dataImport = await ModelImportForm.aggregate([{
            //         $match: {
            //             ...query,
            //             import_form_type: "Nhập hàng khách trả lại"
            //         }
            //     },
            //     {
            //         $unwind: {
            //             path: "$import_form_product"
            //         }
            //     },
            //     {
            //         $project: {
            //             id_subcategory: "$import_form_product.id_subcategory",
            //             product_quantity: "$import_form_product.product_quantity",
            //             revenue: {
            //                 $multiply: [{
            //                         $subtract: [
            //                             "$import_form_product.product_export_price",
            //                             {
            //                                 $subtract: [{
            //                                         $subtract: [
            //                                             "$import_form_product.product_import_price",
            //                                             {
            //                                                 $multiply: [{
            //                                                         $divide: [
            //                                                             "$import_form_product.product_import_price",
            //                                                             100
            //                                                         ]
            //                                                     },
            //                                                     "$import_form_product.product_ck"
            //                                                 ]
            //                                             }
            //                                         ]
            //                                     },
            //                                     "$import_form_product.product_discount"
            //                                 ]
            //                             },

            //                         ]
            //                     },
            //                     "$import_form_product.product_quantity"
            //                 ]
            //             }
            //         }
            //     },
            //     {
            //         $group: {
            //             _id: "$id_subcategory",
            //             product_quantity: { $sum: "$product_quantity" },
            //             revenue: { $sum: "$revenue" }
            //         }
            //     }
            // ])

            const dataImport = await ModelImportForm.aggregate([{
                $match: {
                    ...query,
                    import_form_type: "Nhập hàng khách trả lại"
                }
            },
            {
                $unwind: {
                    path: "$import_form_product"
                }
            },
            {
                $project: {
                    id_subcategory: "$import_form_product.id_subcategory",
                    product_quantity: "$import_form_product.product_quantity",
                    revenue: {
                        $multiply: [{
                                $subtract: [
                                    "$import_form_product.product_import_price_return",
                                    {
                                        $subtract: [{
                                                $subtract: [
                                                    "$import_form_product.product_import_price",
                                                    {
                                                        $multiply: [{
                                                                $divide: [
                                                                    "$import_form_product.product_import_price",
                                                                    100
                                                                ]
                                                            },
                                                            "$import_form_product.product_ck"
                                                        ]
                                                    }
                                                ]
                                            },
                                            "$import_form_product.product_discount"
                                        ]
                                    },

                                ]
                            },
                            "$import_form_product.product_quantity"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$id_subcategory",
                    product_quantity: { $sum: "$product_quantity" },
                    revenue: { $sum: "$revenue" }
                }
            }
        ])

            for (let i = 0; i < dataExport.length; i++) {
                dataExport[i].neg_revenue = 0
                const dataSub = await ModelSubCategory.findById(dataExport[i]._id)
                if (dataSub) {
                    dataExport[i].subcategory_name = dataSub.subcategory_name
                    dataExport[i].id_category = dataSub.id_category
                }
            }
            for (let i = 0; i < dataImport.length; i++) {
            
                const dataSub = await ModelSubCategory.findById(dataImport[i]._id)
                if (dataSub) {
                    dataImport[i].subcategory_name = dataSub.subcategory_name
                    dataImport[i].id_category = dataSub.id_category
                }
            }

            return res.json({ dataExport: dataExport, dataImport: dataImport })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const print = async(app) => {
    app.get(prefixApi + "/print", helper.authenToken, async(req, res) => {
        try {

            const id_export = req.query.id_export
            if (!id_export || !validator.ObjectId.isValid(id_export.trim())) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")
            const dataExport = await ModelExportForm.findById(id_export.trim())
            if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")
            const dataWarehouse = await ModelWarehouse.findById(dataExport.id_warehouse)
            const id_branch = dataWarehouse.id_branch

            const dataBranch = await get_branch_ById(id_branch)

            dataExport.receive_money = 0
            dataExport.fundbook_name = ""
            dataExport.user_fullname = ""
            dataExport.user_phone = ""
            dataExport.user_address = ""

            const dataReceive = await ModelReceive.findOne({ id_form: validator.ObjectId(dataExport._id) })

            if (dataReceive) {

                dataExport.receive_money = dataReceive.receive_money
                const dataFund = await ModelFundBook.findById(dataReceive.id_fundbook)
                if (dataFund) dataExport.fundbook_name = dataFund.fundbook_name
            }
            if (validator.ObjectId.isValid(dataExport.id_user)) {
                const dataUser = await ModelUser.findById(dataExport.id_user)
                if (dataUser) {
                    dataExport.user_fullname = dataUser.user_fullname
                    dataExport.user_phone = dataUser.user_phone
                    dataExport.user_address = dataUser.user_address
                }
            }
            for (let i = 0; i < dataExport.export_form_product.length; i++) {

                for (let j = i + 1; j < dataExport.export_form_product.length; j++) {
                    if (
                        (dataExport.export_form_product[i].id_subcategory.toString() == dataExport.export_form_product[j].id_subcategory.toString()) &&
                        (dataExport.export_form_product[i].product_vat == dataExport.export_form_product[j].product_vat) &&
                        (dataExport.export_form_product[i].product_ck == dataExport.export_form_product[j].product_ck) &&
                        (dataExport.export_form_product[i].product_discount == dataExport.export_form_product[j].product_discount) &&
                        (dataExport.export_form_product[i].product_import_price == dataExport.export_form_product[j].product_import_price) && 
                        (dataExport.export_form_product[i].product_export_price == dataExport.export_form_product[j].product_export_price) 
                    ) {
                        dataExport.export_form_product[i].product_quantity += dataExport.export_form_product[j].product_quantity
                        dataExport.export_form_product.splice(j, 1)
                        j--
                    }
                }

            }



            for (let i = 0; i < dataExport.export_form_product.length; i++) {
                dataExport.export_form_product[i].subcategory_unit = ""
                const dataSub = await ModelSubCategory.findById(dataExport.export_form_product[i].id_subcategory)
                if (dataSub) {
                    dataExport.export_form_product[i].subcategory_unit = dataSub.subcategory_unit
                }
                dataExport.export_form_product[i].total = validator.calculateMoneyExport(dataExport.export_form_product[i])
            }

            const totalMoney = validator.calculateMoneyExport(dataExport.export_form_product)
            dataExport.text_of_number = validator.tranfer_number_to_text(totalMoney)
            dataExport.total_money = totalMoney

            return res.json({ dataBranch: dataBranch, dataExport: dataExport })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const cancel_product = async(app) => {
    app.delete(prefixApi + "/product", helper.authenToken, async(req, res) => {
        try {

            const id_export = req.body.id_export
            const indexOfProduct = req.body.indexOfProduct
            if (!id_export || !validator.ObjectId.isValid(id_export.trim())) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")

            const dataExport = await ModelExportForm.findById(id_export.trim())
            if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")

            if (dataExport.money_voucher_code && dataExport.money_voucher_code > 0) return res.status(400).send(`Thất bại! Phiếu xuất có áp dụng mã giảm giá không thể hủy`)

            const dataDebt = await ModelDebt.findOne({ $and: [{ id_form: dataExport._id, debt_type: "export" }] })
            if (!dataDebt) return res.status(400).send(`Thất bại! Không tìm thấy công nợ`)

            const product_cancel = dataExport.export_form_product[indexOfProduct]
            if (!product_cancel) return res.status(400).send(`Thất bại! Sản phẩm không còn trong phiếu xuất`)

            const dataProduct = await ModelProduct.findById(product_cancel.id_product)
            if (!dataProduct) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm này`)

            if (!dataProduct.product_status) return res.status(400).send(`Thất bại! Sẩn phẩm này đã được nhập lại kho, không thể hủy`)
            if (dataProduct.id_warehouse.toString() != dataExport.id_warehouse.toString()) return res.status(400).send(`Thất bại! Sẩn phẩm này đang được lưu dữ trong kho khác không thể hủy`)
            if (dataProduct.product_note[dataProduct.product_note.length - 1].toString() != dataExport._id.toString()) return res.status(400).send(`Thất bại! Sản phẩm đã thực hiện 1 nghiệp vụ khác sau đó lên không thể xóa`)

            dataExport.export_form_product.splice(indexOfProduct, 1)
            const dataOrder = await ModelOrder.findOne({ id_export_form: dataExport._id })
            if (dataOrder) {
                for (let i = 0; i < dataOrder.order_product.length; i++) {
                    if (dataOrder.order_product[i].id_product.toString() == dataProduct._id.toString()) {
                        dataOrder.order_product.splice(i, 1)
                        break
                    }
                }
                await ModelOrder.findByIdAndUpdate(dataOrder._id, {
                    order_product: dataOrder.order_product
                })
            }


            const money_export = validator.calculateMoneyExport(dataExport.export_form_product)


            await ModelDebt.findByIdAndUpdate(dataDebt._id, {
                debt_money_export: money_export
            })
            await ModelProduct.findByIdAndUpdate(dataProduct._id, {
                $set: {
                    product_status: false,
                    id_export: null,
                }
            })

            const dataExport_after = await ModelExportForm.findByIdAndUpdate(dataExport._id, {
                export_form_product: dataExport.export_form_product
            }, { new: true })

            return res.json(dataExport_after)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}



export const revenue_product_by_employee = async(app) => {
    app.get(prefixApi + "/revenue-product-by-employee", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62552cb84173457d1adca31d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const fromdate = req.query.fromdate
            const todate = req.query.todate
            const id_employee = req.query.id_employee


            const dataWarehouse = await ModelWarehouse.find({ id_branch: req.body._caller.id_branch_login })
            let query_warehouse = []
            for (let i = 0; i < dataWarehouse.length; i++) {
                query_warehouse.push({ id_warehouse: dataWarehouse[i]._id })
            }
            const query = {
                ...validator.query_createdAt(fromdate, todate),
                $or: [...query_warehouse]
            }
            const dataExort = await ModelExportForm.find({
                ...query,
                export_form_type: validator.TYPE_EXPORT,
                // "export_form_product.id_employee": validator.ObjectId(id_employee)
                $or: [
                    { "export_form_product.id_employee": validator.ObjectId(id_employee) },
                    { "export_form_product.id_employee_setting": validator.ObjectId(id_employee) },
                ]

            })


            const dataImport = await ModelImportForm.find({
                ...query,
                import_form_type: validator.TYPE_IMPORT_RETURN,
                // "import_form_product.id_employee": validator.ObjectId(id_employee)
                $or: [
                    { "import_form_product.id_employee": validator.ObjectId(id_employee) },
                    { "import_form_product.id_employee_setting": validator.ObjectId(id_employee) },
                ]

            })

            const arrData = []
            for (let i = 0; i < dataExort.length; i++) {
                for (let j = 0; j < dataExort[i].export_form_product.length; j++) {
                    if ((dataExort[i].export_form_product[j].id_employee && dataExort[i].export_form_product[j].id_employee.toString() == id_employee.toString()) ||
                        (dataExort[i].export_form_product[j].id_employee_setting && dataExort[i].export_form_product[j].id_employee_setting.toString() == id_employee.toString())
                    ) {
                        arrData.push({
                            _id: dataExort[i]._id,
                            id_employee_setting: dataExort[i].id_employee_setting,
                            id_user: dataExort[i].id_user,
                            type: "export",
                            id_product: dataExort[i].export_form_product[j].id_product,
                            subcategory_name: dataExort[i].export_form_product[j].subcategory_name,
                            product_price: dataExort[i].export_form_product[j].product_export_price,
                            product_import_price: dataExort[i].export_form_product[j].product_import_price,
                            product_vat: dataExort[i].export_form_product[j].product_vat,
                            product_ck: dataExort[i].export_form_product[j].product_ck,
                            product_discount: dataExort[i].export_form_product[j].product_discount,
                            product_quantity: dataExort[i].export_form_product[j].product_quantity,
                            product_warranty: dataExort[i].export_form_product[j].product_warranty,
                            subcategory_point: dataExort[i].export_form_product[j].subcategory_point,
                            subcategory_part: dataExort[i].export_form_product[j].subcategory_part,
                        })
                    }
                }
            }
            for (let i = 0; i < dataImport.length; i++) {
                for (let j = 0; j < dataImport[i].import_form_product.length; j++) {
                    if ((dataImport[i].import_form_product[j].id_employee && dataImport[i].import_form_product[j].id_employee.toString() == id_employee.toString()) ||
                        (dataImport[i].import_form_product[j].id_employee_setting && dataImport[i].import_form_product[j].id_employee_setting.toString() == id_employee.toString())
                    ) {
                        arrData.push({
                            _id: dataImport[i]._id,
                            id_employee_setting: dataImport[i].import_form_product[j].id_employee_setting,
                            id_user: dataImport[i].id_user,
                            type: "import",
                            id_product: dataImport[i].import_form_product[j].id_product,
                            subcategory_name: dataImport[i].import_form_product[j].subcategory_name,
                            product_vat: dataImport[i].import_form_product[j].product_vat,
                            product_ck: dataImport[i].import_form_product[j].product_ck,
                            product_discount: dataImport[i].import_form_product[j].product_discount,
                            product_quantity: dataImport[i].import_form_product[j].product_quantity,
                            product_warranty: dataImport[i].import_form_product[j].product_warranty,
                            product_price: dataImport[i].import_form_product[j].product_import_price,
                            product_import_price: dataImport[i].import_form_product[j].product_import_price_return, // giá vốn
                            subcategory_point: dataImport[i].import_form_product[j].subcategory_point,
                            subcategory_part: dataImport[i].import_form_product[j].subcategory_part,
                        })
                    }
                }
            }

            for (let i = 0; i < arrData.length; i++) {
                const dataUser = await ModelUser.findById(arrData[i].id_user)
                if (dataUser) {
                    arrData[i].user_fullname = dataUser.user_fullname
                    arrData[i].user_phone = dataUser.user_phone
                }
            }

            return res.json(arrData)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const update_employee = async(app) => {
    app.put(`${prefixApi}/employee`, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("620e1dacac9a6e7894da61ce", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const arrProduct = JSON.parse(req.body.arrProduct) // mảng sản phẩm mới

            const id_export = req.body.id_export // id phiếu nhập cần update
            const dataExport = await ModelExportForm.findById(id_export)
            if (!dataExport) return res.status(400).send("Thất bại! Không tìm thấy phiếu xuất")

            if (arrProduct.length != dataExport.export_form_product.length) return res.status(400).send(`Dữ liệu không khớp, hãy load lại trang`)
            for (let i = 0; i < arrProduct.length; i++) {
                for (let j = 0; j < dataExport.export_form_product.length; j++) {
                    if (arrProduct[i].id_product.toString() == dataExport.export_form_product[j].id_product.toString()) {
                        dataExport.export_form_product[j].id_employee = arrProduct[i].id_employee
                        dataExport.export_form_product[j].product_warranty = arrProduct[i].product_warranty
                    }
                }
            }

            const updateExport = await ModelExportForm.findByIdAndUpdate(dataExport._id, {
                export_form_product: dataExport.export_form_product
            })
            return res.json(updateExport)

        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const change_customer = async(app) => {
    app.put(prefixApi + "/change-customer", helper.authenToken, async(req, res) => {
        try {

            if (!await helper.checkPermission("62552cb84173457d1adca31d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_export = req.body.id_export
            const id_user = req.body.id_user

            const dataUser = await ModelUser.findById(id_user)
            if(!dataUser) return res.status(400).send(`Thất bại! Không tìm thấy khách hàng`)
            const dataExport = await ModelExportForm.findById(id_export)
            if(!dataExport) return res.status(400).send(`Thất bại! Không tìm thấy phiếu xuất`)

            await ModelExportForm.findByIdAndUpdate(dataExport._id,{
                id_user:dataUser._id
            })

            await ModelDebt.updateOne({
                $and:[{
                    debt_type:"export",
                    id_form:dataExport._id
                }]
            },{$set:{id_user:dataUser._id}})

            await ModelReceive.updateOne({
                $and:[{
                    receive_type:"export",
                    id_form:dataExport._id
                }]
            },{$set:{id_user:dataUser._id}})
            return res.json("success")
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
