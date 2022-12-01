//Email_Announcement_Promotion
import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const Schema_Email_Announcement_Promotion = new mongoose.Schema(
    {
        email: {
            ...validator.schemaString,
            ...validator.schemeRequired,
        },
        quantity_register: {
            ...validator.schemaNumber,
            default: 1,
        },
    },
    { timestamps: true }
)

validator.schePre(Schema_Email_Announcement_Promotion)

export const Model_Email_Announcement_Promotion = mongoose.model("Email_Announcement_Promotion", Schema_Email_Announcement_Promotion)
