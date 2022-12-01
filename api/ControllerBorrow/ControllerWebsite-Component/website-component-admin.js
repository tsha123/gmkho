//6272511fda540000f1000fc2
import sanitize from 'mongo-sanitize'
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelCategory } from '../../models/Category.js'
import { ModelSubCategory } from '../../models/SubCategory.js'
import { Model_Website_Component } from '../../models/WebsiteComponent.js'
const prefixApi = '/api/website-component'
const FIXED_LIMIT = 10
import path from 'path'
import multer from 'multer'

var url_image = 'public/images/images_website_component'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, url_image)
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname).replace(path.extname(file.originalname), '-') + Date.now() + path.extname(file.originalname))
    },
})

export const management = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission('6272511fda540000f1000fc2', req.body._caller.id_employee_group))) return res.status(403).send('Thất bại! Bạn không có quyền truy cập chức năng này')
            const data = await Model_Website_Component.find().lean()
            if (validator.isDefine(data)) {
                for (let i = 0; i < data.length; i++) {
                    //sản phẩm flash sale
                    const arr_id_flash_sale = data[i]?.Content?.home_flash_sale_products?.Products
                    let arr_product_flash_sale = []
                    if (validator.isNotEmpty(arr_id_flash_sale) && arr_id_flash_sale.length > 0) {
                        for (let j = 0; j < arr_id_flash_sale.length; j++) {
                            const data_product = await ModelSubCategory.findById(`${arr_id_flash_sale[j]}`)
                            // if (data_product?.Active == 1 || data_product?.Active == true) {
                            arr_product_flash_sale.push(data_product)
                            // }
                        }
                    }
                    data[i] = {
                        ...data[i],
                        data_product_flash_sale: arr_product_flash_sale,
                    }

                    if (validator.isDefine(data[i].Content.menu_build_pc)) {
                        for (let j = 0; j < data[i].Content.menu_build_pc.array_category.length; j++) {
                            const data_category = await ModelCategory.findById(data[i].Content.menu_build_pc.array_category[j])
                            data[i].Content.menu_build_pc.array_category[j] = data_category
                        }
                    }
                    if (validator.isDefine(data[i].Content.list_subcategory_build_pc)) {
                        for (let j = 0; j < data[i].Content.list_subcategory_build_pc.array_subcategory.length; j++) {
                            const data_subcategory = await ModelSubCategory.findById(data[i].Content.list_subcategory_build_pc.array_subcategory[j])
                            data[i].Content.list_subcategory_build_pc.array_subcategory[j] = data_subcategory
                        }
                    }
                }
                return res.json({ data: data })
            } else {
                return res.json({ data: null })
            }
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send('Thất bại! Có lỗi xảy ra')
        }
    })
    app.put(prefixApi + '/:component', helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission('6272511fda540000f1000fc2', req.body._caller.id_employee_group))) return res.status(403).send('Thất bại! Bạn không có quyền truy cập chức năng này')
            const component = req.params.component
            url_image = 'public/images/images_website_component'
            switch (component) {
                case `title`: {
                    let upload = multer({ storage: storage, fileFilter: null }).array('image_title', 1)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //
                        const title = req.body.title.trim()
                        if (title.length == 0) return res.status(400).send('Thất bại! Tiêu đề không được để trống')
                        const img_old_title = _DATA?.Content?.Title?.Content?.Image || null
                        var newValue = _DATA.Content
                        newValue.Title.Content.Title = title
                        let check_delete_img_old = false
                        if (req.files.length > 0) {
                            check_delete_img_old = true
                            newValue.Title.Content.Image = req.files[0].filename
                        }
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + img_old_title)
                            }
                            return res.json(dataUpdate)
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }
                case `seo-image`: {
                    let upload = multer({ storage: storage, fileFilter: null }).array('seo_image', 1)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //
                        const img_old = _DATA?.Content?.SEO_image?.Content || null
                        var newValue = _DATA.Content
                        let check_delete_img_old = false
                        if (req.files.length > 0) {
                            check_delete_img_old = true
                            newValue.SEO_image.Content = req.files[0].filename
                        }
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + img_old)
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }
                case `seo-image-alt`: {
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const seo_image_alt = req.body.seo_image_alt.trim()
                    var newValue = _DATA.Content
                    newValue.SEO_image_alt.Content = seo_image_alt
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `seo-description`: {
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const seo_description = req.body.seo_description.trim()
                    var newValue = _DATA.Content
                    newValue.SEO_description.Content = seo_description
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `seo-title`: {
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const seo_title = req.body.seo_title.trim()
                    var newValue = _DATA.Content
                    newValue.SEO_title.Content = seo_title
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `seo-url`: {
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const seo_url = req.body.seo_url.trim()
                    var newValue = _DATA.Content
                    newValue.SEO_url.Content = seo_url
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `seo-type`: {
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const seo_type = req.body.seo_type.trim()
                    var newValue = _DATA.Content
                    newValue.SEO_type.Content = seo_type
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `operate-time`: {
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const operate_time = req.body.operate_time.trim()
                    var newValue = _DATA.Content
                    newValue.Operate_Time.Content = operate_time
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `hotline`: {
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const hotline = req.body.hotline.trim()
                    var newValue = _DATA.Content
                    newValue.Hotline.Content = hotline
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `Footer_Branch`: {
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let branch = []
                    if (validator.isNotEmpty(req.body.arrBranch)) {
                        branch = req.body.arrBranch
                    }
                    var newValue = _DATA.Content
                    newValue.Footer_Branch.Content = branch
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `footer_introduction`: {
                    const _key_update = `footer_introduction`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let DATA_UPDATE = req.body.receive_data
                    if (!validator.isDefine(DATA_UPDATE)) {
                        DATA_UPDATE = []
                    }
                    var newValue = _DATA.Content
                    newValue[_key_update].Content = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `footer_suport`: {
                    const _key_update = `footer_suport`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let DATA_UPDATE = req.body.receive_data
                    if (!validator.isDefine(DATA_UPDATE)) {
                        DATA_UPDATE = []
                    }
                    var newValue = _DATA.Content
                    newValue[_key_update].Content = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `footer_common_policy`: {
                    const _key_update = `footer_common_policy`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let DATA_UPDATE = req.body.receive_data
                    if (!validator.isDefine(DATA_UPDATE)) {
                        DATA_UPDATE = []
                    }
                    var newValue = _DATA.Content
                    newValue[_key_update].Content = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `footer_promotion`: {
                    const _key_update = `footer_promotion`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let DATA_UPDATE = req.body.receive_data
                    if (!validator.isDefine(DATA_UPDATE)) {
                        DATA_UPDATE = []
                    }
                    var newValue = _DATA.Content
                    newValue[_key_update].Content = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `footer_description`: {
                    const _key_update = `footer_description`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let DATA_UPDATE = req.body.receive_data
                    if (!validator.isDefine(DATA_UPDATE)) {
                        DATA_UPDATE = null
                    }
                    var newValue = _DATA.Content
                    newValue[_key_update].Content = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `footer_facebook`: {
                    const _key_update = `footer_facebook`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let DATA_UPDATE = req.body.receive_data
                    if (!validator.isDefine(DATA_UPDATE)) {
                        DATA_UPDATE = null
                    }
                    var newValue = _DATA.Content
                    newValue[_key_update].Content = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `footer_note`: {
                    const _key_update = `footer_note`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let DATA_UPDATE = req.body.receive_data
                    if (!validator.isDefine(DATA_UPDATE)) {
                        DATA_UPDATE = null
                    }
                    var newValue = _DATA.Content
                    newValue[_key_update].Content = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `footer_business_license`: {
                    const _key_update = `footer_business_license`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    let DATA_UPDATE = req.body.receive_data
                    if (!validator.isDefine(DATA_UPDATE)) {
                        DATA_UPDATE = null
                    }
                    var newValue = _DATA.Content
                    newValue[_key_update].Content = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }

                case `home_image_banner_flash_sale`: {
                    const _key_update = `home_image_banner_flash_sale`
                    let upload = multer({ storage: storage, fileFilter: null }).array('home_image_banner_flash_sale', 1)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //
                        const img_old = _DATA.Content[_key_update].Content || null
                        var newValue = _DATA.Content
                        let check_delete_img_old = false
                        if (req.files.length > 0) {
                            check_delete_img_old = true
                            newValue[_key_update].Content = req.files[0].filename
                        }
                        // else {
                        //     return res.status(404).json(`Ảnh tải lên không thành công hoặc chưa có ảnh`)
                        // }
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + img_old)
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }
                case `mobile_home_image_banner_flash_sale`: {
                    const _key_update = `mobile_home_image_banner_flash_sale`
                    let upload = multer({ storage: storage, fileFilter: null }).array('mobile_home_image_banner_flash_sale', 1)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //
                        const img_old = _DATA.Content[_key_update].Content || null
                        var newValue = _DATA.Content
                        let check_delete_img_old = false
                        if (req.files.length > 0) {
                            check_delete_img_old = true
                            newValue[_key_update].Content = req.files[0].filename
                        }
                        // else {
                        //     return res.status(404).json(`Ảnh tải lên không thành công hoặc chưa có ảnh`)
                        // }
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + img_old)
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }

                case `logo_header`: {
                    const _key_update = `logo_header`
                    let upload = multer({ storage: storage, fileFilter: null }).array('logo_header', 1)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //
                        const img_old = _DATA.Content[_key_update].Content || null
                        var newValue = _DATA.Content
                        let check_delete_img_old = false
                        if (req.files.length > 0) {
                            check_delete_img_old = true
                            newValue[_key_update].Content = req.files[0].filename
                        }
                        // else {
                        //     return res.status(404).json(`Ảnh tải lên không thành công hoặc chưa có ảnh`)
                        // }
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + img_old)
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }
                case `mobile_logo_header`: {
                    const _key_update = `mobile_logo_header`
                    let upload = multer({ storage: storage, fileFilter: null }).array('mobile_logo_header', 1)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //
                        const img_old = _DATA.Content[_key_update].Content || null
                        var newValue = _DATA.Content
                        let check_delete_img_old = false
                        if (req.files.length > 0) {
                            check_delete_img_old = true
                            newValue[_key_update].Content = req.files[0].filename
                        }
                        // else {
                        //     return res.status(404).json(`Ảnh tải lên không thành công hoặc chưa có ảnh`)
                        // }
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + img_old)
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }
                case `home_flash_sale_products`: {
                    const _key_update = `home_flash_sale_products`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const DATA_UPDATE = JSON.parse(req.body.receive_data)
                    var newValue = _DATA.Content
                    newValue[_key_update].Products = DATA_UPDATE
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                Content: newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `home_slide_banner`: {
                    const _key_update = `home_slide_banner`
                    let upload = multer({ storage: storage, fileFilter: null }).array('home_slide_banner', 100)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //xử lý chuỗi ảnh
                        const arr_receive_data = JSON.parse(req.body.receive_data)
                        var arrNew = []
                        let check_delete_img_old = false
                        var arr_old_image = []
                        for (let i = 0; i < arr_receive_data.length; i++) {
                            arrNew[i] = {
                                title: arr_receive_data[i].title,
                                link: arr_receive_data[i].link,
                                image: arr_receive_data[i].image,
                                Origin: arr_receive_data[i].image,
                            }
                            // for (let j = 0; j < _DATA.Content[_key_update].Content.length; j++) {
                            //     if (arr_receive_data[i].image != _DATA.Content[_key_update].Content[j].image) {
                            //         //gán check img old và cho tên ảnh cũ vào mảng
                            //         check_delete_img_old = true
                            //         arr_old_image.push(arrNew[i].image)
                            //     }
                            // }
                        }
                        for (let i = 0; i < req.files.length; i++) {
                            for (let j = 0; j < arrNew.length; j++) {
                                if (req.files[i].originalname == arrNew[j].Origin) {
                                    //
                                    arrNew[j].image = req.files[i].filename
                                    break
                                }
                            }
                        }
                        for (let i = 0; i < arrNew.length; i++) {
                            delete arrNew[i].Origin
                        }
                        var newValue = _DATA.Content
                        newValue[_key_update].Content = arrNew
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                for (let i = 0; i < arr_old_image.length; i++) {
                                    await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + arr_old_image[i])
                                }
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }
                case `mobile_home_slide_banner_1`: {
                    const _key_update = `mobile_home_slide_banner_1`
                    let upload = multer({ storage: storage, fileFilter: null }).array('mobile_home_slide_banner_1', 100)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //xử lý chuỗi ảnh
                        const arr_receive_data = JSON.parse(req.body.receive_data)
                        var arrNew = []
                        let check_delete_img_old = false
                        var arr_old_image = []
                        for (let i = 0; i < arr_receive_data.length; i++) {
                            arrNew[i] = {
                                title: arr_receive_data[i].title,
                                link: arr_receive_data[i].link,
                                image: arr_receive_data[i].image,
                                Origin: arr_receive_data[i].image,
                            }
                            // for (let j = 0; j < _DATA.Content[_key_update].Content.length; j++) {
                            //     if (arr_receive_data[i].image != _DATA.Content[_key_update].Content[j].image) {
                            //         //gán check img old và cho tên ảnh cũ vào mảng
                            //         check_delete_img_old = true
                            //         arr_old_image.push(arrNew[i].image)
                            //     }
                            // }
                        }
                        for (let i = 0; i < req.files.length; i++) {
                            for (let j = 0; j < arrNew.length; j++) {
                                if (req.files[i].originalname == arrNew[j].Origin) {
                                    //
                                    arrNew[j].image = req.files[i].filename
                                    break
                                }
                            }
                        }
                        for (let i = 0; i < arrNew.length; i++) {
                            delete arrNew[i].Origin
                        }
                        var newValue = _DATA.Content
                        newValue[_key_update].Content = arrNew
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                for (let i = 0; i < arr_old_image.length; i++) {
                                    await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + arr_old_image[i])
                                }
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }
                case `mobile_home_slide_banner_2`: {
                    const _key_update = `mobile_home_slide_banner_2`
                    let upload = multer({ storage: storage, fileFilter: null }).array('mobile_home_slide_banner_2', 100)
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        //xử lý chuỗi ảnh
                        const arr_receive_data = JSON.parse(req.body.receive_data)
                        var arrNew = []
                        let check_delete_img_old = false
                        var arr_old_image = []
                        for (let i = 0; i < arr_receive_data.length; i++) {
                            arrNew[i] = {
                                title: arr_receive_data[i].title,
                                link: arr_receive_data[i].link,
                                image: arr_receive_data[i].image,
                                Origin: arr_receive_data[i].image,
                            }
                            // for (let j = 0; j < _DATA.Content[_key_update].Content.length; j++) {
                            //     if (arr_receive_data[i].image != _DATA.Content[_key_update].Content[j].image) {
                            //         //gán check img old và cho tên ảnh cũ vào mảng
                            //         check_delete_img_old = true
                            //         arr_old_image.push(arrNew[i].image)
                            //     }
                            // }
                        }
                        for (let i = 0; i < req.files.length; i++) {
                            for (let j = 0; j < arrNew.length; j++) {
                                if (req.files[i].originalname == arrNew[j].Origin) {
                                    //
                                    arrNew[j].image = req.files[i].filename
                                    break
                                }
                            }
                        }
                        for (let i = 0; i < arrNew.length; i++) {
                            delete arrNew[i].Origin
                        }
                        var newValue = _DATA.Content
                        newValue[_key_update].Content = arrNew
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    Content: newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                for (let i = 0; i < arr_old_image.length; i++) {
                                    await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + arr_old_image[i])
                                }
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }
                case `home_banner_gaming_market_01`: {
                    const _key_update = `home_banner_gaming_market_01`
                    const upload = multer({ storage: storage, fileFilter: null }).fields([
                        { name: `banner_00_image`, maxCount: 1 },
                        { name: `banner_01_image`, maxCount: 1 },
                        { name: `banner_02_image`, maxCount: 1 },
                        { name: `banner_03_image`, maxCount: 1 },
                        { name: `banner_04_image`, maxCount: 1 },
                        { name: `banner_05_image`, maxCount: 1 },
                        { name: `banner_06_image`, maxCount: 1 },
                    ])
                    upload(req, res, async (err) => {
                        if (err) {
                            validator.throwError(err)
                            return res.status(400).send('Thất bại! Ảnh không phù hợp')
                        }
                        //
                        const _id = req.body._id
                        const _DATA = await Model_Website_Component.findById(_id)
                        if (!validator.isDefine(_DATA)) {
                            return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                        }
                        var arr_old_image = []
                        var check_delete_img_old = false
                        var newValue = _DATA.Content[_key_update]
                        //banner_00
                        const name_image_banner_00 = req.body.banner_00_name_image
                        const img_old_banner_00 = _DATA.Content[_key_update].banner_00.image || null
                        const files_image_banner_00 = req.files['banner_00_image']
                        let banner_00_image = name_image_banner_00
                        if (files_image_banner_00) {
                            banner_00_image = req.files['banner_00_image'][0]?.filename
                            //
                            check_delete_img_old = true
                            arr_old_image.push(img_old_banner_00)
                            newValue.banner_00 = {
                                title: req.body.banner_00_title,
                                link: req.body.banner_00_link,
                                image: banner_00_image,
                            }
                        } else {
                            newValue.banner_00 = {
                                title: req.body.banner_00_title,
                                link: req.body.banner_00_link,
                                image: banner_00_image,
                            }
                        }
                        //banner_01
                        const name_image_banner_01 = req.body.banner_01_name_image
                        const img_old_banner_01 = _DATA.Content[_key_update].banner_01.image || null
                        const files_image_banner_01 = req.files['banner_01_image']
                        let banner_01_image = name_image_banner_01
                        if (files_image_banner_01) {
                            banner_01_image = req.files['banner_01_image'][0]?.filename
                            //
                            check_delete_img_old = true
                            arr_old_image.push(img_old_banner_01)
                            newValue.banner_01 = {
                                title: req.body.banner_01_title,
                                link: req.body.banner_01_link,
                                image: banner_01_image,
                            }
                        } else {
                            newValue.banner_01 = {
                                title: req.body.banner_01_title,
                                link: req.body.banner_01_link,
                                image: banner_01_image,
                            }
                        }
                        //banner_02
                        const name_image_banner_02 = req.body.banner_02_name_image
                        const img_old_banner_02 = _DATA.Content[_key_update].banner_02.image || null
                        const files_image_banner_02 = req.files['banner_02_image']
                        let banner_02_image = name_image_banner_02
                        if (files_image_banner_02) {
                            banner_02_image = req.files['banner_02_image'][0]?.filename
                            check_delete_img_old = true
                            arr_old_image.push(img_old_banner_02)
                            newValue.banner_02 = {
                                title: req.body.banner_02_title,
                                link: req.body.banner_02_link,
                                image: banner_02_image,
                            }
                        } else {
                            newValue.banner_02 = {
                                title: req.body.banner_02_title,
                                link: req.body.banner_02_link,
                                image: banner_02_image,
                            }
                        }
                        //banner_03
                        const name_image_banner_03 = req.body.banner_03_name_image
                        const img_old_banner_03 = _DATA.Content[_key_update].banner_03.image || null
                        const files_image_banner_03 = req.files['banner_03_image']
                        let banner_03_image = name_image_banner_03
                        if (files_image_banner_03) {
                            banner_03_image = req.files['banner_03_image'][0]?.filename
                            check_delete_img_old = true
                            arr_old_image.push(img_old_banner_03)
                            newValue.banner_03 = {
                                title: req.body.banner_03_title,
                                link: req.body.banner_03_link,
                                image: banner_03_image,
                            }
                        } else {
                            newValue.banner_03 = {
                                title: req.body.banner_03_title,
                                link: req.body.banner_03_link,
                                image: banner_03_image,
                            }
                        }
                        //banner_04
                        const name_image_banner_04 = req.body.banner_04_name_image
                        const img_old_banner_04 = _DATA.Content[_key_update].banner_04.image || null
                        const files_image_banner_04 = req.files['banner_04_image']
                        let banner_04_image = name_image_banner_04
                        if (files_image_banner_04) {
                            banner_04_image = req.files['banner_04_image'][0]?.filename
                            check_delete_img_old = true
                            arr_old_image.push(img_old_banner_04)
                            newValue.banner_04 = {
                                title: req.body.banner_04_title,
                                link: req.body.banner_04_link,
                                image: banner_04_image,
                            }
                        } else {
                            newValue.banner_04 = {
                                title: req.body.banner_04_title,
                                link: req.body.banner_04_link,
                                image: banner_04_image,
                            }
                        }
                        //banner_05
                        const name_image_banner_05 = req.body.banner_05_name_image
                        const img_old_banner_05 = _DATA.Content[_key_update].banner_05.image || null
                        const files_image_banner_05 = req.files['banner_05_image']
                        let banner_05_image = name_image_banner_05
                        if (files_image_banner_05) {
                            banner_05_image = req.files['banner_05_image'][0]?.filename
                            check_delete_img_old = true
                            arr_old_image.push(img_old_banner_05)
                            newValue.banner_05 = {
                                title: req.body.banner_05_title,
                                link: req.body.banner_05_link,
                                image: banner_05_image,
                            }
                        } else {
                            newValue.banner_05 = {
                                title: req.body.banner_05_title,
                                link: req.body.banner_05_link,
                                image: banner_05_image,
                            }
                        }
                        //banner_06
                        const name_image_banner_06 = req.body.banner_06_name_image
                        const img_old_banner_06 = _DATA.Content[_key_update].banner_06.image || null
                        const files_image_banner_06 = req.files['banner_06_image']
                        let banner_06_image = name_image_banner_06
                        if (files_image_banner_06) {
                            banner_06_image = req.files['banner_06_image'][0]?.filename
                            check_delete_img_old = true
                            arr_old_image.push(img_old_banner_06)
                            newValue.banner_06 = {
                                title: req.body.banner_06_title,
                                link: req.body.banner_06_link,
                                image: banner_06_image,
                            }
                        } else {
                            newValue.banner_06 = {
                                title: req.body.banner_06_title,
                                link: req.body.banner_06_link,
                                image: banner_06_image,
                            }
                        }
                        //update
                        try {
                            const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                                $set: {
                                    'Content.home_banner_gaming_market_01': newValue,
                                },
                            })
                            if (check_delete_img_old) {
                                for (let i = 0; i < arr_old_image.length; i++) {
                                    await validator.removeFile(validator.URL_IMAGE_WEBSITE_COMPONENT + '/' + arr_old_image[i])
                                }
                                return res.json(dataUpdate)
                            } else {
                                return res.json(dataUpdate)
                            }
                        } catch (e) {
                            validator.throwError(e)
                            return res.status(500).send('Thất bại! Có lỗi xảy ra')
                        }
                    })
                    break
                }

                case `contact_info`: {
                    const _key_update = `contact_info`
                    const _id = req.body._id
                    const _DATA = await Model_Website_Component.findById(_id)
                    if (!validator.isDefine(_DATA)) {
                        return res.status(404).json(`Không tìm thấy nội dung cần được chỉnh sửa`)
                    }
                    //
                    const newValue = {
                        Active: true,
                        Description: 'Thông tin liên hệ',
                        Title: 'Thông tin liên hệ',
                        name_company: req.body.name_company,
                        address: req.body.address,
                        hotline: req.body.hotline,
                        email: req.body.email,
                    }
                    try {
                        const dataUpdate = await Model_Website_Component.findByIdAndUpdate(_DATA._id, {
                            $set: {
                                'Content.contact_info': newValue,
                            },
                        })
                        return res.json(dataUpdate)
                    } catch (e) {
                        validator.throwError(e)
                        return res.status(500).send('Thất bại! Có lỗi xảy ra')
                    }
                    break
                }
                case `menu_build_pc`: {
                    await update_menu_build_pc(req, res)
                    break
                }
                case `list_subcategory_build_pc`: {
                    await update_list_subcategory_build_pc(req, res)
                    break
                }
                case `banner_build_pc`: {
                    await update_banner_build_pc(req, res)
                    break
                }
                case `banner_news`: {
                    await update_banner_news(req, res)
                    break
                }
                default:
                    return res.status(404).json(`Không tìm thấy nội dung cần chỉnh sửa - Vui lòng thử lại hoặc liên hệ với bộ phận kỹ thuật!`)
            }
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send('Thất bại! Có lỗi xảy ra')
        }
    })
}

const update_menu_build_pc = async (req, res) => {
    try {
        const id_menu = req.body.id_menu
        const array_category = JSON.parse(req.body.array_category)

        const data_menu = await Model_Website_Component.findById(id_menu)
        if (!data_menu) return res.status(400).send(`Thất bại! Không tìm thấy menu`)
        for (let i = 0; i < array_category.length; i++) {
            if (!validator.ObjectId.isValid(array_category[i])) return res.status(400).send(`Thất bại! Có lỗi xảy ra`)
            array_category[i] = validator.ObjectId(array_category[i])
        }

        for (let i = 0; i < array_category.length; i++) {
            for (let j = i + 1; j < array_category.length; j++) {
                if (array_category[i].toString() == array_category[j].toString()) {
                    array_category.splice(j, 1)
                    j--
                }
            }
        }
        await Model_Website_Component.findByIdAndUpdate(data_menu._id, {
            Content: {
                ...data_menu.Content,
                menu_build_pc: {
                    ...data_menu.Content.menu_build_pc,
                    array_category: array_category,
                },
            },
        })
        return res.json('Success')
    } catch (e) {
        validator.throwError(e)
        return res.status(500).send('Thất bại! Có lỗi xảy ra')
    }
}

const update_list_subcategory_build_pc = async (req, res) => {
    try {
        const id_menu = req.body.id_menu
        const array_subcategory = JSON.parse(req.body.array_subcategory)

        const data_menu = await Model_Website_Component.findById(id_menu)
        if (!data_menu) return res.status(400).send(`Thất bại! Không tìm thấy menu`)
        for (let i = 0; i < array_subcategory.length; i++) {
            if (!validator.ObjectId.isValid(array_subcategory[i])) return res.status(400).send(`Thất bại! Có lỗi xảy ra`)
            array_subcategory[i] = validator.ObjectId(array_subcategory[i])
        }

        for (let i = 0; i < array_subcategory.length; i++) {
            for (let j = i + 1; j < array_subcategory.length; j++) {
                if (array_subcategory[i].toString() == array_subcategory[j].toString()) {
                    array_subcategory.splice(j, 1)
                    j--
                }
            }
        }
        await Model_Website_Component.findByIdAndUpdate(data_menu._id, {
            Content: {
                ...data_menu.Content,
                list_subcategory_build_pc: {
                    ...data_menu.Content.list_subcategory_build_pc,
                    array_subcategory: array_subcategory,
                },
            },
        })
        return res.json('Success')
    } catch (e) {
        validator.throwError(e)
        return res.status(500).send('Thất bại! Có lỗi xảy ra')
    }
}

const update_banner_build_pc = async (req, res) => {
    try {
        url_image = 'public/images/images_website_component'
        multer({
            storage: storage,
            fileFilter: function (req, file, cb) {
                cb(null, true)
            },
        }).fields([{ name: 'image_product' }])(req, res, async (err) => {
            try {
                if (err) return res.status(400).send(err)
                const id_menu = req.body.id_menu
                const data_menu = await Model_Website_Component.findById(id_menu)
                if (!data_menu) return res.status(400).send(`Thất bại! Không tìm thấy menu`)
                const arrImage = []
                const old_images = JSON.parse(req.body.old_images)
                if (typeof req.files != 'undefined' && req.files != null && typeof req.files.image_product != 'undefined') {
                    for (let i = 0; i < req.files.image_product.length; i++) {
                        // thêm ảnh từ mảng mới up lên
                        arrImage.push(req.files.image_product[i].filename)
                    }
                }
                for (let i = 0; i < old_images.length; i++) {
                    // thêm ảnh từ mảng mới up lên
                    arrImage.push(old_images[i])
                }

                await Model_Website_Component.findByIdAndUpdate(data_menu._id, {
                    Content: {
                        ...data_menu.Content,
                        banner_build_pc: {
                            ...data_menu.Content.banner_build_pc,
                            array_images: arrImage,
                        },
                    },
                })

                return res.json('success')
            } catch (e) {
                console.error('____', e)
                return res.status(500).send('Thất bại! Có lỗi xảy ra')
            }
        })
    } catch (e) {
        validator.throwError(e)
        return res.status(500).send('Thất bại! Có lỗi xảy ra')
    }
}

const update_banner_news = async (req, res) => {
    try {
        url_image = 'public/images/images_website_component'
        multer({
            storage: storage,
            fileFilter: function (req, file, cb) {
                cb(null, true)
            },
        }).fields([{ name: 'image_product' }])(req, res, async (err) => {
            try {
                if (err) return res.status(400).send(err)
                const id_menu = req.body.id_menu
                const data_menu = await Model_Website_Component.findById(id_menu)
                if (!data_menu) return res.status(400).send(`Thất bại! Không tìm thấy menu`)
                const arrImage = []
                const old_images = JSON.parse(req.body.old_images)
                if (typeof req.files != 'undefined' && req.files != null && typeof req.files.image_product != 'undefined') {
                    for (let i = 0; i < req.files.image_product.length; i++) {
                        // thêm ảnh từ mảng mới up lên
                        arrImage.push(req.files.image_product[i].filename)
                    }
                }
                for (let i = 0; i < old_images.length; i++) {
                    // thêm ảnh từ mảng mới up lên
                    arrImage.push(old_images[i])
                }

                await Model_Website_Component.findByIdAndUpdate(data_menu._id, {
                    Content: {
                        ...data_menu.Content,
                        banner_news: {
                            ...data_menu.Content.banner_news,
                            array_images: arrImage,
                        },
                    },
                })

                return res.json('success')
            } catch (e) {
                console.error('____', e)
                return res.status(500).send('Thất bại! Có lỗi xảy ra')
            }
        })
    } catch (e) {
        validator.throwError(e)
        return res.status(500).send('Thất bại! Có lỗi xảy ra')
    }
}
