const prefixApi = '/api/branch';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import path from 'path';
import { ModelBranch } from '../../models/Branch.js'
import { ModelUser } from '../../models/User.js'

import multer from 'multer'

export const management = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async(req, res) => {
            try {
                if (!await helper.checkPermission("61e1581f20006610c388a12a", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
                const query = {}
                if (validator.isDefine(req.query.id_branch)) {
                    const data = await ModelBranch.findById(req.query.id_branch)
                    return res.json(data)
                }
                const dataBranch = await ModelBranch.find()
                return res.json(dataBranch)
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        })
        //#endregion api lấy danh sách chức năng và nhóm người dùng

}


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images/images_branch')
    },
    filename: function(req, file, cb) {
        cb(null, path.basename(file.originalname).replace(path.extname(file.originalname), '-') + Date.now() + path.extname(file.originalname))
    }
});
const upload_image_branch = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/jfif") {
            cb(null, true)
        } else {
            return cb(new Error('Only image are allowed!'))
        }
    }
}).fields([{ name: 'branch_logo', maxCount: 1 }, { name: 'branch_image', maxCount: 1 }]);

export const update = async(app) => {

    app.put(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("61e1581f20006610c388a12a", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            await upload_image_branch(req, res, async(err) => {
                try {
                    var newValue = {}

                    if (validator.isDefine(req.files.branch_logo) && req.files.branch_logo.length > 0) {
                        const branch_logo = req.files.branch_logo[0].filename
                        newValue = {...newValue, branch_logo: branch_logo }
                    }
                    if (validator.isDefine(req.files.branch_image) && req.files.branch_image.length > 0) {
                        const branch_image = req.files.branch_image[0].filename
                        newValue = {...newValue, branch_image: branch_image }
                    }
                    const branch_name = req.body.branch_name.trim()
                    const branch_phone = req.body.branch_phone.trim()
                    const branch_address = req.body.branch_address.trim()
                    const branch_email = req.body.branch_email.trim()

                    const id_branch = req.body.id_branch

                    if (branch_name.length == 0) return res.status(400).send("Thất bại! Tên chi nhánh không được để trống")
                    const dataBranch = await ModelBranch.findById(id_branch)
                    if (!dataBranch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh")

                    newValue = {
                        ...newValue,
                        branch_email: branch_email,
                        branch_name: branch_name,
                        branch_address: branch_address,
                        branch_phone: branch_phone,
                    }
                    const updateNew = await ModelBranch.findByIdAndUpdate(dataBranch._id, newValue)
                    return res.json(updateNew)
                } catch (e) {
                    console.log(e)
                    return res.status(500).send("Thất bại! Có lỗi xảy ra")
                }
            })
        } catch (e) {

        }
    })
}


export const insert = async(app) => {

    app.post(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("61e1581f20006610c388a12a", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            upload_image_branch(req, res, async(err) => {
                try {
                    var newValue = {}

                    if (validator.isDefine(req.files.branch_logo) && req.files.branch_logo.length > 0) {
                        const branch_logo = req.files.branch_logo[0].filename
                        newValue = {...newValue, branch_logo: branch_logo }
                    }
                    if (validator.isDefine(req.files.branch_image) && req.files.branch_image.length > 0) {
                        const branch_image = req.files.branch_image[0].filename
                        newValue = {...newValue, branch_image: branch_image }
                    }
                    const branch_name = req.body.branch_name.trim()
                    const branch_phone = req.body.branch_phone.trim()
                    const branch_address = req.body.branch_address.trim()
                    const branch_email = req.body.branch_email.trim()

                    if (branch_name.length == 0) return res.status(400).send("Thất bại! Tên chi nhánh không được để trống")

                    if (!validator.isDefine(branch_phone)) return res.status(400).send(`Hotline không được để trống!`)
                    const dataUser = await ModelUser.findOne({ user_phone: branch_phone })
                    if (dataUser) return res.status(400).send(`Hotline dùng để tạo user mặc định đã tồn tại!`)

                    newValue = {
                        ...newValue,
                        branch_name: branch_name,
                        branch_address: branch_address,
                        branch_phone: branch_phone,
                        branch_email: branch_email,
                    }
                    try {
                        const addBranch = await new ModelBranch(newValue).save()
                        await new ModelUser({
                            _id: validator.ObjectId(addBranch._id),
                            user_phone: branch_phone,
                            user_fullname: branch_name
                        }).save()
                        return res.json(addBranch)
                    } catch (e) {
                        console.log(e)
                        return res.status(500).send("Thất bại! Có lỗi xảy ra")
                    }

                } catch (e) {
                    console.log(e)
                    return res.status(500).send("Thất bại! Có lỗi xảy ra")
                }
            })
        } catch (e) {

        }
    })
}



export const getByClient = async(app) => {

    app.get(prefixApi + "/client", async(req, res) => {
        try {
            const data = await ModelBranch.find({ branch_active: true })
            return res.json(data)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const get_branch_ById = async(id_branch) => {
    const data = await ModelBranch.findById(id_branch)
    return data
}

export const update_active = async(app) => {

    app.put(prefixApi + "/active", async(req, res) => {
        try {
            const branch_active = req.body.branch_active === 'true'
            const id_branch = req.body.id_branch

            const data = await ModelBranch.findByIdAndUpdate(id_branch,{
                branch_active:branch_active
            })
            return res.json(data)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
