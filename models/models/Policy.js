import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const Schema = new mongoose.Schema(
    {
        Name: {
            ...validator.schemaString,
        },
        Note: {
            ...validator.schemaString,
        },
        Content: {
            ...validator.schemaJSON,
        },
        Active_Website_GamingMarket: { ...validator.schemaBoolean },
    },
    { timestamps: true }
)
validator.schePre(Schema)
export const Model_Policy = mongoose.model("Policy", Schema)