import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { ModelMenu } from "../../models/Menu.js"
import { ModelCategory } from "../../models/Category.js"
import { ModelSuperCategory } from "../../models/SuperCategory.js"
import { Model_Website_Component } from "./../../models/WebsiteComponent.js"

const prefixApi = "/api/menu"
const FIXED_LIMIT = 10
import path from "path"
import multer from "multer"
const _id_website_component = validator.id_website_component_shopweb
async function get_data_website_components() {
    let data_website_component = await Model_Website_Component.find()
    return data_website_component
}
function get_child_menu(arr, _id, arr_ids = [], arr_object_id = [], arr_child_category = []) {
    arr.forEach((element) => {
        if (element.id_parent + "" == _id + "") {
            arr_ids.push(element._id + "")
            arr_object_id.push(validator.ObjectId(element._id))
            arr_child_category.push(element)
            get_child_menu(arr, element._id, arr_ids)
        }
    })

    return {
        arr_ids: arr_ids,
        arr_object_id: arr_object_id,
        arr_child_category: arr_child_category,
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/images_menu")
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname).replace(path.extname(file.originalname), "-") + Date.now() + path.extname(file.originalname))
    },
})
export const management = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61ea38244d09cf202a258fe9", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            let limit = FIXED_LIMIT
            let page = 1
            if (validator.isNotEmpty(req.query.page)) {
                page = Math.abs(validator.tryParseInt(req.query.page)) || 1
            }
            if (validator.isNotEmpty(req.query.limit)) {
                limit = Math.abs(validator.tryParseInt(req.query.limit)) || FIXED_LIMIT
                if (limit > validator.limit_query || limit == 0) {
                    limit = FIXED_LIMIT
                }
            }
            let query = {}
            let query_2 = {}

            let sort_conditions = {
                serial_number: -1,
                _id: -1,
            }
            let sort_conditions_2 = {
                serial_number: -1,
                _id: -1,
            }
            let search_key = ""
            if (validator.isNotEmpty(req.query.key)) {
                search_key = validator.viToEn(req.query.key).replace(/[^a-zA-Z0-9]/g, " ")
                query = {
                    ...query,
                    $text: {
                        $search: search_key,
                    },
                }
                query_2 = {
                    ...query_2,
                    name: { $regex: ".*" + req.query.key + ".*", $options: "$i" },
                }
                sort_conditions = {
                    score: { $meta: "textScore" },
                    ...sort_conditions,
                }
            }

            const _data_all = await ModelMenu.find({}).lean()
            let id_parent = ``
            if (validator.isNotEmpty(req.query.id_parent)) {
                id_parent = req.query.id_parent
                if (id_parent + "" == "top") {
                    query = {
                        ...query,
                        id_parent:null
                    }
                    query_2 = {
                        ...query_2,
                        id_parent:null
                    }
                } else if(validator.isObjectId(id_parent)) {
                    
                    let arr_id_parent_category = get_child_menu(_data_all, id_parent).arr_ids
                    arr_id_parent_category.push(id_parent + "")
                    let arr_object_id_parent_category = get_child_menu(_data_all, id_parent).arr_object_id
                    arr_object_id_parent_category.push(validator.ObjectId(id_parent))
                    // console.log(id_parent)
                    // console.log(arr_id_parent_category)
                    // console.log(arr_object_id_parent_category)
                    query = {
                        ...query,
                        $or: [{ _id: { $in: arr_id_parent_category } }, { _id: { $in: arr_object_id_parent_category } }],
                    }
                    query_2 = {
                        ...query_2,
                        $or: [{ _id: { $in: arr_id_parent_category } }, { _id: { $in: arr_object_id_parent_category } }],
                    }
                }
            }
            let id_website_component = ``
            if (validator.isNotEmpty(req.query.id_website_component)) {
                id_website_component = req.query.id_website_component
                query = {
                    ...query,
                    id_website_component: validator.ObjectId(req.query.id_website_component),
                }
                query_2 = {
                    ...query_2,
                    id_website_component: validator.ObjectId(req.query.id_website_component),
                }
            }
            let data = await ModelMenu.find(query)
                .sort(sort_conditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
            let count = await ModelMenu.find(query).countDocuments()
            if (data.length == 0) {
                data = await ModelMenu.find(query_2)
                    .sort(sort_conditions_2)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean()
                count = await ModelMenu.find(query_2).countDocuments()
            }
            for (let i = 0; i < data.length; i++) {
                const data_parent = await ModelMenu.findById(data[i].id_parent).lean()
                const data_website_component = await Model_Website_Component.findById(data[i].id_website_component).lean()
                data[i] = {
                    ...data[i],
                    data_parent: data_parent,
                    data_website_component: data_website_component,
                }
            }
            //others
            const _data_all_category = await ModelCategory.find({}).sort({ LinkSlug: 1 }).lean()
            const max_serial_number = await ModelMenu.findOne({}).sort("-serial_number").lean()
            const data_website_component = await get_data_website_components()
            const object = {
                data: data,
                data_website_component: data_website_component,
                id_website_component: id_website_component,
                data_all: _data_all,
                data_all_category: _data_all_category,
                max_serial_number: max_serial_number?.serial_number || 0,
                id_parent: id_parent,
                count: count,
                page: page,
            }
            return res.json(object)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //add
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            // console.log(req.body)
            if (!(await helper.checkPermission("61ea38244d09cf202a258fe9", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            //check and gán
            const upload = multer({
                storage: storage,
                fileFilter: function (req, file, cb) {
                    cb(null, true)
                },
            }).fields([
                { name: `image`, maxCount: 1 },
                { name: `icon`, maxCount: 1 },
            ])

            upload(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    console.error("A Multer error occurred when uploading.")
                } else if (err) {
                    console.error("An unknown error occurred when uploading." + err)
                } else {
                    let image = null
                    if (validator.isNotEmpty(req.files["image"])) {
                        const image_menu = req.files["image"][0]?.filename
                        image = image_menu
                    }
                    let icon = null
                    if (validator.isNotEmpty(req.files["icon"])) {
                        const icon_menu = req.files["icon"][0]?.filename
                        icon = icon_menu
                    }
                    //
                    const name = req.body.name
                    const link = req.body.link
                    const display_app = validator.tryParseBoolean(req.body.display_app)
                    const display_website = validator.tryParseBoolean(req.body.display_website)
                    const display_tree = validator.tryParseBoolean(req.body.display_tree)
                    const display_home = validator.tryParseBoolean(req.body.display_home)

                    const serial_number = validator.tryParseInt(req.body.serial_number)
                    let id_parent = req.body.id_parent
                    if (!validator.isNotEmpty(id_parent)) {
                        id_parent = null
                    }
                    let id_represent_category = req.body.id_represent_category
                    if (!validator.isNotEmpty(id_represent_category)) {
                        id_represent_category = null
                    }
                    let id_website_component = req.body.id_website_component
                    if (!validator.isNotEmpty(id_website_component)) {
                        id_website_component = null
                    }
                    let value = new ModelMenu({
                        name: name,
                        link: link,
                        id_parent: id_parent,
                        id_represent_category: id_represent_category,
                        id_website_component: id_website_component,
                        serial_number: serial_number,
                        display_app: display_app,
                        display_website: display_website,
                        display_tree: display_tree,
                        display_home: display_home,
                        image: image,
                        icon: icon,
                    })
                    await value.save()
                    return res.status(200).json("success")
                }
            })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //put
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61ea38244d09cf202a258fe9", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            //check and gán
            const upload = multer({
                storage: storage,
                fileFilter: function (req, file, cb) {
                    cb(null, true)
                },
            }).fields([
                { name: `image`, maxCount: 1 },
                { name: `icon`, maxCount: 1 },
            ])
            upload(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    console.error("A Multer error occurred when uploading.")
                } else if (err) {
                    console.error("An unknown error occurred when uploading." + err)
                } else {
                    const _id = req.body._id
                    const data_menu = await ModelMenu.findById(_id).lean()
                    if (!data_menu) {
                        return res.status(404).json(`Không tìm thấy menu cần chỉnh sửa`)
                    } else {
                        // console.log(req.body)
                        let check_delete_img_old = false
                        let check_delete_icon_old = false
                        const img_Old = data_menu?.image
                        const icon_Old = data_menu?.icon
                        let query = {}
                        //

                        if (validator.isNotEmpty(req.files?.image)) {
                            check_delete_img_old = true
                            const image_menu = req.files["image"][0]?.filename
                            query = {
                                ...query,
                                image: image_menu,
                            }
                        }
                        if (validator.isNotEmpty(req.body.check_delete_image)) {
                            const check_image = req.body.check_delete_image
                            if (parseInt(check_image) == 1) {
                                check_delete_img_old = true
                                query = {
                                    ...query,
                                    image: null,
                                }
                            }
                        }
                        if (validator.isNotEmpty(req.files?.icon)) {
                            check_delete_icon_old = true
                            const icon_menu = req.files["icon"][0]?.filename
                            query = {
                                ...query,
                                icon: icon_menu,
                            }
                        }
                        if (validator.isNotEmpty(req.body.check_delete_icon)) {
                            const check_icon = req.body.check_delete_icon
                            if (parseInt(check_icon) == 1) {
                                check_delete_icon_old = true
                                query = {
                                    ...query,
                                    icon: null,
                                }
                            }
                        }
                        //
                        if (validator.isNotEmpty(req.body.name)) {
                            query = { ...query, name: req.body.name }
                        }
                        //sửa link
                        query = { ...query, link: req.body.link }
                        // if (validator.isNotEmpty(req.body.link)) {
                        //     query = { ...query, link: req.body.link }
                        // }
                        if (validator.isNotEmpty(req.body.check_parent_category)) {
                            let parent_id = req.body.id_parent
                            if (!validator.isNotEmpty(parent_id)) {
                                parent_id = null
                            }
                            query = { ...query, id_parent: parent_id }
                        }
                        if (validator.isNotEmpty(req.body.check_id_represent_category)) {
                            let id_represent_category = req.body.id_represent_category
                            if (!validator.isNotEmpty(id_represent_category)) {
                                id_represent_category = null
                            }
                            query = { ...query, id_represent_category: id_represent_category }
                        }
                        if (validator.isNotEmpty(req.body.check_id_website_component)) {
                            let id_website_component = req.body.id_website_component
                            if (!validator.isNotEmpty(id_website_component)) {
                                id_website_component = null
                            }
                            query = { ...query, id_website_component: id_website_component }
                        }
                        if (validator.isNotEmpty(req.body.serial_number)) {
                            query = { ...query, serial_number: validator.tryParseInt(req.body.serial_number) }
                        }
                        //
                        if (validator.isNotEmpty(req.body.display_app)) {
                            query = { ...query, display_app: validator.tryParseBoolean(req.body.display_app) }
                        }
                        if (validator.isNotEmpty(req.body.display_website)) {
                            query = { ...query, display_website: validator.tryParseBoolean(req.body.display_website) }
                        }
                        if (validator.isNotEmpty(req.body.display_tree)) {
                            query = { ...query, display_tree: validator.tryParseBoolean(req.body.display_tree) }
                        }
                        if (validator.isNotEmpty(req.body.display_home)) {
                            query = { ...query, display_home: validator.tryParseBoolean(req.body.display_home) }
                        }
                        //
                        if (validator.isNotEmpty(_id) && validator.isObjectId(_id)) {
                            // console.log(query)
                            try {
                                // console.log(req.body)
                                const data_update = await ModelMenu.findByIdAndUpdate(_id, query, { new: true })
                                if (check_delete_img_old) {
                                    await validator.removeFile(validator.URL_IMAGE_MENU + "/" + img_Old)
                                }
                                if (check_delete_icon_old) {
                                    await validator.removeFile(validator.URL_IMAGE_MENU + "/" + icon_Old)
                                }
                                return res.json(data_update)
                            } catch (e) {
                                validator.throwError(e)
                                res.sendStatus(500)
                            }
                        } else {
                            res.status(400).json(`Có lỗi xảy ra vui lòng thử lại: Invalid id`)
                        }
                    }
                }
            })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //delete
    app.delete(prefixApi, helper.authenToken, async (req, res) => { 
        try {
            if (!(await helper.checkPermission("61ea38244d09cf202a258fe9", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const _id = req.body._id
            const data_delete = await ModelMenu.findByIdAndRemove(_id)
            if (data_delete) {
                return res.sendStatus(200)
            } else {
                return res.status(400).json(`Có lỗi xảy ra vui lòng thử lại!`)
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const getData = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi + "/client", async (req, res) => {
        try {
            var query = {}
            if (validator.isDefine(req.query.menu_type)) {
                query = { menu_type: req.query.menu_type }
            }
            const data = await ModelMenu.find(query)
            try {
                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < data[i].menu_content.length; j++) {
                        if (data[i].menu_type == "Category") {
                            const dataCate = await ModelCategory.findById(data[i].menu_content[j])
                            data[i].menu_content[j] = {
                                id_category: dataCate._id,
                                category_name: dataCate.category_name,
                                category_image: dataCate.category_image,
                            }
                        } else if (data[i].menu_type == "SuperCategory") {
                            const dataSuperCate = await ModelSuperCategory.findById(data[i].menu_content[j])
                            data[i].menu_content[j] = {
                                id_super_category: dataSuperCate._id,
                                super_category_name: dataSuperCate.super_category_name,
                            }
                        }
                    }
                }
                return res.json(data)
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng
}

export const update = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61ea38244d09cf202a258fe9", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            var arr_menu_content = []
            const id_menu = req.body.id_menu
            const dataMenu = await ModelMenu.findById(id_menu)
            if (!dataMenu) return res.status(400).send("Thất bại! Không tìm thấy menu")

            for (let i = 0; i < req.body.arrContent.length; i++) {
                if (req.body.menu_type == "Category") {
                    arr_menu_content.push(req.body.arrContent[i].id_category)
                } else if (req.body.menu_type == "SuperCategory") {
                    arr_menu_content.push(req.body.arrContent[i].id_super_category)
                }
            }
            try {
                const updateNew = await ModelMenu.findByIdAndUpdate(dataMenu._id, {
                    $set: {
                        menu_content: arr_menu_content,
                    },
                })
                return res.json(updateNew)
            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    //#endregion api lấy danh sách chức năng và nhóm người dùng
}
