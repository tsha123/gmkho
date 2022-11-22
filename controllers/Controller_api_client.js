// import MobileDetect from "mobile-detect"
import * as validator from "./../helper/validator.js"
import * as helper from "./../helper/helper.js"
//import api
const FIXED_LIMIT = validator.FIXED_LIMIT
const prefix_api_client = `/api/client`
//import model

import { Model_Website_Component } from "./../models/WebsiteComponent.js"
import { ModelBranch } from "./../models/Branch.js"
import { ModelSubCategory } from "./../models/SubCategory.js"
//
function controller_api_client(app) {
    init(app)
}
export default controller_api_client

function init(app) {
    try {
        app.get(prefix_api_client + "/init", async (req, res) => {
            const data_website_component = await get_data_website_components()
            const data = {
                data_website_component: data_website_component,
            }
            return res.status(200).json(data)
        })
    } catch (err) {
        throwError(err)
    }
}
//key_website_components
const _key_website_component__footer_branch = `Footer_Branch`
const _key_website_component__home_flash_sale_products = `home_flash_sale_products`
//id-website-component
const _id_website_component = validator.id_website_component_shopweb
//
async function get_data_website_components() {
    let data_website_component = await Model_Website_Component.findById(_id_website_component)
    console.log(`data_website_component`, data_website_component)
    //lấy thông tin chi nhánh
    const arr_id_branch = data_website_component?.Content[_key_website_component__footer_branch]?.Content || []
    let arr_branch = []
    for (let i = 0; i < arr_id_branch.length; i++) {
        const _data_branch = await ModelBranch  .findById(arr_id_branch[i])
        if (_data_branch) {
            arr_branch.push(_data_branch)
        }
    }
    data_website_component.Content[_key_website_component__footer_branch].data = arr_branch
    //thông tin sản phẩn flash sale
    const arr_id_flash_sale_products = data_website_component?.Content[_key_website_component__home_flash_sale_products]?.Products || []
    let arr_branch_products = []
    for (let i = 0; i < arr_id_flash_sale_products.length; i++) {
        const _data_products = await ModelSubCategory.findById(arr_id_flash_sale_products[i])
        if (_data_products) {
            arr_branch_products.push(_data_products)
        }
    }
    data_website_component.Content[_key_website_component__home_flash_sale_products].data = arr_branch_products
    //return data
    return data_website_component
}
