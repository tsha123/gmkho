import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"

const SchemaTranferFundbook = new mongoose.Schema({
    id_branch: {...validator.schemaObjectId },
    note: {...validator.schemaString },
    id_employee: {...validator.schemaObjectId },
    id_receipts: {...validator.schemaObjectId },
    id_payment: {...validator.schemaObjectId },
    from_fundbook: {...validator.schemaObjectId },
    to_fundbook: {...validator.schemaObjectId },
    money: {...validator.schemaNumber },

}, { timestamps: true });

validator.schePre(SchemaTranferFundbook);

export const ModelTranferFundbook = mongoose.model("tranferfundbook", SchemaTranferFundbook);