import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaTimekeepingSchedule = new mongoose.Schema({
	id_employee: {
      ...validator.schemaObjectId,
      ...validator.schemaRequired,
      ...validator.schemaIndex,
    },
    in_noon:validator.schemaSchedule,
	out_noon:validator.schemaSchedule,
	in_night:validator.schemaSchedule,
	out_night:validator.schemaSchedule,
	late_noon:validator.schemaSchedule,
    late_night:validator.schemaSchedule,
    overtime:validator.schemaSchedule,
},{timestamps: true });

validator.schePre(SchemaTimekeepingSchedule)

export const  ModelTimekeepingSchedule = mongoose.model("TimeKeepingSchedule",SchemaTimekeepingSchedule);