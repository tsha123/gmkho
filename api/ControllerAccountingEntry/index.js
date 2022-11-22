const prefixApi = '/api/accounting-entry';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'

import { ModelAccountingEntry } from '../../models/AccountingEntry.js'

export const management = async (app) => {
  //#region api lấy danh sách bút toán thu chi
  app.get(prefixApi, helper.authenToken, async (req, res) => {
    try {
     
      if (!await helper.checkPermission("61fe6f9dca658758ac1b3e0f", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
      let query = {}
      if(validator.isDefine(req.query.key)){
        query = {...query, accounting_entry_name:{$regex:".*"+req.query.key+".*", $options:"i"}}
      }
      if(validator.isDefine(req.query.type)){
        query = {...query, accounting_entry_type: req.query.type}
      }
      const data = await ModelAccountingEntry.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
      const count = await ModelAccountingEntry.find(query).countDocuments()
      return res.json({data:data,count:count})
    }
    catch (e) {
      console.log(e)
      return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
  })
}

export const insert = async (app) => {
  app.post(prefixApi, helper.authenToken, async (req, res) => {
    try {
      if (!await helper.checkPermission("61fe6f9dca658758ac1b3e0f", req.body._caller.id_employee_group))return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
     
      try{
        const insertNew = await new ModelAccountingEntry({
          accounting_entry_type:req.body.accounting_entry_type,
          accounting_entry_name:req.body.accounting_entry_name,
          accounting_entry_create_debt:req.body.accounting_entry_create_debt,
          accounting_entry_default: false
        }).save()
        return res.json(insertNew)
      }
      catch(e){
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
      }
    }
    catch (e) {
      console.log(e)
      return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
  })
}

export const update = async (app) => {
  app.put(prefixApi, helper.authenToken, async (req, res) => {
    try {
      if (!await helper.checkPermission("61fe6f9dca658758ac1b3e0f", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
      const id_accounting_entry = req.body.id_accounting_entry
      const dataAccounting = await ModelAccountingEntry.findById(id_accounting_entry)
      if(!dataAccounting) return res.status(400).send("Thất bại! Không tìm thấy bút toán")
      if(dataAccounting.accounting_entry_default) return res.status(400).send("Thất bại! Đây là bút toán mặc định, không thể sửa")
      try{
        const updateNew = await ModelAccountingEntry.findByIdAndUpdate(dataAccounting._id,{
          accounting_entry_type:req.body.accounting_entry_type,
          accounting_entry_name:req.body.accounting_entry_name,
          accounting_entry_create_debt:req.body.accounting_entry_create_debt,
        })
        return res.json(updateNew)
      }
      catch(e){
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
      }
    }
    catch (e) {
      console.log(e)
      return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
  })
}

export const getAllAccountingEntry = async (query = {})=>{
    const data = await ModelAccountingEntry.find(query)
    return data
}
