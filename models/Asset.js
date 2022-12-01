import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaAsset = new mongoose.Schema(
  {
    id_asset: {  // tên danh mục
      ...validator.schemaString,
      // ...validator.schemaRequired,
      // ...validator.schemaUnique
    },
    asset_name: {
      ...validator.schemaString,
      ...validator.schemaRequired,
    },
    asset_price: {
      ...validator.schemaNumber,
    },
    asset_note: {
      ...validator.schemaString,
    },
    asset_time: {
      ...validator.schemaDatetime,
    },
    asset_expiry: {
      ...validator.schemaNumber,
    },
    asset_position: {
      ...validator.schemaString,
    },
    id_branch: {
      ...validator.schemaObjectId,
      ...validator.schemaRequired,
    },
    id_employee: {
      ...validator.schemaObjectId,
    },

  },
  { timestamps: true }
);

validator.schePre(SchemaAsset)

// SchemaAsset.pre(["validate"], async function (next) {
//     // this.category_sluglink = validator.stringToSlug(this.asset_name)
//     next()
// })


export const ModelAsset = mongoose.model("Asset", SchemaAsset);
