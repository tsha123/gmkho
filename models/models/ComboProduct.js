import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";

const SchemaComboProduct = new mongoose.Schema(
    {
        id_employee: { 
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },// tên nhân viên
        array_subcategory:{
            type:[{
                id_subcategory:{
                    ...validator.schemaObjectId,
                    ...validator.schemaRequired
                },
                quantity:{...validator.schemaNumber}
            }],
        },
        combo_name:{
            ...validator.schemaString,
            ...validator.schemaIndex,
            ...validator.schemaRequired
        },
        combo_type:{
            ...validator.schemaString,
        }
        
    },
    { timestamps: true }
);



validator.schePre(SchemaComboProduct)

export const ModelComboProduct = mongoose.model("ComboProduct", SchemaComboProduct);
