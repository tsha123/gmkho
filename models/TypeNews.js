import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaTypeNews = new mongoose.Schema({
    type_news_name: {
        ...validator.schemaString,
        ...validator.schemaRequired,
        ...validator.schemaUnique
    },
    type_news_slug: {
        ...validator.schemaString,
        ...validator.schemaUnique
    },
}, { timestamps: true });

SchemaTypeNews.pre(["save", "insertMany","findByIdAndUpdate", "findOneAndUpdate"], async function (next) {
    this.type_news_slug = validator.stringToSlug(this.type_news_name)
    return next()
})

validator.schePre(SchemaTypeNews);

export const ModelTypeNews = mongoose.model("TypeNews", SchemaTypeNews);