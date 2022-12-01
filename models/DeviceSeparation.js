import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";


const SchemaDeviceSeparation = new mongoose.Schema(
    {
     //    id_user:{
     //        ...validator.schemaObjectId,
     //        ...validator.schemaRequired
     //    },
        id_warehouse:{
             ...validator.schemaObjectId,
             ...validator.schemaRequired,
             ...validator.schemaIndex
        },
        id_employee:{
             ...validator.schemaObjectId,
             ...validator.schemaRequired
        },
      
        id_export_form:{
             ...validator.schemaObjectId,
             ...validator.schemaRequired
 
        },
        id_import_form:{
             ...validator.schemaObjectId,
             ...validator.schemaRequired
        },
    },
  
    { timestamps: true }
)

validator.schePre(SchemaDeviceSeparation)
export const ModelDeviceSeparation = mongoose.model("DeviceSeparation", SchemaDeviceSeparation);
