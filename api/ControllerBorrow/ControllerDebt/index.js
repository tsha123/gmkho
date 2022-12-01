const prefixApi = '/api/debt';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelUser} from '../../models/User.js'
import {ModelDebt} from '../../models/Debt.js'
import {ModelReceive} from '../../models/Receive.js'
import {ModelPayment} from '../../models/Payment.js'
import {ModelImportForm} from '../../models/ImportForm.js'
import {ModelExportForm} from '../../models/ExportForm.js'
import {ModelAccountingEntry} from '../../models/AccountingEntry.js'


export const management = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("6222d942f0c6a4c0c8a47995", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        let query_key = {}
        if (validator.isDefine(req.query.key)) {
            query_key = {
                ...query_key,
                $or:[
                    {"user.user_fullname":{$regex:".*"+req.query.key+".*", $options:"i"}},
                    {"user.user_phone":{$regex:".*"+req.query.key+".*"}}
                ]
            }
        }
        let query_total = {}
        if (validator.isDefine(req.query.debt) && req.query.debt.length > 0 ) {
            query_total = { "total_debt": { [`$${req.query.debt}`]: 0 }
            }
        }

        const data = await ModelDebt.aggregate([
            {
                $match: {
                    id_branch:validator.ObjectId(req.body._caller.id_branch_login)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as:"user"
                }
            },
            {
                $unwind: {
                    path:"$user"
                }
            },
            {
                $match: query_key
            },
            {
                $project: {
                    id_user:1,
                    id_branch:1,
                    debt_money_payment:1,
                    debt_money_receive:1,
                    debt_money_import:1,
                    debt_money_export: 1,
                    user_fullname:"$user.user_fullname",
                    user_phone:"$user.user_phone",
                }   
            },
            {
                $group: {
                    _id: "$id_user",
                    id_branch: { $first: "$id_branch" },
                    user_fullname: { $first: "$user_fullname" },
                    user_phone: { $first: "$user_phone" },
                    total_debt: {
                        $sum:{$subtract:[{$subtract:["$debt_money_export","$debt_money_receive"]},{$subtract:["$debt_money_import","$debt_money_payment"]}]},
                    }
                }
            },
            {
                $match: query_total
            },
            {
                $project: {
                    _id: 1,
                    id_branch: 1,
                    total_debt: 1,
                    user_fullname:1,
                    user_phone:1
                }
            }
        ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))

        const count = await ModelDebt.aggregate([
            {
                $match: {
                    id_branch:validator.ObjectId(req.body._caller.id_branch_login)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "id_user",
                    foreignField: "_id",
                    as:"user"
                }
            },
            {
                $unwind: {
                    path:"$user"
                }
            },
            {
                $match: query_key
            },
            {
                $project: {
                    id_user:1,
                    id_branch:1,
                    debt_money_payment:1,
                    debt_money_receive:1,
                    debt_money_import:1,
                    debt_money_export: 1,
                    user_fullname:"$user.user_fullname",
                    user_phone:"$user.user_phone",
                }   
            },
            {
                $group: {
                    _id: "$id_user",
                    total_debt: {
                        $sum:{$subtract:[{$subtract:["$debt_money_export","$debt_money_receive"]},{$subtract:["$debt_money_import","$debt_money_payment"]}]},
                    }
                }
            },
            {
                $match: query_total
            },
            {
                $count:"count"
            }
        ])
        
        return res.json({data:data, count:count.length > 0?count[0].count:0})
    })
}


export const insert = async (app) => {
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("6222d942f0c6a4c0c8a47995", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        const debt_type = req.body.debt_type
        const debt_money = validator.tryParseInt(req.body.debt_money)
        const debt_note = req.body.debt_note
        const id_user = req.body.id_user

        if(!validator.ObjectId.isValid(id_user)) return res.status(400).send("Thất bại! Không tìm thấy người dùng")
        const dataUser = await ModelUser.findById(id_user) 
        if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy khách hàng")

        var objectDebt = {
            id_user: dataUser._id,
            debt_type: "period", // tồn đầu kì
            id_branch: req.body._caller.id_branch_login,
            id_employee: req.body._caller._id,
            debt_note: debt_note,
            debt_time: 0,
        }
        if (debt_type == "import") {
            objectDebt = {
                ...objectDebt,
                debt_money_import:debt_money
            }
        }
        else if (debt_type == "export") {
            objectDebt = {
                ...objectDebt,
                debt_money_export: debt_money
            }
        }
        const insertDebt = await new ModelDebt(objectDebt).save()
        return res.json(insertDebt)
        
        
    })
}


export const getDetailReport = async (app) => {
    app.get(prefixApi +"/report", helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("6222d942f0c6a4c0c8a47995", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        let query = {id_branch:  validator.ObjectId(req.body._caller.id_branch_login)}
        let queryPeriod = { id_branch: validator.ObjectId(req.body._caller.id_branch_login) }
       
        if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
            query = {
                ...query,
                $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } },{ createdAt: { $lte:validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay  } }]
            }
            queryPeriod = {
                ...queryPeriod,
                createdAt: { $lt: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay }
            }
            
        }
        if (validator.isDefine(req.query.id_user)) {
            query = {
                ...query,
                id_user: validator.ObjectId(req.query.id_user)
            }

            queryPeriod = {
                ...queryPeriod,
                id_user:validator.ObjectId(req.query.id_user)
            }
        }
        
        const currentDebt = await ModelDebt.find(query).sort({createdAt:1})
        const periodDebt = await ModelDebt.aggregate([
            {
                $match: queryPeriod
            },
            {
                $project: {
                    id_user: 1,
                    debt_money_payment: 1,
                    debt_money_receive: 1,
                    debt_money_import: 1,
                    debt_money_export:1
                }
            },
            {
                $group: {
                    _id: "$id_user",
                    total_period: {
                        // xuất - thu -( nhập - chị)
                        $sum:{$subtract:[{$subtract:["$debt_money_export","$debt_money_receive"]},{$subtract:["$debt_money_import","$debt_money_payment"]}]},
                    }
                }
            },
            {
                $sort:{createdAt:1}
            }
        ])
        for (let i = 0; i < currentDebt.length; i++){
            if (currentDebt[i].debt_type == "import") currentDebt[i].content_debt = await ModelImportForm.findById(currentDebt[i].id_form)
            if (currentDebt[i].debt_type == "export") currentDebt[i].content_debt = await ModelExportForm.findById(currentDebt[i].id_form)
            if (currentDebt[i].debt_type == "receive") {
                const receive = await ModelReceive.findById(currentDebt[i].id_form)
                if (receive) {
                    const account = await ModelAccountingEntry.findById(receive.receive_content)
                    if(account) currentDebt[i].content_debt = account.accounting_entry_name
                }
            }
            if (currentDebt[i].debt_type == "payment") {
                const payment = await ModelPayment.findById(currentDebt[i].id_form)
                if (payment) {
                    const account = await ModelAccountingEntry.findById(payment.payment_content)
                    if(account) currentDebt[i].content_debt = account.accounting_entry_name
                }
            }    
            if (currentDebt[i].debt_type == "period") currentDebt[i].content_debt = "Nhập tồn đầu kỳ"
        }
        return res.json({currentDebt: currentDebt, periodDebt:periodDebt})
    })
}