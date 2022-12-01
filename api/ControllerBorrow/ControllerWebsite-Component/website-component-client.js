//6272511fda540000f1000fc2
import sanitize from "mongo-sanitize"
import * as helper from "./../../helper/helper.js"
import * as validator from "./../../helper/validator.js"
import { ModelCategory } from "./../../models/Category.js"
import { ModelSubCategory } from "./../../models/SubCategory.js"
import { ModelMenu } from "./../../models/Menu.js"
import { ModelBranch } from "./../../models/Branch.js"
import { Model_Website_Component } from "./../../models/WebsiteComponent.js"
const prefixApi = "/api/website-component-client"
const FIXED_LIMIT = 10
const NAME_WEBSITE_COMPONENT = helper.NAME_WEBSITE_COMPONENT

export const website_component_client = async (app) => {
    app.get(prefixApi + "/init", async (req, res) => {
        try {
            const data_menu = await get_data_menu()
            const data_website_component = await get_data_website_component()
            const object = {
                data_menu: data_menu,
                data_website_component: data_website_component,
            }
            return res.status(200).json(object)
        } catch (e) {
            validator.throwError(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}
//lấy dữ liệu website component
async function get_data_website_component() {
    let data_website_component = await Model_Website_Component.findOne({ MenuName: NAME_WEBSITE_COMPONENT })
    //Thông tin chi nhánh chân trang
    let arr_id_branch = data_website_component?.Content?.Footer_Branch?.Content
    let arr_branch = []
    for (let i = 0; i < arr_id_branch.length; i++) {
        const _data_branch = await ModelBranch.findById(arr_id_branch[i])
        if (_data_branch) {
            arr_branch.push(_data_branch)
        }
    }
    data_website_component.Content.Footer_Branch.data = arr_branch
    return data_website_component
}
//lấy dữ liệu menu
async function get_data_menu() {
    let data_website_component = await Model_Website_Component.findOne({ MenuName: NAME_WEBSITE_COMPONENT })
    const _id_website_component = data_website_component?._id
    const data_menu = await ModelMenu.find({ id_website_component: validator.ObjectId(_id_website_component), display_app: true, id_parent: null }).sort({ serial_number: -1 })
    // for (let i = 0; i < data_menu.length; i++) {
    //     const _data = await ModelCategory.findById(data_menu[i]?.id_represent_category)
    //     data_menu[i] = {
    //         ...data_menu[i],
    //         data_represent_category: _data,
    //     }
    // }
    // console.log(data_menu)
    return data_menu
}
