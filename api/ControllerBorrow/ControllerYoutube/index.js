const prefixApi = '/api/youtube';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelYoutube} from '../../models/Youtube.js'


export const management = async (app)=>{
   
    app.get(prefixApi ,helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("62c8f03eb5971db3a265287d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const status = req.query.status
            const key = req.query.key
            let query = {}
            if(validator.isDefine(status)){
                query = {
                    ...query,
                    youtube_status:status === 'true'
                }
            }
            if(validator.isDefine(key)){
                query = {
                    ...query,
                    $or:[{youtube_link:{$regex:".*"+key+".*",$options:"$i"}},{youtube_id:{$regex:".*"+key+".*",$options:"$i"}}]
                }
            }
            const data = await ModelYoutube.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            const count = await ModelYoutube.countDocuments(query)
            return res.json({data:data, count:count})
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}



export const insert = async (app)=>{
   
    app.post(prefixApi ,helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("62c8f03eb5971db3a265287d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const youtube_link = req.body.youtube_link
            const youtube_id = req.body.youtube_id
            const youtube_index = req.body.youtube_index

            if(!validator.isDefine(youtube_link) || !validator.isDefine(youtube_id)) return res.status(400).send(`Thất bại! Link và ID không được để trống`)
            
            const insert_new = await new ModelYoutube({
                youtube_link:youtube_link,
                youtube_id:youtube_id,
                youtube_index:youtube_index,
                youtube_status:true
            }).save()
            return res.json(insert_new)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const update = async (app)=>{
   
    app.put(prefixApi ,helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("62c8f03eb5971db3a265287d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const youtube_link = req.body.youtube_link
            const youtube_id = req.body.youtube_id
            const youtube_index = req.body.youtube_index
            const youtube_status = req.body.youtube_status==='true'
            const id_video = req.body.id_video

            if(!validator.isDefine(youtube_link) || !validator.isDefine(youtube_id)) return res.status(400).send(`Thất bại! Link và ID không được để trống`)
            const dataYoutube = await ModelYoutube.findById(id_video)
            if(!dataYoutube) return res.status(400).send(`Thất bại! Không tìm thấy video`)

            const update_new = await ModelYoutube.findByIdAndUpdate(dataYoutube._id,{
                youtube_link:youtube_link,
                youtube_id:youtube_id,
                youtube_index:youtube_index,
                youtube_status:youtube_status
            },{new:true})
            return res.json(update_new)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const delete_youtube = async (app)=>{

    app.delete(prefixApi ,helper.authenToken, async (req, res) => {
        try {
            if (!await helper.checkPermission("62c8f03eb5971db3a265287d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_video = req.body.id_video
            const dataYoutube = await ModelYoutube.findById(id_video)
            if(!dataYoutube) return res.status(400).send(`Thất bại! Không tìm thấy video`)
            const delete_new = await ModelYoutube.findByIdAndDelete(dataYoutube._id)
            return res.json(delete_new)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
