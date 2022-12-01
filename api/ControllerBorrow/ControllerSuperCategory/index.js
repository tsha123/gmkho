const prefixApi = '/api/supercategory';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'

import {ModelSuperCategory} from '../../models/SuperCategory.js'

export const management = async(app)=>{
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async (req, res)=>{
        try
        {
            if(!await helper.checkPermission("61e15782f8bf2521b16be20e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        } 
    })
}


export const insert = async(app)=>{
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.post(prefixApi, helper.authenToken, async (req, res)=>{
        try
        {
            if(!await helper.checkPermission("61e15782f8bf2521b16be20e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            try {
                const super_category_name = req.body.super_category_name
                if(!validator.isDefine(super_category_name)  || super_category_name.trim().length == 0) return res.status(400).send("Thất bại! Tên sản phẩm không được để trống")
                
                const insertedNew = await new ModelSuperCategory({
                    super_category_name:super_category_name
                }).save()
                return res.json(insertedNew)
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

export const getDataClient = async(app)=>{
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi+"/client", helper.authenToken, async (req, res)=>{
        try
        {
            validator.eshtml(req)
            var query = {}
            if(validator.isDefine(req.query.super_category_name)){
                query = {super_category_name:{$regex:".*"+req.query.super_category_name+".*",$options:"$i"}}
            }
                const data = await ModelSuperCategory.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
                return res.json(data)
           
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        } 
    })
}

