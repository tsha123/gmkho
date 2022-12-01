import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const schemaProductCart = {
    id_subcategory: {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    subcategory_quantity: {
        ...validator.schemaNumber,
        default:1
    },
}
const SchemaCart = new mongoose.Schema({
	id_user:
    {
        ...validator.schemaObjectId,
        ...validator.schemaRequired
    },
    cart_product:schemaProductCart,
},{timestamps: true });



validator.schePre(SchemaCart)
export const  ModelCart = mongoose.model("Cart",SchemaCart);