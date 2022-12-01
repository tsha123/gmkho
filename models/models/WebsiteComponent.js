import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaMenu = new mongoose.Schema(
    {
        MenuName: {
            ...validator.schemaString,
        },
        Description: validator.schemaString,
        Content: validator.schemaJson,
    },
    { timestamps: true }
)

export const Model_Website_Component = mongoose.model("WebsiteComponent", SchemaMenu)
