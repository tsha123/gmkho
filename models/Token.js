import mongoose from 'mongoose'
import * as validatior from './../helper/validator.js'

const schemaToken = mongoose.Schema({
    token:{
        ...validatior.schemaString,
        ...validatior.schemaAutoIndex,
    },
},{timestamps: true});

validatior.schePre(schemaToken)

export const TokenModel = mongoose.model('Token' , schemaToken);