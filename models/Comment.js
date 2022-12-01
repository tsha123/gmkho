import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"

const SchemaRep = (
    {
        comment_star:{
            ...validator.schemaNumber
        },
        user_fullname:{
            ...validator.schemaString,
        },
        user_phone:{
            ...validator.schemaString
        },
        comment_content:{
            ...validator.schemaString,
            ...validator.schemaRequired
        },
        createdAt:{...validator.schemaDatetime}
    }
)

const SchemaComment = new mongoose.Schema(
    {
        user_fullname:{
            ...validator.schemaString,
        },
        user_phone:{
            ...validator.schemaString
        },
        comment_content:{
            ...validator.schemaString,
            ...validator.schemaRequired
        },
        id_subcategory:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        comment_star:{
            ...validator.schemaNumber,
        },
        comment_reps:{
            type:[SchemaRep]
        }
    },
    { timestamps: true }
)

validator.schePre(SchemaComment)


export const ModelComment = mongoose.model("Comment", SchemaComment)
