import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const Schema_Comment = {
    comment_like: {
        ...validator.schemaNumber,
    },
    user_fullname: {
        ...validator.schemaString,
    },
    id_user: {
        ...validator.schemaObjectId,
    },
    content: {
        ...validator.schemaString,
        ...validator.schemaRequired,
    },
    createdAt: { ...validator.schemaDatetime },
}
const Schema_Comment_Reply = {
    comment_like: {
        ...validator.schemaNumber,
    },
    user_fullname: {
        ...validator.schemaString,
    },
    id_user: {
        ...validator.schemaObjectId,
    },
    comment_content: {
        ...validator.schemaString,
        ...validator.schemaRequired,
    },
    createdAt: { ...validator.schemaDatetime },
}
const Schema_Community_Post = new mongoose.Schema(
    {
        id_user: {
            ...validator.schemaObjectId,
            ...validator.schemaRequired,
        },
        post_emotion: {
            ...validator.schemaString,
        },
        //Đối tượng bài viết
        //Công khai - Bạn bè - Chỉ mình tôi
        post_target: {
            ...validator.schemaString,
        },
        post_content: {
            ...validator.schemaString,
            ...validator.schemaRequired,
        },
        post_image: {
            ...validator.schemaArray,
        },
        //Gắn thẻ user
        post_tags: {
            ...validator.schemaArray,
        },
        //Trạng thái xét duyệt - Hiện_true - Ẩn_false
        post_status_approval: {
            ...validator.schemaBoolean,
        },
        // id shared post
        id_shared_post: {
            ...validator.schemaObjectId,
        },
    },
    { timestamps: true }
)

validator.schePre(Schema_Community_Post)

export const Model_Community_Post = mongoose.model("Community_Post", Schema_Community_Post)
