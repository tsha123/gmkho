const prefixApi = '/api/inventory';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'

import {ModelCategory} from '../../models/Category.js'
import {ModelSubCategory} from '../../models/SubCategory.js'
import {ModelExportForm} from '../../models/ExportForm.js'
import {ModelImportForm} from '../../models/ImportForm.js'
import {ModelProduct} from '../../models/Product.js'
import { ModelReportInventory } from '../../models/ReportInventory.js'

import * as warehouse from '../ControllerWarehouse/index.js'
import * as category from '../ControllerCategory/index.js'

export const checkPermission = async (app) => {
    app.get(prefixApi +"/checkPermission", helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("6229b26b9536efa0b53b053f", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        const warehouses = await warehouse.getWarehouseByBranch(req.body._caller.id_branch_login)
        const categories = await category.get_array_category()
        return res.json({warehouses:warehouses, categories:categories})
    })
}


export const management = async (app) => {
    app.get(prefixApi, helper.authenToken, async (req, res) => {
        if (!await helper.checkPermission("6229b26b9536efa0b53b053f", req.body._caller.id_employee_group)) return res.status(403).send("Thất bại! Bạn không có quyền truy cập chức năng này")
        const fromdate = req.query.fromdate
        const todate = req.query.todate
        const id_warehouse = req.query.id_warehouse
        // // let queryCurrent = {}
        // // if (validator.isDefine(req.query.fromdate) && validator.isDefine(req.query.todate)) {
        // //     queryPeriod = {
        // //         createdAt: { $lt: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } 
        // //     }
        // //     queryCurrent = {
        // //         $and: [{ createdAt: { $gte: validator.dateTimeZone(undefined, new Date(req.query.fromdate)).startOfDay } },{ createdAt: { $lte:validator.dateTimeZone(undefined, new Date(req.query.todate)).endOfDay  } }]
        // //     }
        // // }
  
        // if (!validator.ObjectId.isValid(id_warehouse)) return res.status(400).send("Thất bại! Không tìm thấy kho")
        // const query = {
        //     id_warehouse:validator.ObjectId(id_warehouse), 
        //     createdAt: { $lte:validator.dateTimeZone(undefined, new Date(todate)).endOfDay  }
        // }
        // const dataImport = await ModelReportInventory.aggregate([
        //     {
        //         $match:query
        //     },
        //     {
        //         $project:{
        //             id_subcategory:1,
        //             quantity_import_period:{
        //                 $cond:{
        //                     if:{$lt:["$createdAt", validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay] },
        //                     then: "$import_quantity",
        //                     else:0
        //                 }
        //             },
        //             money_import_period:{
        //                 $cond:{
        //                     if:{$lt:["$createdAt", validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay] },
        //                     then: "$import_money",
        //                     else:0
        //                 }
        //             },
        //             quantity_import_current:{
        //                 $cond:{
        //                     if:{ $gte: ["$createdAt" ,validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay ]},
        //                     then: "$import_quantity",
        //                     else:0
        //                 }
        //             },
        //             money_import_current:{
        //                 $cond:{
        //                     if:{ $gte: ["$createdAt" ,validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay ]},
        //                     then: "$import_money",
        //                     else:0
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $group:{
        //             _id:"$id_subcategory",
        //             quantity_import_period:{$sum:"$quantity_import_period"},
        //             money_import_period:{$sum:"$money_import_period"},
        //             quantity_import_current:{$sum:"$quantity_import_current"},
        //             money_import_current:{$sum:"$money_import_current"},
        //         }
        //     }
        // ])

        // const dataExport = await ModelExportForm.aggregate([
        //     {
        //         $match:query
        //     },
        //     {
        //         $unwind:{
        //             path:"$export_form_product"
        //         }
        //     },
        //     {
        //         $lookup:{
        //             from:"products",
        //             localField:"export_form_product.id_product",
        //             foreignField:"_id",
        //             as:"product"
        //         }
        //     },
        //     {
        //         $unwind:{
        //             path:"$product"
        //         }
        //     },
        //     {
        //         $project:{
        //             id_subcategory:"$export_form_product.id_subcategory",
        //             money_import_of_export_period:{
        //                 $cond:{
        //                     if:{$lt:["$createdAt", validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay] },
        //                     then: "$product.product_import_price",
        //                     else:0
        //                 }
        //             }
        //             ,
        //             money_import_of_export_current:{
        //                 $cond:{
        //                     if:{$gte:["$createdAt", validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay] },
        //                     then: "$product.product_import_price",
        //                     else:0
        //                 }
        //             },
        //             money_export_current:{
        //                 $cond:{
        //                     if:{$gte:["$createdAt", validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay] },
        //                     then: {$multiply: [{ $subtract: [{ $subtract: ["$export_form_product.product_export_price", { $multiply: [{ $divide: ["$export_form_product.product_export_price", 100] }, "$export_form_product.product_ck"] }] }, "$export_form_product.product_discount"] }, "$export_form_product.product_quantity"] , },
        //                     else:0
        //                 }
        //             },
        //             quantity_export_current:{
        //                 $cond:{
        //                     if:{$gte:["$createdAt", validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay] },
        //                     then: "$export_form_product.product_quantity",
        //                     else:0
        //                 }
        //             },
        //             quantity_export_period:{
        //                 $cond:{
        //                     if:{$lt:["$createdAt", validator.dateTimeZone(undefined, new Date(fromdate)).startOfDay] },
        //                     then: "$export_form_product.product_quantity",
        //                     else:0
        //                 }
        //             },

        //         }
        //     },
        //     {
        //         $group: {
        //             _id: "$id_subcategory",
        //             money_import_of_export_period: { $sum: "$money_import_of_export_period" },
        //             money_import_of_export_current: { $sum: "$money_import_of_export_current" },
        //             money_export_current:{$sum:"$money_export_current"},
        //             quantity_export_current:{$sum:"$quantity_export_current"},
        //             quantity_export_period:{$sum:"$quantity_export_period"},
     
                    
        //         }
        //     }
            
        // ])
        
        // for(let i =0; i<dataImport.length;i++){
        //     dataImport[i].money_import_of_export_period = 0
        //     dataImport[i].money_import_of_export_current = 0
        //     dataImport[i].money_export_current = 0
        //     dataImport[i].quantity_export_current = 0
        //     dataImport[i].quantity_export_period = 0

        //     dataImport[i].subcategory_name = ""
        //     dataImport[i].id_category = ""
        //     const dataSub = await ModelSubCategory.findById(dataImport[i]._id)
        //     if(dataSub){
        //         dataImport[i].subcategory_name = dataSub.subcategory_name
        //         dataImport[i].id_category = dataSub.id_category
        //     }
        //     for(let j =0;j<dataExport.length; j++){
        //         if (dataImport[i]._id.toString() == dataExport[j]._id.toString()) {
                   
        //             dataImport[i].money_import_of_export_period += dataExport[j].money_import_of_export_period 
        //             dataImport[i].money_import_of_export_current += dataExport[j].money_import_of_export_current 
        //             dataImport[i].money_export_current += dataExport[j].money_export_current 
        //             dataImport[i].quantity_export_current += dataExport[j].quantity_export_current
        //             dataImport[i].quantity_export_period += dataExport[j].quantity_export_period
        //             dataExport.splice(j,1)
        //             j--
        //     }
        //     }
        // }

        // return res.json(dataImport)
        const data = await get_inventory(fromdate, todate, id_warehouse)
        return res.json(data)
    })
}

const get_inventory = async (fromdate , todate , id_warehouse) =>{
    try{
        fromdate = new Date(fromdate +" 00:00:00")
        todate = new Date(todate +" 23:59:59")
        const dataImport = await ModelImportForm.aggregate([ // nhập hiện tại
        {
            $match: {
                import_form_type:{$ne: validator.TYPE_IMPORT_BORROWING},
                id_warehouse:validator.ObjectId(id_warehouse),
                createdAt: { $lte: todate}
            }
        },
        {
            $unwind: {
                path: "$import_form_product"
            }
        },
        {
            $project: {
                ID_SubCategory: "$import_form_product.id_subcategory",
                QuantityPeriod: {
                    $cond:
                    {
                        if: { $lt: ["$createdAt", fromdate ] },
                        then: "$import_form_product.product_quantity",
                        else: 0
                    }
                    
                },
                ImportPeriod: {
                    $cond:
                    {
                        if: { $lt: ["$createdAt", fromdate ] },
                        then: {
                            $cond: {
                                if: { $eq: ["$import_form_type", validator.TYPE_IMPORT_RETURN] },
                                // then: { $multiply: [{ $subtract: [{ $subtract: ["$Product.ImportPrice", { $multiply: [{ $divide: ["$Product.ImportPrice", 100] }, "$Product.TradeDiscount"] }] }, "$Product.Discount"] }, "$Product.Quantity"] },
                                then: "$import_form_product.product_import_price_return",
                                else: { $multiply: [{ $subtract: ["$import_form_product.product_import_price", { $multiply: [{ $divide: ["$import_form_product.product_import_price", 100] }, "$import_form_product.product_ck"] }] }, "$import_form_product.product_quantity"] }
                            }
                        },
                        else: 0
                    }
                },
                ImportCurrent: {
                    $cond:
                    {
                        if: { $gte: ["$createdAt", fromdate ] },
                        then: {
                            $cond: {
                                if: { $eq: ["$import_form_type", validator.TYPE_IMPORT_RETURN] },
                                // then: { $multiply: [{ $subtract: [{ $subtract: ["$Product.ImportPrice", { $multiply: [{ $divide: ["$Product.ImportPrice", 100] }, "$Product.TradeDiscount"] }] }, "$Product.Discount"] }, "$Product.Quantity"] },
                                then: "$import_form_product.product_import_price_return",
                                else: { $multiply: [{ $subtract: ["$import_form_product.product_import_price", { $multiply: [{ $divide: ["$import_form_product.product_import_price", 100] }, "$import_form_product.product_ck"] }] }, "$import_form_product.product_quantity"] }
                            }
                        },
                        else: 0
                    }
                    
                },
                QuantityCurrent: {
                    $cond:
                    {
                        if: { $gte: ["$createdAt", fromdate ] },
                        then: "$import_form_product.product_quantity",
                        else: 0
                    }
                    
                },
            }
        },
       
        {
            $group: {
                _id: "$ID_SubCategory",
                QuantityCurrent: { $sum: "$QuantityCurrent" },
                ImportCurrent: { $sum: "$ImportCurrent" },
                ImportPeriod:{$sum:"$ImportPeriod"},
                QuantityPeriod:{$sum:"$QuantityPeriod"}
                
            }
        }
    ])

    const dataExport = await ModelExportForm.aggregate([ // nhập hiện tại
    {
        $match: {
            export_form_type:{$ne: validator.TYPE_EXPORT_BORROWING},
            id_warehouse: validator.ObjectId(id_warehouse),
            createdAt: { $lte: todate }
        }
    },
    {
        $unwind: {
            path: "$export_form_product"
        }
    },
    {
        $project: {
            ID_SubCategory: "$export_form_product.id_subcategory",
            QuantityExportPeriod: {
                $cond:
                {
                    if: { $lt: ["$createdAt", fromdate ] },
                    then: "$export_form_product.product_quantity",
                    else: 0
                }
                
            },
            // ExportPeriod: {
            //     $cond:
            //     {
            //         if: { $lt: ["$createdAt", fromdate ] },
            //         then: {
            //            $multiply: [{ $subtract: [{ $subtract: ["$Product.product_export_price", { $multiply: [{ $divide: ["$Product.product_export_price", 100] }, "$Product.CK"] }] }, "$Product.Discount"] }, "$Product.Number"] , 
            //         },
            //         else: 0
            //     }
            // },
            ImportOfExportPeriod: {
                $cond:
                {
                    if: { $lt: ["$createdAt", fromdate ] },
                    then: "$export_form_product.product_import_price" ,
                    else: 0
                }
            },
            ExportCurrent: {
                $cond:
                {
                    if: { $gte: ["$createdAt", fromdate ] },
                    then: {
                        $multiply: [{ $subtract: [{ $subtract: ["$export_form_product.product_export_price", { $multiply: [{ $divide: ["$export_form_product.product_export_price", 100] }, "$export_form_product.product_ck"] }] }, "$export_form_product.product_discount"] }, "$export_form_product.product_quantity"] , 
                    },
                    else: 0
                }
                
            },
            ImportOfExportCurrent: {
                $cond:
                {
                    if: { $gte: ["$createdAt", fromdate ] },
                    then: "$export_form_product.product_import_price" ,
                    else: 0
                }
                
            },
            QuantityExportCurrent: {
                $cond:
                {
                    if: { $gte: ["$createdAt", fromdate] },
                    then: "$export_form_product.product_quantity",
                    else: 0
                }
                
            },
        }
    },

    {
        $group: {
            _id: "$ID_SubCategory",
            QuantityExportCurrent: { $sum: "$QuantityExportCurrent" },
            ExportCurrent: { $sum: "$ExportCurrent" },
            // ExportPeriod:{$sum:"$ExportPeriod"},
            QuantityExportPeriod:{$sum:"$QuantityExportPeriod"},
            ImportOfExportCurrent:{$sum:"$ImportOfExportCurrent"},
            ImportOfExportPeriod:{$sum:"$ImportOfExportPeriod"}
            
        }
    }
])
 
    for (let i = 0; i < dataImport.length; i++){
        dataImport[i] = {
            ...dataImport[i],
            QuantityExportCurrent: 0,
            ExportCurrent: 0,
            // ExportPeriod: 0,
            QuantityExportPeriod: 0,
            ImportOfExportCurrent:0,
            ImportOfExportPeriod:0
            
        }
        for (let j = 0; j < dataExport.length; j++){
           
            if (dataImport[i]._id.toString() == dataExport[j]._id.toString()) {
               
                    dataImport[i].QuantityExportCurrent += dataExport[j].QuantityExportCurrent 
                    dataImport[i].ExportCurrent += dataExport[j].ExportCurrent 
                    // dataImport[i].ExportPeriod += dataExport[j].ExportPeriod 
                    dataImport[i].QuantityExportPeriod += dataExport[j].QuantityExportPeriod 
                    dataImport[i].ImportOfExportCurrent += dataExport[j].ImportOfExportCurrent
                    dataImport[i].ImportOfExportPeriod += dataExport[j].ImportOfExportPeriod
               
                dataExport.splice(j,1)
                j--
            }
         
        }
    }
    for(let i =0;i<dataImport.length;i++){
        if(dataImport[i]._id.toString() == "62e25982ac23489afdaa708c"){
            console.log(dataImport[i])
        }
        dataImport[i].Name = ""
        dataImport[i].CategoryName = ""
        dataImport[i].ID_Category = ""
        dataImport[i].ImportNew = 0

        const dataPro = await ModelProduct.find({$and:
            [
                {id_warehouse:validator.ObjectId(id_warehouse)},
                {id_subcategory:validator.ObjectId(dataImport[i]._id)}
            ]}).sort({_id:-1}).limit(1)

        if(dataPro && dataPro.length == 1){
            dataImport[i].ImportNew = dataPro[0].product_import_price
        }
        const dataSub = await ModelSubCategory.findById(dataImport[i]._id).lean()
        if(dataSub) {
            dataImport[i].Name = dataSub.subcategory_name
            dataImport[i].Unit = dataSub.subcategory_unit
            dataImport[i].ID_Category = dataSub.id_category
        }
    }
    return dataImport
    }
    catch(e){
        console.error(e)
        return null
    }
    
}