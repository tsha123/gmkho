import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";


const SchemaProductExportForm = 
    {

        id_product: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_product2: {
            ...validator.schemeString
        },
        id_subcategory: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        subcategory_name: {
            ...validator.schemaString,
            ...validator.schemaRequired
        },
        product_export_price: {
            ...validator.schemaNumber
        },
        product_vat: {
            ...validator.schemaNumber
        },
        product_ck: {
            ...validator.schemaNumber
        },
        product_discount: {
            ...validator.schemaNumber
        },
        product_quantity: {
            ...validator.schemaNumber,
            default:1
        },
        product_warranty: {
            ...validator.schemaNumber,
        },
        product_import_price: {
            ...validator.schemaNumber,
        },
        subcategory_point: {
            ...validator.schemaNumber,
            ...validator.schemaRequired

        },
        subcategory_part: {
            ...validator.schemaNumber,
            ...validator.schemaRequired

        },
        status_repair:{
            ...validator.schemaBoolean
        }
    }
const SchemaExternalRepairService= new mongoose.Schema(
    {
        id_export_form:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_warehouse:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        external_repair_service_product:{
            type:[SchemaProductExportForm]
        },
        id_employee:{
            ...validator.schemaObjectId
        },
        id_user:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        external_repair_service_note:{
            ...validator.schemaString
        }
    },
    { timestamps: true }
);


validator.schePre(SchemaExternalRepairService)
export const ModelExternalRepairService = mongoose.model("ExternalRepairService", SchemaExternalRepairService);
