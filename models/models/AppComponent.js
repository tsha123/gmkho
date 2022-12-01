import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const Schema_App_Component = new mongoose.Schema(
    {
        MenuName: {
            ...validator.schemaString,
        },
        Description: validator.schemaString,
        Content: validator.schemaJson,
    },
    { timestamps: true }
)

export const Model_App_Component = mongoose.model("AppComponent", Schema_App_Component)
