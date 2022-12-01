import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaNotificationUser = new mongoose.Schema({

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
    notification_topic:{...validator.schemaString}, // đây là số điên jthoaij
    id_user:{
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    notification_status:{

        ...validator.schemaBooleanFalse
    }
},{timestamps: true });

SchemaNotificationUser.index({"createdAt": 1})
SchemaNotificationUser.index({"updatedAt": 1})

export const  ModelNotificationUser = mongoose.model("NotificationUser",SchemaNotificationUser);
