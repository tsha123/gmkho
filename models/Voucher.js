import mongoose from "mongoose"
import * as validator from "./../helper/validator.js"
const SchemaVoucher = new mongoose.Schema({
    voucher_code: {  // mã code , duy nhất
        ...validator.schemaString,
        ...validator.schemaRequired,
        ...validator.schemaUnique,
        ...validator.schemaTextIndex,
    },
    voucher_type: {  // loại giảm giá theo % hay tiền mặt
        ...validator.schemaString,
        ...validator.schemaRequired,
    },
    voucher_description: { // mô tả ...
        ...validator.schemaString,
    },
    voucher_value: { // giá trị có thể là 5% , 10.000 ... tùy thược vào type
        ...validator.schemaNumber
    },

    voucher_limit_total: { // giá trị giới hạn có thể áp dụng trong tổng đơn
        ...validator.schemaNumber
    },
    voucher_limit_user: {  // số lượt dùng , mặc định là 1
        ...validator.schemaNumber
    },
    voucher_is_limit_time: {  // có giới hạn thời gian sử dụng hay ko , nếu có kiểm tra voucher_time_start và voucher_time_end , còn ok thì bỏ qua thời gian
        ...validator.schemaBooleanFalse
    },
    voucher_time_start: { // thời gian áp dụng
        ...validator.schemaDatetime
    },
    voucher_time_end: { // thời gian kết thúc
        ...validator.schemaDatetime
    },
    voucher_is_own: { // có thể sở hữu bởi ai đó ko
        ...validator.schemaBooleanFalse
    },
    id_user: { // id người dùng nếu is_own = true
        ...validator.schemaObjectId
    },
}, { timestamps: true });


validator.schePre(SchemaVoucher);

export const ModelVoucher = mongoose.model("Voucher", SchemaVoucher);

// nếu là tiền : limit sẽ là tổng tiền phải trên
// nếu là % limit sẽ là  tổng tiền phải dưới