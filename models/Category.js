import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaCategory = new mongoose.Schema(
    {
        category_name: {
            // tên danh mục
            ...validator.schemaString,
            ...validator.schemaRequired,
            ...validator.schemaUnique,
        },
        category_sluglink: {
            // tên danh mục
            ...validator.schemaString,
            ...validator.schemaRequired,
            ...validator.schemaUnique,
        },
        category_status: { ...validator.schemaBoolean },
        category_part: { ...validator.schemaNumber },
        display_app: { ...validator.schemaBoolean },
        display_website: { ...validator.schemaBoolean },
        id_parent_category: {
            ...validator.schemaObjectId,
        },
        id_slide_banner: {
            ...validator.schemaObjectId,
        },
        category_image: { ...validator.schemaString },
        category_options: { ...validator.schemaArray },
        category_content: { ...validator.schemaString },
    },
    { timestamps: true }
)

validator.schePre(SchemaCategory)

SchemaCategory.pre(["validate"], async function (next) {
    this.category_sluglink = validator.stringToSlug(this.category_name)
    next()
})

export const ModelCategory = mongoose.model("Category", SchemaCategory)
