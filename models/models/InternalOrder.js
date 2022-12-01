import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";

const SchemaInternalOrderProduct = new mongoose.Schema(
    {
        id_subcategory:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_product:{
            ...validator.schemaObjectId,
        },
        subcategory_export_price:{
            ...validator.schemaNumber,
            ...validator.schemaRequired
        } ,
        subcategory_vat:{
            ...validator.schemaNumber,
            ...validator.schemaRequired
        } ,
        subcategory_ck:{
            ...validator.schemaNumber,
            ...validator.schemaRequired
        },
        subcategory_discount:{
            ...validator.schemaNumber,
        } ,
        subcategory_quantity:{
            ...validator.schemaNumber,
            ...validator.schemaRequired
        } ,
        subcategory_warranty:{
            ...validator.schemaNumber,
            ...validator.schemaRequired
        } ,
        subcategory_name:{
            ...validator.schemaString,
            ...validator.schemaRequired
        } ,

    },
    { timestamps: true }
);

const SchemaInternalOrder = new mongoose.Schema(
    {
        interal_order_status: { 
            ...validator.schemaString,
            ...validator.schemaRequired
        },// tên nhân viên
        from_warehouse: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        to_warehouse: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        from_user: {
            ...validator.schemaObjectId,
        },
        to_user: {
            ...validator.schemaObjectId,
        },
        interal_order_product: {
            type: [SchemaInternalOrderProduct],
            default:[]
        },
        from_employee: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        to_employee: {
            ...validator.schemaObjectId,
        },
        internal_order_note: {
            ...validator.schemaString,
        },
        id_import_form: {
            ...validator.schemaObjectId
        },
        id_export_form: {
            ...validator.schemaObjectId
        }

    },
    { timestamps: true }
);



validator.schePre(SchemaInternalOrder)

export const ModelInternalOrder = mongoose.model("InternalOrder", SchemaInternalOrder);
