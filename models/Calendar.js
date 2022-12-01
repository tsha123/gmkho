import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaCalendar = new mongoose.Schema({
	id_employee: {
      ...validator.schemaObjectId,
      ...validator.schemaRequired,
      ...validator.schemaIndex,
    },
    in_noon_calendar:validator.schemaSchedule,
	out_noon_calendar:validator.schemaSchedule,
	in_night_calendar:validator.schemaSchedule,
	out_night_calendar:validator.schemaSchedule,
    date_calendar:validator.schemaDatetime
},{timestamps: true });


validator.schePre(SchemaCalendar)
export const  ModelCalendar = mongoose.model("Calendar",SchemaCalendar);