import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaPromotionCombo = new mongoose.Schema(
    {
        promotion_combo_name:{
            ...validator.schemaString,
            ...validator.schemaRequired,
            ...validator.schemaTextIndex, 
        },
        promotion_combo_content:
        {
            ...validator.schemaArray
        }
    },
    { timestamps: true }
);


validator.schePre(SchemaPromotionCombo)
export const ModelPromotionCombo = mongoose.model("PromotionCombo", SchemaPromotionCombo);
