import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaFundBook = new mongoose.Schema({
	fundbook_name: {
		...validator.schemaString,
        ...validator.schemaRequired
	},
    fundbook_type:{  // kiểu số quỹ , mặc định có 3 kiểu cash, bank , other
        ...validator.schemaString,
        ...validator.schemaRequired
    },
    id_branch:{
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    }
},{timestamps: true, });

validator.schePre(SchemaFundBook)
export const  ModelFundBook = mongoose.model("FundBook",SchemaFundBook);