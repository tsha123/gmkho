import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const Schema_Community_Friend_List = new mongoose.Schema(
    {
        id_user: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
        },
        list_id_user: {
            ...validator.schemaArray,
        },
    },
    { timestamps: true }
)

validator.schePre(Schema_Community_Friend_List)

export const Model_Community_Friend_List = mongoose.model("Community_Friend_List", Schema_Community_Friend_List)
