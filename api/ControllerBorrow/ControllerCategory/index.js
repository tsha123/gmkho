const prefixApi = "/api/category"
import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { ModelSuperCategory } from "../../models/SuperCategory.js"
import { ModelCategory } from "../../models/Category.js"
import { ModelSubCategory } from "../../models/SubCategory.js"
import { Model_Slide_Banner } from "../../models/Slide-banner.js"

import path from "path"
import multer from "multer"
async function get_data_slide_banner() {
    const data_slide_banner = await Model_Slide_Banner.find()
    return data_slide_banner
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, validator.URL_IMAGE_CATEGORY)
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname).replace(path.extname(file.originalname), "-") + Date.now() + path.extname(file.originalname))
    },
})

const upload_image = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/jfif") {
            cb(null, true)
        } else {
            return cb(new Error("Only image are allowed!"))
        }
    },
}).single("category_image")
export const management = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e15772f8bf2521b16be20c", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            try {
                var query = {}
                if (validator.isDefine(req.query.key)) {
                    query = { ...query, category_name: { $regex: ".*" + req.query.key + ".*", $options: "$i" } }
                }
                if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
                    query = {
                        _id:validator.ObjectId(req.query.key)
                    }
                }
                const data = await ModelCategory.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))

                for (let i = 0; i < data.length; i++) {
                    if (validator.isObjectId(data[i].id_parent_category)) {
                        const data_parent = await ModelCategory.findById(data[i].id_parent_category).lean()
                        data[i] = {
                            ...data[i],
                            data_parent: data_parent,
                        }
                    } else {
                        data[i] = {
                            ...data[i],
                            data_parent: null,
                        }
                    }
                    if (validator.isObjectId(data[i].id_slide_banner)) {
                        const data_slide_banner = await Model_Slide_Banner.findById(data[i].id_slide_banner).lean()
                        data[i] = {
                            ...data[i],
                            data_slide_banner: data_slide_banner,
                        }
                    } else {
                        data[i] = {
                            ...data[i],
                            data_slide_banner: null,
                        }
                    }
                }
                const _data_all = await ModelCategory.find({}).lean()
                const count = await ModelCategory.countDocuments(query)

                const data_slide_banner = await get_data_slide_banner()
                return res.json({ data: data, count: count, data_all: _data_all, data_slide_banner: data_slide_banner })
            } catch (err) {
                console.log(err)
            }
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const update = async (app) => {
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e15772f8bf2521b16be20c", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            upload_image(req, res, async (err) => {
                try {
                    const _id = req.body._id

                    const dataCategory = await ModelCategory.findById(_id)
                    if (!dataCategory) return res.status(400).send("Thất bại! Không tìm thấy danh mục cần update")

                    const imgOld = dataCategory.category_image

                    const category_image = typeof req.file != "undefined" ? req.file.filename : imgOld
                    const category_name = req.body.category_name.trim()
                    const category_sluglink = validator.stringToSlug(category_name)
                    const category_status = validator.tryParseBoolean(req.body.category_status)
                    const display_app = validator.tryParseBoolean(req.body.display_app)
                    const display_website = validator.tryParseBoolean(req.body.display_website)
                    const category_part = validator.tryParseInt(req.body.part)
                    //
                    let id_parent_category = req.body.id_parent_category
                    if (!validator.isDefine(id_parent_category)) {
                        id_parent_category = null
                    }
                    let id_slide_banner = req.body.id_slide_banner
                    if (!validator.isDefine(id_slide_banner)) {
                        id_slide_banner = null
                    }

                    if (category_name.length == 0) return res.status(400).send("Thất bại! Tên danh mục không được để trống")
                    try {
                        const updateNew = await ModelCategory.findByIdAndUpdate(_id, {
                            category_image: category_image,
                            category_name: category_name,
                            category_sluglink: category_sluglink,
                            category_status: category_status,
                            display_app: display_app,
                            display_website: display_website,
                            id_parent_category: id_parent_category,
                            id_slide_banner: id_slide_banner,
                            category_part:category_part
                        })

                        if (typeof req.file != "undefined") {
                            // xóa ảnh cũ
                            await validator.removeFile(validator.URL_IMAGE_CATEGORY + "/" + imgOld)
                        }
                        return res.json(updateNew)
                    } catch (e) {
                        console.error(e)
                        return res.status(500).send("Thất bại! Có lỗi xảy ra")
                    }
                } catch (e) {
                    console.error(e)
                    return res.status(500).send("Thất bại! Có lỗi xảy ra")
                }
            })
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const insert = async (app) => {
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e15772f8bf2521b16be20c", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            //check and gán
            const upload = multer({
                storage: storage,
                fileFilter: function (req, file, cb) {
                    cb(null, true)
                },
            }).fields([{ name: `category_image`, maxCount: 1 }])
            upload(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    console.error("A Multer error occurred when uploading.")
                } else if (err) {
                    console.error("An unknown error occurred when uploading." + err)
                } else {
                    let image = null
                    if (validator.isNotEmpty(req.files["category_image"])) {
                        const image_category_website = req.files["category_image"][0]?.filename
                        image = image_category_website
                    }
                    //
                    const category_name = req.body.category_name
                    const category_sluglink = validator.stringToSlug(category_name)
                    const category_status = validator.tryParseBoolean(req.body.category_status)
                    const display_app = validator.tryParseBoolean(req.body.display_app)
                    const display_website = validator.tryParseBoolean(req.body.display_website)
                    const category_part = validator.tryParseInt(req.body.part)

                    let id_parent_category = req.body.id_parent_category
                    if (!validator.isNotEmpty(id_parent_category)) {
                        id_parent_category = null
                    }
                    let id_slide_banner = req.body.id_slide_banner
                    if (!validator.isNotEmpty(id_slide_banner)) {
                        id_slide_banner = null
                    }
                    const value = new ModelCategory({
                        category_name: category_name,
                        category_sluglink: category_sluglink,
                        category_status: category_status,
                        display_app: display_app,
                        display_website: display_website,
                        id_parent_category: id_parent_category,
                        id_slide_banner: id_slide_banner,
                        category_image: image,
                        category_options: [],
                        category_part:category_part
                    })
                    await value.save()
                    return res.json("success")
                }
            })
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const addKey = async (app) => {
    app.post(prefixApi + "/key", helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e15772f8bf2521b16be20c", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_category = req.body.id_category
            const category_options_alt = req.body.category_options_alt.trim()
            const category_options_name = req.body.category_options_name.trim()
            const category_options_values = req.body.category_options_values
            const category_options_active = req.body.category_options_active === 'true'

            if (category_options_name.length == 0) return res.status(400).send("Thất bại! Từ khóa không được để trống")
            if (category_options_alt.length == 0) return res.status(400).send("Thất bại! Tên thay thế không được để trống")
            if (category_options_values.length == 0) return res.status(400).send("Thất bại! Giá trị không được để trống")
            const dataCategory = await ModelCategory.findById(id_category)
            if (!dataCategory) return res.status(400).send("Thất bại! Không tìm thấy danh mục")

            try {
                const updateKey = await ModelCategory.findByIdAndUpdate(dataCategory._id, {
                    $push: {
                        category_options: {
                            category_options_name: category_options_name,
                            category_options_alt: category_options_alt,
                            category_options_values: category_options_values,
                            category_options_active:category_options_active
                        },
                    },
                })
                return res.json(updateKey)
            } catch (e) {
                console.error(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const updateKey = async (app) => {
    app.put(prefixApi + "/key", helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e15772f8bf2521b16be20c", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_category = req.body.id_category
            const category_options_name = req.body.category_options_name.trim()
            const category_options_alt = req.body.category_options_alt.trim()
            const category_options_values = req.body.category_options_values
            const category_options_active = req.body.category_options_active
            const indexOption = validator.tryParseInt(req.body.indexOption)
            if (category_options_name.length == 0) return res.status(400).send("Thất bại! Từ khóa không được để trống")
            if (category_options_alt.length == 0) return res.status(400).send("Thất bại! Từ thay thế không được để trống")
            if (category_options_values.length == 0) return res.status(400).send("Thất bại! Giá trị không được để trống")
            const dataCategory = await ModelCategory.findById(id_category)

            if (!dataCategory) return res.status(400).send("Thất bại! Không tìm thấy danh mục")
            if (dataCategory.category_options.length < indexOption) return res.status(400).send("Thất bai, Không tìm thấy option cần chỉnh sửa")
            dataCategory.category_options[indexOption] = {
                category_options_name: category_options_name,
                category_options_alt: category_options_alt,
                category_options_values: category_options_values,
                category_options_active:category_options_active
            }

            try {
                const updateKey = await ModelCategory.findByIdAndUpdate(dataCategory._id, { category_options: dataCategory.category_options })
                return res.json(updateKey)
            } catch (e) {
                console.error(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const deleteKey = async (app) => {
    app.delete(prefixApi + "/key", helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e15772f8bf2521b16be20c", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_category = req.body.id_category
            const indexOption = validator.tryParseInt(req.body.indexOption)

            const dataCategory = await ModelCategory.findById(id_category)
            dataCategory.category_options.splice(indexOption, 1)

            try {
                const updateKey = await ModelCategory.findByIdAndUpdate(dataCategory._id, { category_options: dataCategory.category_options })
                return res.json(updateKey)
            } catch (e) {
                console.error(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const getDataClient = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi + "/client", async (req, res) => {
        try {
            validator.eshtml(req)
            var query = {}
            if (validator.isDefine(req.query.key)) query = { ...query, category_name: { $regex: ".*" + sanitize(req.query.key) + ".*", $options: "$i" } }
            if (validator.isDefine(req.query.category_status)) query = { ...query, category_status: req.query.category_status === 'true' }
            if (validator.isDefine(req.query.id_super_category) && validator.ObjectId.isValid(req.query.id_super_category)) query = { ...query, id_super_category: req.query.id_super_category }

            const data = await ModelCategory.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            return res.json(data)
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const get_array_category = async (array_id) => {
    try {
        if(array_id){
            for(let i =0;i<array_id.length;i++){
                array_id[i] = validator.ObjectId(array_id[i])
            }
            const data = await ModelCategory.find({_id:{$in:array_id}})
            return data
        }
        else{
            const data = await ModelCategory.find({})
            return data
        }
       
    } catch (e) {
        return []
    }
}


export const edit_content = async (app) => {
    app.put(prefixApi+"/edit-content", helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e15772f8bf2521b16be20c", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const category_content = req.body.category_content
            const id_category = req.body.id_category
            if(!id_category || !validator.ObjectId.isValid(id_category)) return res.status(400).send(`Thất bại! Không tìm thấy danh mục`)
            const data = await ModelCategory.findById(id_category)
            if(!data) return res.status(400).send(`Thất bại! Không tìm thấy danh mục`)

            const update_content = await ModelCategory.findByIdAndUpdate(data._id,{
                category_content:category_content
            })
            return res.json(update_content)
        }
        catch(e)
        {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
    
export const delete_category = async (app) => {
    app.delete(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e15772f8bf2521b16be20c", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_category = req.body.id_category
            const dataCategory = await ModelCategory.findById(id_category)
            if(!dataCategory) return res.status(400).send(`Thất bại! Không tìm thấy danh mục`)

            const count = await ModelSubCategory.countDocuments({id_category:dataCategory._id})
            if(count > 0) return res.status(400).send(`Thất bại! Đang có ${count} sản phẩm thuộc danh mục này, không thể xóa`)

            await ModelCategory.findByIdAndDelete(dataCategory._id)
            return res.json("Success")
        }
        catch(e)
        {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
    