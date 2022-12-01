import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaPoint = new mongoose.Schema(
    {
        point_number: {  // id nhóm nhân viên
            ...validator.schemaNumber
        },
        point_value: {  //id chức năng
            ...validator.schemaNumber
        },
    },
    { timestamps: true }
);


validator.schePre(SchemaPoint)

export const ModelPoint = mongoose.model("Point", SchemaPoint);
