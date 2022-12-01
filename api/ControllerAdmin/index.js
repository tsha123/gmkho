const prefixApi = '/api/admin';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelExportForm } from '../../models/ExportForm.js'
import { ModelReceive } from '../../models/Receive.js'
import { ModelPayment } from '../../models/Payment.js'

export const data_chart = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            const revenue = await revenue_product(req, res)
            const receipts = await get_receive(req, res)
            const payment = await get_payment(req, res)

            return res.json({ revenue, receipts, payment, birthday: 15 })
        }
        catch (e) {
            return res.status(500).send("Thất bại! Có lỗi gì xảy ra rồi á :))");
        }
    })

}
const get_payment = async (req, res) => {
    try {
        const id_branch = req.body._caller.id_branch_login
        const date = new Date()
        const month = validator.addZero(date.getMonth() + 1)
        const day = validator.addZero(date.getDate())
        const year = date.getFullYear()

        const data = await ModelPayment.aggregate([
            {
                $match: {
                    ...validator.query_createdAt(year + "-" + month + "-01", year + "-" + month + "-" + day),
                    id_branch: validator.ObjectId(id_branch)
                }
            },
            {
                $project: {
                    payment_money: 1
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$payment_money" }
                }
            }
        ])
        if (data.length == 0) return 0
        else return data[0].total

    }
    catch (e) {
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}

const get_receive = async (req, res) => {
    try {
        const id_branch = req.body._caller.id_branch_login
        const date = new Date()
        const month = validator.addZero(date.getMonth() + 1)
        const day = validator.addZero(date.getDate())
        const year = date.getFullYear()

        const data = await ModelReceive.aggregate([
            {
                $match: {
                    ...validator.query_createdAt(year + "-" + month + "-01", year + "-" + month + "-" + day),
                    id_branch: validator.ObjectId(id_branch)
                }
            },
            {
                $project: {
                    receive_money: 1
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$receive_money" }
                }
            }
        ])
        if (data.length == 0) return 0
        else return data[0].total

    }
    catch (e) {
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}

const revenue_product = async (req, res) => {
    try {
        const id_branch = req.body._caller.id_branch_login
        const data = await ModelExportForm.aggregate([
            {
                $unwind: {
                    path: "$export_form_product"
                }
            },
            {
                $addFields:
                {
                    "monthexport": { $month: { $toDate: "$createdAt" } },
                    "yearexport": { $year: { $toDate: "$createdAt" } }
                }
            },
            {
                $lookup:
                {
                    from: "warehouses",
                    localField: "id_warehouse",
                    foreignField: "_id",
                    as: "Warehouse"
                }
            },
            {
                $unwind:
                {
                    path: "$Warehouse"
                }
            },
            {
                $match:
                {
                    "Warehouse.id_branch": validator.ObjectId(id_branch),
                    export_form_type: validator.TYPE_EXPORT,
                    "yearexport": new Date().getFullYear()
                }
            },

            {
                $project: {
                    total: {
                        $multiply: [{ $subtract: [{ $subtract: ["$export_form_product.product_export_price", { $multiply: [{ $divide: ["$export_form_product.product_export_price", 100] }, 0] }] }, "$export_form_product.product_discount"] }, "$export_form_product.product_quantity"]
                    },
                    monthexport: 1
                }
            },
            {
                $project:
                {
                    Month1: {
                        $cond: { if: { $eq: ["$monthexport", 1] }, then: "$total", else: 0 }
                    },
                    Month2: {
                        $cond: { if: { $eq: ["$monthexport", 2] }, then: "$total", else: 0 }
                    },
                    Month3: {
                        $cond: { if: { $eq: ["$monthexport", 3] }, then: "$total", else: 0 }
                    },
                    Month4: {
                        $cond: { if: { $eq: ["$monthexport", 4] }, then: "$total", else: 0 }
                    },
                    Month5: {
                        $cond: { if: { $eq: ["$monthexport", 5] }, then: "$total", else: 0 }
                    },
                    Month6: {
                        $cond: { if: { $eq: ["$monthexport", 6] }, then: "$total", else: 0 }
                    },
                    Month7: {
                        $cond: { if: { $eq: ["$monthexport", 7] }, then: "$total", else: 0 }
                    },
                    Month8: {
                        $cond: { if: { $eq: ["$monthexport", 8] }, then: "$total", else: 0 }
                    },
                    Month9: {
                        $cond: { if: { $eq: ["$monthexport", 9] }, then: "$total", else: 0 }
                    },
                    Month10: {
                        $cond: { if: { $eq: ["$monthexport", 10] }, then: "$total", else: 0 }
                    },
                    Month11: {
                        $cond: { if: { $eq: ["$monthexport", 11] }, then: "$total", else: 0 }
                    },
                    Month12: {
                        $cond: { if: { $eq: ["$monthexport", 12] }, then: "$total", else: 0 }
                    },

                }
            },
            {
                $group:
                {
                    _id: null,
                    Month1: { $sum: "$Month1" },
                    Month2: { $sum: "$Month2" },
                    Month3: { $sum: "$Month3" },
                    Month4: { $sum: "$Month4" },
                    Month5: { $sum: "$Month5" },
                    Month6: { $sum: "$Month6" },
                    Month7: { $sum: "$Month7" },
                    Month8: { $sum: "$Month8" },
                    Month9: { $sum: "$Month9" },
                    Month10: { $sum: "$Month10" },
                    Month11: { $sum: "$Month11" },
                    Month12: { $sum: "$Month12" },
                }
            }
        ])
        if (data.length == 0) {
            return { Month1: 0, Month2: 0, Month3: 0, Month4: 0, Month5: 0, Month6: 0, Month7: 0, Month8: 0, Month9: 64049100, Month10: 51365000, Month11: 130040000, Month12: 0 }

        }
        return data[0]

    }
    catch (e) {
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}