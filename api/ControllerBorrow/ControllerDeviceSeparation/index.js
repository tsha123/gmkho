
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import  mongoose  from "mongoose"

import { ModelDeviceSeparation } from '../../models/DeviceSeparation.js'
import { ModelImportForm } from '../../models/ImportForm.js'
import { ModelExportForm } from '../../models/ExportForm.js'
import { ModelWarehouse } from '../../models/Warehouse.js'
import { ModelProduct } from '../../models/Product.js'
import { ModelSubCategory } from '../../models/SubCategory.js'
import { ModelEmployee } from '../../models/Employee.js'
import { ModelUser } from '../../models/User.js'
import { createAndUpdateReport } from '../ControllerReportInventory/index.js'
import * as warehouse from '../ControllerWarehouse/index.js'
const prefixApi = "/api/device-separation"


export const check_permission = async (app) => {
    app.get(prefixApi + "/checkPermission", helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("62a011e42be116263e3f815e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const warehouses = await warehouse.getWarehouseByBranch(req.body._caller.id_branch_login)
            return res.json(warehouses)
        }
        catch (e) {
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
export const insert = async (app) => {
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("62a011e42be116263e3f815e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            devide_process(req, res)
        }
        catch (e) {
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const management = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("62a011e42be116263e3f815e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            get_data(req, res)
        }
        catch (e) {
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const remove = async (app) => {
    app.delete(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("62a011e42be116263e3f815e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            confirmDelete(req, res)
        }
        catch (e) {
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


const devide_process = async (req, res) => {
    try {
        const arr_input = JSON.parse(req.body.arr_input)
        const arr_output = JSON.parse(req.body.arr_output)

        const note = req.body.note
        const id_employee = req.body._caller._id

        if (arr_input.length == 0) return res.status(400).send(`Thất bại! Sản phẩm cần bóc tách không thể để trống`)
        if (arr_output.length == 0) return res.status(400).send(`Thất bại! Sản phẩm đầu ra không thể để trống`)
        let id_warehouse = null
        const arr_export = []
        for (let i = 0; i < arr_input.length; i++) {
            if (!validator.ObjectId.isValid(arr_input[i].id_product)) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm tại dòng ${i + 1}`)
            const dataProduct = await ModelProduct.findById(arr_input[i].id_product)
            if (!dataProduct) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm tại dòng ${i + 1}`)
            if (dataProduct.product_status) return res.status(400).send(`Thất bại! Sản phẩm có mã ${dataProduct._id}/${dataProduct.id_product2 || ""} đã được xuất khỏi kho`)
            if (!id_warehouse) {
                id_warehouse = dataProduct.id_warehouse
            }
            if (id_warehouse.toString() != dataProduct.id_warehouse.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${dataProduct._id} không cùng kho với các sản phẩm khác`)
            const dataSub = await ModelSubCategory.findById(dataProduct.id_subcategory)
            if (!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm tại dòng ${i + 1}`)

            arr_export.push({
                subcategory_name: dataSub.subcategory_name,
                id_product: dataProduct._id,
                id_product2: dataProduct.id_product2,
                product_import_price: dataProduct.product_import_price,
                id_subcategory: dataSub._id,
                product_export_price: arr_input[i].export_price,
                product_vat: 0,
                product_ck: 0,
                subcategory_point: 0,
                subcategory_part: 0,
                product_discount: 0,
                product_quantity: 1,
                product_warranty: arr_input[i].warranty,
                id_employee: null,
            })
        }

        const arr_import = []

        for (let i = 0; i < arr_output.length; i++) {
            if (!validator.ObjectId.isValid(arr_output[i].id_subcategory)) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm đầu ra tại dòng ${i + 1}`)
            if (arr_output[i].id_product2) {
                const dataPro = await ModelProduct.findOne({ id_product2: arr_output[i].id_product2 })
                if (dataPro) return res.status(400).send(`Thất bại! Sản phẩm có mã phụ ${arr_output[i].id_product2} đã tồn tại`)
            }
            const dataSub = await ModelSubCategory.findById(arr_output[i].id_subcategory)
            if (!dataSub) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm đầu ra tại dòng ${i + 1}`)

            const quantity = validator.tryParseInt(arr_output[i].quantity)
            const import_price = validator.tryParseInt(arr_output[i].import_price)
            arr_import.push({
                id_subcategory: dataSub._id,
                product_warranty: arr_output[i].warranty,
                subcategory_name: dataSub.subcategory_name,
                product_import_price: import_price,
                product_vat: 0,
                product_ck: 0,
                product_discount: 0,
                product_quantity: quantity,
                id_product2: arr_output[i].id_product2,
                product_index: i,
            })
        }
        const dataWarehouse = await ModelWarehouse.findById(id_warehouse)

        if (!dataWarehouse) return res.status(400).send(`Thất bại! Không tìm thấy kho của sản phẩm`)

        // const dataUser = await ModelUser.findById(dataWarehouse._id)
        // if(!dataUser) return res.status(400).send(`Thất bại! Không tìm thấy người dùng`)

        const total_export = validator.calculateMoneyExport(arr_export)
        const total_import = validator.calculateMoneyImport(arr_import)

        const dataExport = await new ModelExportForm({ // xuất sản phẩm bị bóc tách 
            id_warehouse: dataWarehouse._id,
            id_employee: id_employee,
            // id_user: dataUser._id,
            export_form_status_paid: false,
            export_form_product: arr_export,
            export_form_note: note,
            export_form_type: validator.TYPE_EXPORT_SEPARATION,
            money_voucher_code: 0,
            point_number: 0,
            money_point: 0
        }).save()

        for (let i = 0; i < arr_export.length; i++) {

            await ModelProduct.findByIdAndUpdate(arr_export[i].id_product, {
                $set: {
                    product_status: true,
                    id_export_form: dataExport._id,
                },
                $push: {
                    product_note: `${new Date()} xuất bóc tách từ kho ${dataWarehouse.warehouse_name} bởi nhân viên ${id_employee} mã phiếu xuất : ${dataExport._id}`
                }
            })

        }


        const insert_import = await new ModelImportForm({
            id_warehouse: dataWarehouse._id,
            id_employee: id_employee,
            // id_user:dataUser._id,
            import_form_type: validator.TYPE_IMPORT_SEPARATION,
            import_form_status_paid: false,
            import_form_product: arr_import,
            import_form_note: note,
        }).save()

        for (let i = 0; i < arr_import.length; i++) {
            for (let j = 0; j < arr_import[i].product_quantity; j++) {

                const insert_pro = await new ModelProduct({
                    product_index: arr_import[i].product_index,
                    id_subcategory: arr_import[i].id_subcategory,
                    subcategory_name: arr_import[i].subcategory_name,
                    id_product2: arr_import[i].id_product2,
                    id_warehouse: dataWarehouse._id,
                    product_vat: 0,
                    product_ck: 0,
                    id_import_form: insert_import._id,
                    product_status: false,
                    product_import_price: arr_import[i].product_import_price,
                    product_warranty: arr_output[i].warranty,
                    product_note: [`${new Date()} Nhập bóc tách từ kho ${dataWarehouse.warehouse_name} bởi nhân viên ${id_employee} mã phiếu nhập : ${insert_import._id}`]
                }).save()

                await createAndUpdateReport(dataWarehouse._id, arr_import[i].id_subcategory.id_subcategory, 1, validator.calculateMoneyImport(arr_import[i]))
            }
        }
        const insert_devide = await new ModelDeviceSeparation({
            // id_user: dataUser._id,
            id_warehouse: dataWarehouse._id,
            id_employee: id_employee,
            id_export_form: dataExport._id,
            id_import_form: insert_import._id,
        }).save()

        const data_product = await ModelProduct.find({ id_import_form: validator.ObjectId(insert_import._id) })
        return res.json({ insertPro: data_product, id_import: insert_import._id })


    }
    catch (e) {
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}

const get_data = async (req, res) => {
    try {

        const key = req.query.key
        const id_warehouse = req.query.id_warehouse
        const fromdate = req.query.fromdate
        const todate = req.query.todate
        let query = {
            $and: [{ createdAt: { $gte: new Date(fromdate + " 00:00:00") } }, { createdAt: { $lte: new Date(todate + " 23:59:59") } }],
            id_warehouse: validator.ObjectId(id_warehouse)
        }
        let query2 = {
            "data_export.export_form_product.subcategory_name": { $regex: ".*" + key + ".*", $options: "$i" }
        }

        if (key && validator.ObjectId.isValid(key)) {
            query2 = {
                $or: [
                    { id_export_form: validator.ObjectId(key) },
                    { id_import_form: validator.ObjectId(key) },
                    { "data_export.export_form_product.id_product": validator.ObjectId(key) }
                ]
            }
        }

        const data = await ModelDeviceSeparation.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "exportforms",
                    localField: "id_export_form",
                    foreignField: "_id",
                    as: "data_export"
                }
            },
            {
                $unwind: {
                    path: "$data_export"
                }
            },
            {
                $match: query2
            }
        ])

        const count = await ModelDeviceSeparation.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "exportforms",
                    localField: "id_export_form",
                    foreignField: "_id",
                    as: "data_export"
                }
            },
            {
                $unwind: {
                    path: "$data_export"
                }
            },
            {
                $match: query2
            },
            {
                $count: "count"
            }
        ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))

        for (let i = 0; i < data.length; i++) {
            data[i].data_import = {}
            const dataImport = await ModelImportForm.findById(data[i].id_import_form)
            if (dataImport) data[i].data_import = dataImport

            const dataEm = await ModelEmployee.findById(data[i].id_employee)
            if (dataEm) {
                data[i].employee_name = dataEm.employee_fullname
                data[i].employee_phone = dataEm.employee_phone
            }

            const dataWarehouse = await ModelWarehouse.findById(data[i].id_warehouse)
            if (dataWarehouse) {
                data[i].warehouse_name = dataWarehouse.warehouse_name
            }
        }

        return res.json({ data: data, count: count.length > 0 ? count[0].count : 0 })
    }
    catch (e) {
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}

const confirmDelete = async (req, res) => {
    const session = await mongoose.startSession()
    try {

        session.startTransaction()

        const device_separation_id = req.body.device_separation_id
        if (!device_separation_id || !validator.ObjectId.isValid(device_separation_id)) return res.status(400).send(`Thất bại! Không tìm thấy phiếu`)
        const data_separation = await ModelDeviceSeparation.findById(device_separation_id)
        if (!data_separation) return res.status(400).send(`Thất bại! Không tìm thấy phiếu`)

        const data_export = await ModelExportForm.findById(data_separation.id_export_form)
        if (!data_export) return res.status(400).send(`Thất bại! Phiếu xuất không còn tồn tại`)

        for (let i = 0; i < data_export.export_form_product.length; i++) {
            const data_product = await ModelProduct.findById(data_export.export_form_product[i].id_product)
            if (!data_product) return res.status(400).send(`Thất bại! Không tìm thấy sản phẩm có mã ${data_export.export_form_product[i].id_product}`)
            if(!data_product.product_status) return res.status(400).send(`Thất bại! Sản phẩm có mã ${data_product._id} đã thực hiện nghiệp vụ khác`)
            if(data_product.id_warehouse.toString() != data_export.id_warehouse.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${data_product._id} đã thực hiện nghiệp vụ khác`)
            const dataExport_pro = await ModelExportForm.find({"export_form_product.id_product": validator.ObjectId(data_product._id)}).sort({createdAt:-1}).limit(1)
            if(!dataExport_pro || dataExport_pro.length == 0 || dataExport_pro[0]._id.toString() != data_export._id.toString()) return res.status(400).send(`Thất bại! Sản phẩm có mã ${data_product._id} đã thực hiện nghiệp vụ khác`)
        }
        const data_import = await ModelImportForm.findById(data_separation.id_import_form)
        if (!data_import) return res.status(400).send(`Thất bại! Phiếu nhập không còn tồn tại`)
        const data_product_import = await ModelProduct.find({id_import_form:validator.ObjectId(data_import._id)})
        for(let i =0;i<data_product_import.length;i++){
            if(data_product_import[i].product_status) return res.status(400).send(`Thất bại! Sản phẩm có mã ${data_product_import[i]._id} đã thực hiện nghiệp vụ khác`)
            const dataIm = await ModelImportForm.findOne({"import_form_product.id_product": validator.ObjectId(data_product_import[i]._id)})
            if(dataIm) return res.status(400).send(`Thất bại! Sản phẩm có mã ${data_product_import[i]._id} đã thực hiện nghiệp vụ khác`)

            const dataEx = await ModelExportForm.findOne({"export_form_product.id_product": validator.ObjectId(data_product_import[i]._id)})
            if(dataEx) return res.status(400).send(`Thất bại! Sản phẩm có mã ${data_product_import[i]._id} đã thực hiện nghiệp vụ khác`)
        }

        await ModelProduct.deleteMany({id_import_form:validator.ObjectId(data_import._id)})
        for (let i = 0; i < data_export.export_form_product.length; i++) {
            await ModelProduct.updateOne({_id:data_export.export_form_product[i].id_product},{$set:{product_status:false}})
        }
        await ModelExportForm.findByIdAndDelete(data_export._id)
        await ModelImportForm.findByIdAndDelete(data_import._id)
        await ModelDeviceSeparation.findByIdAndDelete(data_separation._id)

        session.commitTransaction()
        session.endSession()
        return res.json("success")
        // const dataExport = await ModelExportForm.findById()
    } catch (e) {
        console.error(e)
        session.abortTransaction()
        session.endSession()
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}