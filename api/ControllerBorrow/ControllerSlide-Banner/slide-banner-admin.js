import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { Model_Slide_Banner } from "../../models/Slide-banner.js"

//
const prefixApi = "/api/slide-banner-admin"
const prefixApi_client = "/api/slide-banner-client"
const DEFAULT_LIMIT = validator.DEFAULT_LIMIT
//
import path from "path"
import multer from "multer"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/images_slide_banner")
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname).replace(path.extname(file.originalname), "-") + Date.now() + path.extname(file.originalname))
    },
})

export const management = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            // if (!(await helper.checkPermission("6272511fda540000f1000fc2", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            let limit = DEFAULT_LIMIT
            let page = 1
            if (validator.isNotEmpty(req.query.page)) {
                page = Math.abs(validator.tryParseInt(req.query.page)) || 1
            }
            if (validator.isNotEmpty(req.query.limit)) {
                limit = Math.abs(validator.tryParseInt(req.query.limit)) || DEFAULT_LIMIT
                if (limit > validator.limit_query || limit == 0) {
                    limit = DEFAULT_LIMIT
                }
            }
            let query = {}

            let sort_conditions = {
                _id: -1,
            }
            if (validator.isNotEmpty(req.query.key)) {
                query = {
                    ...query,
                    Title: { $regex: ".*" + req.query.key + ".*", $options: "$i" },
                }
            }
            let data = await Model_Slide_Banner.find(query)
                .sort(sort_conditions)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
            let count = await Model_Slide_Banner.find(query).countDocuments()
            const object = {
                data: data,
                total: count,
                limit: limit,
                page: page,
            }
            return res.json(object)
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        try {
            let upload = multer({ storage: storage, fileFilter: null }).array("image_slide_banner", 100)
            upload(req, res, async (err) => {
                if (err) {
                    validator.throwError(err)
                    return res.status(400).send("Thất bại! Ảnh không phù hợp")
                }
                //
                const _id = req.body._id
                let _DATA = await Model_Slide_Banner.findById(_id).lean()
                // console.log(_DATA)
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
                    // for (let j = 0; j < _DATA.SlideBanner.length; j++) {
                    //     if (arr_receive_data[i].image != _DATA.SlideBanner[j].image) {
                    //         //gán check img old và cho tên ảnh cũ vào mảng
                    //         check_delete_img_old = true
                    //         arr_old_image.push(_DATA.SlideBanner[j].image)
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
                const dataUpdate = await Model_Slide_Banner.findByIdAndUpdate(_id, {
                    Title: req.body.Title,
                    Description: req.body.Description,
                    SlideBanner: arrNew,
                })
                if (check_delete_img_old) {
                    for (let i = 0; i < arr_old_image.length; i++) {
                        await validator.removeFile(validator.URL_IMAGE_SLIDE + "/" + arr_old_image[i])
                    }
                    // res.status(200).json(`OK`)
                    return res.json(dataUpdate)
                } else {
                    // res.status(200).json(`OK`)
                    return res.json(dataUpdate)
                }
            })
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        try {
            let upload = multer({ storage: storage, fileFilter: null }).array("image_slide_banner", 100)
            upload(req, res, async (err) => {
                if (err) {
                    validator.throwError(err)
                    return res.status(400).send("Thất bại! Ảnh không phù hợp")
                }
                //xử lý chuỗi ảnh
                const arr_receive_data = JSON.parse(req.body.receive_data)
                // console.log(arr_receive_data)
                var arrNew = []
                let check_delete_img_old = false
                var arr_old_image = []
                // console.log(_DATA.SlideBanner, typeof _DATA.SlideBanner)
                for (let i = 0; i < arr_receive_data.length; i++) {
                    arrNew[i] = {
                        title: arr_receive_data[i].title,
                        link: arr_receive_data[i].link,
                        image: arr_receive_data[i].image,
                        Origin: arr_receive_data[i].image,
                    }
                    // for (let j = 0; j < _DATA.SlideBanner.length; j++) {
                    //     if (arr_receive_data[i].image != _DATA.SlideBanner[j].image) {
                    //         //gán check img old và cho tên ảnh cũ vào mảng
                    //         check_delete_img_old = true
                    //         arr_old_image.push(_DATA.SlideBanner[j].image)
                    //     }
                    // }
                }
                for (let i = 0; i < req.files.length; i++) {
                    for (let j = 0; j < arrNew.length; j++) {
                        if (req.files[i].originalname == arrNew[j].Origin) {
                            arrNew[j].image = req.files[i].filename
                            break
                        }
                    }
                }
                for (let i = 0; i < arrNew.length; i++) {
                    delete arrNew[i].Origin
                }
                const data_insert = await new Model_Slide_Banner({
                    Title: req.body.Title,
                    Description: req.body.Description,
                    SlideBanner: arrNew,
                }).save()
                if (check_delete_img_old) {
                    for (let i = 0; i < arr_old_image.length; i++) {
                        await validator.removeFile(validator.URL_IMAGE_SLIDE + "/" + arr_old_image[i])
                    }
                    // res.status(200).json(`OK`)
                    return res.json(data_insert)
                } else {
                    // res.status(200).json(`OK`)
                    return res.json(data_insert)
                }
            })
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })

    app.put(prefixApi +"/active-mobile", helper.authenToken, async (req, res) => {
        await update_active_mobile(req, res)
    })

    app.get(prefixApi_client +"/mobile", async (req, res) => {
        await get_slide_mobile(req, res)
    })
}

const update_active_mobile = async(req, res)=>{
    try{
        const id_banner = req.body.id_banner
        const status_active = req.body.status_active

        if(!validator.ObjectId.isValid(id_banner)) return res.status(400).send(`Thất bại! Không tìm thấy banner`)

        const update_data = await Model_Slide_Banner.findByIdAndUpdate(id_banner,{
            Active_Mobile:status_active
        },{new:true})
        return res.json(update_data)
    }
    catch(e){
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}

const get_slide_mobile = async (req, res)=>{
    try{
        const data = await Model_Slide_Banner.find({Active_Mobile:true})
        return res.json(data)
    }  
    catch(e){
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}