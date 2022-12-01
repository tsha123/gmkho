const prefixApi = '/api/tranfer-fundbook';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelEmployee } from '../../models/Employee.js'
import { ModelPayment } from '../../models/Payment.js'
import { ModelReceive } from '../../models/Receive.js'
import { ModelFundBook } from '../../models/FundBook.js'
import { ModelTranferFundbook } from '../../models/TranferFundbook.js'

import { ModelDebt } from '../../models/Debt.js'
import { ModelAccountingEntry } from '../../models/AccountingEntry.js'
import { getAllAccountingEntry } from './../ControllerAccountingEntry/index.js'
import { getFundbookByBranch } from './../ControllerFundBook/index.js'
import { get_branch_ById } from '../ControllerBranch/index.js'




export const check_permission = async(app) => {
    app.get(prefixApi + "/checkPermission", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("6321b1fa29d0915c4b9c5587", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_branch = req.body._caller.id_branch_login
            const data = await ModelFundBook.find({ id_branch: id_branch })
            return res.json(data)

        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}



export const getData = async(app) => {
    app.get(prefixApi , helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("6321b1fa29d0915c4b9c5587", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_branch = req.body._caller.id_branch_login
            let query = {id_branch:id_branch}
            
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    $and: [{ createdAt: { $gte: new Date(req.query.fromdate + " 00:00:00") } }, { createdAt: { $lte: new Date(req.query.todate + " 23:59:59") } }]
                }
            }
            if (validator.isDefine(req.query.from_fundbook) && validator.ObjectId.isValid(req.query.from_fundbook)) {
                query = {
                    ...query,
                    from_fundbook: validator.ObjectId(req.query.from_fundbook)
                }
            }
            if (validator.isDefine(req.query.to_fundbook) && validator.ObjectId.isValid(req.query.to_fundbook)) {
                query = {
                    ...query,
                    to_fundbook:  validator.ObjectId(req.query.to_fundbook)
                }
            }
            const from_money = validator.tryParseInt(req.query.from_money)
            const to_money = validator.tryParseInt(req.query.to_money)
            if (from_money > 0 || to_money > 0) {

                query = {
                    $and: [{...query }, { money: { $gte: from_money } }, { money: { $lte: to_money } }]
                }
            }
            const data = await ModelTranferFundbook.find(query).sort({ _id: -1 }).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            const count = await ModelTranferFundbook.countDocuments(query)
            for (let i = 0; i < data.length; i++) {
                const dataEm = await ModelEmployee.findById(data[i].id_employee).lean()
                if (dataEm) {
                    data[i].employee_fullname = dataEm.employee_fullname
                }
            }
            return res.json({ data: data, count: count })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const add_form = async(app) => {
    app.post(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("6321b1fa29d0915c4b9c5587", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")


            const id_employee = req.body._caller._id
            const id_branch = req.body._caller.id_branch_login
            const from_fundbook = req.body.from_fundbook
            const to_fundbook = req.body.to_fundbook
            const money = validator.tryParseInt(req.body.money)
            const note = req.body.note
            if (!validator.ObjectId.isValid(id_branch) || !validator.ObjectId.isValid(from_fundbook) || !validator.ObjectId.isValid(to_fundbook)) return res.status(400).send("Thất bại! Có lỗi xảy ra")
            if (money <= 0) return res.status(400).send("Giá trị chuyển phải lớn hơn không!")

            const data_from_fundbook = await ModelFundBook.findById(from_fundbook)
            if (!data_from_fundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ cần chuyển")

            const data_to_fundbook = await ModelFundBook.findById(to_fundbook).lean()
            if (!data_to_fundbook) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ cần chuyển")

            const insert_payment = await ModelPayment({
                payment_money: money,
                id_employee: id_employee,
                id_user: id_branch,
                payment_type: "tranfer",
                id_branch: id_branch,
                payment_content: validator.ObjectId("6321f0ec29d0915c4b9c75d1"),
                id_form: null,
                payment_note: `Chuyển từ quỹ ${data_from_fundbook.fundbook_name} sang quỹ ${data_to_fundbook.fundbook_name}`,
                id_fundbook: data_from_fundbook._id
            }).save()

            const insert_receipts = await ModelReceive({
                receive_money: money,
                id_employee: id_employee,
                id_user: id_branch,
                receive_type: "tranfer",
                id_branch: id_branch,
                receive_content: validator.ObjectId("6321f0ec29d0915c4b9c75d1"),
                id_form: null,
                receive_note: `Chuyển từ quỹ ${data_from_fundbook.fundbook_name} sang quỹ ${data_to_fundbook.fundbook_name}`,
                id_fundbook: data_to_fundbook._id
            }).save()

            const data = await new ModelTranferFundbook({
                id_branch: id_branch,
                note: note,
                id_employee: id_employee,
                id_receipts: insert_receipts._id,
                id_payment: insert_payment._id,
                money: money,
                from_fundbook: data_from_fundbook._id,
                to_fundbook: data_to_fundbook._id,
            }).save()

            return res.json(data)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const delete_form = async(app) => {
    app.delete(prefixApi, helper.authenToken, async(req, res) => {   
        try {
            if (!await helper.checkPermission("6321b1fa29d0915c4b9c5587", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_tranfer = req.body.id_tranfer
            if (!validator.ObjectId.isValid(id_tranfer)) return res.status(400).send("Thất bại! Có lỗi xảy ra")
            const dataTranfer = await ModelTranferFundbook.findById(id_tranfer)

            if (!dataTranfer) return res.status(400).send("Thất bại! Không tìm thấy phiếu")

            await ModelReceive.findByIdAndDelete(dataTranfer.id_receipts)
            await ModelPayment.findByIdAndDelete(dataTranfer.id_payment)
            await ModelTranferFundbook.findByIdAndDelete(dataTranfer._id)
            return res.json("Success")
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}