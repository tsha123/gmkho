const prefixApi = '/api/warehouse';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelWarehouse} from '../../models/Warehouse.js'
import {ModelSubCategory} from '../../models/SubCategory.js'

export const getWarehouse = async (id_branch) =>
{
    const data = await ModelWarehouse.find({id_branch:id_branch,warehouse_status:true})
    return data
}

export const management = async (app)=>{
    try
    {
        app.get(prefixApi,  helper.authenToken, async (req, res)=>{
            if(!await helper.checkPermission("61e1585020006610c388a12d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const data = await ModelWarehouse.find({id_branch:req.body._caller.id_branch_login}).sort({warehouse_index:1})
            return res.json(data)
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
            if(!await helper.checkPermission("61e1585020006610c388a12d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const warehouse_name = req.body.warehouse_name
            const warehouse_phone = req.body.warehouse_phone
            const warehouse_address = req.body.warehouse_address

            if(! validator.isDefine(warehouse_name) ) return res.status(400).send("Tên kho không được để trống")
            try
            {
                const dataInsert = await new ModelWarehouse({
                    warehouse_name:warehouse_name,
                    warehouse_phone:warehouse_phone,
                    warehouse_address:warehouse_address,
                    id_branch:req.body._caller.id_branch_login,

                }).save()
                const subcategory_warehouses = {
                    id_warehouse:dataInsert._id,
                    limit_inventory:0,
                    current_inventory:0
                }
                const dataSub = await ModelSubCategory.updateMany({},{
                    $push:{
                        subcategory_warehouses:subcategory_warehouses
                    }
                })
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
        console.log(e)
        return res.status(500).send("Thất bại! Có lỗi xảy ra")
    }
}


export const update = async (app)=>{
    try
    {
        app.put(prefixApi,  helper.authenToken, async (req, res)=>{
            if(!await helper.checkPermission("61e1585020006610c388a12d", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
            const warehouse_name = req.body.warehouse_name
            const warehouse_phone = req.body.warehouse_phone
            const warehouse_address = req.body.warehouse_address
            const warehouse_status = req.body.warehouse_status
            const id_warehouse = req.body.id_warehouse
            const warehouse_index = validator.tryParseInt(req.body.warehouse_index)
            const dataWarehouse = await ModelWarehouse.findById(id_warehouse)
            if(!dataWarehouse) return res.status(400).send("Thất bại! Không tìm thấy kho")
            if(! validator.isDefine(warehouse_name) ) return res.status(400).send("Tên kho không được để trống")
            try
            {
                const dataUpdate = await ModelWarehouse.findByIdAndUpdate(dataWarehouse._id,{
                    warehouse_name:warehouse_name,
                    warehouse_phone:warehouse_phone,
                    warehouse_address:warehouse_address,
                    warehouse_status:warehouse_status,
                    warehouse_index:warehouse_index
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

export const getWarehouseByBranch = async (idbranch) =>{
    try{
        let query = {warehouse_status:true}
        if(idbranch && validator.ObjectId.isValid(idbranch)) query = {
            $and:[query,{id_branch:idbranch}]
        }

        const data = await ModelWarehouse.find(query).sort({warehouse_index:1})
        return data
    }
    catch(e){
        console.log(e)
        return []
    }
}

export const getWarehouseOtherBranch = async (idbranch) =>{
    try{
        const data = await ModelWarehouse.find({$and:[{id_branch:{$ne:idbranch}},{warehouse_status:true}]}).sort({warehouse_index:1})
        return data
    }
    catch(e){
        console.log(e)
        return []
    }
}

