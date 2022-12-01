import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";

const SchemaReceive = new mongoose.Schema(
    {
        id_user: { 
            ...validator.schemaObjectId,
        },// tên nhân viên
        receive_money: { ...validator.schemaNumber },
        receive_type:{...validator.schemaString}, // loại chi từ : import (phiếu nhập ), export(phiếu xuất)
        id_employee: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_branch: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        receive_content: {  // nội dung chi , id của accounting_ entry
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_form: { ...validator.schemaObjectId }, // id từ mã phiếu tạo (phiếu nhập , xuất . ..)
        receive_note:{...validator.schemaString}, // ghi chú
        id_fundbook: {  // hình thức thanh toán
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
    },
    { timestamps: true }
);



validator.schePre(SchemaReceive)

export const ModelReceive = mongoose.model("Receive", SchemaReceive);
