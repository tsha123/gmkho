import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaYoutube = new mongoose.Schema({
    youtube_index:{
        ...validator.schemaNumber
    },
    youtube_link:{
        ...validator.schemaString
    },
    youtube_id:{
        ...validator.schemaString
    },
    youtube_status:{
        ...validator.schemaBoolean
    }
}, { timestamps: true });


validator.schePre(SchemaYoutube);

export const ModelYoutube = mongoose.model("Youtube", SchemaYoutube);
