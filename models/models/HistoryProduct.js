import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaMenu = new mongoose.Schema(
    {
        product_id: {
            ...validator.schemaObjectId,
        },
        content: { ...validator.schemaString },      
    },
    { timestamps: true }
)
validator.schePre(SchemaMenu)
export const ModelHistoryProduct = mongoose.model("historyproduct", SchemaMenu)
