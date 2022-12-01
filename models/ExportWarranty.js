import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";

const schemaProductWarranty = {
    id_product: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    id_product2: {
        ...validator.schemaString
    },
    product_time_import: {
        ...validator.schemaDatetime,
        ...validator.schemaRequired
    },
    id_subcategory: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    product_warranty: {
        ...validator.schemaRequired,
        ...validator.schemaNumber,
    },
    subcategory_name: {
        ...validator.schemaString,
        ...validator.schemaRequired
    },
    product_status: {
        ...validator.schemaString
    },
    product_quantity: {
        ...validator.schemaNumber,
        default:1
    },
    subcategory_point: {
        ...validator.schemaNumber,
    },
    subcategory_part: {
        ...validator.schemaNumber,
    },
    product_discount: {
        ...validator.schemaNumber,
    },
    product_ck: {
        ...validator.schemaNumber,
    },
    product_vat: {
        ...validator.schemaNumber,
    },
    product_export_price: {
        ...validator.schemaNumber,
    },
    id_product_changed: {
        ...validator.schemaObjectId,
    }
}

const SchemaExportWarranty = new mongoose.Schema(
    {
        id_user: { 
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },// tên nhân viên
        warranty_status: {
            ...validator.schemaString,
            ...validator.schemaRequired
        },
        id_warehouse: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        warranty_product: {
            type:[schemaProductWarranty]
        },
        id_export_form: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_employee: { 
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },//
        warranty_note: {
            ...validator.schemaString,
        },
    },
    { timestamps: true }
);


validator.schePre(SchemaExportWarranty)

export const ModelExportWarranty = mongoose.model("ExportWarranty", SchemaExportWarranty);
