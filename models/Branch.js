import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaBranch = new mongoose.Schema({
	branch_name:{
		...validator.schemaString,
		...validator.schemaRequired,
	} ,
	branch_address: validator.schemaString,
	branch_map_address: validator.schemaString,
	branch_email: validator.schemaString,
	branch_time_active: validator.schemaString,
	branch_phone:{
		...validator.schemaString,
		...validator.schemaRequired,
		...validator.schemaIndex,
	},
	branch_image: {
		...validator.schemaString
	},
	branch_header_content:{
		...validator.schemaString
	},
	branch_ipwifi:{
		...validator.schemaArray
	},
	branch_logo:{
		...validator.schemaString
	},
	branch_note:{
		...validator.schemaString
	},
	in_morning:validator.schemaSchedule,
	out_morning:validator.schemaSchedule,
	in_afternoon:validator.schemaSchedule,
	out_afternoon:validator.schemaSchedule,

	in_noon_schedule:validator.schemaSchedule,
	out_noon_schedule:validator.schemaSchedule,
	in_night_schedule:validator.schemaSchedule,
	out_night_schedule:validator.schemaSchedule,

	late_limit: validator.schemaNumber,
	branch_active: {
		...validator.schemaBooleanFalse
	}

},{timestamps: true });


validator.schePre(SchemaBranch)

export const ModelBranch = mongoose.model("Branch",SchemaBranch);



