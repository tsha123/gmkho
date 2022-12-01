const prefixApi = "/api/user"
import sanitize from "mongo-sanitize"
import * as helper from "../../helper/helper.js"
import * as validator from "../../helper/validator.js"
import { ModelUser } from "../../models/User.js"
import { ModelExportForm } from "../../models/ExportForm.js"
import { ModelImportForm } from "../../models/ImportForm.js"
import { ModelReceive } from "../../models/Receive.js"
import { ModelPayment } from "../../models/Payment.js"
import { ModelFundBook } from "../../models/FundBook.js"

export const getWarehouse = async (id_branch) => {
    const data = await ModelWarehouse.find({ id_branch: id_branch, warehouse_status: true })
    return data
}

export const management = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        try {
            if (!(await helper.checkPermission("6202411e187533274b9ce427", req.body._caller.id_employee_group))) return res.status(400).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            let query = {}
            if (validator.isDefine(req.query.key)) {
                query = {
                    ...query,
                    $or: [{ user_fullname: { $regex: ".*" + req.query.key + ".*", $options: "$i" } }, { user_phone: { $regex: ".*" + req.query.key + ".*" } }],
                }
            }
            const data = await ModelUser.find(query).sort({ _id: -1 }).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            const count = await ModelUser.countDocuments(query)

            return res.json({ data: data, count: count })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const insert = async (app) => {
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        if (!(await helper.checkPermission("6202411e187533274b9ce427", req.body._caller.id_employee_group))) return res.status(400).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        try {
            const objectUser = JSON.parse(req.body.data)
            if (objectUser.user_phone.length == 0 || objectUser.user_fullname.length == 0) return res.status(400).send("Thất bại! Số điện thoại và tên khách hàng không được để trống")

            const dataUser = await ModelUser.findOne({ user_phone: objectUser.user_phone.trim() })
            if (dataUser) return res.status(400).send("Thất bại! Số điện thoại đã được đăng ký")
            const insert_data = await new ModelUser(objectUser).save()
            return res.json(insert_data)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const update = async (app) => {
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        if (!(await helper.checkPermission("6202411e187533274b9ce427", req.body._caller.id_employee_group))) return res.status(400).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        try {
            const objectUser = JSON.parse(req.body.data)
            if (objectUser.user_phone.length == 0 || objectUser.user_fullname.length == 0) return res.status(400).send("Thất bại! Số điện thoại và tên khách hàng không được để trống")
            const dataUserOld = await ModelUser.findById(objectUser.id_user)
            if (!dataUserOld) return res.status(400).send("Thất bại! Không tìm thấy khách hàng cần chỉnh sửa")

            const dataUser = await ModelUser.findOne({ user_phone: objectUser.user_phone.trim() })
            if (dataUser) {
                if (dataUser._id.toString() != dataUserOld._id.toString()) return res.status(400).send(`Thất bại! Số điện thoại này đã được sử dụng bởi khách hàng có tên ${dataUser.user_fullname}`)
            }

            const update_user = await ModelUser.findByIdAndUpdate(dataUserOld._id, objectUser)
            return res.json(update_user)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const insertMany = async (app) => {
    app.post(prefixApi + "/excel", helper.authenToken, async (req, res) => {
        if (!(await helper.checkPermission("6202411e187533274b9ce427", req.body._caller.id_employee_group))) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        try {
            const arr_excel = JSON.parse(req.body.arr_excel)
            if (arr_excel.length == 0) return res.status(400).send("Thất bại! Hãy nhập ít nhất một sản phẩm")
            for (let i = 0; i < arr_excel.length; i++) {
                if (!arr_excel[i].user_phone || !arr_excel[i].user_fullname) return res.status(400).send(`Thất bại! Số điện thoại hoặc họ tên không được để trống`)
                arr_excel[i].user_phone = arr_excel[i].user_phone.trim()
                const dataUser = await ModelUser.findOne({ user_phone: arr_excel[i].user_phone })
                if (dataUser) return res.status(400).send("Thất bại! Số điện thoại đã được đăng ký")
            }
            const insert_excel = await ModelUser.insertMany(arr_excel)
            return res.json(insert_excel)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const getUser = async (app) => {
    app.get(prefixApi + "/findOther", helper.authenToken, async (req, res) => {
        try {
            let query = {}
            if (validator.isDefine(req.query.key)) {
                query = {
                    $or: [{ user_fullname: { $regex: ".*" + sanitize(req.query.key) + ".*", $options: "$i" } }, { user_phone: { $regex: ".*" + sanitize(req.query.key) + ".*", $options: "$i" } }],
                }
            }
            const data = await ModelUser.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            return res.json(data)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const check_is_register = async (app) => {
    app.get(prefixApi + "/check-phone-register", async (req, res) => {
        const phone = req.query.phone
        if (check_usable_phone(phone)) {
            const dataUser = await ModelUser.findOne({ user_phone: phone })
            if (dataUser && validator.isNotEmpty(dataUser.user_password)) return res.status(400).send(`Số điện thoại đã được đăng ký`)
            return res.status(200).json("success")
        } else {
            return res.status(400).send(`Số điện thoại không hợp lệ`)
        }
    })
}
export const check_exist_phone_register = async (app) => {
    app.get(prefixApi + "/check-exist-phone-register", async (req, res) => {
        const phone = req.query.phone
        if (check_usable_phone(phone)) {
            const dataUser = await ModelUser.findOne({ user_phone: phone })
            if (dataUser && validator.isNotEmpty(dataUser.user_password)) return res.sendStatus(200)
            return res.status(400).send(`Số điện thoại chưa được đăng ký`)
        } else {
            return res.status(400).send(`Số điện thoại không hợp lệ`)
        }
    })
}
export const signup = async (app) => {
    app.post(prefixApi + "/signup", async (req, res) => {
        try {
            const user_phone = req.body.user_phone
            const dataUser = await ModelUser.findOne({ user_phone: user_phone })
            const info_firebase = validator.tryParseJson(req.body.info_firebase)
            // console.log(info_firebase)
            const uid = info_firebase?.user?.uid || null;
            if (!validator.isNotEmpty(uid)) {
                return res.status(400).send("Thất bại! Không tìm thấy uid")
            }
            if (dataUser && validator.isNotEmpty(dataUser.user_password)) {
                return res.status(400).send("Thất bại! Số điện thoại đã được đăng kí")
            } else if (dataUser) {
                const user_fullname = req.body.user_fullname
                if (typeof user_fullname == "undefined" || !user_fullname) return res.status(400).send("Thất bại! Tên người dùng không được để trống")
                const user_password = req.body.user_password
                if (typeof user_password == "undefined" || !user_password) return res.status(400).send("Thất bại! Mật khẩu không được để trống")
                const dataUpdate = await ModelUser.findByIdAndUpdate(dataUser._id, {
                    $set: {
                        uid_firebase:uid,
                        user_fullname: user_fullname,
                        user_password: user_password,
                    },
                })

                delete dataUpdate.user_password

                return res.json(dataUpdate)
            } else {
                const user_fullname = req.body.user_fullname
                if (typeof user_fullname == "undefined" || !user_fullname) return res.status(400).send("Thất bại! Tên người dùng không được để trống")
                const user_password = req.body.user_password
                if (typeof user_password == "undefined" || !user_password) return res.status(400).send("Thất bại! Mật khẩu không được để trống")
                const insertUser = await new ModelUser({
                    uid_firebase:uid,
                    user_fullname: user_fullname,
                    user_phone: user_phone,
                    user_password: user_password,
                    user_address: req.body.user_address,
                    user_point: 0,
                    user_image: null,
                    user_gender: req.body.user_gender,
                    user_email: req.body.user_email,
                    user_birthday: req.body.user_birthday ? new Date(req.body.user_birthday) : null,
                }).save()
                delete insertUser.user_password

                return res.json(insertUser)
            }
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
export const signin = async (app) => {
    app.post(prefixApi + "/signin", async (req, res) => {
        try {
            const user_phone = sanitize(req.body.user_phone)
            const user_password = sanitize(req.body.user_password)

            if (!validator.isDefine(user_phone) || user_phone.length == 0 || !validator.isDefine(user_password) || user_password.length == 0) return res.status(400).send("Thất bại! Sai tên đăng nhập hoặc mật khẩu.")

            const dataUser = await ModelUser.findOne({ user_phone: user_phone })
            if (!dataUser) return res.status(400).send("Thất bại! Sai tên đăng nhập hoặc mật khẩu")

            if (dataUser.user_password != user_password) return res.status(400).send("Thất bại! Sai tên đăng nhập hoặc mật khẩu")

            const token = await helper.signupjwt({ ...dataUser })
            await helper.signToken(token)
            delete dataUser.user_password
            return res.json({ token: token, user: dataUser })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
export const update_client = async (app) => {
    app.put(prefixApi + "/client", helper.authenToken, async (req, res) => {
        const id_user = req.body._caller._id
        try {
            const dataUser = await ModelUser.findById(id_user)
            if (!dataUser) return res.status(400).send(`Thất bại! Không tìm thấy người dùng.`)

            const user_email = sanitize(req.body.user_email)
            const user_fullname = sanitize(req.body.user_fullname)
            const user_address = sanitize(req.body.user_address)
            const user_phone = sanitize(req.body.user_phone)
            const user_gender = sanitize(req.body.user_gender)
            const user_birthday = sanitize(req.body.user_birthday)

            if (!validator.isDefine(user_fullname) || !validator.isDefine(user_phone)) return res.status(400).send(`Số điện thoại và họ tên không được để trống!`)

            if (!check_usable_phone(user_phone)) return res.status(400).send(`Thất bại! Số tài khoản không hợp lệ.`)
            const dataUser2 = await ModelUser.findOne({ user_phone: user_phone.trim() })
            if (dataUser2) {
                if (dataUser2._id.toString() != dataUser._id.toString()) return res.status(400).send(`Thất bại! Số điện thoại này đã được sử dụng bởi khách hàng khác`)
            }
            const update_user = await ModelUser.findByIdAndUpdate(
                dataUser._id,
                {
                    user_email: user_email,
                    user_fullname: user_fullname,
                    user_address: user_address,
                    // user_phone:user_phone,
                    user_gender: user_gender,
                    user_birthday: user_birthday,
                },
                { new: true }
            )
            return res.json(update_user)
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    app.delete(prefixApi + "/client/remove", helper.authenToken, async (req, res) => {
        try {
            const id_user = req.body._caller._id
            const dataUser = await ModelUser.findById(id_user).lean()
            if (!dataUser) return res.status(400).send(`Thất bại! Có lỗi xảy ra`)

            const data_update = await ModelUser.findByIdAndUpdate(dataUser._id, {
                user_password: null,
            })
            return res.json(data_update)
        } catch (e) {
            validator.throwError(e)
            res.sendStatus(500)
        }
    })
}

function check_usable_phone(phone) {
    const reg = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g
    if (!phone || phone.length != 10) return false
    if (phone.substring(0, 1) != "0") return false
    if (reg.test(phone)) return false
    return true
}

export const forgot_password = async (app) => {
    app.put(prefixApi + "/forgot-password",  async (req, res) => {
        try {
            const user_phone = req.body.user_phone
            const new_password = req.body.new_password
            const dataUser = await ModelUser.findOne({user_phone:user_phone})
            //
            if (!dataUser) {
                return res.status(400).send(`Thất bại! Không tìm thấy thông tin người dùng`)
            } else {
                const info_firebase = validator.tryParseJson(req.body.info_firebase)
                const uid = info_firebase?.user?.uid || null;
                //
                if (!validator.isNotEmpty(uid)) {
                    return res.status(400).send("Thất bại! Không tìm thấy uid")
                }
                if (dataUser.uid_firebase != uid) {
                    return res.status(400).send("Thất bại! Thông tin không trùng khớp")
                }
                if (!validator.isNotEmpty(new_password)) return res.status(400).send(`Mật khẩu mới không được để trống`)
                await ModelUser.findByIdAndUpdate(dataUser._id, {
                    user_password: new_password,
                })
                return res.sendStatus(200)
            }
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
export const change_password = async (app) => {
    app.put(prefixApi + "/client/change-password", helper.authenToken, async (req, res) => {
        try {
            const old_password = req.body.old_password
            const new_password = req.body.new_password
            const id_user = req.body._caller._id

            const dataUser = await ModelUser.findById(id_user)
            if (!dataUser) return res.status(400).send(`Thất bại! Có lỗi xảy ra`)
            if (dataUser.user_password != old_password) return res.status(400).send(`Mật khẩu cũ không khớp`)
            if (!new_password || new_password.length == 0) return res.status(400).send(`Mật khẩu mới không được để trống`)
            await ModelUser.findByIdAndUpdate(dataUser._id, {
                user_password: new_password,
            })
            return res.json("Success")
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const get_history = async (app) => {
    app.get(prefixApi + "/history", helper.authenToken, async (req, res) => {
        try {
            const id_user = req.query.id_user
            const dataUser = await ModelUser.findById(id_user)
            if (!dataUser) return res.status(400).send(`Thất bại! Không tìm thấy khách hàng`)

            const dataExport = await ModelExportForm.find({ id_user: dataUser._id })
            const dataImport = await ModelImportForm.find({ id_user: dataUser._id })

            for (let i = 0; i < dataExport.length; i++) {
                dataExport[i].fundbook_name = ""
                dataExport[i].receive_form_money = 0
                dataExport[i].user_fullname = dataUser.user_fullname
                dataExport[i].user_phone = dataUser.user_phone
                dataExport[i].user_address = dataUser.user_address

                if (dataExport[i].export_form_status_paid) {
                    const dataReceive = await ModelReceive.findOne({ id_form: dataExport[i]._id })
                    if (dataReceive) {
                        const data_fundbook = await ModelFundBook.findById(dataReceive.id_fundbook)
                        if (data_fundbook) {
                            dataExport[i].fundbook_name = data_fundbook.fundbook_name
                            dataExport[i].receive_form_money = dataReceive.receive_money
                        }
                    }
                }
            }

            for (let i = 0; i < dataImport.length; i++) {
                dataImport[i].fundbook_name = ""
                dataImport[i].payment_form_money = 0
                dataImport[i].user_fullname = dataUser.user_fullname
                dataImport[i].user_phone = dataUser.user_phone
                dataImport[i].user_address = dataUser.user_address

                if (dataImport[i].import_form_status_paid) {
                    const dataPayment = await ModelPayment.findOne({ id_form: dataImport[i]._id })
                    if (dataPayment) {
                        const data_fundbook = await ModelFundBook.findById(dataPayment.id_fundbook)

                        if (data_fundbook) {
                            dataImport[i].fundbook_name = data_fundbook.fundbook_name
                            dataImport[i].payment_form_money = dataPayment.payment_money
                        }
                    }
                }
            }
            return res.json({ dataExport: dataExport, dataImport: dataImport })
        } catch (e) {
            console.error(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
