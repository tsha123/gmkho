import mongoose from "mongoose";
import * as validator from "./../helper/validator.js";
import { ModelSubCategory } from "./SubCategory.js";
const SchemaProduct = new mongoose.Schema(
    {
        id_product2: {  // mã 2 của sản phẩm
            ...validator.schemaString,
            ...validator.schemaTextIndex,
            ...validator.schemaUnique,
        },// tên nhân viên
        id_subcategory:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        subcategory_name:{
            ...validator.schemaString,
            ...validator.schemaRequired
        },
        product_index:{
            ...validator.schemaNumber,
            ...validator.schemaRequired
        },
        product_vat:{
            ...validator.schemaNumber,
        },
        product_ck:{
            ...validator.schemaNumber,
        },
        id_warehouse:{
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        id_import_form:{  // mã phiếu nhập lần đầu tiên
            ...validator.schemaObjectId,
            ...validator.schemaRequired
        },
        product_status:{ //  trạng thái tồn của sản phẩm / true đã xuất / false chưa xuất
            ...validator.schemaBooleanFalse
        },
        product_import_price:{ //  trạng thái tồn của sản phẩm / true đã xuất / false chưa xuất
            ...validator.schemaNumber
        },
        id_export_form:{ // mã phiếu xuất mới nhất, giúp tìm kiếm bảo hành nhanh chóng hơn
            ...validator.schemaObjectId, 
        },
        product_warranty:{ // mã phiếu xuất mới nhất, giúp tìm kiếm bảo hành nhanh chóng hơn
            ...validator.schemaNumber, 
        },
        product_note:{
            type:[]
        }
    },
    { timestamps: true }
);

validator.schePre(SchemaProduct)

SchemaProduct.pre(['insertOne'], async function (next) {
    
    if (!this.product_status) {
       await updateInventory(this.id_subcategory, this.id_warehouse, 1)
    }
    else {
        await updateInventory(this.id_subcategory, this.id_warehouse, -1)
    }

    return next()
})

SchemaProduct.pre(['deleteOne','findByIdAnDelete'], async function (next) {
    await updateInventory(this.id_subcategory, this.id_warehouse, -1)
    return next()
})

SchemaProduct.pre(['insertMany'], async function (  next,docs,) {
    try{
        
        var arr = []
        docs.map( pro =>{
            arr.push({
                ...pro._doc,
                quantity:1
            })
        })
        for(let i =0;i<arr.length;i++){
            for(let j = i+1; j<arr.length ;j++){
                if(
                    arr[i].id_subcategory.toString() == arr[j].id_subcategory.toString() &&
                    arr[i].id_warehouse.toString() == arr[j].id_warehouse.toString() &&
                    arr[i].product_status == arr[j].product_status
                ){
                    arr[i].quantity += 1
                    arr.splice(j,1)
                    j--
                }
            }
        }
        

        await Promise.all(  arr.map( async product =>{
            if(!product.product_status){
                await updateInventory(product.id_subcategory, product.id_warehouse, product.quantity)
            }
            else{
                await updateInventory(product.id_subcategory, product.id_warehouse, -product.quantity)
            }

        })
        )
        return next()
    }
    catch(e)
    {
        console.log(e)
    }
    
})
SchemaProduct.pre(['deleteMany'], async function (  next) {
   
    try{
        const docs = await ModelProduct.find(this._conditions)
       
        var arr = []
        docs.map( pro =>{
            arr.push({
                ...pro,
                quantity:1
            })
        })
        for(let i =0;i<arr.length;i++){
            for(let j = i+1; j<arr.length ;j++){
                if(
                    arr[i].id_subcategory.toString() == arr[j].id_subcategory.toString() &&
                    arr[i].id_warehouse.toString() == arr[j].id_warehouse.toString() 
                ){
                    arr[i].quantity += 1
                    arr.splice(j,1)
                    j--
                }
            }
        }
        

        await Promise.all(  arr.map( async product =>{
            await updateInventory(product.id_subcategory, product.id_warehouse, -product.quantity)
            

        })
        )
        return next()
    }
    catch(e)
    {
        console.log(e)
    }
    
})

SchemaProduct.post(['save', 'updateOne', 'updateMany', 'findByIdAndUpdate', 'findOneAndUpdate'], async (docs) => {
    if (Array.isArray(docs)) {
        await Promise.all(  docs.map(async product => {
            await updateByCount(product)
        }))
    }
    else {
        await updateByCount(docs)
    }
    
})


const updateByCount = async (data) => {
    try {
        const countProduct = await ModelProduct.countDocuments({ id_warehouse: data.id_warehouse, id_subcategory: data.id_subcategory, product_status: false }) // đến số lượng sản phẩm hiện tại của kho
        const dataSub = await ModelSubCategory.findById(data.id_subcategory)
            for (let i = 0; i < dataSub.subcategory_warehouses.length; i++){
                if (dataSub.subcategory_warehouses[i].id_warehouse.toString() == data.id_warehouse.toString()) {
                    dataSub.subcategory_warehouses[i].current_inventory = countProduct
                    const updateSub = await ModelSubCategory.findByIdAndUpdate(data.id_subcategory, {
                        $set: {
                            subcategory_warehouses:dataSub.subcategory_warehouses
                        }
                    })
                    break
                }
            }
    }
    catch (e) {
        console.log(e)
    }
   
    
}
const updateInventory = async (id_subcategory, id_warehouse, number) =>{
    try{
        const dataSub = await ModelSubCategory.findById(id_subcategory)
        const dataWarehouse = dataSub.subcategory_warehouses
        for (let i = 0; i < dataWarehouse.length; i++){
            if (dataWarehouse[i].id_warehouse.toString() == id_warehouse.toString()) {

                dataWarehouse[i].current_inventory += number
                await ModelSubCategory.findByIdAndUpdate(dataSub._id, { $set: { subcategory_warehouses: dataWarehouse } })
                break
            }
        }
    }
    catch(e){
        console.log(e)
    }
}
export const ModelProduct = mongoose.model("Product", SchemaProduct);
