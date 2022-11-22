const prefixApi = '/api/employee';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import path from 'path';
import { ModelBranch } from '../../models/Branch.js'
import { ModelEmployeeGroup } from '../../models/EmployeeGroup.js'
import { ModelEmployeeSuperGroup } from '../../models/EmployeeSuperGroup.js'
import { ModelEmployee } from '../../models/Employee.js'
import multer from 'multer'
import fs from 'fs'
export const management = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("61e15741f8bf2521b16be201", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            var query = { id_branch: req.body._caller.id_branch_login }
            if (validator.isDefine(req.query.key)) {
                query = { ...query, $or: [{ employee_fullname: { $regex: ".*" + sanitize(req.query.key) + ".*", $options: "i" } }, { employee_phone: { $regex: ".*" + sanitize(req.query.key) + ".*" } }] }
            }
            if (validator.isDefine(req.query.id_employee_group) && validator.ObjectId.isValid(req.query.id_employee_group)) {
                query = { ...query, id_employee_group: req.query.id_employee_group }
            }
            var limit = 10;
            var page = 0;

            if (validator.isDefine(req.query.limit)) {
                limit = validator.tryParseInt(req.query.limit)
            }
            if (validator.isDefine(req.query.page)) {
                page = validator.tryParseInt(req.query.page)
                if (page <= 0) page = 1
            }
            var arrGroup = []
            var supperGroup = []
            if (req.query.getGroup === 'true') {
                arrGroup = await ModelEmployeeGroup.find()
                supperGroup = await ModelEmployeeSuperGroup.find()
            }

            const data = await ModelEmployee.find(query).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit)
            for (let i = 0; i < data.length; i++) {
                const group = await ModelEmployeeGroup.findById(data[i].id_employee_group)
                data[i].employee_group_name = group.employee_group_name
                delete data[i].password
            }
            const count = await ModelEmployee.countDocuments(query)

            return res.json({ data: data, count: count, arrGroup: arrGroup, supperGroup:supperGroup })

        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng

}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/images_employee')
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname).replace(path.extname(file.originalname), '-') + Date.now() + path.extname(file.originalname))
    }
});
const upload_image_branch = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/jfif") {
            cb(null, true)
        } else {
            return cb(new Error('Chỉ file ảnh mới đc cho phép!'))
        }
    }
}).single('employee_image')


export const update = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("61e15741f8bf2521b16be201", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_employee_group_admin = req.body._caller.id_employee_group
            upload_image_branch(req, res, async (err) => {
                if (err) {
                    return res.status(400).send(err)
                }
                const dataEm = await ModelEmployee.findById(req.body.id_employee)
                if (!dataEm) return res.status(400).send("Thất bại! Không tìm thấy nhân viên");
                const dataGroup = await ModelEmployeeGroup.findById(dataEm.id_employee_group)
                if (!dataGroup) return res.status(400).send("Thất bại! Không tìm thấy chức danh của nhân viên")
                const dataGroupOfAdmin = await ModelEmployeeGroup.findById(id_employee_group_admin)
                if (!dataGroupOfAdmin) return res.status(400).send("Thất bại! Không tìm thấy chức danh của bạn")
                if (dataGroupOfAdmin.employee_level > dataGroup.employee_level) return res.status(400).send("Thất bại! Bạn không có quyền sửa thông tin của nhân viên cao hơn chức danh hiện tại của bạn")

                var newValue = {}
                if (req.file) newValue = { ...newValue, employee_image: req.file.filename }
                if (validator.isDefine(req.body.password) && req.body.password.length > 0) newValue = { ...newValue, password: req.body.password }
                if (validator.isDefine(req.body.employee_fullname) && req.body.employee_fullname.length > 0) newValue = { ...newValue, employee_fullname: req.body.employee_fullname }
                if (validator.isDefine(req.body.employee_address)) newValue = { ...newValue, employee_address: req.body.employee_address }
                if (validator.isDefine(req.body.employee_bank_number)) newValue = { ...newValue, employee_bank_number: req.body.employee_bank_number }
                if (validator.isDefine(req.body.employee_bank_name)) newValue = { ...newValue, employee_bank_name: req.body.employee_bank_name }
                if (validator.isDefine(req.body.id_employee_group)) newValue = { ...newValue, id_employee_group: req.body.id_employee_group }
                if (validator.isDefine(req.body.employee_level)) newValue = { ...newValue, employee_level: req.body.employee_level }
                if (validator.isDefine(req.body.employee_salary)) newValue = { ...newValue, employee_salary: validator.tryParseInt(req.body.employee_salary) }
                if (validator.isDefine(req.body.employee_salary_duty)) newValue = { ...newValue, employee_salary_duty: validator.tryParseInt(req.body.employee_salary_duty) }
                if (validator.isDefine(req.body.employee_lunch_allowance)) newValue = { ...newValue, employee_lunch_allowance: validator.tryParseInt(req.body.employee_lunch_allowance) }
                if (validator.isDefine(req.body.employee_revenue_percent)) newValue = { ...newValue, employee_revenue_percent: parseFloat(req.body.employee_revenue_percent) }
                if (validator.isDefine(req.body.employee_status)) newValue = { ...newValue, employee_status: req.body.employee_status }
                if (validator.isDefine(req.body.employee_phone)) newValue = { ...newValue, employee_phone: req.body.employee_phone }
                if (validator.isDefine(req.body.id_branch)) newValue = { ...newValue, id_branch: req.body.id_branch }
                try {
                    const updateNew = await ModelEmployee.findByIdAndUpdate(dataEm._id, newValue)
                    if (!req.file) {
                        await validator.removeFile(validator.URL_IMAGE_EMPLOYEE + `/${dataEm.employee_image}`)
                    }
                    return res.json(updateNew)
                }
                catch (e) {
                    console.log(e)
                    return res.status(500).send("Thất bại! Có lỗi xảy ra")
                }

            })
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }



    })
}


export const insert = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("61e15741f8bf2521b16be201", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_employee_group_admin = req.body._caller.id_employee_group
            const id_branch = req.body._caller.id_branch_login
            upload_image_branch(req, res, async (err) => {
                if (err) {
                    return res.status(400).send(err)
                }

                const dataGroup = await ModelEmployeeGroup.findById(req.body.id_employee_group)
                if (!dataGroup) return res.status(400).send("Thất bại! Không tìm thấy chức danh của nhân viên")
                const dataGroupOfAdmin = await ModelEmployeeGroup.findById(id_employee_group_admin)
                if (!dataGroupOfAdmin) return res.status(400).send("Thất bại! Không tìm thấy chức danh của bạn")
                if (dataGroupOfAdmin.employee_level > dataGroup.employee_level) return res.status(400).send("Thất bại! Bạn không có quyền tạo tài khoản có chức danh cao hơn bạn")

                var newValue = { id_branch: id_branch }
                if (req.file) newValue = { ...newValue, employee_image: req.file.filename }
                if (validator.isDefine(req.body.password) && req.body.password.length > 0) newValue = { ...newValue, password: req.body.password }
                if (validator.isDefine(req.body.employee_fullname) && req.body.employee_fullname.length > 0) newValue = { ...newValue, employee_fullname: req.body.employee_fullname }
                if (validator.isDefine(req.body.employee_address)) newValue = { ...newValue, employee_address: req.body.employee_address }
                if (validator.isDefine(req.body.employee_bank_number)) newValue = { ...newValue, employee_bank_number: req.body.employee_bank_number }
                if (validator.isDefine(req.body.employee_bank_name)) newValue = { ...newValue, employee_bank_name: req.body.employee_bank_name }
                if (validator.isDefine(req.body.id_employee_group)) newValue = { ...newValue, id_employee_group: req.body.id_employee_group }
                if (validator.isDefine(req.body.employee_level)) newValue = { ...newValue, employee_level: req.body.employee_level }
                if (validator.isDefine(req.body.employee_salary)) newValue = { ...newValue, employee_salary: validator.tryParseInt(req.body.employee_salary) }
                if (validator.isDefine(req.body.employee_salary_duty)) newValue = { ...newValue, employee_salary_duty: validator.tryParseInt(req.body.employee_salary_duty) }
                if (validator.isDefine(req.body.employee_lunch_allowance)) newValue = { ...newValue, employee_lunch_allowance: validator.tryParseInt(req.body.employee_lunch_allowance) }
                if (validator.isDefine(req.body.employee_revenue_percent)) newValue = { ...newValue, employee_revenue_percent: parseFloat(req.body.employee_revenue_percent) }
                if (validator.isDefine(req.body.employee_status)) newValue = { ...newValue, employee_status: true }
                if (validator.isDefine(req.body.employee_phone)) newValue = { ...newValue, employee_phone: req.body.employee_phone }
             
                
                try {
                    const insertNew = await new ModelEmployee(newValue).save()
                    return res.json(insertNew)
                }
                catch (e) {
                    console.log(e)
                    return res.status(500).send("Thất bại! Có lỗi xảy ra")
                }

            })
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }



    })
}

export const getInfo = async (app) => {
    app.get(prefixApi + "/info", helper.authenToken, async (req, res) => {
        try {
            var query = {}
            if (validator.isDefine(req.query.key)) {
                query = {
                    ...query,
                    $or:[{employee_fullname:{$regex:".*"+req.query.key+".*" , $options:"i"}}, {employee_phone:{$regex:".*"+req.query.key+".*" , $options:"i"}}]
                }
            }
            if (req.query.is_branch === 'true') {
                query = {
                    ...query,
                    id_branch:id_branch_login
                }
            }
            const data = await ModelEmployee.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            return res.json(data)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
       
    })
}

export const insert_group = async (app) => {
    app.post(prefixApi + "/add-group", helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("61e15741f8bf2521b16be201", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_supper = req.body.id_supper
            const group_name = req.body.group_name
            if(!validator.isDefine(group_name)) return res.status(400).send(`Thất bại! Tên chức danh không được để trống.`)
            if(!validator.ObjectId.isValid(id_supper))  return res.status(400).send(`Thất bại! Hãy chọn nhóm nhân viên.`)
            
            const insert_new = await new ModelEmployeeGroup({
                employee_group_name: group_name,
                id_super_group: id_supper,
                employee_level: 1,
            }).save()
            return res.json(insert_new)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
       
    })
}

export const get_employee = async(id_branch) =>{
    try{
        let query = {}
        if(id_branch && validator.ObjectId.isValid(id_branch)){
            query = {
                id_branch:validator.ObjectId(id_branch)
            }
        }
        
        const data = await ModelEmployee.find(query)
        return data
    }
    catch(e){
        return null
    }
}
