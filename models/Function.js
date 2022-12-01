import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaFunction = new mongoose.Schema({
	function_name: {
		...validator.schemaString,
		...validator.schemaUnique,
	} // tên chức năng
},{timestamps: true, });


validator.schePre(SchemaFunction)
export const  ModelFunction = mongoose.model("Function",SchemaFunction);