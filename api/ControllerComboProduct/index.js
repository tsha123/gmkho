const prefixApi = '/api/combo-product-to-sale';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelSubCategory} from '../../models/SubCategory.js'
import {ModelComboProduct} from '../../models/ComboProduct.js'
import {ModelEmployee} from '../../models/Employee.js'



export const management = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        // if (!await helper.checkPermission("62f9fbd80ae0dd89ef483ce5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        getData(req, res)
    })
}


export const insert = async (app) => {
    app.post(prefixApi, helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("62f9fbd80ae0dd89ef483ce5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        insert_or_update(req, res)
        
    })
}

export const delete_combo = async (app) => {
    app.delete(prefixApi, helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("62f9fbd80ae0dd89ef483ce5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        remove_combo(req, res)
        
    })
}

export const update = async (app) => {
    app.put(prefixApi, helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("62f9fbd80ae0dd89ef483ce5", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        insert_or_update(req, res)
        
    })
}

const insert_or_update = async (req, res) =>{
    try{
        const array_subcategory = JSON.parse(req.body.array_subcategory)
        const combo_name = req.body.combo_name
        const combo_type = req.body.combo_type
        if(!combo_name || combo_name.length == 0) return res.status(400).send(`Thất bại! Tên combo không được để trống`)
        if(array_subcategory.length == 0) return res.status(400).send(`Thất bại! Hãy chọn ít nhất 1 sản phẩm`)

        const id_employee = req.body._caller._id
        const id_combo = req.body.id_combo
        var data = null
        if(id_combo && validator.ObjectId.isValid(id_combo)){
            data = await ModelComboProduct.findByIdAndUpdate(id_combo,{
                array_subcategory:array_subcategory,
                combo_name:combo_name,
                combo_type:combo_type
            })
        }
        else{
            data = await new ModelComboProduct({
                array_subcategory:array_subcategory,
                id_employee:id_employee,
                combo_name:combo_name,
                combo_type:combo_type
            }).save()
        }
        return res.json(data)
    }
    catch(e){
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }   
}

const getData = async (req, res) =>{
    try{
        const key = req.query.key
        var data = []
        var count = 0
        var sort = {_id:-1}
        var combo_type = req.query.combo_type

        
        let query = {
            combo_name:{$regex:".*"+key+".*",$options:"i"},
        }
        
        if(validator.isDefine(combo_type)){
            query = {
                ...query,
                combo_type:combo_type
            }
            
        }
        data = await ModelComboProduct.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
        count = await ModelComboProduct.countDocuments(query)
        if(data.length == 0){
            if (validator.isDefine(key)) {
                const search_key = validator.viToEn(key).replace(/[^a-zA-Z0-9]/g, " ")
                query = {
                    $text: {$search: search_key},
                }             
                sort= {
                    score: { $meta: "textScore" },
                    ...sort,
                } 
            
            }
            if(validator.isDefine(combo_type)){
                query = {
                    ...query,
                    combo_type:combo_type
                }
            }
            data = await ModelComboProduct.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            count = await ModelComboProduct.countDocuments(query)
        }
        
        await Promise.all( data.map(async item =>{
            const dataEm = await ModelEmployee.findById(item.id_employee)
            if(dataEm){
                item['employee_fullname'] = dataEm.employee_fullname
            }
            item.total_money = 0
            for(let i =0;i<item.array_subcategory.length;i++){
                item.array_subcategory[i].subcategory_name= ""
                item.array_subcategory[i].subcategory_export_price= 0
                item.array_subcategory[i].subcategory_warranty= 0
                item.array_subcategory[i].product_vat= 0
                item.array_subcategory[i].product_ck= 0
                item.array_subcategory[i].product_discount= 0
                item.array_subcategory[i].product_quantity = item.array_subcategory[i].quantity
                item.array_subcategory[i].product_warranty = 0
                item.array_subcategory[i].product_export_price  = 0
                const dataSub = await ModelSubCategory.findById(item.array_subcategory[i].id_subcategory)
  
                if(dataSub){
                    item.array_subcategory[i].subcategory_name = dataSub.subcategory_name
                    if(item.combo_type != "Combo khuyến mại"){
                        item.array_subcategory[i].product_warranty  = dataSub.subcategory_warranty
                        item.array_subcategory[i].product_export_price  = dataSub.subcategory_export_price
                        item.array_subcategory[i].subcategory_export_price = dataSub.subcategory_export_price
                        item.total_money += item.array_subcategory[i].subcategory_export_price * item.array_subcategory[i].quantity 
                        item.array_subcategory[i].subcategory_warranty = dataSub.subcategory_warranty
                    }
                }
                
                
            }
            
        }))

        return res.json({
            data:data,
            count:count
        })


    }
    catch(e){
        return res.json({
            data:[],
            count:0
        })
    }
}

const remove_combo = async (req, res)=>{
    try{    
        const id_combo = req.body.id_combo
        const data = await ModelComboProduct.findByIdAndDelete(id_combo)
        return res.json(data)
    }
    catch(e){
        console.error(e)
        return res.status(500).send(`Thất bại! Có lỗi xảy ra`)
    }
}
