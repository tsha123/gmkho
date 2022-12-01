const prefixApi = "/api/comment"
import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { ModelUser } from "../../models/User.js"
import { ModelComment } from "../../models/Comment.js"
import { ModelSubCategory } from "../../models/SubCategory.js"

export const insert = async (app) => {
    app.post(prefixApi, async (req, res) => {
        try {
            const id_comment = req.body.id_comment
            const comment_content = req.body.comment_content
            if (!validator.isDefine(comment_content)) return res.status(400).send(`Bạn chưa điền nội cung đánh giá`)
            const comment_star = get_number_star_from_content(req.body.comment_star)

            const id_user = req.body.id_user
            const id_subcategory = req.body.id_subcategory
            if ((!comment_content || comment_content.length == 0) && !comment_star) return res.status(400).send(`Nội dung comment không được để trống`)
            var data_user = {
                user_fullname: req.body.user_fullname,
                user_phone: req.body.user_phone,
            }
            if (validator.ObjectId.isValid(id_user)) {
                data_user = await ModelUser.findById(id_user)
                if (!data_user) {
                    data_user = {
                        user_fullname: req.body.user_fullname,
                        user_phone: req.body.user_phone,
                    }
                }
            }
            const values = {
                user_fullname: data_user.user_fullname,
                user_phone: data_user.user_phone,
                comment_content: comment_content,
                comment_star: comment_star,
                id_subcategory: id_subcategory,
            }
            if (validator.ObjectId.isValid(id_comment)) {
                const reply = await ModelComment.findByIdAndUpdate(id_comment, {
                    $push: {
                        comment_reps: values,
                    },
                })
                return res.json(reply)
            } else {
                const data_sub = await ModelSubCategory.findById(id_subcategory)
                if (!data_sub) return res.status(400).send("Có lỗi xảy ra")

                if (values.comment_star == 1) data_sub.subcategory_number_star.one_star += 1
                if (values.comment_star == 2) data_sub.subcategory_number_star.two_star += 1
                if (values.comment_star == 3) data_sub.subcategory_number_star.three_star += 1
                if (values.comment_star == 4) data_sub.subcategory_number_star.four_star += 1
                if (values.comment_star == 5) data_sub.subcategory_number_star.five_star += 1

                const new_comment = await new ModelComment(values).save()
                await ModelSubCategory.findByIdAndUpdate(id_subcategory, {
                    $inc: {
                        subcategory_comment_quantity: 1,
                    },
                    $set: {
                        subcategory_number_star: data_sub.subcategory_number_star,
                    },
                })
                return res.json(new_comment)
            }
        } catch (e) {
            console.error(e)
            return res.status(500).send("Có lỗi xảy ra")
        }
    })
}

export const get_data = async (app) => {
    app.get(prefixApi, async (req, res) => {
        try {
            const id_subcategory = req.query.id_subcategory

            if (!validator.ObjectId.isValid(id_subcategory)) return res.json([])
            let query = { id_subcategory: validator.ObjectId(id_subcategory) }
            const data = await ModelComment.find(query).sort({ _id: -1 }).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            return res.json(data)
        } catch (e) {
            console.error(e)
            return res.status(500).send("Có lỗi xảy ra")
        }
    })
}

const get_number_star_from_content = (content) => {
    var num = 1
    if (content == "Rất tệ" || validator.tryParseInt(content) == 1) num = 1
    if (content == "Tệ" || validator.tryParseInt(content) == 2) num = 2
    if (content == "Bình thường" || validator.tryParseInt(content) == 3) num = 3
    if (content == "Tốt" || validator.tryParseInt(content) == 4) num = 4
    if (content == "Rất hài lòng" || validator.tryParseInt(content) == 5) num = 5
    return num
}
