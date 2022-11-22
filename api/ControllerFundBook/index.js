const prefixApi = '/api/fundbook';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelFundBook } from "../../models/FundBook.js";
import { ModelReceive } from "../../models/Receive.js";
import { ModelPayment } from "../../models/Payment.js";
import { ModelUser } from "../../models/User.js";
import { ModelAccountingEntry } from "../../models/AccountingEntry.js";


export const management = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try
        {
            if(!await helper.checkPermission("61ee736efc3b22e001d48eac", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const data = await ModelFundBook.find({id_branch:req.body._caller.id_branch_login})
            return res.json(data)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
        
    })
}

export const insert = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try
        {
            if(!await helper.checkPermission("61ee736efc3b22e001d48eac", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const fundbook_name = req.body.fundbook_name
            const fundbook_type = req.body.fundbook_type
    
            if(fundbook_type != 'cash' && fundbook_type != 'bank' && fundbook_type != 'other') return res.status(400).send("Thất bại! Không tồn tại loại sổ quỹ này")
            
            try
            {
                const dataNew = await new ModelFundBook({
                    fundbook_name:fundbook_name,
                    fundbook_type:fundbook_type,
                    id_branch:req.body._caller.id_branch_login
                }).save()
                return res.json(dataNew)
            }
            catch(e)
            {
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


export const update = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try
        {
            if(!await helper.checkPermission("61ee736efc3b22e001d48eac", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const fundbook_name = req.body.fundbook_name
            const fundbook_type = req.body.fundbook_type
            const id_fundbook = req.body.id_fundbook

            if(fundbook_type != 'cash' && fundbook_type != 'bank' && fundbook_type != 'other') return res.status(400).send("Thất bại! Không tồn tại loại sổ quỹ này")
            
            try
            {
                const dataFund = await ModelFundBook.findById(id_fundbook)
                if(!dataFund) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")

                const updateNew = await ModelFundBook.findByIdAndUpdate(dataFund._id,{
                    fundbook_name:fundbook_name,
                    fundbook_type:fundbook_type,
                })
                return res.json(updateNew)
            }
            catch(e)
            {
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

export const getFundbookByBranch = async (id_branch)=>{
    const data = await ModelFundBook.find({id_branch:id_branch})
    return data
}

export const report = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi +"/report", helper.authenToken, async (req, res) => {
        try
        {
            if(!await helper.checkPermission("61ee736efc3b22e001d48eac", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_fundbook = req.query.id_fundbook
            const fromdate = req.query.fromdate
            const todate = req.query.todate
            const id_branch = req.body._caller.id_branch_login
            var query_period = {id_branch: validator.ObjectId(id_branch)}
            var query = {id_branch:validator.ObjectId(id_branch)}
            if(validator.ObjectId.isValid(id_fundbook)){
                query = {
                    ...query,
                    id_fundbook: validator.ObjectId(id_fundbook)
                }
                query_period = {
                    ...query_period,
                    id_fundbook:validator.ObjectId(id_fundbook)
                }
            }
        
            if(id_fundbook == "all_bank"){
                const fundbooks = await ModelFundBook.find({id_branch:validator.ObjectId(id_branch),fundbook_type:"bank"})
                var xquery = []
                for(let i = 0; i<fundbooks.length; i++){
                    xquery.push({id_fundbook: fundbooks[i]._id})
                }
                query = {
                    ...query,
                    $or:[...xquery]
                }
            }
            if(validator.isDefine(fromdate) && validator.isDefine(todate)){
                query = {
                    ...query,
                    ...validator.query_createdAt(fromdate , todate)
                }
                query_period = {
                    ...query_period,
                    createdAt:{$lt: new Date(fromdate +" 00:00:00")}
                }
            }

            const receive = await ModelReceive.find(query)
            const payment = await ModelPayment.find(query)
            const period_receive = await ModelReceive.aggregate([
                {
                    $match:query_period
                },
                {
                    $group:{
                        _id:null,
                        total_receive_period:{$sum:"$receive_money"}
                    }
                }
            ])

            const period_payment = await ModelPayment.aggregate([
                {
                    $match:query_period
                },
                {
                    $group:{
                        _id:null,
                        total_payment_period:{$sum:"$payment_money"}
                    }
                }
            ])
            let total_period = 0
            if(period_receive.length > 0) total_period = period_receive[0].total_receive_period
            if(period_payment.length > 0) total_period -= period_payment[0].total_payment_period

            const arrData = []

            for(let i = 0;i<receive.length ;i++){
                const dataAccounting = await ModelAccountingEntry.findById(receive[i].receive_content)
                receive[i].accounting_entry_name = dataAccounting.accounting_entry_name

                if(validator.ObjectId.isValid(receive[i].id_user)){
                    const dataUser = await ModelUser.findById(receive[i].id_user)
                    if(dataUser){
                        receive[i].user_fullname = dataUser.user_fullname
                        receive[i].user_phone = dataUser.user_phone
                        receive[i].user_address = dataUser.user_address
                    }
                }
                arrData.push(receive[i])
            }
            for(let i = 0;i<payment.length ;i++){
                const dataAccounting = await ModelAccountingEntry.findById(payment[i].payment_content)
                payment[i].accounting_entry_name = dataAccounting.accounting_entry_name

                if(validator.ObjectId.isValid(payment[i].id_user)){
                    const dataUser = await ModelUser.findById(payment[i].id_user)
                    if(dataUser){
                        payment[i].user_fullname = dataUser.user_fullname
                        payment[i].user_phone = dataUser.user_phone
                        payment[i].user_address = dataUser.user_address
                    }
                }
                arrData.push(payment[i])
            }
            
            arrData.sort((a, b)=>{
                return a.createdAt - b.createdAt
            })
            return res.json({arrData:arrData, total_period:total_period})
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const import_period = async (app )=>{
    app.post(prefixApi +"/period", helper.authenToken, async (req, res) => {
        try{
            if(!await helper.checkPermission("61ee736efc3b22e001d48eac", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_fundbook = req.body.id_fundbook
            const createdAt = new Date(req.body.createdAt)
            const receive_money = validator.tryParseInt(req.body.receive_money)

            if(!validator.ObjectId.isValid(id_fundbook)) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
            if(createdAt == 'Invalid Date') return res.status(400).send("Ngày tồn không được để trống")
            if(receive_money <= 0) return res.status(400).send("Giá trị tồn không được để trống")

            const dataFund = await ModelFundBook.findById(id_fundbook)
            if(!dataFund) return res.status(400).send("Thất bại! Không tìm thấy sổ quỹ")
            const dataReceive = await new ModelReceive({

                receive_money: receive_money ,
                receive_type: "hide",
                id_employee: req.body._caller._id,
                id_branch:  req.body._caller.id_branch_login,
                receive_content: "62440f8c1e19bd8f338010a6",
                receive_note: "Nhập qũy tồn đầu kỳ",
                id_fundbook: dataFund._id,
                createdAt: createdAt,

            }).save()
            return res.json(dataReceive)
        }
        catch(e){
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}

export const get_fundbook_by_employee = async (app) =>{
    app.get(prefixApi +"/get-by-employee", helper.authenToken, async (req, res) => {
        try
        {
            const id_branch = req.body._caller.id_branch
            const data = await ModelFundBook.find({id_branch:id_branch})
            return res.json(data)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
        
    })
}