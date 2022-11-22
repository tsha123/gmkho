const prefixApi = '/api/gm-feed/promotion';
import sanitize from "mongo-sanitize";
import * as helper from '../../../helper/helper.js'
import * as validator from '../../../helper/validator.js'

import { ModelPromotion } from '../../../models/Promotion.js'
import multer from 'multer'
import path from 'path';
export const management = async (app)=>{
    app.get(prefixApi,helper.authenToken, async (req, res)=>{
        try {
          
            if(!await helper.checkPermission("62611d0fd3a3a02443abf68e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            let query = {}
            
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    ...validator.query_createdAt(req.query.fromdate , req.query.todate)
                }
            }
  
            let sort = {_id:-1}
            if (validator.isDefine(req.query.key)) {
                const search_key = validator.viToEn(req.query.key).replace(/[^a-zA-Z0-9]/g, " ")
                query = {
                    ...query,
                    $or:[{$text: {$search: search_key}}],
                }
                sort= {
                    score: { $meta: "textScore" },
                    ...sort,
                } 
            }
            if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
                query = {_id: validator.ObjectId(req.query.key)}
                    
            }
           
            const data = await ModelPromotion.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            const count = await ModelPromotion.countDocuments(query)
            return res.json({data:data, count:count})
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, validator.URL_IMAGE_PROMOTION)
    },
    filename: function(req, file, cb) {
        cb(null,path.basename(file.originalname).replace(path.extname(file.originalname),'-') + Date.now() + path.extname(file.originalname))
    }
});
const upload_image = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        // if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/jfif") {
            cb(null, true)
        // } else {
        //     return cb(new Error('Only image are allowed!'))
        // }
    }
}).fields([{name:'image_promotion'}]);

export const get_by_id = async (app)=>{
    app.get(prefixApi +"/byId",helper.authenToken, async (req, res)=>{
        try {
            if(!await helper.checkPermission("62611d0fd3a3a02443abf68e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const id_promotion = req.query.id_promotion
            
            if(!validator.isDefine(id_promotion) || !validator.ObjectId.isValid(id_promotion)) return res.status(400).send("Thất bại! Không tìm thấy khuyển mại này")
            const data = await ModelPromotion.findById(id_promotion)
            return res.json(data)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const insert = async (app)=>{
    app.post(prefixApi,helper.authenToken, async (req, res)=>{
        try {
            if(!await helper.checkPermission("62611d0fd3a3a02443abf68e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            upload_image(req, res, async (err) =>{
                try{
                    if(err) return res.status(400).send(err)  
                    const id_promotion = req.body.id_promotion
                    const arr_image_delete = JSON.parse(req.body.array_image_delete)
                    const promotion_url = req.body.promotion_url
                    const title_promotion = req.body.title_promotion
                    const promotion_content = req.body.promotion_content
                    const promotion_index = validator.tryParseInt(req.body.promotion_index)
                    if(!validator.isDefine(title_promotion) || title_promotion.length ==0) return res.status(400).send("Tiêu đề không được để trống")
                    const arrImage = []
                 
                    if( req.files && req.files.image_promotion )
                    {
                      
                        for(let i = 0;i<req.files.image_promotion.length;i++)  // thêm ảnh từ mảng mới up lên
                        {
                            arrImage.push(req.files.image_promotion[i].filename)
                        }
                    }
                  
                    if(validator.isDefine(id_promotion) && id_promotion.length > 0 && validator.ObjectId.isValid(id_promotion)){
                        const dataPro = await ModelPromotion.findById(id_promotion)
                        if(!dataPro) return res.status(400).send("Thất bại! Không tìm thấy khuyến mại này")
                        for(let i =0;i<dataPro.promotion_images.length;i++){
                            for(let j =0;j<arr_image_delete.length;j++){
                                if(dataPro.promotion_images[i] == arr_image_delete[j] ){
                                    dataPro.promotion_images.splice(i,1)
                                    i--
                                }
                            }
                        }
                        for(let i =0;i<dataPro.promotion_images.length;i++){
                            arrImage.push(dataPro.promotion_images[i])
                        }
                    }
                 
                    const values = {
                        promotion_url:promotion_url,
                        promotion_title:title_promotion,
                        promotion_content:promotion_content,
                        promotion_images:arrImage,
                        promotion_index:promotion_index
                    }
    
                    if(validator.isDefine(id_promotion) && id_promotion.length > 0 && validator.ObjectId.isValid(id_promotion)){
                        await ModelPromotion.findByIdAndUpdate(id_promotion,values)

                    }
                    else{
                        await new ModelPromotion(values).save()

                    }
                    return res.json("Success")
                }
                catch(e){
                    console.log(e)
                    return res.status(500).send("Thất bại! Có lỗi xảy ra")
                }
                
                
            })
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const get_data_client = async (app)=>{
    app.get(prefixApi+"/client", async (req, res)=>{
        try {
            let query = {}
            
            if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
                query = {
                    ...query,
                    ...validator.query_createdAt(req.query.fromdate , req.query.todate)
                }
            }
  
            let sort = {_id:-1}
            if (validator.isDefine(req.query.key)) {
                const search_key = validator.viToEn(req.query.key).replace(/[^a-zA-Z0-9]/g, " ")
                query = {
                    ...query,
                    $or:[{$text: {$search: search_key}}],
                }
                sort= {
                    score: { $meta: "textScore" },
                    ...sort,
                } 
            }
            if (validator.isDefine(req.query.key) && validator.ObjectId.isValid(req.query.key)) {
                query = {_id: validator.ObjectId(req.query.key)}
                    
            }
           
            const data = await ModelPromotion.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
       
            return res.json({data:data})
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}