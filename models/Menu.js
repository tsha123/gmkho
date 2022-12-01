import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaMenu = new mongoose.Schema(
    {
        name: {
            ...validator.schemaString,
        },
        link: { ...validator.schemaString },
        id_parent: {
            ...validator.schemaObjectId,
        },
        id_represent_category: {
            ...validator.schemaObjectId,
        },
        id_website_component: {
            ...validator.schemaObjectId,
        },
        serial_number: { ...validator.schemaNumber },
        display_app: { ...validator.schemaBoolean },
        display_website: { ...validator.schemaBoolean },
        display_tree: { ...validator.schemaBoolean },
        display_home: { ...validator.schemaBoolean },
        image: { ...validator.schemaString },
        icon: { ...validator.schemaString },
    },
    { timestamps: true }
)
validator.schePre(SchemaMenu)
export const ModelMenu = mongoose.model("Menu", SchemaMenu)
