import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaWarehouse = new mongoose.Schema(
    {
        warehouse_name: { 
            ...validator.schemaString,
            ...validator.schemaTextIndex,
            ...validator.schemaRequired
        },// tên nhân viên
        warehouse_phone: {   // số didenj thoại, và là duy nhất
            ...validator.schemaString,
        },
        warehouse_address: {   // số didenj thoại, và là duy nhất
            ...validator.schemaString,
        },
        id_branch: {  // mã chi nhánh , bắt buộc phải có kể cả ô giám đốc
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
        },
        warehouse_status:{  // trạng thái kho, true còn hoạt động, false là ko hoạt động
            ...validator.schemaBoolean
        },
        warehouse_index:{
            ...validator.schemaNumber
        }
    },
    { timestamps: true }
);


validator.schePre(SchemaWarehouse)
export const ModelWarehouse = mongoose.model("Warehouse", SchemaWarehouse);
