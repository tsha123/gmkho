import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";

const SchemaDebt = new mongoose.Schema(
    {
        id_user: { 
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },// tên nhân viên
        debt_type:{...validator.schemaString},
        id_branch: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_employee: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        debt_money_payment:{...validator.schemaNumber},
        debt_money_receive: { ...validator.schemaNumber },
        debt_money_import:{...validator.schemaNumber},
        debt_money_export:{...validator.schemaNumber},
        debt_note: { ...validator.schemaString },
        id_form: { ...validator.schemaObjectId },
        debt_time: { ...validator.schemaNumber },
        
    },
    { timestamps: true }
);



validator.schePre(SchemaDebt)

export const ModelDebt = mongoose.model("Debt", SchemaDebt);
