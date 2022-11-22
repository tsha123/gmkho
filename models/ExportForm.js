import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
import { ModelSubCategory } from "./SubCategory.js";
// import {update_status_voucher} from './../api/ControllerVoucher/index.js'
// import {ModelProduct} from './Product.js'
const SchemaProductExportFor = {
    id_product: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    id_product2: {
        ...validator.schemeString
    },
    id_subcategory: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    subcategory_name: {
        ...validator.schemaString,
        ...validator.schemaRequired
    },
    product_export_price: {
        ...validator.schemaNumber
    },
    product_vat: {
        ...validator.schemaNumber
    },
    product_ck: {
        ...validator.schemaNumber
    },
    product_discount: {
        ...validator.schemaNumber
    },
    product_quantity: {
        ...validator.schemaNumber,
        default: 1
    },
    product_warranty: {
        ...validator.schemaNumber,
    },
    product_import_price: {
        ...validator.schemaNumber,
    },
    subcategory_point: {
        ...validator.schemaNumber,
        ...validator.schemaRequired

    },
    subcategory_part: {
        ...validator.schemaNumber,
        ...validator.schemaRequired

    },
    id_employee: {
        ...validator.schemaObjectId,
    },
    id_employee_setting: {
        ...validator.schemaObjectId,
    },
    id_import_return: { // id phiếu nhập trả lại , nếu khi nhập hàng khách trả lại sẽ cập nhập cái này vào phiếu xuất
        ...validator.schemaObjectId,
    },

}


const SchemaExportForm = new mongoose.Schema({
    id_warehouse: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },

    id_employee: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    id_user: {
        ...validator.schemaObjectId,
    },
    id_employee_setting: {
        ...validator.schemaObjectId,
    },
    id_employee_tranfer: {
        ...validator.schemaObjectId,
    },
    id_employee_manager: {
        ...validator.schemaObjectId,
    },
    export_status: { // 1. Chờ lấy hàng  2.Đang lắp đặt 3. Đang giao  4. Hoàn thành
        ...validator.schemaString,
        default: "Hoàn thành"
    },
    id_employee_create: {
        ...validator.schemaObjectId,
    },
    export_form_status_paid: {...validator.schemaBooleanFalse },
    export_form_product: {
        ...validator.schemaArray,
        type: [SchemaProductExportFor]
    },
    export_form_note: {...validator.schemeString },
    export_form_type: {...validator.schemeString },
    voucher_code: {
        ...validator.schemeString
    },
    money_voucher_code: {
        ...validator.schemeNumber,
    },
    point_number: {
        ...validator.schemeNumber
    },
    subcategory_part: {
        ...validator.schemeNumber
    },
    money_point: {
        ...validator.schemeNumber
    },
    order_time_trafer: {...validator.schemaDatetime }
}, { timestamps: true });


validator.schePre(SchemaExportForm)


SchemaExportForm.post(['save'], async(docs) => {
    var arrSubcategory = []
    for (let i = 0; i < docs.export_form_product.length; i++) {
        await ModelSubCategory.findByIdAndUpdate(docs.export_form_product[i].id_subcategory, {
            $inc: {
                subcategory_number_sale: 1
            }

        })
    }
})


export const ModelExportForm = mongoose.model("ExportForm", SchemaExportForm);