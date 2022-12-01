import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const Schema = new mongoose.Schema(
    {
        Title: {
            ...validator.schemaString,
        },
        Description: {
            ...validator.schemaString,
        },
        SlideBanner: validator.schemaArray,
        Active_Mobile:{
            ...validator.schemaBooleanFalse
        }
    },
    { timestamps: true }
)
validator.schePre(Schema)
export const Model_Slide_Banner = mongoose.model("SlideBanner", Schema)
