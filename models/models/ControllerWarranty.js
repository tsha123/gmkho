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
    subcategory_name: {
        ...validator.schemaString,
        ...validator.schemaRequired
    },
    product_time_export: {
        ...validator.schemaDatetime,
        ...validator.schemaRequired
    },
    id_form_export: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    product_status: {
        ...validator.schemaString
    },
    product_warranty: {
        ...validator.schemaString
    },
    id_product_return: {
        ...validator.schemaObjectId,
    }
}

const SchemaWarranty = new mongoose.Schema(
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

        
    },
    { timestamps: true }
);



validator.schePre(SchemaWarranty)

export const ModelWarranty = mongoose.model("Warranty", SchemaWarranty);
