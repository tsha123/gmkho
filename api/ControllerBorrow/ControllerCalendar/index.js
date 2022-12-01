
const prefixApi = '/api/calendar';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelEmployee} from '../../models/Employee.js'
import {ModelCalendar} from '../../models/Calendar.js'
import {ModelBranch} from '../../models/Branch.js'
import {ModelNotification} from '../../models/Notification.js'


export const management = (app)=>{
    try
    {
        app.get(prefixApi, helper.authenToken,async (req,res)=>{
            if(! await helper.checkPermission("61e6e38d07faee0053c02ecd", req.body._caller.id_employee_group)) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này!")
            var dataBranch = [];
            var dataEmployee =[]
            if(validator.isDefine(req.query.isGetOther) && req.query.isGetOther ==='true')
            {
                dataBranch = await ModelBranch.findById(req.body._caller.id_branch_login).lean()
                dataEmployee = await ModelEmployee.find({id_branch:req.body._caller.id_branch_login}).lean();
            }
            const startWeek = validator.startOfWeek(new Date(sanitize(req.query.fromdate)))
            const endWeek = validator.endOfWeek(new Date(sanitize(req.query.fromdate)))
            const data = await ModelCalendar.aggregate([
                {
                    $match:{
                        $and:[{date_calendar:{$gte:startWeek}},{date_calendar:{$lte:endWeek}}]
                    }
                },
                {
                    $lookup:
                    {
                        from:"employees",
                        localField:"id_employee",
                        foreignField:"_id",
                        as:"Employee"
                    }
                },
                {
                    $unwind:{
                        path:"$Employee"
                    }
                },
                {
                    $match:{
                        "Employee.id_branch": validator.ObjectId(req.body._caller.id_branch_login),
                    }
                },
                {
                    $project:{
                        _id:1,
                        in_noon_calendar:1,
                        out_noon_calendar:1,
                        in_night_calendar:1,
                        out_night_calendar:1,
                        date_calendar:1,
                        employee_fullname:"$Employee.employee_fullname",
                        employee_phone:"$Employee.employee_phone"
                    }
                }
            ])
            return res.json({dataBranch:dataBranch,dataEmployee:dataEmployee,data:data})
        })
    }
    catch(e)
    {
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}

export const insert = (app)=>{
    try
    {
        app.post(prefixApi, helper.authenToken,async (req,res)=>{
            if(! await helper.checkPermission("61e6e38d07faee0053c02ecd", req.body._caller.id_employee_group)) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này!")
           

            try
            {
                const dataEm = await ModelEmployee.findById(sanitize(req.body.id_employee)).lean()
                if(!dataEm) return res.status(400).send("Thất bại! Không tìm thấy nhân viên")

                const dataInsert = await new ModelCalendar({
                    id_employee: sanitize(req.body.id_employee) ,
                    in_noon_calendar:sanitize(req.body.in_noon_calendar),
                    out_noon_calendar:sanitize(req.body.out_noon_calendar),
                    in_night_calendar:sanitize(req.body.in_night_calendar),
                    out_night_calendar:sanitize(req.body.out_night_calendar),
                    date_calendar: new Date(sanitize(req.body.date_calendar))
                }).save()
                await new ModelNotification({
                    notification_topic:dataEm.employee_phone,
                    notification_title:"Thông báo lịch",
                    notification_content:"Bạn có một lịch trực vào ngày hôm nay",
                    notification_time: new Date(sanitize(req.body.date_calendar)),
                    id_from:dataInsert._id,
                    notification_type:"Calendar"
                }).save()

                return res.json(dataInsert)
            }
            catch(e)
            {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        })
    }
    catch(e)
    {

    }
}


export const update = (app)=>{
    try
    {
        app.put(prefixApi, helper.authenToken,async (req,res)=>{
            if(! await helper.checkPermission("61e6e38d07faee0053c02ecd", req.body._caller.id_employee_group)) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này!")
            
            const id_calendar = sanitize(req.body.id_calendar)
            const type = sanitize(req.body.type)
            const current = new Date(req.body.current)
            console.log(id_calendar)
            if(current == 'Invalid')
            {
                return res.status(400).send("Thất bại! Thời gian xảy ra lôi")
            }
          
            const calendar = await ModelCalendar.findById(id_calendar).lean()
            if(!calendar) return res.status(400).send("Thất bại! Không tìm thấy lịch trực")
            
            if(type == 'Noon')
            {
                const updateCa = await ModelCalendar.findByIdAndUpdate(calendar._id,{
                    in_noon_calendar:{hours:0,minutes:0,seconds:0},
                    out_noon_calendar:{hours:0,minutes:0,seconds:0},
                }) 
            }
            else if(type == 'Night')
            {
                const updateCa = await ModelCalendar.findByIdAndUpdate(calendar._id,{
                    in_night_calendar:{hours:0,minutes:0,seconds:0},
                    out_night_calendar:{hours:0,minutes:0,seconds:0},
                }) 
            }
            else
            {
                return res.status(400).send("Thất bại! Có lỗi xảy ra")
            }
            const calendar2 = await ModelCalendar.findById(id_calendar).lean()
            if(!validator.isChecked(calendar2.in_noon_calendar) && !validator.isChecked(calendar2.out_noon_calendar) && 
                !validator.isChecked(calendar2.in_night_calendar) && !validator.isChecked(calendar2.out_night_calendar)
            )
            {
                await ModelCalendar.findByIdAndRemove(id_calendar);
                await ModelNotification.findOneAndRemove({id_from:calendar2._id})
                return res.json("Success")
            }
            else
            {
                return res.json("Success")
            }
        })
    }
    catch(e)
    {
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}


export const getDataCalendar = async (app)=>{
    //#region  api get data
    try
    {
        app.get(prefixApi+"/byEmployee", helper.authenToken, async (req,res)=>{
            
            let query = {id_employee:req.body._caller._id}
            let limit = 10
            let offset = 0;
            if(validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate))
            {
                query = {...query,$and:[{date_calendar:{$gte:new Date(req.query.fromdate+" 00:00:00")}},{date_calendar:{$lte:new Date(req.query.todate+" 23:59:59")}}]}
            }
            if(validator.isDefine(req.query.limit))
            {
                limit = validator.tryParseInt(req.query.limit)
            }
            if(validator.isDefine(req.query.offset))
            {
                offset = validator.tryParseInt(req.query.offset)
            }
            const dataTime = await ModelCalendar.find(query).skip(offset).limit(limit).lean();
            return res.json(dataTime)
        })
    }
    catch(e)
    {
        validator.throwError(e);
        res.status(500).send("Có lỗi xảy ra");
    }
    //#endregion api get data

}