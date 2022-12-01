const prefixApi = '/api/point';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelPoint} from '../../models/Point.js'
import {ModelUser} from '../../models/User.js'



export const management = async (app)=>{
   
    app.get(prefixApi, async (req, res)=>{
        const data = await ModelPoint.findOne()
        return res.json(data)
    })
  
}



export const update = async (app)=>{
    try
    {
        app.put(prefixApi,  helper.authenToken, async (req, res)=>{
            if(!await helper.checkPermission("620c93815ce304199a9db351", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const point_number = validator.tryParseInt(req.body.point_number)
            const point_value = validator.tryParseInt(req.body.point_value)
            try
            {
                const dataUpdate = await ModelPoint.updateOne({}, {
                    point_number: point_number,
                    point_value:point_value
                   
                })
                return res.json(dataUpdate)
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
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}

export const update_point_user = async (id_user , point) =>{
    try{
        // await ModelUser.findByIdAndUpdate(id_user,{$inc:{user_point:point}})
    }
    catch(e){
        console.log(e)
    }
}
export const checkValuePoint = async (app) => {
    app.get(prefixApi + "/check", helper.authenToken, async (req, res) => {
        try
        {
            const id_user = req.query.id_user
            const point = req.query.point_number
            const dataPoint = await ModelPoint.findOne()
            const result = await checkPoint(id_user, point, res)
            return  res.json({
                dataPoint: dataPoint,
                result: result
            })
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
export const checkPoint = async (id_user, point_number, res) => {
    try
    {  
        if(! validator.ObjectId.isValid(id_user)) return ("Thất bại! Không tìm thấy khách hàng")
        point_number = validator.tryParseInt(point_number)
        const dataPoint = await ModelPoint.findOne()
        if (!dataPoint) return res.status(400).send("Không tìm thấy chỉ số quy đổi")
        const data_user = await ModelUser.findById(id_user)
        if (!data_user) return res.status(400).send("Thất bại! Không tìm thấy khách hàng")
        if (point_number > data_user.user_point) return res.status(400).send(`Khách hàng không đủ ${point_number} điểm để thực hiện quy đổi`)
      
        return (dataPoint.point_value/ dataPoint.point_number)*point_number
    }
    catch (e) {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
   
}

export const checkPointReturnZero = async (id_user, point_number) => {
    try
    {  
        if(! validator.ObjectId.isValid(id_user)) return ("Thất bại! Không tìm thấy khách hàng")
        point_number = validator.tryParseInt(point_number)
        const dataPoint = await ModelPoint.findOne()
        if (!dataPoint) return ("Không tìm thấy chỉ số quy đổi")
        const data_user = await ModelUser.findById(id_user)
        if (!data_user) return ("Thất bại! Không tìm thấy khách hàng")
        if (point_number > data_user.user_point) return (`Khách hàng không đủ ${point_number} điểm để thực hiện quy đổi`)
      
        return (dataPoint.point_value/ dataPoint.point_number)*point_number
    }
    catch (e) {
        
        return ("Thất bại! Có lỗi xảy ra")
    }
   
}