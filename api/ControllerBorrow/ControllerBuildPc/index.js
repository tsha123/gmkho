const prefixApi = '/api/build-pc';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import { ModelSubCategory } from '../../models/SubCategory.js'
import { ModelCategory } from '../../models/Category.js'
import { Model_Website_Component } from '../../models/WebsiteComponent.js'

export const find_data_build_pc = async (app) => {
    app.get(prefixApi + "/search-data", async (req, res) => {
        await find_subcategory(req, res)
    })
}

export const info_build_pc = async (app) => {
    app.get(prefixApi, async (req, res) => {
        const data = await get_menu_category()
        return res.json({ components: data })
    })
}

export const info_build_pc_app = async (app) => {
    app.get(prefixApi + "/app", async (req, res) => {
        const data = await get_menu_category()
        return res.json(data.Content.menu_build_pc)
    })
}


const find_subcategory = async (req, res) => {
    try {

        const id_category = req.query.id_category
        if (!id_category && !validator.ObjectId(id_category)) return res.json({ data: [], count: 0 })

        console.log(req.query.array_query)
        const key = req.query.key
        const value_sort = validator.tryParseInt(req.query.sort)
        const page = validator.tryParseInt(req.query.page)
        const limit = 10
        const array_query = JSON.parse(req.query.array_query)

        const categories = await ModelCategory.find({}).lean()
        const parents = validator.load_parent_category(categories, id_category)
        parents.arr_ids.push(validator.ObjectId(id_category))

        var sort = {}
        if (value_sort != 0) {
            sort = {
                subcategory_export_price: value_sort
            }
        }
        let query = {
            id_category: { $in: parents.arr_ids },
            subcategory_status: 1,
            subcategory_export_price: { $gt: 0 }
        }

        for (let i = 0; i < categories.length; i++) {
            if (categories[i]._id.toString() == id_category.toString()) {
                parents.arr_child_category.push(categories[i])
                break
            }
        }
        var query_or = {}
        for (let i = 0; i < parents.arr_child_category.length; i++) {
            const category = parents.arr_child_category[i]
            for (let j = 0; j < category.category_options.length; j++) {

                Object.keys(array_query).map(alt_query => {
                    if (category.category_options[j].category_options_alt == alt_query) {
                        if (!query_or[alt_query]) {
                            query_or[alt_query] = []
                        }
                        query = {
                            ...query,
                            [`subcategory_options.${category._id.toString()}.${alt_query}`]: { $in: array_query[alt_query] }
                        }

                    }
                })
            }
        }

        const query1 = {
            $or: [{ subcategory_replace_name: { $regex: ".*" + key + ".*", $options: "i" } }, { subcategory_text_search: { $regex: ".*" + key + ".*", $options: "i" } }],
            ...query
        }
        var data = await ModelSubCategory.find(query1).skip(page).limit(limit).sort(sort).lean()
        var count = await ModelSubCategory.countDocuments(query)
        if (!data || data.length == 0) {
            if (validator.isDefine(key)) {
                const search_key = validator.viToEn(key).replace(/[^a-zA-Z0-9]/g, " ")
                query = {
                    $text: { $search: search_key },
                    ...query
                }
                sort = {
                    score: { $meta: "textScore" },
                    ...sort,
                }
            }
            data = await ModelSubCategory.find(query).skip(page).limit(limit).sort(sort).lean()
            count = await ModelSubCategory.countDocuments(query)
        }
        return res.json({ data: data, count: count })
    }
    catch (e) {
        console.error(e)
        return res.status(500).send(`error`)
    }
}

export const get_menu_category = async () => {
    const categories = await ModelCategory.find()
    const components = await Model_Website_Component.findOne({ MenuName: helper.NAME_WEBSITE_COMPONENT })

    if (validator.isDefine(components.Content.menu_build_pc)) {
        for (let i = 0; i < components.Content.menu_build_pc.array_category.length; i++) {
            for (let j = 0; j < categories.length; j++) {
                if (components.Content.menu_build_pc.array_category[i].toString() == categories[j]._id.toString()) {

                    const parents = validator.load_parent_category(categories, categories[j]._id)
                    components.Content.menu_build_pc.array_category[i] = categories[j]

                    components.Content.menu_build_pc.array_category[i].category_options = [
                        ...components.Content.menu_build_pc.array_category[i].category_options,
                        ...group_option_category(parents.arr_child_category)
                    ]
                    // console.log(parents)
                }
            }
            // if(components.Content.menu_build_pc.array_category[i])
            // // const dataCategory = await ModelCategory.findById(components.Content.menu_build_pc.array_category[i])
            // if(dataCategory) components.Content.menu_build_pc.array_category[i] = dataCategory
        }
    }
    if (validator.isDefine(components.Content.list_subcategory_build_pc)) {
        for (let i = 0; i < components.Content.list_subcategory_build_pc.array_subcategory.length; i++) {
            const dataSub = await ModelSubCategory.findById(components.Content.list_subcategory_build_pc.array_subcategory[i])
            components.Content.list_subcategory_build_pc.array_subcategory[i] = dataSub
        }
    }
    return components
}


const group_option_category = (array) => {
    const data = []
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].category_options.length; j++) {
            data.push(array[i].category_options[j])
        }
    }
    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            if (data[i].category_options_name = data[j].category_options_name && data[i].category_options_alt == data[j].category_options_alt) {
                data[i] = {
                    ...data[i].category_options_values,
                    ...data[j].category_options_values,
                }
                data.splice(j, 1)
                j--
            }
        }
    }
    return data
}
