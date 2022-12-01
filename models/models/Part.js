import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
const SchemaPart = new mongoose.Schema(
    {
        id_branch: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        part_value: {
            ...validator.schemaNumber
        }

    },
    { timestamps: true }
);


validator.schePre(SchemaPart)

export const ModelPart = mongoose.model("Part", SchemaPart);
