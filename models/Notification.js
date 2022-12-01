import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaNotification = new mongoose.Schema({

    notification_title:{
      ...validator.schemaString,
    },
    notification_content:{
      ...validator.schemaString,
    },
    notification_time:{
        ...validator.schemaDatetime,
    },
    id_from:{
        ...validator.schemaString,
        ...validator.schemaRequired,
        ...validator.schemaAutoIndex,
    },
    notification_type:{...validator.schemaString},
    notification_topic:{...validator.schemaString}
},{timestamps: true });

SchemaNotification.index({"createdAt": 1})
SchemaNotification.index({"updatedAt": 1})

export const  ModelNotification = mongoose.model("Notification",SchemaNotification);
