import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";

const SchemaBorrowProduct= new mongoose.Schema(
    {
        id_product: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_product2: {
            ...validator.schemaString,
        },
        id_subcategory: {
            ...validator.schemaObjectId,
        },
        subcategory_name: {
            ...validator.schemaString,
            ...validator.schemaRequired
        },
        product_status: {
            ...validator.schemaBooleanFalse
        },
        product_time_return: {
            ...validator.schemaDatetime
        }
    },
);


const SchemaBorrow= new mongoose.Schema(
    {
        id_warehouse: { 
            ...validator.schemaObjectId,
            ...validator.schemaIndex,
            ...validator.schemaRequired
        },// tên nhân viên
        id_employee: {
            ...validator.schemaObjectId,
            ...validator.schemaIndex,
            ...validator.schemaRequired
        },
        id_employee_created: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_export_form: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        borrow_status: {
            ...validator.schemaString,
            ...validator.schemaRequired
        },
        borrow_time_return: {
            ...validator.schemaDatetime
        },
        borrow_product: {
            ...validator.schemaArray,
            type:[SchemaBorrowProduct]
        },
        borrow_note:{
            ...validator.schemaString
        },
        id_import_form: {
            ...validator.schemaObjectId,
        }
    },
    { timestamps: true }
);


validator.schePre(SchemaBorrow)
export const ModelBorrow = mongoose.model("Borrow", SchemaBorrow);
