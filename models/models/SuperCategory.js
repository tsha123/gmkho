import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaSuperCategory = new mongoose.Schema(
    {
        super_category_name:{
            ...validator.schemaString,
            ...validator.schemaRequired,
            ...validator.schemaUnique
        },
        super_category_index:{
            ...validator.schemaNumber
        }
    },
    { timestamps: true }
);

validator.schePre(SchemaSuperCategory)
export const ModelSuperCategory = mongoose.model("SuperCategory", SchemaSuperCategory);
