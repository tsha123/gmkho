const prefixApi = '/api/promotion-combo';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelPromotionCombo} from '../../models/PromotionCombo.js'


export const management = async (app)=>{
    try
    {
        app.get(prefixApi,  helper.authenToken, async (req, res)=>{
            if(!await helper.checkPermission("61e632af06c24a9d47558f7c", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            var query = {}
            if(validator.isDefine(req.query.key))
            {
                query = {...query, promotion_combo_name:{$regex:".*"+ sanitize(req.query.key) +".*",$options:"i"}}
            }
            const data = await ModelPromotionCombo.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            const count = await ModelPromotionCombo.countDocuments(query)
            return res.json({data:data, count:count})
        })
    }
    catch(e)
    {
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}

export const insert = async (app)=>{
    try
    {
        app.post(prefixApi,  helper.authenToken, async (req, res)=>{
            if(!await helper.checkPermission("61e632af06c24a9d47558f7c", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            
            try
            {
                const promotion_combo_name = req.body.promotion_combo_name.trim()
                const arrContent = req.body.arrContent
                if(promotion_combo_name.length == 0) return res.status(400).send("Thất bại! Tên combo không được để trống")
                if(arrContent.length == 0) return res.status(400).send("Thất bại! Combo phải có ít nhất 1 giá trị")
                
                const insertNew = await new ModelPromotionCombo({
                    promotion_combo_name:promotion_combo_name,
                    promotion_combo_content:arrContent
                }).save()
                return res.json(insertNew)
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


export const update = async (app)=>{
    try
    {
        app.put(prefixApi,  helper.authenToken, async (req, res)=>{
            if(!await helper.checkPermission("61e632af06c24a9d47558f7c", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            try
            {
                const promotion_combo_name = req.body.promotion_combo_name.trim()
                const arrContent = req.body.arrContent
                const id_combo = req.body.id_combo
                const dataCombo = await ModelPromotionCombo.findById(id_combo)
                if(!dataCombo) return res.status(400).send("Thất bại! Không tìm thấy combo này")

                if(promotion_combo_name.length == 0) return res.status(400).send("Thất bại! Tên combo không được để trống")
                if(arrContent.length == 0) return res.status(400).send("Thất bại! Combo phải có ít nhất 1 giá trị")
                
                const updateNew = await ModelPromotionCombo.findByIdAndUpdate(dataCombo._id,{
                    promotion_combo_name:promotion_combo_name,
                    promotion_combo_content:arrContent,
                })
                return res.json(updateNew)
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
