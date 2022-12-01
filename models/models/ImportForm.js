import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const schemaProduct = {
    id_subcategory: {
        type: validator.ObjectId,
        ...validator.schemaRequired
    },
    id_product: {
        type: validator.ObjectId,
    },
    id_product2: {
        ...validator.schemaString,
    },
    subcategory_name: {
        ...validator.schemaString,
    },
    product_import_price: {
        ...validator.schemaNumber,
    },
    product_import_price_return: {
        ...validator.schemaNumber,
    },
    product_export_price:{
        ...validator.schemaNumber,
    },
    product_vat: {
        ...validator.schemaNumber,
    },
    product_ck: {
        ...validator.schemaNumber,
    },
    product_discount: {
        ...validator.schemaNumber,
    },
    product_quantity: {
        ...validator.schemaNumber,
        default:1
    },
    product_warranty: {
        ...validator.schemaNumber,
    },
    product_index: {
        ...validator.schemaNumber,
    },
    subcategory_point: {
        ...validator.schemaNumber,
    },
    subcategory_part: {
        ...validator.schemaNumber,
    },
    id_employee: {
        ...validator.schemaObjectId
    },
    id_employee_setting: {
        ...validator.schemaObjectId
    },
    id_form_export: {
        ...validator.schemaObjectId
    },
}
const SchemaImportForm = new mongoose.Schema(
    {
        id_warehouse:{  // mã kho
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_employee:{  // mã nhân viên
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_user:{  // mã nhà cung cập hoặc khách hàng
            ...validator.schemaObjectId,
        },
        import_form_status_paid:{...validator.schemaBooleanFalse},  // trạng thái thanh đoán , false là chưa thanh toán
        import_form_product: {
            ...validator.schemaJson,
            type: [schemaProduct]
        },  // json sản phẩm
        import_form_note:{...validator.schemaString},  // ghi chú
        import_form_type:{
            ...validator.schemaString,
            ...validator.schemaRequired
        },  //loại phiếu
    },
    { timestamps: true }
);

validator.schePre(SchemaImportForm)
export const ModelImportForm = mongoose.model("ImportForm", SchemaImportForm);
