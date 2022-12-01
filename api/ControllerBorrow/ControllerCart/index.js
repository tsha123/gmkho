const prefixApi = "/api/cart"
import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { ModelCart } from "../../models/Cart.js"
import { ModelSubCategory } from "../../models/SubCategory.js"

export const management = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            const id_user = req.body._caller._id
            const data = await ModelCart.find({ id_user: id_user }).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            for (let i = 0; i < data.length; i++) {
                const dataSub = await ModelSubCategory.findById(data[i].cart_product.id_subcategory)
                // const discount = dataSub.subcategory_export_price_web>0?dataSub.subcategory_export_price_web - dataSub.subcategory_export_price:0
                data[i].cart_product = {
                    ...data[i].cart_product,
                    subcategory_export_price: dataSub.subcategory_export_price,
                    subcategory_discount: 0,
                    subcategory_vat: 0,
                    subcategory_ck: 0,
                    subcategory_warranty: dataSub.subcategory_warranty,
                    subcategory_unit: dataSub.subcategory_unit,
                    subcategory_images: dataSub.subcategory_images,
                    subcategory_name: dataSub.subcategory_name,
                }
            }
            return res.json(data)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng
}

export const insert = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            const id_subcategory = req.body.id_subcategory
            const quantity = validator.tryParseInt(req.body.quantity)
            const id_user = req.body._caller._id
            if (!validator.ObjectId.isValid(id_subcategory)) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")

            const dataSub = await ModelSubCategory.findById(id_subcategory)
            if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")

            const dataCart = await ModelCart.findOne({ id_user: id_user, "cart_product.id_subcategory": dataSub._id }) // kiểm tra trong danh sách cart của user đã có sản phẩm này chưa

            // const discount = dataSub.subcategory_export_price_web>0?dataSub.subcategory_export_price_web - dataSub.subcategory_export_price:0
            if (dataCart) {
                // đã tồn tại thì tăng số lượng lên 1
                dataCart.cart_product.subcategory_quantity += quantity == 0 ? 1 : quantity

                const updateCart = await ModelCart.findByIdAndUpdate(dataCart._id, {
                    cart_product: dataCart.cart_product,
                })
                const result = {
                    ...dataCart,
                    cart_product: {
                        ...dataCart.cart_product,
                        subcategory_export_price: dataSub.subcategory_export_price,
                        subcategory_discount: 0,
                        subcategory_vat: 0,
                        subcategory_ck: 0,
                        subcategory_warranty: dataSub.subcategory_warranty,
                        subcategory_unit: dataSub.subcategory_unit,
                        subcategory_images: dataSub.subcategory_images,
                    },
                }

                return res.json(result)
            } else {
                // chưa có thì tạo mới
                const insertCart = await new ModelCart({
                    id_user: id_user,
                    cart_product: {
                        id_subcategory: dataSub._id,
                        subcategory_quantity: 1,
                    },
                }).save()

                const result = {
                    ...insertCart._doc,
                    cart_product: {
                        ...insertCart._doc.cart_product,
                        subcategory_export_price: dataSub.subcategory_export_price,
                        subcategory_discount: 0,
                        subcategory_vat: 0,
                        subcategory_ck: 0,
                        subcategory_warranty: dataSub.subcategory_warranty,
                        subcategory_unit: dataSub.subcategory_unit,
                        subcategory_images: dataSub.subcategory_images,
                    },
                }
                return res.json(result)
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng

    app.post(prefixApi + "/build-pc", helper.authenToken, async (req, res) => {
        try {
            // console.log(`req.body.array_subcategory`, typeof req.body.array_subcategory, req.body.array_subcategory)
            const array_subcategory = validator.tryParseJson(req.body.array_subcategory)
            const id_user = req.body._caller._id

            for (let i = 0; i < array_subcategory.length; i++) {
                if (!validator.isDefine(array_subcategory[i].id_subcategory) || !validator.ObjectId.isValid(array_subcategory[i].id_subcategory)) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")
                const dataSub = await ModelSubCategory.findById(array_subcategory[i].id_subcategory)
                if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")

                const discount = dataSub.subcategory_export_price_web > 0 ? dataSub.subcategory_export_price_web - dataSub.subcategory_export_price : 0
                const dataCart = await ModelCart.findOne({ id_user: id_user, "cart_product.id_subcategory": dataSub._id }) // kiểm tra trong danh sách cart của user đã có sản phẩm này chưa
                if (dataCart) {
                    // đã tồn tại thì tăng số lượng lên 1
                    dataCart.cart_product.subcategory_quantity += validator.tryParseInt(array_subcategory[i].quantity)

                    const updateCart = await ModelCart.findByIdAndUpdate(dataCart._id, {
                        cart_product: dataCart.cart_product,
                    })
                } else {
                    // chưa có thì tạo mới
                    const insertCart = await new ModelCart({
                        id_user: id_user,
                        cart_product: {
                            id_subcategory: dataSub._id,
                            subcategory_quantity: validator.tryParseInt(array_subcategory[i].quantity),
                        },
                    }).save()
                }
            }
            return res.json("success")
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const update = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try {
            const id_cart = req.body.id_cart
            const subcategory_quantity = validator.tryParseInt(req.body.subcategory_quantity) // <= 0?1:validator.tryParseInt(req.body.subcategory_quantity)

            const dataCart = await ModelCart.findById(id_cart)
            if (!dataCart) return res.status(400).send("Thất bại! Không tìm thấy giỏ hàng")
            if (subcategory_quantity > 0) {
                dataCart.cart_product.subcategory_quantity = subcategory_quantity
                const updateCart = await ModelCart.findByIdAndUpdate(dataCart._id, {
                    cart_product: dataCart.cart_product,
                })

                return res.json(updateCart)
            } else {
                const delete_cart = await ModelCart.findByIdAndDelete(dataCart._id)

                return res.json(delete_cart)
            }
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng
}

export const deleteCart = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.delete(prefixApi + "/:id_cart", helper.authenToken, async (req, res) => {
        try {
            const id_cart = req.params.id_cart
            const dele = await ModelCart.findByIdAndDelete(id_cart)
            return res.json(dele)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng
}
