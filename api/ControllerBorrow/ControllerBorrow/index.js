const prefixApi = '/api/borrow';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelWarehouse } from '../../models/Warehouse.js'
import { ModelSubCategory } from '../../models/SubCategory.js'
import { ModelProduct } from '../../models/Product.js'
import { ModelBorrow } from '../../models/Borrow.js'
import { ModelEmployee } from '../../models/Employee.js'
import { ModelExportForm } from '../../models/ExportForm.js'
import { ModelImportForm } from '../../models/ImportForm.js'
import { getWarehouseByBranch } from './../ControllerWarehouse/index.js'

export const checkPermission = async (app) => {
    app.get(prefixApi + "/checkPermission", helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("6219b0eff796eb805c4af47e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const warehouses = await getWarehouseByBranch(req.body._caller.id_branch_login)
            return res.json(warehouses)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })

}
export const management = async (app) => {

    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("6219b0eff796eb805c4af47e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            let query = {}
            let queryWarehouse = {}
            if (validator.isDefine(req.query.key) && !validator.ObjectId.isValid(req.query.key)) {
                query = {
                    ...query,
                    $or: [{ "employee.employee_fullname": { $regex: ".*" + req.query.key + ".*", $options: "i" } }, { "employee.employee_phone": { $regex: ".*" + req.query.key + ".*" } }]
                }
            }
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } }, { createdAt: { $lte: validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay } }]
                }
            }
            if (validator.isDefine(req.query.borrow_status)) {
                query = {
                    ...query,
                    borrow_status: req.query.borrow_status
                }
            }
            if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
                query = {
                    $or: [{ id_export_form: validator.ObjectId(req.query.key) }, { id_import_form: validator.ObjectId(req.query.key) }]

                }
            }
            if (validator.isDefine(req.query.id_warehouse) && validator.ObjectId.isValid(req.query.id_warehouse)) {
                queryWarehouse = {
                    id_warehouse: validator.ObjectId(req.query.id_warehouse)
                }
            }

            const data = await ModelBorrow.aggregate([
                {
                    $match: queryWarehouse
                },
                {
                    $lookup: {
                        from: "employees",
                        localField: "id_employee",
                        foreignField: "_id",
                        as: "employee"
                    }
                }, {
                    $match: query
                },
                {
                    $sort: { _id: -1 }
                }
            ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))

            const count = await ModelBorrow.aggregate([
                {
                    $match: queryWarehouse
                },
                {
                    $lookup: {
                        from: "employees",
                        localField: "id_employee",
                        foreignField: "_id",
                        as: "employee"
                    }
                }, {
                    $match: query
                },
                {
                    $count: "count"
                }
            ])

            for (let i = 0; i < data.length; i++) {
                data[i].id_employee_created_fullname = ""
                data[i].employee_fullname = data[i].employee[0].employee_fullname
                data[i].employee_phone = data[i].employee[0].employee_phone
                data[i].employee_address = data[i].employee[0].employee_address

                const employee = await ModelEmployee.findById(data[i].id_employee_created)
                if (employee) data[i].id_employee_created_fullname = employee.employee_fullname

                delete data[i].employee
            }

            return res.json({ data: data, count: count.length > 0 ? count[0].count : 0 })

        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })

}

export const insert = async (app) => {

    app.post(prefixApi, helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("6219b0eff796eb805c4af47e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        try {
            const note = req.body.note
            const arrProduct = JSON.parse(req.body.arrProduct)
            const id_employee_created = req.body._caller._id
            const id_employee = req.body.id_employee
            if (!validator.ObjectId.isValid(id_employee)) return res.status(400).send("Thất bại! Không tìm thấy nhân viên")
            const dataEmployee = await ModelEmployee.findById(id_employee)
            if (!dataEmployee) return res.status(400).send("Thất bại! Không tìm thấy nhân viên")
            if (arrProduct.length == 0) return res.status(400).send("Hãy chọn ít nhất 1 sản phẩm")
            var id_warehouse = null
            for (let i = 0; i < arrProduct.length; i++) {
                const dataPro = await ModelProduct.findById(arrProduct[i])
                if (!dataPro) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm dòng ${i + 1}`)
                const dataSub = await ModelSubCategory.findById(dataPro.id_subcategory)
                if (!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${dataPro._id}`)
                if (i == 0) id_warehouse = dataPro.id_warehouse
                if (dataPro.id_warehouse.toString() != id_warehouse.toString()) return res.status(400).send(`Sản phẩm có mã ${dataPro._id} khác kho mới các sản phẩm khác`)
                arrProduct[i] = {
                    ...arrProduct[i],
                    id_product: dataPro._id,
                    id_product2: dataPro.id_product2,
                    id_subcategory: dataSub._id,
                    subcategory_name: dataSub.subcategory_name,
                    product_export_price: 0,
                    product_vat: 0,
                    product_ck: 0,
                    product_discount: 0,
                    product_quantity: 1,
                    product_warranty: 0,
                    subcategory_point: 0,
                    subcategory_part: 0,
                    id_employee: null
                }
            }
            if (!id_warehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của các sản phẩm")
            const dataWarehouse = await ModelWarehouse.findById(id_warehouse)
            if (!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho của các sản phẩm")
            if (dataWarehouse.id_branch.toString() != req.body._caller.id_branch_login.toString()) return res.status(400).send("Thất bại! Sản phẩm không thuộc kho của chi nhánh")
            const insertExport = await new ModelExportForm({
                id_warehouse: dataWarehouse._id,
                id_employee: id_employee_created,
                id_user: null,
                export_form_status_paid: false,
                export_form_product: arrProduct,
                export_form_note: "",
                export_form_type: "Xuất hàng mượn kho",
                money_voucher_code: 0,
                point_number: 0,
                money_point: 0,
                voucher_code: null
            }).save()

            const insertBorrow = await new ModelBorrow({
                id_warehouse: dataWarehouse._id,
                id_employee: id_employee,
                borrow_product: arrProduct,
                id_export_form: insertExport._id,
                borrow_status: "Đang mượn",
                id_employee_created: id_employee_created,
                borrow_note: note
            }).save()

            for (let i = 0; i < arrProduct.length; i++) {
                await ModelProduct.findByIdAndUpdate(arrProduct[i].id_product, {
                    $set: {
                        product_status: true,
                        id_export_form: insertExport._id,
                    },
                    $push: {
                        product_note: insertExport._id.toString()
                    }
                })
            }
            return res.json(insertBorrow)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })

}


export const update = async (app) => {
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("6219b0eff796eb805c4af47e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        try {
            const id_product = req.body.id_product
            const id_borrow = req.body.id_borrow

            const dataBorrow = await ModelBorrow.findById(id_borrow)
            if (!dataBorrow) return res.status(400).send("Thất bại! Không tìm thấy phiếu mượn")

            const dataProduct = await ModelProduct.findById(id_product)
            if (!dataProduct) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm này trong hệ thống")
            if (!dataProduct.product_status) return res.status(400).send("Thất bại! Sản phẩm này được đc trả")
            var indexProduct = -1
            var product = null
            var borrow_status = "Đã trả"
            var updateBorrow = null
            for (let i = 0; i < dataBorrow.borrow_product.length; i++) {
                if (dataProduct._id.toString() == dataBorrow.borrow_product[i].id_product.toString()) {
                    indexProduct = i
                    dataBorrow.borrow_product[i].product_status = true
                }
                else {
                    if (!dataBorrow.borrow_product[i].product_status) borrow_status = "Đang mượn" // nếu chưa trả hết thì vãn là đang mượn
                }
            }
            if (indexProduct == -1) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm trong phiếu")
            var id_import = dataBorrow.id_import_form
            if (!validator.ObjectId.isValid(dataBorrow.id_import_form)) { // chưa có phiếu nhập vì trả lần đầu
                const insertImport = await new ModelImportForm({
                    id_warehouse: dataBorrow.id_warehouse,
                    id_employee: req.body._caller._id,
                    id_user: dataBorrow.id_user,
                    import_form_status_paid: false,
                    import_form_product: [dataBorrow.borrow_product[indexProduct]],
                    import_form_type: "Nhập hàng mượn kho"
                }).save()
                id_import = insertImport._id
                updateBorrow = await ModelBorrow.findByIdAndUpdate(dataBorrow._id, {
                    borrow_product: dataBorrow.borrow_product,
                    borrow_status: borrow_status,
                    id_import_form: insertImport._id
                })
            }
            else {
                await ModelImportForm.findByIdAndUpdate(dataBorrow.id_import_form, {
                    $push: {
                        import_form_product: dataBorrow.borrow_product[indexProduct]
                    }
                })
                updateBorrow = await ModelBorrow.findByIdAndUpdate(dataBorrow._id, {
                    borrow_product: dataBorrow.borrow_product,
                    borrow_status: borrow_status,
                })
            }
            await ModelProduct.findByIdAndUpdate(dataProduct._id, {
                $set: {
                    product_status: false
                },
                $push: {
                    product_note: id_import.toString()
                }
            })
            return res.json(updateBorrow)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }

    })

}


