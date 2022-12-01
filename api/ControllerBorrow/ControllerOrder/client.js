const prefixApi = "/api/order/client"
import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { ModelBranch } from "../../models/Branch.js"
import { ModelCart } from "../../models/Cart.js"
import { ModelNotificationUser } from "../../models/Notification_User.js"
import { ModelUser } from "../../models/User.js"
import { ModelSubCategory } from "../../models/SubCategory.js"
import { ModelOrder } from "../../models/Order.js"
import { checkCodeDiscountReturnError, update_status_voucher } from "../ControllerVoucher/index.js"
import { checkPointReturnZero, update_point_user } from "../ControllerPoint/index.js"

export const tracking = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            let query = { id_user: req.body._caller._id }
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } }, { createdAt: { $lte: validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay } }],
                }
            }
            const status = req.query.status
            const key = req.query.key
            if (validator.isDefine(status)) {
                query = {
                    ...query,
                    order_status: status.trim(),
                }
            }
            if (validator.isDefine(key) && validator.ObjectId.isValid(key)) {
                query = {
                    ...query,
                    _id: validator.ObjectId(key),
                }
            }
            const data = await ModelOrder.find(query).sort({ _id: -1 }).skip(validator.getOffset(req)).limit(validator.getLimit(req))

            for(let i =0;i<data.length;i++){
                for(let j =0;j<data[i].order_product.length;j++){
                    const dataSub = await ModelSubCategory.findById(data[i].order_product[j].id_subcategory)
                    if(dataSub){
                        data[i].order_product[j].subcategory_slug_link = dataSub.subcategory_slug_link
                    }
                }
            }
            return res.json(data)
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const insert = async (app) => {
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            const id_user = req.body._caller._id
            const id_branch = req.body.id_branch
            const arrCart = validator.tryParseJson(req.body.arrCart)

            const order_address = req.body.order_address
            const order_phone = req.body.order_phone
            const order_note = req.body.order_note
            const voucher_code = req.body.voucher_code
            const point_number = validator.tryParseInt(req.body.point_number)
            var money_voucher_code = 0
            var money_point = 0
            const dataUser = await ModelUser.findById(id_user)
            if (!dataUser) return res.status(400).send(`Thất bại! Không tìm thấy người dùng`)

            if (!validator.ObjectId.isValid(id_branch)) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh")
            const dataBranch = await ModelBranch.findById(id_branch)
            if (!dataBranch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh")
            if (arrCart.length == 0) return res.status(400).send("Hãy thêm ít nhất 1 sản phẩm")
            const arrProduct = []

            for (let i = 0; i < arrCart.length; i++) {
                const dataCart = await ModelCart.findById(arrCart[i])
                if (!dataCart) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")
console.log(dataCart)
                const dataSub = await ModelSubCategory.findById(dataCart.cart_product.id_subcategory)
                if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")

                for (let j = 0; j < dataCart.cart_product.subcategory_quantity; j++) {
                    arrProduct.push({
                        id_subcategory: dataSub._id,
                        subcategory_name: dataSub.subcategory_name,
                        subcategory_image: dataSub.subcategory_images,
                        product_export_price: dataSub.subcategory_export_price,
                        product_vat: 0,
                        product_ck: 0,
                        product_discount: 0,
                        product_warranty: dataSub.subcategory_warranty,
                        subcategory_point: dataSub.subcategory_point,
                        subcategory_part: dataSub.subcategory_part,
                        product_quantity: 1,
                    })
                }
            }
            const totalMoney = validator.calculateMoneyExport(arrProduct)
            if (voucher_code && voucher_code.length > 0) {
                money_voucher_code = await checkCodeDiscountReturnError(voucher_code, totalMoney)
                if (isNaN(money_voucher_code)) return res.status(400).send(money_voucher_code)
            }
            if (point_number > 0) {
                money_point = await checkPointReturnZero(id_user, point_number)
                if (isNaN(money_point)) return res.status(400).send(money_point)
            }

            const insertOrder = await new ModelOrder({
                id_branch: dataBranch._id,
                id_user: req.body._caller._id,
                order_product: arrProduct,
                order_status: "Chưa xử lý",
                voucher_code: voucher_code,
                point_number: point_number,
                money_voucher_code: money_voucher_code,
                money_point: money_point,
                order_address: order_address,
                order_phone: order_phone,
                order_note: order_note,
            }).save()

            if (voucher_code && voucher_code.length > 0) {
                await update_status_voucher(voucher_code)
            }
            if (point_number > 0) {
                await ModelUser.findByIdAndUpdate(id_user, {
                    $inc: { user_point: -point_number },
                })
            }
            for (let i = 0; i < arrCart.length; i++) {
                await ModelCart.findByIdAndDelete(arrCart[i])
            }
            await new ModelNotificationUser({
                notification_title: "Thông báo",
                notification_content: `Bạn đã đặt mua hàng thành công. Mã đơn hàng của bạn là ${insertOrder._id}`,
                notification_time: new Date(),
                id_from: insertOrder._id,
                notification_type: "Order",
                notification_topic: order_phone,
                id_user: dataUser._id,
            }).save()

            return res.json(insertOrder)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const cancel = async (app) => {
    app.delete(prefixApi, helper.authenToken, async (req, res) => {
        try {
            const id_order = req.body.id_order
            if (!validator.ObjectId.isValid(id_order)) return res.status(400).send("Id đơn hàng không phù hợp")
            const dataOrder = await ModelOrder.findById(id_order)
            if (!dataOrder) return res.status(400).send("Thất bại! Đơn hàng không còn tồn tại")
            if (dataOrder.order_status != "Chưa xử lý") return res.status(400).send("Đơn hàng đã được xử lý, Không thể hủy")
            const deleOrder = await ModelOrder.findByIdAndDelete(dataOrder._id)
            return res.json(deleOrder)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
