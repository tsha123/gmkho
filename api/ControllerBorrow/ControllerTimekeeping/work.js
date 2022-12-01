
const prefixApi = '/api/timekeeping';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelTimekeepingWork } from '../../models/TimeKeepingWork.js'
import { ModelBranch } from '../../models/Branch.js'
import { ModelEmployee } from '../../models/Employee.js'

function check_same_IP(ip1, ip2) {
    console.log(ip1, ip2)
    const a = ip1.split(':')
    const b = ip2.toString().split(':')
    if (!ip1.includes(':') || !ip2.includes(':')) return false
    const lenght = Math.abs(a.length - b.length)
    if (lenght >= 2) return false
    let count = 0
    for (let i = 0; i < b.length; i++) {
        if (a.indexOf(b[i]) == -1) {
            count++
        }
    }
    console.log(a + "____", b + "_______", count)
    if (count >= 2) {
        return false
    }
    return true
}
export const timekeeping_work = (app) => {
    //#region  chấm công bào sáng
    app.get(prefixApi + "/check-ipwifi", helper.authenToken, async (req, res) => {
        try {
            return res.json(req.body.branch_ipwifi)
        }
        catch (e) {
            return res.json(null)
        }

    })
    app.get(prefixApi + "/is-checked", helper.authenToken, async (req, res) => {
        try {
            const dateZone = validator.dateTimeZone("GMT +07:00");
            const id_employee = req.body._caller._id;
            let query = { $and: [{ id_employee: id_employee }, { createdAt: { $gte: dateZone.startOfDay } }, { createdAt: { $lte: dateZone.endOfDay } }] }
            const timeKeeping = await ModelTimekeepingWork.findOne(query)
            return res.json(timeKeeping)
        }
        catch (e) {
            return res.json(null)
        }

    })

    app.post(prefixApi + "/in_morning", helper.authenToken, async (req, res) => {
        try {
            const dateZone = validator.dateTimeZone("GMT +07:00");
            const id_branch = req.body._caller.id_branch;
            const id_employee = req.body._caller._id;
            // const branch_ipwifi = req.body.branch_ipwifi
            const branch_ipwifi = req.body.branch_ipwifi

            const branch = await ModelBranch.findById(id_branch)

            if (!branch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");

            // if(branch.branch_ipwifi != branch_ipwifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
            let success_wifi = false
            for (let i = 0; i < branch.branch_ipwifi.length; i++) {
                if (check_same_IP(branch_ipwifi, branch.branch_ipwifi[i])) {
                    success_wifi = true
                    break
                }
            }
            for (let i = 0; i < branch.branch_ipwifi.length; i++) {
                if (check_same_IP(branch_ipwifi, req.headers['x-forwarded-for'])) {
                    success_wifi = true
                    break
                }
            }
            if (!success_wifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")

            let query = { $and: [{ id_employee: id_employee }, { createdAt: { $gte: dateZone.startOfDay } }, { createdAt: { $lte: dateZone.endOfDay } }] }
            const timeKeeping = await ModelTimekeepingWork.findOne(query)
            if (!timeKeeping) // chưa tạo bao h
            {

                // kiểm tra giờ hiện tại và giờ chiều
                console.log((branch.out_morning.hours * 60 + branch.out_morning.minutes), (dateZone.hours * 60 + dateZone.minutes))
                if ((branch.out_morning.hours * 60 + branch.out_morning.minutes) < (dateZone.hours * 60 + dateZone.minutes)) return res.status(400).send("Thất bại!Bạn đã vượt quá giờ vào sáng"); // kiểm tra còn trong giờ sáng hay không
                const late = (dateZone.hours * 60 + dateZone.minutes) - (branch.in_morning.hours * 60 + branch.in_morning.minutes + branch.late_limit);

                let late_morning = { hours: 0, minutes: 0, seconds: 0 }
                if (late > 0) // muộn
                {
                    const late2 = (dateZone.hours * 60 + dateZone.minutes) - (branch.in_morning.hours * 60 + branch.in_morning.minutes) // phút thực tế đi muộn
                    late_morning = { hours: validator.tryParseInt(late2 / 60), minutes: validator.tryParseInt(late % 60), seconds: 0 }
                }

                const timeKeepingMoring = await new ModelTimekeepingWork({
                    id_employee: id_employee,
                    in_morning: dateZone.scheduleNow,
                    late_morning: late_morning,
                    createdAt: dateZone.currentTime
                }).save();

                if (!timeKeepingMoring) return res.status(500).send("Thất bại! Có lỗi xảy ra");
                return res.json(timeKeepingMoring)

            }
            return res.status(400).send("Thất bại! Bạn đã chấm các giờ khác, không thể chấm lại vào sáng.")

        }
        catch (e) {
            validator.throwError(e);
            return res.status(500).send("Thất bại! Có lỗi xảy ra.")
        }
    })

    //#endregion chấm công đi làm sáng

    //#region  chấm công ra sáng

    app.post(prefixApi + "/out_morning", helper.authenToken, async (req, res) => {
        out_morning(req, res)

    })

    //#endregion chấm công ra sáng



    //#region  chấm công vào chiều

    app.post(prefixApi + "/in_afternoon", helper.authenToken, async (req, res) => {
        try {
            const dateZone = validator.dateTimeZone("GMT +07:00");
            const id_branch = req.body._caller.id_branch;
            const id_employee = req.body._caller._id;
            // const branch_ipwifi = req.body.branch_ipwifi
            const branch_ipwifi = req.body.branch_ipwifi
            const branch = await ModelBranch.findById(id_branch)

            if (!branch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");


            // if(branch.branch_ipwifi != branch_ipwifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
            let success_wifi = false
            for (let i = 0; i < branch.branch_ipwifi.length; i++) {
                if (check_same_IP(branch_ipwifi, branch.branch_ipwifi[i])) {
                    success_wifi = true
                    break
                }
            }
            for (let i = 0; i < branch.branch_ipwifi.length; i++) {
                if (check_same_IP(branch_ipwifi, req.headers['x-forwarded-for'])) {
                    success_wifi = true
                    break
                }
            }
            if (!success_wifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
            let query = { $and: [{ id_employee: id_employee }, { createdAt: { $gte: dateZone.startOfDay } }, { createdAt: { $lte: dateZone.endOfDay } }] }
            // kiểm tra giờ chấm phải > giờ ra sáng
            // 
            if (dateZone.hours * 60 + dateZone.minutes + 60 < branch.out_morning.hours * 60 + branch.out_morning.minutes) return res.status(400).send("Thất bại! Chưa đến giờ chấm công vào chiều")

            let late_afternoon = { hours: 0, minutes: 0, seconds: 0 }
            if ((dateZone.hours * 60 + dateZone.minutes) > (branch.in_afternoon.hours * 60 + branch.in_afternoon.minutes + branch.late_limit)) {
                const late = (dateZone.hours * 60 + dateZone.minutes) - (branch.in_afternoon.hours * 60 + branch.in_afternoon.minutes)
                late_afternoon = { hours: validator.tryParseInt(late / 60), minutes: validator.tryParseInt(late % 60), seconds: 0 }
            }

            const timeKeeping = await ModelTimekeepingWork.findOne(query)

            if (!timeKeeping)  // lần đầu chấm
            {
                const in_afternoon = await new ModelTimekeepingWork({
                    id_employee: id_employee,
                    in_afternoon: dateZone.scheduleNow,
                    late_afternoon: late_afternoon
                }).save()
                if (!in_afternoon) return res.status(500).send("Thất bại! Có lỗi xảy ra")
                return res.json(in_afternoon)
            }
            else {
                if (timeKeeping.in_afternoon.hours != 0 || timeKeeping.in_afternoon.minutes != 0 || timeKeeping.in_afternoon.seconds != 0) return res.status(400).send(`Thất bại! Bạn đã chấm công chiều vào ${timeKeeping.in_afternoon.hours}:${timeKeeping.in_afternoon.minutes}:${timeKeeping.in_afternoon.seconds}`)
                const in_afternoon = await ModelTimekeepingWork.findByIdAndUpdate(timeKeeping._id, { in_afternoon: dateZone.scheduleNow, late_afternoon: late_afternoon }, { new: true })
                if (!in_afternoon) return res.status(500).send("Thất bại! Có lỗi xảy ra")
                return res.json(in_afternoon)
            }
        }
        catch (e) {
            validator.throwError(e);
            res.sendStatus(500);
        }
    })


    //#endregion chấm công ra sáng

    //#region  chấm công  chiều ra
    try {
        app.post(prefixApi + "/out_afternoon", helper.authenToken, async (req, res) => {

            const dateZone = validator.dateTimeZone("GMT +07:00");
            const id_branch = req.body._caller.id_branch;
            const id_employee = req.body._caller._id;
            const branch_ipwifi = req.body.branch_ipwifi

            const branch = await ModelBranch.findById(id_branch)

            if (!branch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");


            let success_wifi = false
            for (let i = 0; i < branch.branch_ipwifi.length; i++) {
                if (check_same_IP(branch_ipwifi, branch.branch_ipwifi[i])) {
                    success_wifi = true
                    break
                }
            }
            for (let i = 0; i < branch.branch_ipwifi.length; i++) {
                if (check_same_IP(branch_ipwifi, req.headers['x-forwarded-for'])) {
                    success_wifi = true
                    break
                }
            }
            if (!success_wifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
            let query = { $and: [{ id_employee: id_employee }, { createdAt: { $gte: dateZone.startOfDay } }, { createdAt: { $lte: dateZone.endOfDay } }] }
            // kiểm tra giờ chấm phải > giờ ra sáng
            const timeKeeping = await ModelTimekeepingWork.findOne(query)

            if (!timeKeeping) return res.status(400).send("Thất bại! Bạn chưa chấm công vào chiều")
            if (timeKeeping.in_afternoon.hours == 0 && timeKeeping.in_afternoon.minutes == 0 && timeKeeping.in_afternoon.seconds == 0) return res.status(400).send("Thất bại! Bạn chưa chấm công vào chiều")
            if (timeKeeping.out_afternoon.hours != 0 || timeKeeping.out_afternoon.minutes != 0 || timeKeeping.out_afternoon.seconds != 0) return res.status(400).send("Thất bại! Bạn đã chấm công chiều ra")
            // tính thời gian thừa
            let overtime = { hours: 0, minutes: 0, seconds: 0 }
            if ((dateZone.hours * 60 + dateZone.minutes) > (branch.out_afternoon.hours * 60 + branch.out_afternoon.minutes + branch.late_limit)) {
                let over = (dateZone.hours * 60 + dateZone.minutes) - (branch.out_afternoon.hours * 60 + branch.out_afternoon.minutes)
                overtime = { hours: validator.tryParseInt(over / 60), minutes: validator.tryParseInt(over % 60), seconds: 0 }
            }
            const out_afternoon = await ModelTimekeepingWork.findByIdAndUpdate(timeKeeping._id, { out_afternoon: dateZone.scheduleNow, overtime: overtime }, { new: true })
            if (!out_afternoon) return res.status(500).send("Thất bại! Có lỗi xảy ra")
            return res.json(out_afternoon)

        })

    }
    catch (e) {
        validator.throwError(e);
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`);
    }
    //#endregion chấm công chiều ra
}

const out_morning = async (req, res) => {
    try {
        const dateZone = validator.dateTimeZone("GMT +07:00");
        const id_branch = req.body._caller.id_branch;
        const id_employee = req.body._caller._id;
        // const branch_ipwifi = req.body.branch_ipwifi
        // const branch_ipwifi = req.body.branch_ipwifi

        const branch_ipwifi = req.body.branch_ipwifi
        const branch = await ModelBranch.findById(id_branch)

        if (!branch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");


        // if(branch.branch_ipwifi != branch_ipwifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
        let success_wifi = false
        for (let i = 0; i < branch.branch_ipwifi.length; i++) {
            if (check_same_IP(branch_ipwifi, branch.branch_ipwifi[i])) {
                success_wifi = true
                break
            }
        }
        for (let i = 0; i < branch.branch_ipwifi.length; i++) {
            if (check_same_IP(branch_ipwifi, req.headers['x-forwarded-for'])) {
                success_wifi = true
                break
            }
        }

        if (!success_wifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
        let query = { $and: [{ id_employee: id_employee }, { createdAt: { $gte: dateZone.startOfDay } }, { createdAt: { $lte: dateZone.endOfDay } }] }
        const timeKeeping = await ModelTimekeepingWork.findOne(query)
        if (!timeKeeping) return res.status(400).send("Thất bại! Bạn chưa chấm vào sáng"); // chưa tạo bao h
        // kiểm tra đã kiểm chấm vào sáng chưa
        if (timeKeeping.in_morning.hours == 0 && timeKeeping.in_morning.minutes == 0 && timeKeeping.in_morning.seconds == 0) return res.status(400).send("Thất bại! Bạn chưa chấm công vào sáng");
        if (timeKeeping.out_morning.hours != 0 || timeKeeping.out_morning.minutes != 0 || timeKeeping.out_morning.seconds != 0) return res.status(400).send(`Thất bại! Bạn đã chấm công ra sáng vào ${timeKeeping.out_morning.hours}:${timeKeeping.out_morning.minutes}:${timeKeeping.out_morning.seconds}`);

        const flagTime = dateZone.hours * 60 + dateZone.minutes // thời gian chấm hiện tại
        if (flagTime > (branch.out_morning.hours * 60 + branch.out_morning.minutes + branch.late_limit)) return res.status(400).send("Thất bại! Giờ ra sáng đã kết thúc.")  // thời gian ra sáng phải nhỏ hơn thời ra sáng của chi nhánh

        const outMorning = await ModelTimekeepingWork.findByIdAndUpdate(timeKeeping._id, { out_morning: dateZone.scheduleNow }, { new: true })
        if (!outMorning) return res.status(500).send("Thất bại! Có lỗi xảy ra.")
        return res.json(outMorning)
    }
    catch (e) {
        validator.throwError(e);
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`);
    }
}

export const management_work = async (app) => {
    //#region  api get data
    try {
        app.get(prefixApi, helper.authenToken, async (req, res) => {

            if (! await helper.checkPermission("61e6e37f07faee0053c02ec9", req.body._caller.id_employee_group)) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này!")
            const dataEmployee = await ModelEmployee.find({ id_branch: req.body._caller.id_branch_login })

            for (let i = 0; i < dataEmployee.length; i++) {
                const dataTime = await ModelTimekeepingWork.findOne({ $and: [{ id_employee: dataEmployee[i]._id }, { createdAt: { $gte: new Date(req.query.fromdate + " 00:00:00") } }, { createdAt: { $lte: new Date(req.query.fromdate + " 23:59:59") } }] })
                dataEmployee[i] = { ...dataEmployee[i], data: dataTime }

            }

            return res.json(dataEmployee)
        })
    }
    catch (e) {
        validator.throwError(e);
        res.status(500).send("Có lỗi xảy ra");
    }
    //#endregion api get data

}


export const report_work = async (app) => {
    //#region  api get data
    try {
        app.get(prefixApi + "/work/report?", helper.authenToken, async (req, res) => {

            if (! await helper.checkPermission("61e6e37f07faee0053c02ec9", req.body._caller.id_employee_group)) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này!")
            const dataEmployee = await ModelEmployee.find({ id_branch: req.body._caller.id_branch_login })
            const fromdate = sanitize(req.query.fromdate)
            const todate = sanitize(req.query.todate)

            try {
                for (let i = 0; i < dataEmployee.length; i++) {
                    const dataTime = await ModelTimekeepingWork.find({ $and: [{ id_employee: dataEmployee[i]._id }, { createdAt: { $gte: new Date(fromdate + " 00:00:00") } }, { createdAt: { $lte: new Date(todate + " 23:59:59") } }] })
                    dataEmployee[i] = { ...dataEmployee[i], data: dataTime }
                }
                return res.json(dataEmployee)
            }
            catch (e) {
                return res.status(400).send("Thất bại! Có lỗi xảy ra")
            }

        })
    }
    catch (e) {

    }
    //#endregion api get data
}

export const getDataWork = async (app) => {
    //#region  api get data
    try {
        app.get(prefixApi + "/byEmployee", helper.authenToken, async (req, res) => {

            let query = { id_employee: req.body._caller._id }
            let limit = 10
            let offset = 0;
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = { ...query, $and: [{ createdAt: { $gte: new Date(req.query.fromdate + " 00:00:00") } }, { createdAt: { $lte: new Date(req.query.todate + " 23:59:59") } }] }
            }
            if (validator.isDefine(req.query.limit)) {
                limit = validator.tryParseInt(req.query.limit)
            }
            if (validator.isDefine(req.query.offset)) {
                offset = validator.tryParseInt(req.query.offset)
            }
            const dataTime = await ModelTimekeepingWork.find(query).lean().sort({ createdAt: -1 }).skip(offset).limit(limit)
            return res.json(dataTime)
        })
    }
    catch (e) {
        validator.throwError(e);
        res.status(500).send("Có lỗi xảy ra");
    }
    //#endregion api get data
}


export const addTimekeepingWork_byAdmin = async (app) => {
    //#region  api get data
    try {
        app.post(prefixApi + "/admin", helper.authenToken, async (req, res) => {
            const id_employee = sanitize(req.body.id_employee)
            const dataEm = await ModelEmployee.findById(id_employee).lean()
            if (!dataEm) return res.status(400).send("Thất bại! Không tìm thấy nhân viên")

            const dataWork = await ModelTimekeepingWork.findOne({ id_employee: id_employee, $and: [{ createdAt: { $gte: validator.dateTimeZone().startOfDay } }, { createdAt: { $lte: validator.dateTimeZone().endOfDay } }] }).lean()
            if (dataWork) return res.status(400).send("Thất bại! Nhân viên này đã chấm công hôm nay")

            const in_morning = sanitize(req.body.in_morning)
            const out_morning = sanitize(req.body.out_morning)
            const in_afternoon = sanitize(req.body.in_afternoon)
            const out_afternoon = sanitize(req.body.out_afternoon)

            const dataBranch = await ModelBranch.findById(req.body._caller.id_branch_login).lean()
            if (!dataBranch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh")

            var late_morning = { hours: 0, minutes: 0, seconds: 0 }
            if (validator.isChecked(in_morning)) {
                if ((dataBranch.in_morning.hours * 60 + dataBranch.in_morning.minutes + dataBranch.late_limit) < (validator.tryParseInt(in_morning.hours) * 60 + validator.tryParseInt(in_morning.minutes))) {
                    const late = (validator.tryParseInt(in_morning.hours) * 60 + validator.tryParseInt(in_morning.minutes)) - (dataBranch.in_morning.hours * 60 + dataBranch.in_morning.minutes)

                    late_morning = {
                        hours: validator.tryParseInt(late / 60),
                        minutes: validator.tryParseInt(late % 60),
                        seconds: 0
                    }
                }
            }

            var late_afternoon = { hours: 0, minutes: 0, seconds: 0 }
            if (validator.isChecked(in_afternoon)) {
                if ((dataBranch.in_afternoon.hours * 60 + dataBranch.in_afternoon.minutes + dataBranch.late_limit) < (validator.tryParseInt(in_afternoon.hours) * 60 + validator.tryParseInt(in_afternoon.minutes))) {
                    const late = (validator.tryParseInt(in_afternoon.hours) * 60 + validator.tryParseInt(in_afternoon.minutes)) - (dataBranch.in_afternoon.hours * 60 + dataBranch.in_afternoon.minutes)

                    late_afternoon = {
                        hours: validator.tryParseInt(late / 60),
                        minutes: validator.tryParseInt(late % 60),
                        seconds: 0
                    }
                }
            }
            let overtime = { hours: 0, minutes: 0, seconds: 0 }
            if ((validator.tryParseInt(out_afternoon).hours * 60 + validator.tryParseInt(out_afternoon).minutes) > (dataBranch.out_afternoon.hours * 60 + dataBranch.out_afternoon.minutes + dataBranch.late_limit)) {
                const over = (validator.tryParseInt(out_afternoon).hours * 60 + validator.tryParseInt(out_afternoon).minutes) - (dataBranch.out_afternoon.hours * 60 + dataBranch.out_afternoon.minutes)
                overtime = { hours: validator.tryParseInt(over / 60), minutes: validator.tryParseInt(over % 60), seconds: 0 }
            }

            const data = await new ModelTimekeepingWork({
                id_employee: id_employee,
                in_morning: in_morning,
                out_morning: out_morning,
                in_afternoon: in_afternoon,
                out_afternoon: out_afternoon,
                late_morning: late_morning,
                late_afternoon: late_afternoon,
                overtime: overtime,
                createdAt: validator.dateTimeZone().currentTime
            }).save()
            if (!data) return res.status(500).send("Thất bại! Có lỗi xảy ra")
            return res.json(data)
        })
    }
    catch (e) {
        validator.throwError(e);
        res.status(500).send("Có lỗi xảy ra");
    }
    //#endregion api get data

}


export const editTimekeepingWork_byAdmin = async (app) => {
    //#region  api get data
    try {
        app.put(prefixApi + "/admin", helper.authenToken, async (req, res) => {


            const id_timekeeping = req.body.id_timekeeping
            const dataWork = await ModelTimekeepingWork.findById(id_timekeeping)

            if (!dataWork) return res.status(400).send(`Thất bại! Có lỗi xả ra`)

            const id_employee = dataWork.id_employee
            const dataEm = await ModelEmployee.findById(id_employee).lean()
            if (!dataEm) return res.status(400).send("Thất bại! Không tìm thấy nhân viên này")

            const in_morning = sanitize(req.body.in_morning)
            const out_morning = sanitize(req.body.out_morning)
            const in_afternoon = sanitize(req.body.in_afternoon)
            const out_afternoon = sanitize(req.body.out_afternoon)

            const dataBranch = await ModelBranch.findById(req.body._caller.id_branch_login)
            if (!dataBranch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh")

            var late_morning = { hours: 0, minutes: 0, seconds: 0 }
            if (validator.isChecked(in_morning)) {
                if ((dataBranch.in_morning.hours * 60 + dataBranch.in_morning.minutes + dataBranch.late_limit) < (validator.tryParseInt(in_morning.hours) * 60 + validator.tryParseInt(in_morning.minutes))) {
                    const late = (validator.tryParseInt(in_morning.hours) * 60 + validator.tryParseInt(in_morning.minutes)) - (dataBranch.in_morning.hours * 60 + dataBranch.in_morning.minutes)

                    late_morning = {
                        hours: validator.tryParseInt(late / 60),
                        minutes: validator.tryParseInt(late % 60),
                        seconds: 0
                    }
                }
            }

            var late_afternoon = { hours: 0, minutes: 0, seconds: 0 }
            if (validator.isChecked(in_afternoon)) {
                if ((dataBranch.in_afternoon.hours * 60 + dataBranch.in_afternoon.minutes + dataBranch.late_limit) < (validator.tryParseInt(in_afternoon.hours) * 60 + validator.tryParseInt(in_afternoon.minutes))) {
                    const late = (validator.tryParseInt(in_afternoon.hours) * 60 + validator.tryParseInt(in_afternoon.minutes)) - (dataBranch.in_afternoon.hours * 60 + dataBranch.in_afternoon.minutes)

                    late_afternoon = {
                        hours: validator.tryParseInt(late / 60),
                        minutes: validator.tryParseInt(late % 60),
                        seconds: 0
                    }
                }
            }
            let overtime = { hours: 0, minutes: 0, seconds: 0 }
            if ((validator.tryParseInt(out_afternoon).hours * 60 + validator.tryParseInt(out_afternoon).minutes) > (dataBranch.out_afternoon.hours * 60 + dataBranch.out_afternoon.minutes + dataBranch.late_limit)) {
                const over = (validator.tryParseInt(out_afternoon).hours * 60 + validator.tryParseInt(out_afternoon).minutes) - (dataBranch.out_afternoon.hours * 60 + dataBranch.out_afternoon.minutes)
                overtime = { hours: validator.tryParseInt(over / 60), minutes: validator.tryParseInt(over % 60), seconds: 0 }
            }

            const data = await ModelTimekeepingWork.findByIdAndUpdate(dataWork._id, {
                id_employee: id_employee,
                in_morning: in_morning,
                out_morning: out_morning,
                in_afternoon: in_afternoon,
                out_afternoon: out_afternoon,
                late_morning: late_morning,
                late_afternoon: late_afternoon,
                overtime: overtime,
                createdAt: validator.dateTimeZone().currentTime
            }, { new: true })

            return res.json(data)
        })
    }
    catch (e) {
        validator.throwError(e);
        res.status(500).send("Có lỗi xảy ra");
    }
    //#endregion api get data

}