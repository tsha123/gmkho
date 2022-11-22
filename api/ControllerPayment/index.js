const prefixApi = '/api/payment';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelUser } from '../../models/User.js'
import { ModelPayment } from '../../models/Payment.js'
import { ModelReceive } from '../../models/Receive.js'
import { ModelFundBook } from '../../models/FundBook.js'
import { ModelEmployee } from '../../models/Employee.js'

import { ModelDebt } from '../../models/Debt.js'
import { ModelAccountingEntry } from '../../models/AccountingEntry.js'
import { getAllAccountingEntry } from './../ControllerAccountingEntry/index.js'
import { getFundbookByBranch } from './../ControllerFundBook/index.js'
import { get_branch_ById } from '../ControllerBranch/index.js'

export const management = async(app) => {
    try {
        app.get(prefixApi, helper.authenToken, async(req, res) => {
            if (!await helper.checkPermission("62185023ab5e6548aafac8f5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_branch = req.body._caller.id_branch_login
            var fundbooks = []
            var accountingentries = []

            if (validator.isDefine(req.query.isOther) && req.query.isOther === 'true') {
                fundbooks = await getFundbookByBranch(req.body._caller.id_branch_login)
                accountingentries = await getAllAccountingEntry({ accounting_entry_type: "payment" })
            }
            let query = { id_branch: validator.ObjectId(id_branch) }
            let queryKey = {}
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } }, { createdAt: { $lte: validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay } }]
                }
            }

            if (validator.isDefine(req.query.key)) {
                queryKey = {
                    $or: [{ "user.user_fullname": { $regex: ".*" + req.query.key + ".*", $options: "i" } }, { "user.user_phone": { $regex: ".*" + req.query.key + ".*", $options: "i" } }, { "accounting.accounting_entry_name": { $regex: ".*" + req.query.key + ".*", $options: "i" } }]
                }
            }
            if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
                query = {
                    _id: validator.ObjectId(req.query.key),
                    id_branch: validator.ObjectId(id_branch)
                }
            }
          
            if (validator.isDefine(req.query.from_money) && validator.isDefine(req.query.to_money)) {
                let from_money = validator.tryParseInt(req.query.from_money) < validator.tryParseInt(req.query.to_money) ? validator.tryParseInt(req.query.from_money) : validator.tryParseInt(req.query.to_money)
                let to_money = validator.tryParseInt(req.query.from_money) > validator.tryParseInt(req.query.to_money) ? validator.tryParseInt(req.query.from_money) : validator.tryParseInt(req.query.to_money)
                query = {
                    $and: [{...query }, {
                        $and: [
                            { payment_money: { $gte: from_money } },
                            { payment_money: { $lte: to_money } },
                        ]
                    }],

                }
            }
            const accounting_id = req.query.accounting_id
            if(accounting_id && validator.ObjectId.isValid(accounting_id)){
                query = {
                    ...query,
                    payment_content: validator.ObjectId(accounting_id)
                }
            }
   

            const data = await ModelPayment.aggregate([{
                    $match: query
                },
                {
                    $lookup: {
                        from: "fundbooks",
                        localField: "id_fundbook",
                        foreignField: "_id",
                        as: "fundbook"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $match: queryKey
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ]).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            const count = await ModelPayment.aggregate([{
                    $match: query
                },
                {
                    $lookup: {
                        from: "fundbooks",
                        localField: "id_fundbook",
                        foreignField: "_id",
                        as: "fundbooks"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $count: "count"
                }
            ])
            await Promise.all(data.map(async payment => {
                if (payment.user && payment.user[0]) {
                    payment.user_fullname = payment.user[0].user_fullname
                    payment.user_phone = payment.user[0].user_phone
                    payment.user_address = payment.user[0].user_address
                    delete payment.user
                }

                payment.employee_fullname = ""
                const employee = await ModelEmployee.findById(payment.id_employee)
                if (employee) {
                    payment.employee_fullname = employee.employee_fullname
                }


            }))


            // console.log(query)
            return res.json({ data: data, count: count.length > 0 ? count[0].count : 0, fundbooks: fundbooks, accountingentries: accountingentries })
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}

export const insert = async(app) => {

    app.post(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62185023ab5e6548aafac8f5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_branch = req.body._caller.id_branch_login
            const id_fundbook = req.body.id_fundbook
            const payment_content = req.body.payment_content
            const payment_money = validator.tryParseInt(req.body.payment_money)
            const payment_note = req.body.payment_note
            const id_user = req.body.id_user

            const dataFundbook = await ModelFundBook.findById(id_fundbook)
            if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
            const dataAccounting = await ModelAccountingEntry.findById(payment_content)
            if (!dataAccounting) return res.status(400).send("Thất bại! Không tìm thấy nội dung thu")

            const dataUser = await ModelUser.findById(id_user)
            if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy người dùng")

            const insertpayment = await new ModelPayment({
                id_user: dataUser._id,
                payment_money: payment_money,
                payment_type: "payment",
                id_employee: req.body._caller._id,
                id_branch: id_branch,
                payment_content: dataAccounting._id,
                id_form: null,
                payment_note: payment_note,
                id_fundbook: dataFundbook._id,
            }).save()

            if (dataAccounting.accounting_entry_create_debt) {
                await new ModelDebt({
                    id_user: dataUser._id,
                    debt_type: "payment",
                    id_branch: id_branch,
                    id_employee: req.body._caller._id,
                    debt_money_payment: payment_money,
                    debt_note: payment_note,
                    id_form: insertpayment._id,
                }).save()
            }
            return res.json(insertpayment)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })


}


export const update = async(app) => {

    app.put(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62185023ab5e6548aafac8f5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const id_branch = req.body._caller.id_branch_login
            const id_fundbook = req.body.id_fundbook
            const payment_content = req.body.payment_content
            const payment_money = validator.tryParseInt(req.body.payment_money)
            const payment_note = req.body.payment_note
            const id_payment = req.body.id_payment

            if (!validator.ObjectId.isValid(id_payment)) return res.status(400).send("Phiếu thu không phù hợp")
            const datapayment = await ModelPayment.findById(id_payment)
            if (!datapayment) return res.status(400).send("Thất bại! Không tìm thấy phiếu thu")
            const dataFundbook = await ModelFundBook.findById(id_fundbook)
            if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
            const dataAccounting = await ModelAccountingEntry.findById(payment_content)
            if (!dataAccounting) return res.status(400).send("Thất bại! Không tìm thấy nội dung thu")
            if (datapayment.id_branch.toString() != id_branch.toString()) return res.status(400).send("Thất bại! Bạn không có quyền sửa phiếu thuộc chi nhánh khác")

            // dòng dưới để ktra nếu phiếu xuất phát từ xuất / nhập thì ko đc sửa nội dung
            if (validator.ObjectId.isValid(datapayment.id_form) && (datapayment.payment_content.toString() != payment_content.toString())) return res.status(400).send("Thất bại! Phiếu xuất phát từ xuất hàng , không thể sửa nội dung")
            if (validator.ObjectId.isValid(datapayment.id_form)) { // nếu xuất phát từ phiếu khác => tính công nợ

                const data_debt = await ModelDebt.findOne({ id_form: datapayment.id_form })
                if (!data_debt) return res.status(400).send("Thất bại! Không tìm thấy công nợ của phiếu")

                await ModelDebt.findByIdAndUpdate(data_debt._id, {
                    debt_money_payment: payment_money,
                    debt_note: payment_note
                })

            } else {
                // const data_debt = await ModelDebt.findOne({ id_form: datapayment._id })
                // if()
                //trường hợp phiếu cũ có nội dung tạo công nợ
                //1. Kiêm tra phiếu cũ có nội dung công nợ ko
                var oldDebt = null
                const oldAccounting = await ModelAccountingEntry.findById(datapayment.payment_content)
                if (!oldAccounting) return res.status(400).send("Thất bại! Không tìm thấy nội dung thu cũ")
                if (oldAccounting.accounting_entry_create_debt) { // có tìm tìm lại phiếu công nợ cũ
                    oldDebt = await ModelDebt.findOne({ id_form: datapayment._id })
                    if (!oldDebt) return res.status(400).send("Thất bại! Không tìm thấy phiếu công nợ cũ")
                }
                // nếu phiếu mới không tạo công nợ => xóa công nợ cũ , update phiếu mới là xong
                if (!dataAccounting.accounting_entry_create_debt) {
                    if (oldDebt) await ModelDebt.findByIdAndDelete(oldDebt._id)
                }
                //nếu phiếu mới có tạo công nợ, =>  kiểm tra xem phiếu cũ có tạo công nợ ko . có thì update , không thì tạo mới
                else {
                    if (oldDebt) { // phiếu cũ có tạo công nợ => cập nhập
                        await ModelDebt.findByIdAndUpdate(oldDebt._id, { debt_money_payment: payment_money, debt_note: payment_note })
                    } else { // tạo mới công nợ

                        await new ModelDebt({
                            id_user: datapayment.id_user,
                            debt_type: "payment",
                            id_branch: id_branch,
                            id_employee: req.body._caller._id,
                            debt_money_payment: payment_money,
                            debt_note: payment_note,
                            id_form: datapayment._id,
                        }).save()
                    }
                }
            }
            const updatepayment = await ModelPayment.findByIdAndUpdate(datapayment._id, {
                payment_content: dataAccounting._id,
                payment_money: payment_money,
                payment_note: payment_note,
                id_fundbook: dataFundbook._id
            })
            return res.json(updatepayment)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })

}

export const report_payment_and_receipts = async(app) => {
    app.get(prefixApi + "/report", helper.authenToken, async(req, res) => {
        try {
            const fromdate = req.query.fromdate
            const todate = req.query.todate
            const id_branch = req.body._caller.id_branch_login
            let query = { id_branch: validator.ObjectId(id_branch) }
            if (validator.isDefine(fromdate) && validator.isDefine(todate)) {
                query = {
                    ...query,
                    $and: [{ createdAt: { $gte: new Date(fromdate + " 00:00:00") } }, { createdAt: { $lte: new Date(todate + " 23:59:59") } }]
                }
            }

            const dataPayment = await ModelPayment.aggregate([{
                    $match: query
                },
                {
                    $group: {
                        _id: "$payment_content",
                        payment_money: { $sum: "$payment_money" }
                    }
                }
            ])

            const dataReceive = await ModelReceive.aggregate([{
                    $match: query
                },
                {
                    $group: {
                        _id: "$receive_content",
                        receive_money: { $sum: "$receive_money" }
                    }
                }
            ])
            const dataAccounting = await ModelAccountingEntry.find()
            return res.json({ dataPayment: dataPayment, dataReceive: dataReceive, dataAccounting: dataAccounting })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const delete_payment = async(app) => {
    app.delete(prefixApi, helper.authenToken, async(req, res) => {
        try {
            const id_payment = req.body.id_payment
            if (!validator.isDefine(id_payment) || !validator.ObjectId.isValid(id_payment)) return res.status(400).send(`Thất bại! Không tìm thấy phiếu chi`)

            const data_payment = await ModelPayment.findById(id_payment)
            if (!data_payment) return res.status(400).send(`Thất bại! Không tìm thấy phiếu chi`)
            if (data_payment.id_form) return res.status(400).send(`Thất bại! Không thể xóa phiếu chi phát sinh từ nghiệp vụ nhập hàng`)
            if(data_payment.payment_type == "tranfer") return res.status(400).send(`Hãy xóa phiếu này từ nghiệp vụ chuyển quỹ`)

            const data_debt = await ModelDebt.findOne({ $and: [{ debt_type: "payment" }, { id_form: data_payment._id }] })
            if (data_debt) {
                await ModelDebt.findByIdAndDelete(data_debt._id)
            }
            await ModelPayment.findByIdAndDelete(id_payment)
            return res.json("Success")

        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const get_data_print = async(app) => {
    app.get(prefixApi + "/print", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62185023ab5e6548aafac8f5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_payment = req.query.id_payment
            if (!id_payment || !validator.ObjectId.isValid(id_payment)) return res.status(400).send("Thất bại! Không tìm thấy phiếu thu")

            const dataPayment = await ModelPayment.findById(id_payment)
            if (!dataPayment) return res.status(400).send("Thất bại! Không tìm thấy phiếu thu")
            const id_branch = req.body._caller.id_branch_login
            const dataBranch = await get_branch_ById(id_branch)

            dataPayment.user_address = ""
            dataPayment.user_fullname = ""
            dataPayment.user_phone = ""
            dataPayment.employee_fullname = ""

            dataPayment.fundbook_name = ""
            dataPayment.accounting_entry_name = ""

            if (validator.ObjectId.isValid(dataPayment.id_user)) {
                const dataUser = await ModelUser.findById(dataPayment.id_user)
                if (dataUser) {
                    dataPayment.user_fullname = dataUser.user_fullname
                    dataPayment.user_phone = dataUser.user_phone
                    dataPayment.user_address = dataUser.user_address
                }
            }
            if (validator.ObjectId.isValid(dataPayment.id_fundbook)) {
                const dataFund = await ModelFundBook.findById(dataPayment.id_fundbook)
                if (dataFund) {
                    dataPayment.fundbook_name = dataFund.fundbook_name
                }

            }
            if (validator.ObjectId.isValid(dataPayment.receive_content)) {
                const dataAccounting = await ModelAccountingEntry.findById(dataPayment.receive_content)
                if (dataAccounting) {
                    dataPayment.accounting_entry_name = dataAccounting.accounting_entry_name
                }

            }
            return res.json({ dataBranch: dataBranch, dataPayment: dataPayment })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
