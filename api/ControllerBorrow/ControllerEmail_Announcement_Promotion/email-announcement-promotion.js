//server
import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { Model_Email_Announcement_Promotion } from "../../models/Email_Announcement_Promotion.js"
//
const prefixApi = "/api/email-announcement-promotion"
const prefixApi_download = "/api/email-announcement-promotion/download"
const DEFAULT_LIMIT = validator.DEFAULT_LIMIT
//

export const management = async (app) => {
    app.get(prefixApi_download, helper.authenToken, async (req, res) => {
        try {
            let query = {}

            let sort_conditions = {
                updatedAt: -1,
                _id: -1,
            }
            let data = await Model_Email_Announcement_Promotion.find(query).sort(sort_conditions).lean()
            const object = {
                data: data,
            }
            return res.json(object)
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            // if (!(await helper.checkPermission("6272511fda540000f1000fc2", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            let limit = DEFAULT_LIMIT
            let page = 1
            if (validator.isNotEmpty(req.query.page)) {
                page = Math.abs(validator.tryParseInt(req.query.page)) || 1
            }
            if (validator.isNotEmpty(req.query.limit)) {
                limit = Math.abs(validator.tryParseInt(req.query.limit)) || DEFAULT_LIMIT
                if (limit > validator.limit_query || limit == 0) {
                    limit = DEFAULT_LIMIT
                }
            }
            let query = {}

            let sort_conditions = {
                updatedAt: -1,
                _id: -1,
            }
            if (validator.isNotEmpty(req.query.key)) {
                query = {
                    ...query,
                    email: { $regex: ".*" + req.query.key + ".*", $options: "$i" },
                }
            }
            let data = await Model_Email_Announcement_Promotion.find(query)
                .sort(sort_conditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
            let count = await Model_Email_Announcement_Promotion.find(query).countDocuments()
            const object = {
                data: data,
                total: count,
                limit: limit,
                page: page,
            }
            return res.json(object)
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    app.put(prefixApi, async (req, res) => {
        try {
            const email_update = req.body.email.trim()
            const dataUpdate = await Model_Email_Announcement_Promotion.findOneAndUpdate(
                { email: email_update },
                {
                    email: email_update,
                    $inc: { quantity_register: 1 },
                    // quantity_register: 1,
                }
            )
            return res.json(dataUpdate)
            // return res.json(`??? chưa làm`)
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    app.post(prefixApi, async (req, res) => {
        try {
            const email = req.body.email.trim()
            const data_email = await Model_Email_Announcement_Promotion.findOne({ email: email })
            if (validator.isNotEmpty(data_email)) {
                const dataUpdate = await Model_Email_Announcement_Promotion.findOneAndUpdate(
                    { email: email },
                    {
                        email: email,
                        $inc: { quantity_register: 1 },
                        // quantity_register: 1,
                    }
                )
                return res.json(dataUpdate)
            } else {
                const data_insert = await new Model_Email_Announcement_Promotion({
                    email: email,
                    quantity_register: 1,
                }).save()
                return res.json(data_insert)
            }
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
