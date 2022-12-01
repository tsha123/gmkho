import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaNews = new mongoose.Schema(
    {
        news_title:{
            ...validator.schemaString,
            ...validator.schemeRequired,
            ...validator.schemaTextIndex
        },
        id_type:{
            ...validator.schemaObjectId
        },
        news_slug_link:{
            ...validator.schemaString,
            ...validator.schemeRequired,
            ...validator.schemaUnique
        },
        news_views:{
           ...validator.schemaNumber,
        },
        news_index:{
            ...validator.schemaNumber,
        },
        news_image:{
            ...validator.schemaString,
            ...validator.schemeRequired
        },
        news_content:{
            ...validator.schemaString,
            ...validator.schemeRequired
        },
        news_brief:{
            ...validator.schemaString,
        },
        
    },
    { timestamps: true }
);


SchemaNews.pre(["findByIdAndUpdate", "findOneAndUpdate","updateOne", "insertMany"], async function (next) {
    // this._update.news_slug_link = validator.stringToSlug(this._update.news_title)
    return next()
})
SchemaNews.pre(["save"], async function (next) {
    this.news_slug_link = validator.stringToSlug(this.news_title)
    return next()
})

validator.schePre(SchemaNews)

export const ModelNews = mongoose.model("News", SchemaNews);
