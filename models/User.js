import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaUser = new mongoose.Schema({
    uid_firebase: {
      ...validator.schemaString  
    },
    is_verify_phone: {
        ...validator.schemaBoolean,
        default:false
    },
    user_fullname: {
        ...validator.schemaString,
        ...validator.schemaTextIndex,
        ...validator.schemaRequired
    },
    user_phone: {
        ...validator.schemaString,
        ...validator.schemaRequired,
        ...validator.schemaUnique,
    },
    user_password: {
        ...validator.schemaString,
    },
    user_address: {
        ...validator.schemaString,
    },
    user_point: {
        ...validator.schemaNumber,
    },
    user_image: {
        ...validator.schemaString,
    },
    user_gender: {
        ...validator.schemaString,
    },
    user_email: {
        ...validator.schemaString,
    },
    user_debt: {
        ...validator.schemaNumber,
    },
    user_birthday: {
        ...validator.schemaDatetime,
    }
}, { timestamps: true });


validator.schePre(SchemaUser);

export const ModelUser = mongoose.model("User", SchemaUser);