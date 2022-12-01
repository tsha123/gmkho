import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaWarrantyCombo = new mongoose.Schema(
    {
        warranty_combo_name:{
            ...validator.schemaString,
            ...validator.schemaRequired,
            ...validator.schemaTextIndex, 
        },
        warranty_combo_content:
        {
            ...validator.schemaArray
        }
    },
    { timestamps: true }
);


validator.schePre(SchemaWarrantyCombo)
export const ModelWarrantyCombo = mongoose.model("WarrantyCombo", SchemaWarrantyCombo);
