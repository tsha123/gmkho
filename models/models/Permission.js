import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaPermission = new mongoose.Schema(
    {
        id_employee_group: {  // id nhóm nhân viên
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
            ...validator.schemaIndex,
        },
        id_function: {  //id chức năng
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
            ...validator.schemaIndex,
        },
        permission_status: { ...validator.schemaBoolean }, //trạng thái xác định có hay không quyền
    },
    { timestamps: true }
);


validator.schePre(SchemaPermission)

export const ModelPermission = mongoose.model("Permission", SchemaPermission);
