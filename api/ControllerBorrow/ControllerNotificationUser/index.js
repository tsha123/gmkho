const prefixApi = '/api/notification';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'

import {ModelNotificationUser} from '../../models/Notification_User.js'

export const getData = async (app)=>{
   
     app.get(prefixApi,  helper.authenToken, async (req, res)=>{
       
            try
            {
                var query = {id_user:validator.ObjectId(req.body._caller._id)}
                let sort = {_id:-1}
                if(req.query.sort && validator.isDefine(req.query.sort)) sort = JSON.parse(req.query.sort)
                Object.keys(req.query).map( key =>{
                    query = {
                        ...query,
                        [key]:req.query[key]
                    }
                })
                const data = await ModelNotificationUser.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
                return res.json(data)
            }
            catch(e)
            {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
    })

}

export const update_status = async (app)=>{
   
    app.put(prefixApi,  helper.authenToken, async (req, res)=>{
      
           try
           {
              const id_notification = req.body.id_notification
              if(!id_notification || !validator.ObjectId.isValid(id_notification)) return res.status(400).send("Không tìm thấy thông báo")
              const data = await ModelNotificationUser.findByIdAndUpdate(id_notification,{notification_status:true})
              return res.status(data)
           }
           catch(e)
           {
               console.log(e)
               return res.status(500).send("Thất bại! Có lỗi xảy ra")
           }
   })

}

