import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaAccountingEntry = new mongoose.Schema(
  {
    accounting_entry_type: {  // tên danh mục
      ...validator.schemaString, // loại bút toán thu hoặc chi
      ...validator.schemaRequired,
    },
    accounting_entry_name: {
      ...validator.schemaString,
      ...validator.schemaRequired,
    },
    accounting_entry_create_debt: {
      ...validator.schemaBoolean,
    },
    accounting_entry_default: {
      ...validator.schemaBoolean,
    },
  },
  { timestamps: true }
);

validator.schePre(SchemaAccountingEntry)

// SchemaAsset.pre(["validate"], async function (next) {
//     // this.category_sluglink = validator.stringToSlug(this.asset_name)
//     next()
// })


export const ModelAccountingEntry = mongoose.model("AccountingEntry", SchemaAccountingEntry);
