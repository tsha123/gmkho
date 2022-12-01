import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const schemaOrderCart = {
    id_product: {
        ...validator.schemaObjectId,
    },
    id_product2: {
        ...validator.schemaString,
    },
    id_subcategory: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired,
    },
    subcategory_name: {
        ...validator.schemaString,
        ...validator.schemaRequired,
    },
    subcategory_image: {
        ...validator.schemaArray,
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
    product_warranty: {
        ...validator.schemaNumber
    },
    product_quantity: {
        ...validator.schemaNumber,
        default:1
    },
    subcategory_point: {
        ...validator.schemaNumber
    },
    subcategory_part: {
        ...validator.schemaNumber
    },
    id_employee: {
        ...validator.schemaObjectId
    }
}

const SchemaOrder = new mongoose.Schema({
    id_branch:
    {
        ...validator.schemaObjectId,
        ...validator.schemaIndex,
        ...validator.schemaRequired,
    },
	id_user:
    {
        ...validator.schemaObjectId,
        ...validator.schemaRequired,
        ...validator.schemaIndex,
    },
    order_product: {
        type:[schemaOrderCart]
    },
    order_status: {
        ...validator.schemaString,
        ...validator.schemaRequired
    },
    order_address: {
        ...validator.schemaString
    },
    order_phone: {
        ...validator.schemaString
    },
    voucher_code: {
        ...validator.schemaString
    },
    point_number: {
        ...validator.schemaNumber
    },
    money_point: {
        ...validator.schemaNumber
    },
    money_voucher_code: {
        ...validator.schemaNumber
    },
    order_note: {
        ...validator.schemaString
    },
    id_export_form: {
        ...validator.schemaObjectId
    },
    order_time_trafer:{...validator.schemaDatetime}
},{timestamps: true });



validator.schePre(SchemaOrder)
export const  ModelOrder = mongoose.model("Order",SchemaOrder);