import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaInventoryWarning = new mongoose.Schema(
    {
        id_subcategory: {  // id nhóm nhân viên
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
            ...validator.schemaIndex,
        },
        id_warehouse: {  //id chức năng
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
            ...validator.schemaIndex,
        },
        inventory_warning_number:{...validator.schemaNumber}
    },
    { timestamps: true }
);


validator.schePre(SchemaInventoryWarning)

export const ModelInventoryWarning = mongoose.model("InventoryWarning", SchemaInventoryWarning);
