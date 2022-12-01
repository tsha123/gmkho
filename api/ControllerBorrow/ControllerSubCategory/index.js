const prefixApi = '/api/subcategory';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import multer from 'multer'
import path from 'path';

import { ModelSubCategory } from '../../models/SubCategory.js'
import { ModelCategory } from '../../models/Category.js'
import { ModelInventoryWarning } from '../../models/InventoryWarning.js'
import { ModelWarehouse } from '../../models/Warehouse.js'
import { info } from "console";
import { Model_Website_Component } from "../../models/WebsiteComponent.js"
export const management = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi, helper.authenToken, async(req, res) => {
        try {
            // if (!await helper.checkPermission("61e4cc4369a5d379b7a29821", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            var arrCategory = []
            if (req.query.getOther === 'true') {
                arrCategory = await ModelCategory.find()
            }
            var query = {}
            var sort = {_id:-1}
            var data = []
            var count = 0
            const key = req.query.key
            const status = req.query.subcategory_status
            if (validator.isDefine(key)) {
                query = {
                    subcategory_name:{$regex:".*"+key+".*",$options:"i"}
                }
                if (validator.isDefine(req.query.id_category) && validator.ObjectId.isValid(req.query.id_category)) {
                    query = {
                        ...query,
                        id_category: req.query.id_category
                    }
                }
                if (validator.isDefine(status) && !isNaN(parseInt(status))) {
                    if (validator.tryParseInt(status) >= -1 && validator.tryParseInt(status) <= 1) {
                        query = {
                            ...query,
                            subcategory_status: validator.tryParseInt(status)
                        }
                    }
    
                }
       
                data = await ModelSubCategory.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
                count = await ModelSubCategory.countDocuments(query)
                 if(data.length > 0)
                    return res.json({ data: data, count: count, arrCategory: arrCategory })
                
                    
            }
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
            if (validator.isDefine(req.query.id_category) && validator.ObjectId.isValid(req.query.id_category)) {
                query = {
                    ...query,
                    id_category: req.query.id_category
                }
            }
            if (validator.isDefine(status) && !isNaN(validator.tryParseInt(status))) {
                if (validator.tryParseInt(status) >= -1 && validator.tryParseInt(status) <= 1) {
                    query = {
                        ...query,
                        subcategory_status: validator.tryParseInt(status)
                    }
                }

            }
            data = await ModelSubCategory.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            count = await ModelSubCategory.countDocuments(query)
          
            return res.json({ data: data, count: count, arrCategory: arrCategory })
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const findOther = async(app) => {
    app.get(prefixApi + "/findOther", helper.authenToken, async(req, res) => {
        let query = {}
        var sort = { _id: -1 }
        const key = req.query.key
        if (validator.isDefine(key)) {
            query = {
                ...query,
                $or:[{subcategory_name:{$regex:".*"+key+".*",$options:"i"}},{subcategory_replace_name:{$regex:".*"+key+".*",$options:"i"}}]
            }
        }

        if (validator.isDefine(req.query.id_category) && validator.ObjectId.isValid(req.query.id_category)) {
            query = {
                ...query,
                id_category: req.query.id_category
            }
        }
        if (validator.isDefine(req.query.subcategory_status) && !isNaN(validator.tryParseInt(req.query.subcategory_status))) {
            if (validator.tryParseInt(req.query.subcategory_status) >= -1 && validator.tryParseInt(req.query.subcategory_status) <= 1) {
                query = {
                    ...query,
                    subcategory_status: validator.tryParseInt(req.query.subcategory_status)
                }
            }

        }

        var data = await ModelSubCategory.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
        if(!data || data.length == 0){
            if (validator.isDefine(key)) {
                const search_key = validator.viToEn(key).replace(/[^a-zA-Z0-9]/g, " ")
                    query = {
                        $or:[{$text: {$search: search_key}}],
                        ...query,
                    }
                    sort= {
                        score: { $meta: "textScore" },
                        ...sort,
                    } 
            }
            data = await ModelSubCategory.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
        }
        return res.json(data)
    });

}
export const insert = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.post(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("61e4cc4369a5d379b7a29821", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const subcategory_name = req.body.subcategory_name
            const subcategory_import_price = validator.tryParseInt(req.body.subcategory_import_price)
            const subcategory_export_price = validator.tryParseInt(req.body.subcategory_export_price)
            const subcategory_export_price_web = validator.tryParseInt(req.body.subcategory_export_price_web)
            const subcategory_vat = validator.tryParseInt(req.body.subcategory_vat)
            const subcategory_ck = validator.tryParseInt(req.body.subcategory_ck)
            const subcategory_discount = validator.tryParseInt(req.body.subcategory_discount)
            const subcategory_warranty = validator.tryParseInt(req.body.subcategory_warranty)
            const subcategory_part = validator.tryParseInt(req.body.subcategory_part)
            const subcategory_point = validator.tryParseInt(req.body.subcategory_point)
            const subcategory_unit = req.body.subcategory_unit
            const number_warning = validator.tryParseInt(req.body.number_warning)
            const id_category = req.body.id_category
            const dataWarehouse = await ModelWarehouse.find();
            var subcategory_warehouses = []
            for (let i = 0; i < dataWarehouse.length; i++) {
                subcategory_warehouses.push({
                    id_warehouse: dataWarehouse[i]._id,
                    limit_inventory: number_warning,
                    current_inventory: 0
                })
            }
            const dataCategory = await ModelCategory.findById(id_category)
            if (!dataCategory) return res.status(400).send("Danh mục không tồn tại")
            try {
                const insertNew = await new ModelSubCategory({
                    subcategory_name: subcategory_name,
                    subcategory_import_price: subcategory_import_price,
                    subcategory_export_price: subcategory_export_price,
                    subcategory_vat: subcategory_vat,
                    subcategory_ck: subcategory_ck,
                    subcategory_discount: subcategory_discount,
                    subcategory_warranty: subcategory_warranty,
                    subcategory_part: subcategory_part,
                    subcategory_point: subcategory_point,
                    subcategory_unit: subcategory_unit,
                    id_category: id_category,
                    subcategory_warehouses: subcategory_warehouses,
                    subcategory_export_price_web:subcategory_export_price_web
                }).save()

                if (!insertNew) return res.status(400).send("Thất bại! Có lỗi xảy ra")

                return res.json(insertNew)

            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }


        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const update = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.put(prefixApi, helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("61e4cc4369a5d379b7a29821", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const subcategory_name = req.body.subcategory_name
            const subcategory_import_price = validator.tryParseInt(req.body.subcategory_import_price)
            const subcategory_export_price = validator.tryParseInt(req.body.subcategory_export_price)
            const subcategory_vat = validator.tryParseInt(req.body.subcategory_vat)
            const subcategory_ck = validator.tryParseInt(req.body.subcategory_ck)
            const subcategory_discount = validator.tryParseInt(req.body.subcategory_discount)
            const subcategory_warranty = validator.tryParseInt(req.body.subcategory_warranty)
            const subcategory_part = validator.tryParseInt(req.body.subcategory_part)
            const subcategory_point = validator.tryParseInt(req.body.subcategory_point)
            const subcategory_unit = req.body.subcategory_unit
            const subcategory_export_price_web = validator.tryParseInt(req.body.subcategory_export_price_web)
            const id_category = req.body.id_category
            const dataCategory = await ModelCategory.findById(id_category)
            if (!dataCategory) return res.status(400).send("Danh mục không tồn tại")

            const id_subcategory = req.body.id_subcategory
            const dataSub = await ModelSubCategory.findById(id_subcategory)
            if (!dataSub) return res.status(400).send("Thất bại! Không tìm thấy sản phẩm")
            try {
                const updateNew = await ModelSubCategory.findByIdAndUpdate(dataSub._id, {
                    subcategory_name: subcategory_name,
                    subcategory_import_price: subcategory_import_price,
                    subcategory_export_price: subcategory_export_price,
                    subcategory_vat: subcategory_vat,
                    subcategory_ck: subcategory_ck,
                    subcategory_discount: subcategory_discount,
                    subcategory_warranty: subcategory_warranty,
                    subcategory_part: subcategory_part,
                    subcategory_point: subcategory_point,
                    subcategory_unit: subcategory_unit,
                    subcategory_export_price_web:subcategory_export_price_web,
                    id_category: id_category,
                })
                if (!updateNew) return res.status(400).send("Thất bại! Có lỗi xảy ra")
                return res.json(updateNew)

            } catch (e) {
                console.log(e)
                return res.status(500).send("Thất bại! Có lỗi xảy ra")
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}


export const addExcel = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.post(prefixApi + "/excel", helper.authenToken, async(req, res) => {
        try {
            if (!await helper.checkPermission("61e4cc4369a5d379b7a29821", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")

            const arrExcel = req.body.arrayExcel
            const dataWarehouse = await ModelWarehouse.find()
            var subcategory_warehouses = []
            for (let i = 0; i < dataWarehouse.length; i++) {
                subcategory_warehouses.push({
                    id_warehouse: dataWarehouse[i]._id,
                    limit_inventory: 0,
                    current_inventory: 0
                })
            }
            for (let i = 0; i < arrExcel.length; i++) {
                arrExcel[i].subcategory_warehouses = subcategory_warehouses // thêm mảng kho vào sản phẩm
                arrExcel[i].subcategory_replace_name = arrExcel[i].subcategory_name

                const datasub = await ModelSubCategory.findOne({ subcategory_name: arrExcel[i].subcategory_name })
                const datacategory = await ModelCategory.findById(arrExcel[i].id_category)
                if (!datacategory) return res.status(400).send(`Thất bại! Không tìm thấy danh mục của sản phẩm ${arrExcel[i].subcategory_name} `)

                if (datasub) return res.status(400).send(`Thất bại! Sản phẩm ${arrExcel[i].subcategory_name} đã có trong hệ thống`)
                for (let j = i + 1; j < arrExcel.length; j++) {


                    if (arrExcel[i].subcategory_name == arrExcel[j].subcategory_name) {
                        arrExcel.splice(j, 1)
                        j--
                    }
                }
            }


            const insertArr = await ModelSubCategory.insertMany(arrExcel);

            return res.json(insertArr)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}



export const getDataClient = async(app) => {
    //#region api lấy danh sách chức năng và nhóm người dùng
    app.get(prefixApi + "/client", async(req, res) => {
        try {

            validator.eshtml(req)
            var query = {}
            var sort = {_id:-1}
            var query2 = {}
            const key = req.query.key
            if (validator.isDefine(key)) {
                query2 = {
                    $or:[{subcategory_name:{$regex:".*"+key+".*", $options:"i"}},{subcategory_replace_name:{$regex:".*"+key+".*", $options:"i"}}]
                }
                const search_key = validator.viToEn(key).replace(/[^a-zA-Z0-9]/g, " ")
                query = {
                    ...query,
                    $or:[{$text: {$search: search_key}}],
                }
                sort= {
                    score: { $meta: "textScore" },
                    ...sort,
                } 
            }
            if (validator.isDefine(req.query.id_category) && validator.ObjectId.isValid(req.query.id_category)) {
                query = {
                    ...query,
                    id_category: req.query.id_category
                }
                query2= {
                    ...query2,
                    id_category: req.query.id_category
                }
            }
            if (validator.isDefine(req.query.subcategory_status)) {
                query = {
                    ...query,
                    subcategory_status:validator.tryParseInt(req.query.subcategory_status)
                }
                query2 = {
                    ...query2,
                    subcategory_status:validator.tryParseInt(req.query.subcategory_status)
                }
            }
            if (validator.isDefine(req.query.fromprice) && validator.isDefine(req.query.toprice)) {
                query = {
                    ...query,
                    $and: [
                        {
                            subcategory_export_price:{$gte:validator.tryParseInt(req.query.fromprice)}
                        },
                        {
                            subcategory_export_price:{$lte:validator.tryParseInt(req.query.toprice)}
                        }
                    ]
                }

                query2 = {
                    ...query2,
                    $and: [
                        {
                            subcategory_export_price:{$gte:validator.tryParseInt(req.query.fromprice)}
                        },
                        {
                            subcategory_export_price:{$lte:validator.tryParseInt(req.query.toprice)}
                        }
                    ]
                }
            }
           
            if (validator.isDefine(req.query.sort) && validator.isDefine(req.query.valuesort)) {
                sort = {
                    [sanitize(req.query.sort)]: validator.tryParseInt(req.query.valuesort) }
            }
            
            var data = await ModelSubCategory.find(query2).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            if(!data || data.length == 0){
                data = await ModelSubCategory.find(query).sort(sort).skip(validator.getOffset(req)).limit(validator.getLimit(req))
            }
            return res.json(data)
        } catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

export const detail_subcategory = async (app) => {
    app.get(prefixApi + "/detail", async (req, res) => { 
        try {
            var query = {}
            Object.keys(req.query).map(key => {
                query = {
                    ...query,
                    [key]:req.query[key]
                }
            })
            const data = await ModelSubCategory.findOne(query)
            
            if (data) {
                for (let i = 0; i < data.subcategory_related.length; i++){
                    const dataSub = await ModelSubCategory.findById(data.subcategory_related[i].id_subcategory)
                    data.subcategory_related[i].subcategory_export_price = 0
                    if (dataSub) {
                        data.subcategory_related[i].subcategory_export_price = dataSub.subcategory_export_price
                    } 
                }
                
            }
            return res.json(data)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}

export const flash_sale_mobile = async (app) => {
    app.get(prefixApi + "/flash-sale", async (req, res) => { 
        try {
            const dataMenu = await Model_Website_Component.find();

            const array_subcategory = []

            for(let i =0;i<dataMenu.length;i++){
                const products = dataMenu[i].Content.home_flash_sale_products.Products
                for(let j = 0;j<products.length;j++){
                    const dataSub = await ModelSubCategory.findById(products[j])
                    if(dataSub){
                        array_subcategory.push(dataSub)
                    }
                }
            }
            return res.json(array_subcategory)
        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
    
}