const prefixApi = '/api/permission';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelPermission} from '../../models/Permission.js'
import {ModelEmployeeGroup} from '../../models/EmployeeGroup.js'
import {ModelEmployeeSuperGroup} from '../../models/EmployeeSuperGroup.js'
import {ModelFunction} from '../../models/Function.js'

export const management = async(app)=>{
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi +"/groupAndFunction", helper.authenToken, async (req, res)=>{
        try
        {
            if(!await helper.checkPermission("61e1573bf8bf2521b16be1ff", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const dataGroups = await ModelEmployeeGroup.find()
            var functions = []
            var dataSuper = []
            if(req.query.getOther === 'true')
            {
                functions = await ModelFunction.find()
                dataSuper = await ModelEmployeeSuperGroup.find()
            }
            return res.json({dataGroups:dataGroups,functions:functions, dataSuper:dataSuper})

        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        } 
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng

    //#region  lấy danh sách quyền
    app.get(prefixApi, helper.authenToken, async (req, res)=>{
        try
        {
            if(!await helper.checkPermission("61e1573bf8bf2521b16be1ff", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            
            var query = {}
            if(validator.isDefine(req.query.id_employee_group))
            {
                query = {id_employee_group: req.query.id_employee_group}
            }
            const dataPer = await ModelPermission.find(query)
            return res.json(dataPer)
        }
        catch(e)
        {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        } 
    })
}


export const updateGroup = async (app)=>{
    try
    {
        app.put(prefixApi+"/group" , helper.authenToken, async (req, res)=>{
    
            if(!await helper.checkPermission("61e1573bf8bf2521b16be1ff", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const dataGroup = await ModelEmployeeGroup.findById(req.body.id_group)
            if(!dataGroup) return res.status(400).send("Thất bại! Không tìm thấy chức danh này")
            const dataGroupOfAdmin = await ModelEmployeeGroup.findById(req.body._caller.id_employee_group)
            if(!dataGroupOfAdmin) return res.status(400).send("Thất bại! Không tìm thấy chức danh của bạn")
    
            if(dataGroupOfAdmin.employee_level > dataGroup.employee_level) return res.status(400).send("Thất bại! Bạn không có quyền sửa chức danh cao hơn chức danh hiện tại của bạn")
            const employee_group_name = req.body.employee_group_name.trim()
            const id_super_group = req.body.id_super_group
            if(employee_group_name.length == 0) return res.status(400).send("Thất bại! Tên chức danh không được để trống")
            const dataSuper = await ModelEmployeeSuperGroup.findById(id_super_group)
            if(!dataSuper) return res.status(400).send("Thất bại! Không tìm thấy bộ bận này")
    
            try
            {
                const updatedGroup = await ModelEmployeeGroup.findByIdAndUpdate(dataGroup._id,{
                    employee_group_name:employee_group_name,
                    id_super_group:dataSuper._id
                })
                return res.json(updatedGroup)
            }
            catch(e)
            {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        })
    } catch(e)
    {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }

    
}

export const updatePermission = async (app)=>{
    try
    {
        app.put(prefixApi, helper.authenToken, async (req, res)=>{
    
            if(!await helper.checkPermission("61e1573bf8bf2521b16be1ff", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const dataGroup = await ModelEmployeeGroup.findById(req.body.id_employee_group)
            if(!dataGroup) return res.status(400).send("Thất bại! Không tìm thấy chức danh này")
            const dataGroupOfAdmin = await ModelEmployeeGroup.findById(req.body._caller.id_employee_group)
            if(!dataGroupOfAdmin) return res.status(400).send("Thất bại! Không tìm thấy chức danh của bạn")
    
            if(dataGroupOfAdmin.employee_level > dataGroup.employee_level) return res.status(400).send("Thất bại! Bạn không có quyền sửa chức danh cao hơn chức danh hiện tại của bạn")
            const dataFunc = await ModelFunction.findById(req.body.id_function)
            if(! dataFunc) return res.status(400).send("Thất bại! Chức năng này không tồn tại")
            
            const dataPer = await ModelPermission.findOne({
                id_employee_group:dataGroup._id,
                id_function:dataFunc._id
            })

            const permission_status = req.body.permission_status
            try
            {
                if(!dataPer) // chưa có chức năng và chức danh này trong permission -> thêm mới
                {
                    const insertPer = await new ModelPermission({
                        id_function:dataFunc._id,
                        id_employee_group:dataGroup._id
                    }).save()
                    return res.json(insertPer)
                }
                else  // chỉnh sửa->update
                {
                    const updatePer = await ModelPermission.findByIdAndUpdate(dataPer._id, {
                        permission_status:permission_status
                    })
                    return res.json(updatePer)
                }
            }
            catch(e)
            {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
         
        })
    } catch(e)
    {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}