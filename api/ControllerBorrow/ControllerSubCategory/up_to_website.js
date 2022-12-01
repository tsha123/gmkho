const prefixApi = "/api/subcategory/up-to-website"
import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import multer from "multer"
import path from "path"

import { ModelSubCategory } from "../../models/SubCategory.js"
import { ModelCategory } from "../../models/Category.js"
import { ModelWarrantyCombo } from "../../models/WarrantyCombo.js"
import { ModelPromotionCombo } from "../../models/PromotionCombo.js"

export const getDataToUpWebsite = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e6236e098025f521b9c7ce", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_subcategory = req.query.id_subcategory
            const dataSub = await ModelSubCategory.findById(id_subcategory)
            if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")
            const dataCategory = await ModelCategory.find()
            const id_category = dataSub.id_category

            const arr_category = load_parent_category(dataCategory, id_category)

            const dataPromotion = await ModelPromotionCombo.find()
            const dataWarranty = await ModelWarrantyCombo.find()

            return res.json({ dataSub: dataSub, dataCategory: arr_category, dataPromotion: dataPromotion, dataWarranty: dataWarranty })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

const load_parent_category = (arr, _id_parent, arrs = []) => {
    arr.forEach((element) => {
        if (element._id + "" == _id_parent + "") {
            arrs.push(element)
            load_parent_category(arr, element.id_parent_category, arrs)
        }
    })
    return arrs
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, validator.URL_IMAGE_PRODUCT)
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname).replace(path.extname(file.originalname), "-") + Date.now() + path.extname(file.originalname))
    },
})
const upload_image_branch = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/jfif") {
            cb(null, true)
        } else {
            return cb(new Error("Only image are allowed!"))
        }
    },
}).fields([{ name: "image_product" }])

export const edit_content = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e6236e098025f521b9c7ce", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            await upload_image_branch(req, res, async (err) => {
                try {
                    if (err) return res.status(400).send(err)
                    const id_subcategory = req.body.id_subcategory
                    const dataSub = await ModelSubCategory.findById(id_subcategory)
                    if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phảm")
                    var arrImage = dataSub.subcategory_images // mảng ảnh cũ
                    const arr_image_delete = JSON.parse(req.body.arr_image_delete)

                    for (
                        let i = 0;
                        i < arr_image_delete.length;
                        i++ // xóa ảnh cần xóa
                    ) {
                        for (let j = 0; j < arrImage.length; j++) {
                            if (arrImage[j] == arr_image_delete[i]) {
                                arrImage.splice(j, 1)
                                j--
                            }
                        }
                    }

                    if (typeof req.files != "undefined" && req.files != null && typeof req.files.image_product != "undefined") {
                        for (
                            let i = 0;
                            i < req.files.image_product.length;
                            i++ // thêm ảnh từ mảng mới up lên
                        ) {
                            arrImage.push(req.files.image_product[i].filename)
                        }
                    }
                    try {
                        const updateContent = await ModelSubCategory.findByIdAndUpdate(id_subcategory, {
                            subcategory_images: arrImage, // ảnh sản phẩm
                            subcategory_specifications: JSON.parse(req.body.subcategory_specifications),
                            subcategory_options: JSON.parse(req.body.subcategory_options),
                            subcategory_sale_status: req.body.subcategory_sale_status,
                            id_combo_promotion: req.body.id_combo_promotion.length == 0 ? null : req.body.id_combo_promotion,
                            id_combo_warranty: req.body.id_combo_warranty.length == 0 ? null : req.body.id_combo_warranty,
                            subcategory_replace_name: req.body.subcategory_replace_name,
                            subcategory_slug_link: validator.stringToSlug(req.body.subcategory_replace_name),
                            subcategory_tags: req.body.subcategory_tags,
                            subcategory_seo_image: req.body.subcategory_seo_image,
                            subcategory_seo_description: req.body.subcategory_seo_description,
                            subcategory_content: req.body.subcategory_content.toString(),
                            subcategory_video: req.body.subcategory_video,
                            subcategory_related: JSON.parse(req.body.subcategory_related),
                            subcategory_status: 1,
                        })

                        return res.json(updateContent)
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
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const edit_stt_status = async (app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.put(prefixApi + "/stt_status", helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("61e6236e098025f521b9c7ce", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const id_subcategory = req.body.id_subcategory
            const dataSub = await ModelSubCategory.findById(id_subcategory)
            if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phảm")
            try {
                const updateNew = await ModelSubCategory.findByIdAndUpdate(dataSub._id, {
                    subcategory_status: req.body.subcategory_status,
                    subcategory_stt: req.body.subcategory_stt,
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
}
