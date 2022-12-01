import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { Model_Policy } from "../../models/Policy.js"
const prefixApi = "/api/policy-admin"
const DEFAULT_LIMIT = validator.DEFAULT_LIMIT

export const admin_website = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
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
                _id: -1,
            }
            if (validator.isNotEmpty(req.query.key)) {
                query = {
                    ...query,
                    Name: { $regex: ".*" + req.query.key + ".*", $options: "$i" },
                }
            }
            let data = await Model_Policy.find(query)
                .sort(sort_conditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
            let count = await Model_Policy.find(query).countDocuments()
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
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try {
            // if (!(await validator.checkPermission("6156749c3aa81fc6768dd6f3", req.body._caller.result[0].ID_GroupUser))) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này")
            const _id = req.body._id
            let query = {}
            if (validator.isNotEmpty(req.body.Name)) {
                query = { ...query, Name: req.body.Name }
            }
            if (validator.isNotEmpty(req.body.Content)) {
                query = { ...query, Content: req.body.Content }
            }
            if (validator.isNotEmpty(req.body.Note)) {
                query = { ...query, Note: req.body.Note }
            }
            if (validator.isNotEmpty(req.body.Active_Website_GamingMarket)) {
                query = { ...query, Active_Website_GamingMarket: validator.tryParseBoolean(req.body.Active_Website_GamingMarket) }
            }
            const data = await Model_Policy.findByIdAndUpdate(_id, query, { new: true })
            res.status(200).json(data)
        } catch (e) {
            validator.throwError(e)
            res.sendStatus(500)
        }
    })
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            // if (!(await validator.checkPermission("6156749c3aa81fc6768dd6f3", req.body._caller.result[0].ID_GroupUser))) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này")
            //
            const Name = req.body.Name
            const Content = req.body.Content
            const Note = req.body.Note
            const Active_Website_GamingMarket = validator.tryParseBoolean(req.body.Active_Website_GamingMarket)
            let value = await new Model_Policy({
                Name: Name,
                Content: Content,
                Note: Note,
                Active_Website_GamingMarket: Active_Website_GamingMarket,
            }).save()
            res.status(200).json(value)
        } catch (e) {
            validator.throwError(e)
            res.sendStatus(500)
        }
    })
    app.delete(prefixApi, helper.authenToken, async (req, res) => {
        try {
            // if (!(await validator.checkPermission("6156749c3aa81fc6768dd6f3", req.body._caller.result[0].ID_GroupUser))) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này")
            const _id = req.body._id
            const data_delete = await Model_Policy.deleteOne({ _id: validator.ObjectId(_id) })

            return res.status(200).json(data_delete)
        } catch (e) {
            validator.throwError(e)
            res.sendStatus(500)
        }
    })
}
