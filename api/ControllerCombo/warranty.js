const prefixApi = '/api/warranty-combo';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelWarrantyCombo} from '../../models/WarrantyCombo.js'


export const management = async (app)=>{
    try
    {
        app.get(prefixApi,  helper.authenToken, async (req, res)=>{
            if(!await helper.checkPermission("61e632b906c24a9d47558f7e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            var query = {}
            if(validator.isDefine(req.query.key))
            {
                query = {...query, warranty_combo_name:{$regex:".*"+ sanitize(req.query.key) +".*",$options:"i"}}
            }
            const data = await ModelWarrantyCombo.find(query).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            const count = await ModelWarrantyCombo.countDocuments(query)
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
            if(!await helper.checkPermission("61e632b906c24a9d47558f7e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            
            try
            {
                const warranty_combo_name = req.body.warranty_combo_name.trim()
                const arrContent = req.body.arrContent
                if(warranty_combo_name.length == 0) return res.status(400).send("Thất bại! Tên combo không được để trống")
                if(arrContent.length == 0) return res.status(400).send("Thất bại! Combo phải có ít nhất 1 giá trị")
                
                const insertNew = await new ModelWarrantyCombo({
                    warranty_combo_name:warranty_combo_name,
                    warranty_combo_content:arrContent
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
            if(!await helper.checkPermission("61e632b906c24a9d47558f7e", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            try
            {
                const warranty_combo_name = req.body.warranty_combo_name.trim()
                const arrContent = req.body.arrContent
                const id_combo = req.body.id_combo
                const dataCombo = await ModelWarrantyCombo.findById(id_combo)
                if(!dataCombo) return res.status(400).send("Thất bại! Không tìm thấy combo này")

                if(warranty_combo_name.length == 0) return res.status(400).send("Thất bại! Tên combo không được để trống")
                if(arrContent.length == 0) return res.status(400).send("Thất bại! Combo phải có ít nhất 1 giá trị")
                
                const updateNew = await ModelWarrantyCombo.findByIdAndUpdate(dataCombo._id,{
                    warranty_combo_name:warranty_combo_name,
                    warranty_combo_content:arrContent,
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
