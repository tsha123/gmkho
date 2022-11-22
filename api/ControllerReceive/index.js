const prefixApi = '/api/receive';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelUser } from '../../models/User.js'
import { ModelReceive } from '../../models/Receive.js'
import { ModelFundBook } from '../../models/FundBook.js'
import { ModelEmployee } from '../../models/Employee.js'
import { ModelExportForm } from '../../models/ExportForm.js'
import { ModelImportForm } from '../../models/ImportForm.js'
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
                accountingentries = await getAllAccountingEntry({ accounting_entry_type: "receive" })
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
                    $or: [
                        { _id: validator.ObjectId(req.query.key) },
                        { id_form: validator.ObjectId(req.query.key) }
                    ],
                    id_branch: validator.ObjectId(id_branch)
                }
                queryKey = {}
            }
            if (validator.isDefine(req.query.from_money) && validator.isDefine(req.query.to_money)) {
                let from_money = validator.tryParseInt(req.query.from_money) < validator.tryParseInt(req.query.to_money) ? validator.tryParseInt(req.query.from_money) : validator.tryParseInt(req.query.to_money)
                let to_money = validator.tryParseInt(req.query.from_money) > validator.tryParseInt(req.query.to_money) ? validator.tryParseInt(req.query.from_money) : validator.tryParseInt(req.query.to_money)
                query = {
                    $and: [{...query }, {
                        $and: [
                            { receive_money: { $gte: from_money } },
                            { receive_money: { $lte: to_money } },
                        ]
                    }],

                }
            }
            const accounting_id = req.query.accounting_id
            if(accounting_id && validator.ObjectId.isValid(accounting_id)){
                query = {
                    ...query,
                    receive_content:validator.ObjectId(accounting_id)
                }
            }
            else{
                query = {
                    ...query,
                    receive_content:{ $ne: validator.ObjectId("62440f8c1e19bd8f338010a6") }
                }
            }


            const data = await ModelReceive.aggregate([
                {
                    $match: {
                        ...query,
                     
                    }

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
            const count = await ModelReceive.aggregate([{
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
            await Promise.all(data.map(async receive => {
                if (receive.user && receive.user[0]) {
                    receive.user_fullname = receive.user[0].user_fullname
                    receive.user_phone = receive.user[0].user_phone
                    receive.user_address = receive.user[0].user_address
                    delete receive.user
                }

                receive.employee_fullname = ""
                const employee = await ModelEmployee.findById(receive.id_employee)
                if (employee) {
                    receive.employee_fullname = employee.employee_fullname
                }


            }))
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
            const receive_content = req.body.receive_content
            const receive_money = validator.tryParseInt(req.body.receive_money)
            const receive_note = req.body.receive_note
            const id_user = req.body.id_user

            const dataFundbook = await ModelFundBook.findById(id_fundbook)
            if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
            const dataAccounting = await ModelAccountingEntry.findById(receive_content)
            if (!dataAccounting) return res.status(400).send("Thất bại! Không tìm thấy nội dung thu")

            const dataUser = await ModelUser.findById(id_user)
            if (!dataUser) return res.status(400).send("Thất bại! Không tìm thấy người dùng")

            const insertReceive = await new ModelReceive({
                id_user: dataUser._id,
                receive_money: receive_money,
                receive_type: "receive",
                id_employee: req.body._caller._id,
                id_branch: id_branch,
                receive_content: dataAccounting._id,
                id_form: null,
                receive_note: receive_note,
                id_fundbook: dataFundbook._id,
            }).save()

            if (dataAccounting.accounting_entry_create_debt) {
                await new ModelDebt({
                    id_user: dataUser._id,
                    debt_type: "receive",
                    id_branch: id_branch,
                    id_employee: req.body._caller._id,
                    debt_money_receive: receive_money,
                    debt_note: receive_note,
                    id_form: insertReceive._id,
                }).save()
            }
            return res.json(insertReceive)
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
            const receive_content = req.body.receive_content
            const receive_money = validator.tryParseInt(req.body.receive_money)
            const receive_note = req.body.receive_note
            const id_receive = req.body.id_receive

            if (!validator.ObjectId.isValid(id_receive)) return res.status(400).send("Phiếu thu không phù hợp")
            const dataReceive = await ModelReceive.findById(id_receive)
            if (!dataReceive) return res.status(400).send("Thất bại! Không tìm thấy phiếu thu")
            const dataFundbook = await ModelFundBook.findById(id_fundbook)
            if (!dataFundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
            const dataAccounting = await ModelAccountingEntry.findById(receive_content)
            if (!dataAccounting) return res.status(400).send("Thất bại! Không tìm thấy nội dung thu")
            if (dataReceive.id_branch.toString() != id_branch.toString()) return res.status(400).send("Thất bại! Bạn không có quyền sửa phiếu thuộc chi nhánh khác")

            // dòng dưới để ktra nếu phiếu xuất phát từ xuất / nhập thì ko đc sửa nội dung
            if (validator.ObjectId.isValid(dataReceive.id_form) && (dataReceive.receive_content.toString() != receive_content.toString())) return res.status(400).send("Thất bại! Phiếu xuất phát từ xuất hàng , không thể sửa nội dung")
            if (validator.ObjectId.isValid(dataReceive.id_form)) { // nếu xuất phát từ phiếu khác => tính công nợ

                const data_debt = await ModelDebt.findOne({ id_form: dataReceive.id_form })
                if (!data_debt) return res.status(400).send("Thất bại! Không tìm thấy công nợ của phiếu")

                await ModelDebt.findByIdAndUpdate(data_debt._id, {
                    debt_money_receive: receive_money,
                    debt_note: receive_note
                })

            } else {
                // const data_debt = await ModelDebt.findOne({ id_form: dataReceive._id })
                // if()
                //trường hợp phiếu cũ có nội dung tạo công nợ
                //1. Kiêm tra phiếu cũ có nội dung công nợ ko
                var oldDebt = null
                const oldAccounting = await ModelAccountingEntry.findById(dataReceive.receive_content)
                if (!oldAccounting) return res.status(400).send("Thất bại! Không tìm thấy nội dung thu cũ")
                if (oldAccounting.accounting_entry_create_debt) { // có tìm tìm lại phiếu công nợ cũ
                    oldDebt = await ModelDebt.findOne({ id_form: dataReceive._id })
                    if (!oldDebt) return res.status(400).send("Thất bại! Không tìm thấy phiếu công nợ cũ")
                }
                // nếu phiếu mới không tạo công nợ => xóa công nợ cũ , update phiếu mới là xong
                if (!dataAccounting.accounting_entry_create_debt) {
                    if (oldDebt) await ModelDebt.findByIdAndDelete(oldDebt._id)
                }
                //nếu phiếu mới có tạo công nợ, =>  kiểm tra xem phiếu cũ có tạo công nợ ko . có thì update , không thì tạo mới
                else {
                    if (oldDebt) { // phiếu cũ có tạo công nợ => cập nhập
                        await ModelDebt.findByIdAndUpdate(oldDebt._id, { debt_money_receive: receive_money, debt_note: receive_note })
                    } else { // tạo mới công nợ

                        await new ModelDebt({
                            id_user: dataReceive.id_user,
                            debt_type: "receive",
                            id_branch: id_branch,
                            id_employee: req.body._caller._id,
                            debt_money_receive: receive_money,
                            debt_note: receive_note,
                            id_form: dataReceive._id,
                        }).save()
                    }
                }
            }
            const updateReceive = await ModelReceive.findByIdAndUpdate(dataReceive._id, {
                receive_content: dataAccounting._id,
                receive_money: receive_money,
                receive_note: receive_note,
                id_fundbook: dataFundbook._id
            })
            return res.json(updateReceive)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })

}

export const get_data_print = async(app) => {
    app.get(prefixApi + "/print", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("62185023ab5e6548aafac8f5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_receive = req.query.id_receive
            if (!id_receive || !validator.ObjectId.isValid(id_receive)) return res.status(400).send("Thất bại! Không tìm thấy phiếu thu")

            const dataReceive = await ModelReceive.findById(id_receive)
            if (!dataReceive) return res.status(400).send("Thất bại! Không tìm thấy phiếu thu")
            const id_branch = req.body._caller.id_branch_login
            const dataBranch = await get_branch_ById(id_branch)

            dataReceive.user_address = ""
            dataReceive.user_fullname = ""
            dataReceive.user_phone = ""
            dataReceive.employee_fullname = ""

            dataReceive.fundbook_name = ""
            dataReceive.accounting_entry_name = ""

            if (validator.ObjectId.isValid(dataReceive.id_user)) {
                const dataUser = await ModelUser.findById(dataReceive.id_user)
                if (dataUser) {
                    dataReceive.user_fullname = dataUser.user_fullname
                    dataReceive.user_phone = dataUser.user_phone
                    dataReceive.user_address = dataUser.user_address
                }
            }
            if (validator.ObjectId.isValid(dataReceive.id_fundbook)) {
                const dataFund = await ModelFundBook.findById(dataReceive.id_fundbook)
                if (dataFund) {
                    dataReceive.fundbook_name = dataFund.fundbook_name
                }

            }
            if (validator.ObjectId.isValid(dataReceive.receive_content)) {
                const dataAccounting = await ModelAccountingEntry.findById(dataReceive.receive_content)
                if (dataAccounting) {
                    dataReceive.accounting_entry_name = dataAccounting.accounting_entry_name
                }

            }
            return res.json({ dataBranch: dataBranch, dataReceive: dataReceive })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const delete_receive = async(app) => {
    app.delete(prefixApi, helper.authenToken, async(req, res) => {
        try {
            const id_receive = req.body.id_receive
            if (!validator.isDefine(id_receive) || !validator.ObjectId.isValid(id_receive)) return res.status(400).send(`Thất bại! Không tìm thấy phiếu chi`)

            const data_receive = await ModelReceive.findById(id_receive)
            if (!data_receive) return res.status(400).send(`Thất bại! Không tìm thấy phiếu chi`)
            if (data_receive.id_form) return res.status(400).send(`Thất bại! Không thể xóa phiếu thu phát sinh từ nghiệp vụ xuất hàng`)
            if(data_receive.receive_type == "tranfer") return res.status(400).send(`Hãy xóa phiếu này từ nghiệp vụ chuyển quỹ`)

            const data_debt = await ModelDebt.findOne({ $and: [{ debt_type: "receive" }, { id_form: data_receive._id }] })
            if (data_debt) {
                await ModelDebt.findByIdAndDelete(data_debt._id)
            }
            await ModelReceive.findByIdAndDelete(id_receive)
            return res.json("Success")

        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
