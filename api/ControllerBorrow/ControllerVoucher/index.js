const prefixApi = '/api/voucher';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelVoucher} from '../../models/Voucher.js'

export const management = async (app)=>{
    try
    {
        app.get(prefixApi,  helper.authenToken, async (req, res)=>{
            if(!await helper.checkPermission("620ca4f7f33f39ea70807397", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            let query = {}
            if (req.query.key) {
                query = {
                    $or:[{voucher_code:{$regex:".*"+req.query.key+".*",$options:"$i"}},{voucher_description:{$regex:".*"+req.query.key+".*",$options:"$i"}}]
                }
            }
            if (req.query.fromdate && req.query.todate) {
                query = {
                    ...query,
                    $and: [{createdAt:{$gte:new Date(req.query.fromdate +" 00:00:00")}},{createdAt:{$lte:new Date(req.query.todate +" 23:59:59")}}] 
                }
            }
            const data = await ModelVoucher.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            const count = await ModelVoucher.countDocuments(query)
            return res.json({data:data, count:count})
        })
    }
    catch(e)
    {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}

export const insert = async (app)=>{
  
    app.post(prefixApi,  helper.authenToken, async (req, res)=>{
        if(!await helper.checkPermission("620ca4f7f33f39ea70807397", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        
        try
        {
        
            const voucher_type = req.body.voucher_type
            const voucher_value = validator.tryParseInt(req.body.voucher_value)
            const voucher_limit_total = validator.tryParseInt(req.body.voucher_limit_total)
            const voucher_limit_user = validator.tryParseInt(req.body.voucher_limit_user)
            const voucher_time_end = new Date(req.body.voucher_time_end)
            const voucher_time_start = new Date(req.body.voucher_time_start)
            const voucher_is_limit_time = req.body.voucher_is_limit_time === 'true'
            const voucher_is_own = req.body.voucher_is_own ==='true'
            const voucher_quantity = validator.tryParseInt(req.body.voucher_quantity)
            const voucher_description = req.body.voucher_description

            if (voucher_quantity < 1) return res.status(400).send("Số lượng mã phải lớn hơn không")
            if (voucher_limit_user < 1) return res.status(400).send("Số lần sử dụng mã phải lớn hơn không")
            if (voucher_is_limit_time && (voucher_time_start == 'Invalid Date' || voucher_time_end == 'Invalid Date')) {
                return res.status(400).send("Giới hạn thời gian không phù hợp")
            }
            
            const arrVoucher = []
            for (let i = 0; i < voucher_quantity; i++){
                var objectModel = {
                    voucher_code:generateString(8),
                    voucher_type: voucher_type.trim(),
                    voucher_value: voucher_value,
                    voucher_limit_total: voucher_limit_total,
                    voucher_limit_user: voucher_limit_user,
                    voucher_is_limit_time: voucher_is_limit_time,
                    voucher_is_own: voucher_is_own,
                    voucher_description:voucher_description
                }
                if (voucher_is_limit_time) {
                    objectModel = {
                        ...objectModel,
                        voucher_time_end:voucher_time_end,
                        voucher_time_start: voucher_time_start,
                    }
                }
                arrVoucher.push(
                    new ModelVoucher(objectModel)
                )
            }
            try {
                for (let i = 0; i < arrVoucher.length; i++){
                    const dataCheck = await ModelVoucher.findOne({ voucher_code: arrVoucher[i].voucher_code })
                    if (dataCheck) {
                        arrVoucher[i].voucher_code = generateString(8)
                        i--
                    }
                }
                const insertDatas = await ModelVoucher.insertMany(arrVoucher)
                return res.json(insertDatas)
                
            }
            catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
            
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
    
}



const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvxyz';

function generateString(length) {
    let result = 'GM';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const checkValueCode = async (app)=>{
  
    app.get(prefixApi + "/value", async (req, res) => {
        validator.eshtml(req)

        const voucher_code = req.query.voucher_code
        const totalMoney = validator.tryParseInt(req.query.totalMoney)

        const money_code_discount = await checkCodeDiscount(voucher_code, totalMoney, res)
        if(!isNaN(money_code_discount))
            return res.json(money_code_discount)
    })
}
export const checkCodeDiscount = async (voucher_code, money, res) => {
    try
    {

        money = validator.tryParseInt(money)
        if(!voucher_code || voucher_code.length == 0) return res.status(400).send("Thất bại! Mã giảm giá không phù hợ")
        const dataVoucher = await ModelVoucher.findOne({ voucher_code: voucher_code.trim() })
        if (!dataVoucher) return res.status(400).send("Thất bại! Không tìm thấy mã giảm giá")
        if(dataVoucher.voucher_limit_user < 1) return res.status(400).send("Thất bại! Mã giảm giá đã hết lượt sử dụng")
        if (dataVoucher.voucher_is_limit_time && (
            validator.dateTimeZone().currentTime < new Date(dataVoucher.voucher_time_start) ||
            validator.dateTimeZone().currentTime > new Date(dataVoucher.voucher_time_end)
        )) {
            return res.status(400).send("Thất bại! Mã giảm giá đã hết hạn hoặc chưa đến hạn sử dụng")   
        }
        // if (dataVoucher.voucher_type == "percent" && money > dataVoucher.voucher_limit_total ) {
        //     return res.status(400).send(`Thất bại! Mã giảm giá chỉ áp dụng cho đơn hàng dưới ${dataVoucher.voucher_limit_total}`)
        // }
        if (dataVoucher.voucher_type == "money" && money < dataVoucher.voucher_limit_total ) {
            return res.status(400).send(`Thất bại! Mã giảm giá chỉ áp dụng cho đơn hàng trên ${dataVoucher.voucher_limit_total}`)
        } 
        let total = 0;
        if (dataVoucher.voucher_type == "percent") {
            if(money > dataVoucher.voucher_limit_total){
                total = dataVoucher.voucher_limit_total/100*dataVoucher.voucher_value
            }
            else total = money/100*dataVoucher.voucher_value
        }
        else {
            total = dataVoucher.voucher_value
        }
        return total
    }
    catch (e) {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
   
}

export const checkCodeDiscountReturnError = async (voucher_code, money) => {
    try
    {
        money = validator.tryParseInt(money)
        if(!voucher_code || voucher_code.length == 0) return ("Thất bại! Mã giảm giá không phù hợ")
        const dataVoucher = await ModelVoucher.findOne({ voucher_code: voucher_code.trim() })
        if (!dataVoucher) return ("Thất bại! Không tìm thấy mã giảm giá")
        if(dataVoucher.voucher_limit_user < 1) return ("Thất bại! Mã giảm giá đã hết lượt sử dụng")
        if (dataVoucher.voucher_is_limit_time && (
            validator.dateTimeZone().currentTime < new Date(dataVoucher.voucher_time_start) ||
            validator.dateTimeZone().currentTime > new Date(dataVoucher.voucher_time_end)
        )) {
            return ("Thất bại! Mã giảm giá đã hết hạn hoặc chưa đến hạn sử dụng")   
        }
        // if (dataVoucher.voucher_type == "percent" && money > dataVoucher.voucher_limit_total ) {
        //     return (`Thất bại! Mã giảm giá chỉ áp dụng cho đơn hàng dưới ${dataVoucher.voucher_limit_total}`)
        // }
        if (dataVoucher.voucher_type == "money" && money < dataVoucher.voucher_limit_total ) {
            return (`Thất bại! Mã giảm giá chỉ áp dụng cho đơn hàng trên ${dataVoucher.voucher_limit_total}`)
        } 
        let total = 0;
        if (dataVoucher.voucher_type == "percent") {
            if(money > dataVoucher.voucher_limit_total){
                total = dataVoucher.voucher_limit_total/100*dataVoucher.voucher_value
            }
            else total = money/100*dataVoucher.voucher_value
        }
        else {
            total = dataVoucher.voucher_value
        }
        return total
    }
    catch (e) {
        console.log(e)
        return ("Thất bại! Có lỗi xảy ra")
    }
   
}
export const update_status_voucher = async (voucher_code) => {
    await ModelVoucher.findOneAndUpdate({ voucher_code: voucher_code }, {
        $inc: {
            voucher_limit_user:-1
    }})
}