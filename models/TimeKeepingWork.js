import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaTimekeepingWork = new mongoose.Schema({
	id_employee: {
      ...validator.schemaObjectId,
      ...validator.schemaRequired,
      ...validator.schemaIndex,
    },
    in_morning:validator.schemaSchedule,
	out_morning:validator.schemaSchedule,
	in_afternoon:validator.schemaSchedule,
	out_afternoon:validator.schemaSchedule,
	late_morning:validator.schemaSchedule,
  late_afternoon:validator.schemaSchedule,
  overtime:validator.schemaSchedule,
},{timestamps: true });

validator.schePre(SchemaTimekeepingWork)

export const  ModelTimekeepingWork = mongoose.model("TimeKeepingWork",SchemaTimekeepingWork);