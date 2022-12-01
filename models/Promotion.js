import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"


const SchemaPromotion = new mongoose.Schema({  // cái này dành cho trang gm feed trên mobile phần khuyến mại
    promotion_images:
    {
        type:[],
    },
    promotion_content:{
        ...validator.schemaString
    },
    promotion_url:{
        ...validator.schemaString
    },
    promotion_index:{
        ...validator.schemaNumber
    },
    promotion_views:{
        ...validator.schemaNumber
    },
    promotion_title:{
        ...validator.schemaString,
        ...validator.schemaTextIndex,
        ...validator.schemaRequired
    },
    promotion_slug_link:{
        ...validator.schemaString,
    }


},{timestamps: true });


SchemaPromotion.pre(["findByIdAndUpdate", "findOneAndUpdate","updateOne", "insertMany"], async function (next) {
    if(validator.isDefine(this._update.promotion_title)){
        this._update.promotion_slug_link = validator.stringToSlug(this._update.promotion_title)
    }
    return next()
})
SchemaPromotion.pre(["save"], async function (next) {
    this.promotion_slug_link = validator.stringToSlug(this.promotion_title)
    return next()
})
validator.schePre(SchemaPromotion)
export const  ModelPromotion = mongoose.model("Promotion",SchemaPromotion);