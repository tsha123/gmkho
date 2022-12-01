import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaChangeWarehouse = new mongoose.Schema(
    {
        id_export_form:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_import_form:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_fromwarehouse:{
            ...validator.schemaObjectId,
        },
        id_towarehouse:{
            ...validator.schemaObjectId,
        },
        id_employee:validator.schemaObjectId,
    },
    { timestamps: true }
)

validator.schePre(SchemaChangeWarehouse)


export const ModelChangeWarehouse = mongoose.model("ChangeWarehouse", SchemaChangeWarehouse)
