
const prefixApi = '/api/timekeeping/schedule';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelTimekeepingSchedule} from '../../models/TimeKeepingSchedule.js'
import {ModelBranch} from '../../models/Branch.js'
import {ModelEmployee} from '../../models/Employee.js'


export const timekeeping_schedule = (app)=>{
    //#region  chấm công bào sáng
    try
    {
        app.post(prefixApi +"/in_noon", helper.authenToken,async (req,res)=>{
           
            const dateZone = validator.dateTimeZone(req.body.timezone);
            const id_branch = req.body._caller.id_branch;
            const id_employee = req.body._caller._id;
            const branch_ipwifi = req.body.branch_ipwifi;
       
            const branch = await ModelBranch.findById(id_branch);
       
            if(!branch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");
            if(branch.branch_ipwifi != branch_ipwifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")

            let query = { $and:[{id_employee:id_employee},{createdAt:{$gte: dateZone.startOfDay}},{createdAt:{$lte: dateZone.endOfDay }}]}
            const dataSchedule = await ModelTimekeepingSchedule.findOne(query);
            if(dataSchedule) return res.status(400).send("Thất bại! Bạn đã chấm vào trưa hoặc các giờ khác, không thể chấm lại vào trưa.")

             if((branch.out_noon_schedule.hours * 60 + branch.out_noon_schedule.minutes) < (dateZone.hours*60+ dateZone.minutes )) return res.status(400).send("Thất bại!Bạn đã vượt quá giờ trực chưa"); // kiểm tra còn trong giờ sáng hay không
    
            const late =  (dateZone.hours*60+dateZone.minutes) - (branch.in_noon_schedule.hours*60+branch.in_noon_schedule.minutes+branch.late_limit) ;
            let late_noon = {hours:0,minutes:0,seconds:0}
            if(late > 0) // muộn
            {
                const late2 = (dateZone.hours*60+dateZone.minutes) - (branch.in_noon_schedule.hours*60+branch.in_noon_schedule.minutes) // phút thực tế đi muộn
                late_noon = {hours: validator.tryParseInt(late2/60) ,minutes:validator.tryParseInt(late%60), seconds:0}
                
            }
            const timeKeepingNoon = await new ModelTimekeepingSchedule({
                id_employee:id_employee,
                in_noon:dateZone.scheduleNow,
                late_noon:late_noon,
                createdAt:dateZone.currentTime
            }).save();

            if(!timeKeepingNoon) return res.status(500).send("Thất bại! Có lỗi xảy ra");
            return res.json(timeKeepingNoon)
            
       
        })
    }
    catch(e)
    {
        validator.throwError(e);
        return res.status(500).send("Thất bại! Có lỗi xảy ra");
    }
    //#endregion chấm công đi làm sáng

      //#region  chấm công ra trưa
      try
      {
        app.post(prefixApi +"/out_noon", helper.authenToken,async (req,res)=>{
        
       
            const dateZone = validator.dateTimeZone(req.body.timezone);
            const id_branch = req.body._caller.id_branch;
            const id_employee = req.body._caller._id;
            const branch_ipwifi = req.body.branch_ipwifi;

            const branch = await ModelBranch.findById(id_branch);

            if(!branch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");
        

            if(branch.branch_ipwifi != branch_ipwifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
            let query = { $and:[{id_employee:id_employee},{createdAt:{$gte: dateZone.startOfDay}},{createdAt:{$lte: dateZone.endOfDay }}]}
            const timeKeeping = await ModelTimekeepingSchedule.findOne(query);
            if(!timeKeeping) return res.status(400).send("Thất bại! Bạn chưa chấm vào sáng"); // chưa tạo bao h
            // kiểm tra đã kiểm chấm vào sáng chưa
            if(!validator.isChecked(timeKeeping.in_noon)) return res.status(400).send("Thất bại! Bạn chưa chấm công vào sáng");
            if(timeKeeping.out_noon.hours != 0 || timeKeeping.out_noon.minutes !=0 || timeKeeping.out_noon.seconds !=0 ) return res.status(400).send(`Thất bại! Bạn đã chấm công ra sáng vào ${timeKeeping.out_noon.hours}:${timeKeeping.out_noon.minutes}:${timeKeeping.out_noon.seconds}`);

            const flagTime = dateZone.hours*60+dateZone.minutes // thời gian chấm hiện tại
            if(flagTime > (branch.out_noon_schedule.hours*60+branch.out_noon_schedule.minutes+branch.late_limit))  return res.status(400).send("Thất bại! Giờ ra sáng đã kết thúc.")  // thời gian ra sáng phải nhỏ hơn thời ra sáng của chi nhánh
            try
            {
                const outNoon = await ModelTimekeepingSchedule.findByIdAndUpdate(timeKeeping._id,{out_noon:dateZone.scheduleNow},{new : true})
                if(!outNoon) return res.status(500).send("Thất bại! Có lỗi xảy ra.")
                return res.json(outNoon)
            }
            catch(e)
            {
                validator.throwError(e);
                return res.status(500).send("Thất bại! Có lỗi xảy ra");

            }
        
    
        })
      }
      catch(e)
      {
          validator.throwError(e);
          return res.status(500).send("Thất bại! Có lỗi xảy ra");
      }
      //#endregion chấm công ra sáng
  

        //#region  chấm công vào tối
    try
    {
        app.post(prefixApi +"/in_night", helper.authenToken,async (req,res)=>{
        
            const dateZone = validator.dateTimeZone(req.body.timezone);
            const id_branch = req.body._caller.id_branch;
            const id_employee = req.body._caller._id;
            const branch_ipwifi = req.body.branch_ipwifi;

            const branch = await ModelBranch.findById(id_branch);

            if(!branch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");
        

            if(branch.branch_ipwifi != branch_ipwifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
            let query = { $and:[{id_employee:id_employee},{createdAt:{$gte: dateZone.startOfDay}},{createdAt:{$lte: dateZone.endOfDay }}]}
            // kiểm tra giờ chấm phải > giờ ra sáng
            if(dateZone.hours*60+dateZone.minutes < branch.out_noon_schedule.hours*60+branch.out_noon_schedule.minutes) return res.status(400).send("Thất bại! Chưa đến giờ trực tối")
            if(dateZone.hours*60+dateZone.minutes > branch.out_night_schedule.hours*60+branch.out_night_schedule.minutes) return res.status(400).send("Thất bại! Đã quá giờ trực tối")
            
            let late_night = {hours:0, minutes:0,seconds:0}
          
            if( (dateZone.hours*60+dateZone.minutes) > (branch.in_night_schedule.hours*60+branch.in_night_schedule.minutes+branch.late_limit))
            {
          
                const late = (dateZone.hours*60+dateZone.minutes) - (branch.in_night_schedule.hours*60+branch.in_night_schedule.minutes)
                late_night = {hours: validator.tryParseInt(late/60), minutes:validator.tryParseInt(late%60), seconds:0}
            }

            const timeKeeping = await ModelTimekeepingSchedule.findOne(query);

            if(!timeKeeping)  // lần đầu chấm
            {
                const in_night = await new ModelTimekeepingSchedule({
                    id_employee:id_employee,
                    in_night:dateZone.scheduleNow,
                    late_night:late_night
                }).save()
                if(!in_night) return res.status(500).send("Thất bại! Có lỗi xảy ra")
                return res.json(in_night)
            }
            else
            {
                if(validator.isChecked(timeKeeping.in_night)) return res.status(400).send(`Thất bại! Bạn đã chấm công tối vào ${timeKeeping.in_night.hours}:${timeKeeping.in_night.minutes}:${timeKeeping.in_night.seconds}`)
                const in_night = await ModelTimekeepingSchedule.findByIdAndUpdate(timeKeeping._id,{in_night:dateZone.scheduleNow, late_night:late_night},{new :true})
                if(!in_night) return res.status(500).send("Thất bại! Có lỗi xảy ra")
                return res.json(in_night)
            }
        })
        
    }
    catch(e)
    {
        validator.throwError(e);
        res.sendStatus(500);
    }
    //#endregion chấm công ra sáng

    //#region  chấm công  tối ra
    try
    {
        app.post(prefixApi +"/out_night", helper.authenToken,async (req,res)=>{
        
            const dateZone = validator.dateTimeZone(req.body.timezone);
            const id_branch = req.body._caller.id_branch;
            const id_employee = req.body._caller._id;
            const branch_ipwifi = req.body.branch_ipwifi;

            const branch = await ModelBranch.findById(id_branch);

            if(!branch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh");
        

            if(branch.branch_ipwifi != branch_ipwifi) return res.status(400).send("Thất bại! Hãy chọn đúng WiFi")
            let query = { $and:[{id_employee:id_employee},{createdAt:{$gte: dateZone.startOfDay}},{createdAt:{$lte: dateZone.endOfDay }}]}
            // kiểm tra giờ chấm phải > giờ ra sáng
            const timeKeeping = await ModelTimekeepingSchedule.findOne(query);

            if(!timeKeeping)  return res.status(400).send("Thất bại! Bạn chưa chấm công vào tối") 
            if(!validator.isChecked(timeKeeping.in_night))  return res.status(400).send("Thất bại! Bạn chưa chấm công vào tối")
            if(validator.isChecked(timeKeeping.out_night))  return res.status(400).send("Thất bại! Bạn đã chấm công tối ra")
            // tính thời gian thừa
            let overtime = {hours:0,minutes:0,seconds:0}
            if((dateZone.hours*60+dateZone.minutes) > (branch.out_night_schedule.hours*60+branch.out_night_schedule.minutes + branch.late_limit))
            {
                let over = (dateZone.hours*60+dateZone.minutes) - (branch.out_night_schedule.hours*60+branch.out_night_schedule.minutes)
                overtime = {hours: validator.tryParseInt(over/60), minutes:validator.tryParseInt(over%60),seconds:0}
            }
            try
            {
                const out_night = await ModelTimekeepingSchedule.findByIdAndUpdate(timeKeeping._id,{out_night:dateZone.scheduleNow, overtime:overtime},{new:true})
                if(!out_night) return res.status(500).send("Thất bại! Có lỗi xảy ra")
                return res.json(out_night)
            }
            catch(e)
            {
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
           
            
        })
        
    }
    catch(e)
    {
        validator.throwError(e);
        res.sendStatus(500);
    }
    //#endregion chấm công tối ra
  
}

export const management_schedule = async (app)=>{
    //#region  api get data
    try
    {
        app.get(prefixApi, helper.authenToken, async (req,res)=>{
    
            try
            {
                if(! await helper.checkPermission("61e6e38607faee0053c02ecb", req.body._caller.id_employee_group)) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này!")

                const dataEmployee = await ModelEmployee.find({id_branch:req.body._caller.id_branch_login});
    
                for(let i = 0 ; i <dataEmployee.length ; i++)
                {
                    const dataTime = await ModelTimekeepingSchedule.findOne({$and:[{id_employee:dataEmployee[i]._id},{createdAt:{$gte:new Date(req.query.fromdate+" 00:00:00")}},{createdAt:{$lte:new Date(req.query.fromdate+" 23:59:59")}}]});
                    dataEmployee[i] = {...dataEmployee[i], data:dataTime}
         
                }
                
                return res.json(dataEmployee)
            }
            catch(e)
            {
                console.log(e)
                return res.status(500).send("Có lỗi xảy ra")
            }
            
        })
    }
    catch(e)
    {

    }
    //#endregion api get data
}

export const report_schedule = async (app)=>{
    //#region  api get data
    try
    {
        app.get(prefixApi +"/report", helper.authenToken, async (req,res)=>{
    
            try
            {
                if(! await helper.checkPermission("61e6e38607faee0053c02ecb", req.body._caller.id_employee_group)) return res.status(400).send("Thất bại! Bạn không có quyền sử dụng chức năng này!")

                const dataEmployee = await ModelEmployee.find({id_branch:req.body._caller.id_branch_login});
                const fromdate = sanitize(req.query.fromdate)
                const todate = sanitize(req.query.todate)
                for(let i = 0 ; i <dataEmployee.length ; i++)
                {
                    const dataTime = await ModelTimekeepingSchedule.find({$and:[{id_employee:dataEmployee[i]._id},{createdAt:{$gte:new Date(fromdate+" 00:00:00")}},{createdAt:{$lte:new Date(todate+" 23:59:59")}}]});
                    dataEmployee[i] = {...dataEmployee[i], data:dataTime}
         
                }
                
                return res.json(dataEmployee)
            }
            catch(e)
            {
                console.log(e)
                return res.status(500).send("Có lỗi xảy ra")
            }
            
        })
    }
    catch(e)
    {

    }
    //#endregion api get data
}

export const getDataSchedule = async (app)=>{
    //#region  api get data
    try
    {
        app.get(prefixApi+"/byEmployee", helper.authenToken, async (req,res)=>{
            
            let query = {id_employee:req.body._caller._id}
            let limit = 10
            let offset = 0;
            console.log(req.query)
            if(validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate))
            {
                query = {...query,$and:[{createdAt:{$gte:new Date(req.query.fromdate+" 00:00:00")}},{createdAt:{$lte:new Date(req.query.todate+" 23:59:59")}}]}
            }
            if(validator.isDefine(req.query.limit))
            {
                limit = validator.tryParseInt(req.query.limit)
            }
            if(validator.isDefine(req.query.offset))
            {
                offset = validator.tryParseInt(req.query.offset)
            }
            const dataTime = await ModelTimekeepingSchedule.find(query).sort({createdAt:-1}).skip(offset).limit(limit)
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


export const addTimekeepingSchedule_byAdmin = async (app)=>{
    //#region  api get data
    try
    {
        app.post(prefixApi+"/admin", helper.authenToken, async (req,res)=>{
            const id_employee = sanitize(req.body.id_employee)
            const dataEm = await ModelEmployee.findById(id_employee)
            if(!dataEm) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")
            
            const dataWork = await ModelTimekeepingSchedule.findOne({id_employee:id_employee,$and:[{createdAt:{$gte:validator.dateTimeZone("GMT +07:00").startOfDay}},{createdAt:{$lte:validator.dateTimeZone("GMT +07:00").endOfDay}}]})
            if(dataWork) return res.status(400).send("Thất bại! Nhân viên này đã chấm công hôm nay")

            const in_noon = sanitize(req.body.in_noon)
            const out_noon = sanitize(req.body.out_noon)
            const in_night = sanitize(req.body.in_night)
            const out_night = sanitize(req.body.out_night)

            const dataBranch = await ModelBranch.findById(req.body._caller.id_branch_login)
            if(!dataBranch) return res.status(400).send("Thất bại! Không tìm thấy chi nhánh")

            var late_noon = {hours:0,minutes:0,seconds:0}
            if(validator.isChecked(in_noon))
            {
                if((dataBranch.in_noon_schedule.hours * 60 + dataBranch.in_noon_schedule.minutes + dataBranch.late_limit) < (validator.tryParseInt(in_noon.hours)*60+ validator.tryParseInt(in_noon.minutes)))
                {
                    const late = (validator.tryParseInt(in_noon.hours)*60+ validator.tryParseInt(in_noon.minutes)) - (dataBranch.in_noon_schedule.hours * 60 + dataBranch.in_noon_schedule.minutes)

                    late_noon = {
                        hours: validator.tryParseInt(late/60),
                        minutes: validator.tryParseInt(late%60) ,
                        seconds:0
                    }
                }
            }

            var late_night = {hours:0,minutes:0,seconds:0}
            if(validator.isChecked(in_night))
            {
                if((dataBranch.in_night_schedule.hours * 60 + dataBranch.in_night_schedule.minutes + dataBranch.late_limit) < (validator.tryParseInt(in_night.hours)*60+ validator.tryParseInt(in_night.minutes)))
                {
                    const late = (validator.tryParseInt(in_night.hours)*60+ validator.tryParseInt(in_night.minutes)) - (dataBranch.in_night_schedule.hours * 60 + dataBranch.in_night_schedule.minutes)

                    late_night = {
                        hours: validator.tryParseInt(late/60),
                        minutes: validator.tryParseInt(late%60) ,
                        seconds:0
                    }
                }
            }
            let overtime = {hours:0,minutes:0,seconds:0}
            if((validator.tryParseInt(out_night).hours*60+validator.tryParseInt(out_night).minutes) > (dataBranch.out_night_schedule.hours*60+dataBranch.out_night_schedule.minutes + dataBranch.late_limit))
            {
                const over = (validator.tryParseInt(out_night).hours*60+validator.tryParseInt(out_night).minutes) - (dataBranch.out_night_schedule.hours*60+dataBranch.out_night_schedule.minutes)
                overtime = {hours: validator.tryParseInt(over/60), minutes:validator.tryParseInt(over%60),seconds:0}
            }

             const data = await new ModelTimekeepingSchedule({
                    id_employee:id_employee,
                    in_noon :in_noon ,
                    out_noon :out_noon ,
                    in_night :in_night ,
                    out_night :out_night,
                    late_noon:late_noon,
                    late_night:late_night,
                    overtime:overtime,
                    createdAt:validator.dateTimeZone("GMT +07:00").currentTime
                }).save()
            if(!data) return res.status(500).send("Thất bại! Có lỗi xảy ra")
            return res.json(data)
        })
    }
    catch(e)
    {
        validator.throwError(e);
        res.status(500).send("Có lỗi xảy ra");
    }
    //#endregion api get data

}