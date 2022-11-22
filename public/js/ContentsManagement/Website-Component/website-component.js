const FIXED_LIMIT = 10
var limitProduct = 10
var page = 1
var arrData = []
var arrBranch = []
var data_product_search
var arr_product_find = []
var check_slot = 0
var flag_website_component = null
var arrSubCategory = []
function getData() {
    // console.log(`??????`)
    callAPI("GET", `${API_WEBSITE_COMPONENT}`, null, (data) => {
        throwValue(data)
        loadData(data.data)
    })
}

function loadData(data) {
    $("#ul_website_component_1").empty()
    arrData = []
    if (isDefine(data)) {
        for (let i = 0; i < data.length; i++) {
            arrData.push(data[i])
            let ul = "#ul_website_component_1"
            if (data[i].MenuName == "laptop") ul = "#ul_website_component_1"
            // if (data[i].MenuName == "accessories") ul = "#ul_accessories"

            Object.keys(data[i].Content).map((key) => {
                if (data[i]?.Content[key]?.Active) {
                    $(ul).append(`
                    <li class="list-group-item" onclick="editMenu(${i},'${key}')" style="cursor: pointer;">
                        <span>${data[i].Content[key].Description}</span>
                        <i onclick="editMenu(${i},'${key}')"  class="fas fa-edit"></i>
                    </li>
                    `)
                }
            })
        }
    } else {
        info(`Không có dữ liệu`)
    }
}

function editMenu(index, key) {
    flag_website_component = index
    // console.log(index, key)
    switch (key) {
        case `SEO_image`: {
            $("#btn_Save_edit_seo_img").attr("onclick", `confirm_Save_Edit_SEO_image(${index})`)
            $("#img_seo_image").attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${arrData[index]?.Content?.SEO_image?.Content}`)
            $("#input_seo_image").val(null)
            showPopup("popup_SEO_image")
            break
        }
        case `SEO_image_alt`: {
            $("#btn_Save_edit_SEO_image_alt").attr("onclick", `confirm_Save_Edit_SEO_image_alt(${index})`)
            $(`#input_SEO_image_alt`).val(arrData[index].Content.SEO_image_alt.Content)
            showPopup("pupup_SEO_image_alt")
            break
        }
        case `SEO_description`: {
            $("#btn_Save_edit_SEO_description").attr("onclick", `confirm_Save_Edit_SEO_description(${index})`)
            $(`#input_SEO_description`).val(arrData[index].Content.SEO_description.Content)
            showPopup("pupup_SEO_description")
            break
        }
        case `SEO_title`: {
            $("#btn_Save_edit_SEO_title").attr("onclick", `confirm_Save_Edit_SEO_title(${index})`)
            $(`#input_SEO_title`).val(arrData[index].Content.SEO_title.Content)
            showPopup("pupup_SEO_title")
            break
        }
        case `SEO_url`: {
            $("#btn_Save_edit_SEO_url").attr("onclick", `confirm_Save_Edit_SEO_url(${index})`)
            $(`#input_SEO_url`).val(arrData[index].Content.SEO_url.Content)
            showPopup("pupup_SEO_url")
            break
        }
        case `SEO_type`: {
            $("#btn_Save_edit_SEO_type").attr("onclick", `confirm_Save_Edit_SEO_type(${index})`)
            $(`#input_SEO_type`).val(arrData[index].Content.SEO_type.Content)
            showPopup("pupup_SEO_type")
            break
        }
        case `Title`: {
            $("#btn_Save_edit_Title").attr("onclick", `confirm_Save_Edit_Title(${index})`)
            $("#edit_Title").val(arrData[index].Content.Title.Content.Title)
            $($("#edit_Title").closest("div").find("img")[0]).attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${arrData[index].Content.Title.Content.Image}`)
            $($("#edit_Title").closest("div").find("input[type=file]")[0]).val(null)
            showPopup("popup_Title")
            break
        }
        case `Operate_Time`: {
            $("#btn_Save_edit_Operate_Time").attr("onclick", `confirm_Save_Edit_Operate_Time(${index})`)
            $(`#input_Operate_Time`).val(arrData[index].Content.Operate_Time.Content)
            showPopup("pupup_Operate_Time")
            break
        }
        case `Hotline`: {
            $("#btn_Save_edit_Hotline").attr("onclick", `confirm_Save_Edit_Hotline(${index})`)
            $(`#input_Hotline`).val(arrData[index].Content.Hotline.Content)
            showPopup("pupup_Hotline")
            break
        }
        case `Footer_Branch`: {
            var select = $("#popup_Footer_Branch").find("select")[0]
            if (arrBranch.length == 0) {
                callAPI("GET", `${API_BRANCH}`, null, (data) => {
                    throwValue(data)
                    for (let i = 0; i < data.length; i++) {
                        arrBranch.push(data[i])
                        $(select).append(`
                            <option value="${data[i]._id}">${data[i].branch_name}</option>
                        `)
                    }
                    load_data__Footer_Branch(index)
                })
            } else {
                load_data__Footer_Branch(index)
            }
            //
            break
        }
        case `footer_introduction`: {
            load_data__footer_introduction(index)
            //
            break
        }
        case `footer_suport`: {
            load_data__footer_suport(index)
            //
            break
        }
        case `footer_common_policy`: {
            load_data__footer_common_policy(index)
            //
            break
        }
        case `footer_promotion`: {
            load_data__footer_promotion(index)
            //
            break
        }
        case `footer_description`: {
            $("#btn_Save_edit_footer_description").attr("onclick", `confirm_Save_Edit_footer_description(${index})`)
            $(`#input_footer_description`).val(arrData[index].Content.footer_description.Content)
            showPopup("pupup_footer_description")
            break
        }
        case `footer_facebook`: {
            $("#btn_Save_edit_footer_facebook").attr("onclick", `confirm_Save_Edit_footer_facebook(${index})`)
            $(`#input_footer_facebook`).val(arrData[index].Content.footer_facebook.Content)
            showPopup("pupup_footer_facebook")
            break
        }
        case `footer_note`: {
            $("#btn_Save_edit_footer_note").attr("onclick", `confirm_Save_Edit_footer_note(${index})`)
            $(`#input_footer_note`).val(arrData[index].Content.footer_note.Content)
            showPopup("pupup_footer_note")
            break
        }
        case `footer_business_license`: {
            $("#btn_Save_edit_footer_business_license").attr("onclick", `confirm_Save_Edit_footer_business_license(${index})`)
            $(`#input_footer_business_license`).val(arrData[index].Content.footer_business_license.Content)
            showPopup("pupup_footer_business_license")
            break
        }
        case `logo_header`: {
            $("#btn_Save_edit_logo_header").attr("onclick", `confirm_Save_Edit_logo_header(${index})`)
            $("#img_logo_header").attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${arrData[index]?.Content?.logo_header?.Content}`)
            $("#input_logo_header").val(null)
            showPopup("popup_logo_header")
            break
        }
        case `mobile_logo_header`: {
            $("#btn_Save_edit_mobile_logo_header").attr("onclick", `confirm_Save_Edit_mobile_logo_header(${index})`)
            $("#img_mobile_logo_header").attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${arrData[index]?.Content?.mobile_logo_header?.Content}`)
            $("#input_mobile_logo_header").val(null)
            showPopup("popup_mobile_logo_header")
            break
        }
        case `home_image_banner_flash_sale`: {
            $("#btn_Save_edit_home_image_banner_flash_sale").attr("onclick", `confirm_Save_Edit_home_image_banner_flash_sale(${index})`)
            $("#img_home_image_banner_flash_sale").attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${arrData[index]?.Content?.home_image_banner_flash_sale?.Content}`)
            $("#input_home_image_banner_flash_sale").val(null)
            showPopup("popup_home_image_banner_flash_sale")
            break
        }
        case `mobile_home_image_banner_flash_sale`: {
            $("#btn_Save_edit_mobile_home_image_banner_flash_sale").attr("onclick", `confirm_Save_Edit_mobile_home_image_banner_flash_sale(${index})`)
            $("#img_mobile_home_image_banner_flash_sale").attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${arrData[index]?.Content?.mobile_home_image_banner_flash_sale?.Content}`)
            $("#input_mobile_home_image_banner_flash_sale").val(null)
            showPopup("popup_mobile_home_image_banner_flash_sale")
            break
        }
        case `home_flash_sale_products`: {
            load_data__home_flash_sale_products(index)
            //
            break
        }
        case `home_slide_banner`: {
            load_data__home_slide_banner(index)
            //
            break
        }
        case `mobile_home_slide_banner_1`: {
            load_data__mobile_home_slide_banner_1(index)
            //
            break
        }
        case `mobile_home_slide_banner_2`: {
            load_data__mobile_home_slide_banner_2(index)
            //
            break
        }
        case `home_banner_gaming_market_01`: {
            load_data__home_banner_gaming_market_01(index)
            //
            break
        }
        case `contact_info`: {
            $(`#input_contact_info__name_company`).val(arrData[index]?.Content?.contact_info?.name_company)
            $(`#input_contact_info__address`).val(arrData[index]?.Content?.contact_info?.address)
            $(`#input_contact_info__hotline`).val(arrData[index]?.Content?.contact_info?.hotline)
            $(`#input_contact_info__email`).val(arrData[index]?.Content?.contact_info?.email)
            //
            $("#btn_Save_edit_contact_info").attr("onclick", `confirm_Save_edit_contact_info(${index})`)
            showPopup("pupup_contact_info")
            break
        }
        case `menu_build_pc`: {
            load_data__menu_build_pc(index)
            break
        }
        case `list_subcategory_build_pc`: {
            load_data__list_subcategory_build_pc(index)
            break
        }
        case `banner_build_pc`: {
            load_data__banner_build_pc(index)
            break
        }
        case `banner_news`: {
            load_data__banner_news(index)
            break
        }
        // }
        default:
            break
    }
}
//#region title
function confirm_Save_Edit_Title(index) {
    const _id = arrData[index]._id
    const title = $("#edit_Title").val().trim()
    if (title.length == 0) {
        info("Tiêu đề không được để trống")
        return
    }
    const image = $($($("#edit_Title").closest("div")).find("input[type=file]")[0])[0].files[0]
    var data = new FormData()
    data.append("_id", _id)
    data.append("title", title)
    data.append("image_title", image)
    hidePopup("popup_Title")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/title`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion title
//#region SEO_image
function confirm_Save_Edit_SEO_image(index) {
    const _id = arrData[index]._id
    const seo_image = $("#input_seo_image")[0].files[0]
    var data = new FormData()
    data.append("_id", _id)
    data.append("seo_image", seo_image)
    hidePopup("popup_SEO_image")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/seo-image`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion SEO_image
//#region SEO_image_alt
function confirm_Save_Edit_SEO_image_alt(index) {
    const _id = arrData[index]._id
    const seo_image_alt = $("#input_SEO_image_alt").val()
    var data = {
        _id: _id,
        seo_image_alt: seo_image_alt,
    }
    hidePopup("pupup_SEO_image_alt")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/seo-image-alt`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion SEO_image_alt
//#region SEO_description
function confirm_Save_Edit_SEO_description(index) {
    const _id = arrData[index]._id
    const seo_description = $("#input_SEO_description").val()
    var data = {
        _id: _id,
        seo_description: seo_description,
    }
    hidePopup("pupup_SEO_description")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/seo-description`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion SEO_description
//#region SEO_title
function confirm_Save_Edit_SEO_title(index) {
    const _id = arrData[index]._id
    const seo_title = $("#input_SEO_title").val()
    var data = {
        _id: _id,
        seo_title: seo_title,
    }
    hidePopup("pupup_SEO_title")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/seo-title`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion SEO_title
//#region SEO_url
function confirm_Save_Edit_SEO_url(index) {
    const _id = arrData[index]._id
    const seo_url = $("#input_SEO_url").val()
    var data = {
        _id: _id,
        seo_url: seo_url,
    }
    hidePopup("pupup_SEO_url")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/seo-url`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion SEO_title
//#region SEO_type
function confirm_Save_Edit_SEO_type(index) {
    const _id = arrData[index]._id
    const seo_type = $("#input_SEO_type").val()
    var data = {
        _id: _id,
        seo_type: seo_type,
    }
    hidePopup("pupup_SEO_type")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/seo-type`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion SEO_type
//#region Operate_Time
function confirm_Save_Edit_Operate_Time(index) {
    const _id = arrData[index]._id
    const operate_time = $("#input_Operate_Time").val()
    var data = {
        _id: _id,
        operate_time: operate_time,
    }
    hidePopup("pupup_Operate_Time")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/operate-time`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion Operate_Time
//#region Hotline
function confirm_Save_Edit_Hotline(index) {
    const _id = arrData[index]._id
    const hotline = $("#input_Hotline").val()
    var data = {
        _id: _id,
        hotline: hotline,
    }
    hidePopup("pupup_Hotline")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/hotline`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion Hotline
//#region Footer_Branch
function load_data__Footer_Branch(index) {
    $("#div_list_branch table").empty()
    for (let i = 0; i < arrBranch.length; i++) {
        for (let j = 0; j < arrData[index].Content.Footer_Branch.Content.length; j++) {
            if (arrBranch[i]._id == arrData[index].Content.Footer_Branch.Content[j]) {
                $(`#div_list_branch table`).append(`
                    <tr>
                    <td style="padding: 10px">
                            ${arrBranch[i].branch_name}
                            <input type="text" name="id_branch" value="${arrBranch[i]._id}" style="display:none;">
                        </td>
                        <td style="width:50px">
                            <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                        </td>
                    </tr>
                `)
            }
        }
    }
    $("#btn_Save_edit_Footer_Branch").attr("onclick", `confirm_Save_Edit_Footer_Branch(${index})`)
    showPopup(`popup_Footer_Branch`)
}
function add_branch_into_table() {
    var select = $($("#popup_Footer_Branch").find("select")[0])

    var arrID = $("#popup_Footer_Branch").find("input[name=id_branch]")
    for (let i = 0; i < arrID.length; i++) {
        if ($(select).val() == $(arrID[i]).val()) {
            info("Chi nhánh này đã tồn tại")
            return
        }
    }
    $(`#div_list_branch table`).prepend(`
        <tr>
            <td style="padding: 10px">
                ${$($(select).find("option:selected")[0]).text()}
                <input type="text" name="id_branch" value="${$(select).val()}" style="display:none;">
            </td>
            <td style="width:50px">
                <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
            </td>
        </tr>
    `)
}
function confirm_Save_Edit_Footer_Branch(index) {
    const _id = arrData[index]._id
    var arrIDBranch = []
    var arrID = $("#popup_Footer_Branch").find("input[name=id_branch]")
    for (let i = 0; i < arrID.length; i++) {
        arrIDBranch.push($(arrID[i]).val())
    }
    hidePopup("popup_Footer_Branch")

    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/Footer_Branch`,
        {
            arrBranch: arrIDBranch,
            _id: _id,
        },
        () => {
            success("Thành công")
            getData()
        }
    )
}
//#endregion Footer_Branch
//#region footer_introduction
function load_data__footer_introduction(index) {
    $(`#input_Content_footer_introduction`).val(null)
    $(`#input_Link_footer_introduction`).val(null)
    var table = $($("#popup_footer_introduction").find("table")[0])
    $(table).empty()
    for (let i = 0; i < arrData[index].Content.footer_introduction.Content.length; i++) {
        $(table).append(`
            <tr>
                <td>
                    <a target="_blank" href="${arrData[index].Content.footer_introduction.Content[i].Link}">${arrData[index].Content.footer_introduction.Content[i].Content}</a>
                </td>
                <td style="width:50px">
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    }
    $("#btn_Save_footer_introduction").attr("onclick", `confirm_Save_Edit_btn_Save_footer_introduction(${index})`)
    showPopup("popup_footer_introduction")
}
function add_footer_introduction() {
    var table = $($("#popup_footer_introduction").find("table")[0])
    const link = $("#input_Link_footer_introduction").val().trim()
    const content = $("#input_Content_footer_introduction").val().trim()

    if (link.length == 0 || content.length == 0) {
        info("Nội dung và link không được để trống")
        return
    }
    $(table).prepend(`
            <tr>
                <td>
                    <a target="_blank" href="${link}">${content}</a>
                </td>
                <td style="width:50px">
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    $("#input_Link_footer_introduction").val(null)
    $("#input_Content_footer_introduction").val(null)
}

function confirm_Save_Edit_btn_Save_footer_introduction(index) {
    const _id = arrData[index]._id
    var tagA = $($("#popup_footer_introduction").find("table")[0]).find("a")
    var arrContent = []
    for (let i = 0; i < tagA.length; i++) {
        arrContent.push({
            Content: $(tagA[i]).text(),
            Link: $(tagA[i]).attr("href"),
        })
    }
    hidePopup("popup_footer_introduction")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/footer_introduction`,
        {
            _id: _id,
            receive_data: arrContent,
        },
        () => {
            success("Thành công")
            getData()
        }
    )
}
//#endregion footer_introduction
//#region footer_suport
function load_data__footer_suport(index) {
    $(`#input_Content_footer_suport`).val(null)
    $(`#input_Link_footer_suport`).val(null)
    var table = $($("#popup_footer_suport").find("table")[0])
    $(table).empty()
    for (let i = 0; i < arrData[index].Content.footer_suport.Content.length; i++) {
        $(table).append(`
            <tr>
                <td>
                    <a target="_blank" href="${arrData[index].Content.footer_suport.Content[i].Link}">${arrData[index].Content.footer_suport.Content[i].Content}</a>
                </td>
                <td style="width:50px">
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    }
    $("#btn_Save_footer_suport").attr("onclick", `confirm_Save_Edit_btn_Save_footer_suport(${index})`)
    showPopup("popup_footer_suport")
}
function add_footer_suport() {
    var table = $($("#popup_footer_suport").find("table")[0])
    const link = $("#input_Link_footer_suport").val().trim()
    const content = $("#input_Content_footer_suport").val().trim()

    if (link.length == 0 || content.length == 0) {
        info("Nội dung và link không được để trống")
        return
    }
    $(table).prepend(`
            <tr>
                <td>
                    <a target="_blank" href="${link}">${content}</a>
                </td>
                <td style="width:50px">
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    $("#input_Link_footer_suport").val(null)
    $("#input_Content_footer_suport").val(null)
}

function confirm_Save_Edit_btn_Save_footer_suport(index) {
    const _id = arrData[index]._id
    var tagA = $($("#popup_footer_suport").find("table")[0]).find("a")
    var arrContent = []
    for (let i = 0; i < tagA.length; i++) {
        arrContent.push({
            Content: $(tagA[i]).text(),
            Link: $(tagA[i]).attr("href"),
        })
    }
    hidePopup("popup_footer_suport")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/footer_suport`,
        {
            _id: _id,
            receive_data: arrContent,
        },
        () => {
            success("Thành công")
            getData()
        }
    )
}
//#endregion footer_suport
//#region footer_common_policy
function load_data__footer_common_policy(index) {
    $(`#input_Content_footer_common_policy`).val(null)
    $(`#input_Link_footer_common_policy`).val(null)
    var table = $($("#popup_footer_common_policy").find("table")[0])
    $(table).empty()
    for (let i = 0; i < arrData[index].Content.footer_common_policy.Content.length; i++) {
        $(table).append(`
            <tr>
                <td>
                    <a target="_blank" href="${arrData[index].Content.footer_common_policy.Content[i].Link}">${arrData[index].Content.footer_common_policy.Content[i].Content}</a>
                </td>
                <td style="width:50px">
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    }
    $("#btn_Save_footer_common_policy").attr("onclick", `confirm_Save_Edit_btn_Save_footer_common_policy(${index})`)
    showPopup("popup_footer_common_policy")
}
function add_footer_common_policy() {
    var table = $($("#popup_footer_common_policy").find("table")[0])
    const link = $("#input_Link_footer_common_policy").val().trim()
    const content = $("#input_Content_footer_common_policy").val().trim()

    if (link.length == 0 || content.length == 0) {
        info("Nội dung và link không được để trống")
        return
    }
    $(table).prepend(`
            <tr>
                <td>
                    <a target="_blank" href="${link}">${content}</a>
                </td>
                <td style="width:50px">
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    $("#input_Link_footer_common_policy").val(null)
    $("#input_Content_footer_common_policy").val(null)
}

function confirm_Save_Edit_btn_Save_footer_common_policy(index) {
    const _id = arrData[index]._id
    var tagA = $($("#popup_footer_common_policy").find("table")[0]).find("a")
    var arrContent = []
    for (let i = 0; i < tagA.length; i++) {
        arrContent.push({
            Content: $(tagA[i]).text(),
            Link: $(tagA[i]).attr("href"),
        })
    }
    hidePopup("popup_footer_common_policy")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/footer_common_policy`,
        {
            _id: _id,
            receive_data: arrContent,
        },
        () => {
            success("Thành công")
            getData()
        }
    )
}
//#endregion footer_common_policy
//#region footer_promotion
function load_data__footer_promotion(index) {
    $(`#input_Content_footer_promotion`).val(null)
    $(`#input_Link_footer_promotion`).val(null)
    var table = $($("#popup_footer_promotion").find("table")[0])
    $(table).empty()
    for (let i = 0; i < arrData[index].Content.footer_promotion.Content.length; i++) {
        $(table).append(`
            <tr>
                <td>
                    <a target="_blank" href="${arrData[index].Content.footer_promotion.Content[i].Link}">${arrData[index].Content.footer_promotion.Content[i].Content}</a>
                </td>
                <td style="width:50px">
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    }
    $("#btn_Save_footer_promotion").attr("onclick", `confirm_Save_Edit_btn_Save_footer_promotion(${index})`)
    showPopup("popup_footer_promotion")
}
function add_footer_promotion() {
    var table = $($("#popup_footer_promotion").find("table")[0])
    const link = $("#input_Link_footer_promotion").val().trim()
    const content = $("#input_Content_footer_promotion").val().trim()

    if (link.length == 0 || content.length == 0) {
        info("Nội dung và link không được để trống")
        return
    }
    $(table).prepend(`
            <tr>
                <td>
                    <a target="_blank" href="${link}">${content}</a>
                </td>
                <td style="width:50px">
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    $("#input_Link_footer_promotion").val(null)
    $("#input_Content_footer_promotion").val(null)
}

function confirm_Save_Edit_btn_Save_footer_promotion(index) {
    const _id = arrData[index]._id
    var tagA = $($("#popup_footer_promotion").find("table")[0]).find("a")
    var arrContent = []
    for (let i = 0; i < tagA.length; i++) {
        arrContent.push({
            Content: $(tagA[i]).text(),
            Link: $(tagA[i]).attr("href"),
        })
    }
    hidePopup("popup_footer_promotion")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/footer_promotion`,
        {
            _id: _id,
            receive_data: arrContent,
        },
        () => {
            success("Thành công")
            getData()
        }
    )
}
//#endregion footer_promotion

//#region footer_description
function confirm_Save_Edit_footer_description(index) {
    const _id = arrData[index]._id
    const receive_data = $("#input_footer_description").val()
    var data = {
        _id: _id,
        receive_data: receive_data,
    }
    hidePopup("pupup_footer_description")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/footer_description`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion footer_description
//#region footer_facebook
function confirm_Save_Edit_footer_facebook(index) {
    const _id = arrData[index]._id
    const receive_data = $("#input_footer_facebook").val()
    var data = {
        _id: _id,
        receive_data: receive_data,
    }
    hidePopup("pupup_footer_facebook")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/footer_facebook`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion footer_facebook
//#region footer_note
function confirm_Save_Edit_footer_note(index) {
    const _id = arrData[index]._id
    const receive_data = $("#input_footer_note").val()
    var data = {
        _id: _id,
        receive_data: receive_data,
    }
    hidePopup("pupup_footer_note")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/footer_note`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion footer_note
//#region footer_business_license
function confirm_Save_Edit_footer_business_license(index) {
    const _id = arrData[index]._id
    const receive_data = $("#input_footer_business_license").val()
    var data = {
        _id: _id,
        receive_data: receive_data,
    }
    hidePopup("pupup_footer_business_license")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/footer_business_license`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion footer_business_license

//#region logo_header
function confirm_Save_Edit_logo_header(index) {
    const _id = arrData[index]._id
    const logo_header = $("#input_logo_header")[0].files[0]
    var data = new FormData()
    data.append("_id", _id)
    data.append("logo_header", logo_header)
    hidePopup("popup_logo_header")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/logo_header`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion logo_header

//#region mobile_logo_header
function confirm_Save_Edit_mobile_logo_header(index) {
    const _id = arrData[index]._id
    const mobile_logo_header = $("#input_mobile_logo_header")[0].files[0]
    var data = new FormData()
    data.append("_id", _id)
    data.append("mobile_logo_header", mobile_logo_header)
    hidePopup("popup_mobile_logo_header")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/mobile_logo_header`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion mobile_logo_header
//#region home_image_banner_flash_sale
function confirm_Save_Edit_home_image_banner_flash_sale(index) {
    const _id = arrData[index]._id
    const home_image_banner_flash_sale = $("#input_home_image_banner_flash_sale")[0].files[0]
    var data = new FormData()
    data.append("_id", _id)
    data.append("home_image_banner_flash_sale", home_image_banner_flash_sale)
    hidePopup("popup_home_image_banner_flash_sale")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/home_image_banner_flash_sale`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion home_image_banner_flash_sale
//#region mobile_home_image_banner_flash_sale
function confirm_Save_Edit_mobile_home_image_banner_flash_sale(index) {
    const _id = arrData[index]._id
    const mobile_home_image_banner_flash_sale = $("#input_mobile_home_image_banner_flash_sale")[0].files[0]
    var data = new FormData()
    data.append("_id", _id)
    data.append("mobile_home_image_banner_flash_sale", mobile_home_image_banner_flash_sale)
    hidePopup("popup_mobile_home_image_banner_flash_sale")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/mobile_home_image_banner_flash_sale`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion mobile_home_image_banner_flash_sale
//#region home_flash_sale_products
function load_data__home_flash_sale_products(index) {
    const data = arrData[index]?.data_product_flash_sale
    $(`#div__list_home_flash_sale_products table`).empty()
    for (let i = 0; i < data?.length; i++) {
        let html_active = `Hoạt động`
        if (data[i].Active == 0 || false) html_active = `Sản phẩm không hoạt động`
        $(`#div__list_home_flash_sale_products table`).prepend(`
            <tr>
                <td>
                    ${data[i]?.subcategory_name}
                    <input type="text" name="_id_product_flash_sale" value="${data[i]?._id}" style="display:none">
                </td>
                <td>
                ${html_active}
                </td>
                <td>
                    <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
                </td>
            </tr>
        `)
    }
    $("#btn_Save_edit_home_flash_sale_products").attr("onclick", `confirmEdit_flash_sale_product(${index})`)
    showPopup("popup_home_flash_sale_products")
}
function confirmEdit_flash_sale_product(index) {
    const _id = arrData[index]._id
    var arr_id_product_flash_sale = []
    var arrID = $("#popup_home_flash_sale_products").find("input[name=_id_product_flash_sale]")
    for (let i = 0; i < arrID.length; i++) {
        arr_id_product_flash_sale.push($(arrID[i]).val())
    }
    const data = {
        _id: _id,
        receive_data: JSON.stringify(arr_id_product_flash_sale),
    }
    hidePopup("popup_home_flash_sale_products")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/home_flash_sale_products`, data, () => {
        success("Thành công")
        getData()
    })
}
function add_product_to_list_flash_sale(id_input, div_table) {
    const subcategory_related_name = $(`#${id_input}`).val().trim()
    const _id_subcategory_related_name = $(`#${id_input}`).attr("name")
    if (subcategory_related_name.length == 0) {
        info("Hãy chọn sản phẩm")
        return
    }
    let html_active = `Hoạt động`
    if (data_product_search.Active == 0 || false) html_active = `Sản phẩm không hoạt động`
    $(`#${id_input}`).val(null).attr("name", null)
    $(`#${div_table} table`).prepend(`
        <tr>
            <td>
                ${subcategory_related_name}
                <input type="text" name="_id_product_flash_sale" value="${_id_subcategory_related_name}" style="display:none">
            </td>
            <td>
            ${html_active}
            </td>
            <td>
                <i onclick="deleteRow(this)" class="fas fa-trash text-danger"></i>
            </td>
        </tr>
    `)
}
//#endregion home_flash_sale_products
//#region home_slide_banner
function load_data__home_slide_banner(index) {
    $($("#popup_home_slide_banner").find("#div__home_slide_banner")[0]).empty()
    const data_banner_home_slide_banner = arrData[index].Content.home_slide_banner.Content
    check_slot = 0
    for (let i = 0; i < data_banner_home_slide_banner.length; i++) {
        check_slot++
        $($("#popup_home_slide_banner").find("#div__home_slide_banner")[0]).append(`
        <div style="position: relative; border-style: ridge; padding: 20px 20px; margin-bottom: 20px;" id="tr_home_slide_banner_${i}" class="thuan-2022-home_slide_banner">
            <div class="row">
                <i onclick="confirm_delete_banner_home_slide_banner('tr_home_slide_banner_${i}')" style="padding: 0px 0px; position: absolute; top: 0; left: 0;" class="fas fa-trash text-danger"></i>
                <div class="col col-md-9">
                    <div class="row" style="margin-top: 20px;">
                        <label class="col-md-2"><b>Tiêu đề:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-title-home_slide_banner" id="title_home_slide_banner_${i}" value="${data_banner_home_slide_banner[i]?.title}">
                    </div>
                    <div class="row" style="margin-top: 20px">
                        <label class="col-md-2"><b>Link bài viết:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-link-home_slide_banner" id="link_home_slide_banner_${i}" value="${data_banner_home_slide_banner[i]?.link}">
                    </div>
                </div>
                <div class="col col-md-3">
                    <img alt="Vui lòng chọn ảnh" style="width:200px; height: auto;" src="${URL_IMAGE_WEBSITE_COMPONENT}${data_banner_home_slide_banner[i]?.image}">
                    <input class="thuan-2022-name-image-home_slide_banner" style="display:none;" id="name_image_home_slide_banner_${i}" value="${data_banner_home_slide_banner[i]?.image}">
                    <input class="thuan-2022-img-home_slide_banner" autocomplete="off" accept="image/*" type="file" onchange="changeImage(this)" placeholder="Chọn file ảnh">
                </div>
                
            </div>
        </div>
        `)
    }
    $("#btn_Save_edit_home_slide_banner").attr("onclick", `confirmEdit_home_slide_banner(${index})`)
    showPopup(`popup_home_slide_banner`)
}
//home_slide_banner
function add_more_home_slide_banner() {
    check_slot++
    const numb = check_slot
    $($("#popup_home_slide_banner").find("#div__home_slide_banner")[0]).append(`
    <div style="position: relative; border-style: ridge; padding: 20px 20px; margin-bottom: 20px;" id="tr_home_slide_banner_${numb}"  class="thuan-2022-home_slide_banner">
    <i onclick="confirm_delete_banner_home_slide_banner('tr_home_slide_banner_${numb}')" style="padding: 0px 0px; position: absolute; top: 0; left: 0;" class="fas fa-trash text-danger"></i>
        <div class="row">
            <div class="col col-md-9">
                <div class="row" style="margin-top: 20px;">
                    <label class="col-md-2"><b>Tiêu đề:</b></label>
                    <input autocomplete="off" class="col-md-9 form-control thuan-2022-title-home_slide_banner" id="title_home_slide_banner_${numb}" value="">
                </div>
                <div class="row" style="margin-top: 20px">
                    <label class="col-md-2"><b>Link bài viết:</b></label>
                    <input autocomplete="off" class="col-md-9 form-control thuan-2022-link-home_slide_banner" id="link_home_slide_banner_${numb}" value="">
                </div>
            </div>
            <div class="col col-md-3">
                <img alt="Vui lòng chọn ảnh" style="width:200px; height: auto;" src="">
                <input class="thuan-2022-name-image-home_slide_banner" style="display:none;" id="name_image_home_slide_banner_${numb}" value="">
                <input class="thuan-2022-img-home_slide_banner" autocomplete="off" accept="image/*" type="file"  onchange="changeImage(this)" placeholder="Chọn file ảnh">
            </div>
        </div>
    </div>
    `)
}

function confirm_delete_banner_home_slide_banner(id_tr) {
    if (confirm("Bạn có muốn xóa banner này?") == true) {
        $(`#${id_tr}`).remove()
    }
}
function confirmEdit_home_slide_banner(index) {
    const _id = arrData[index]._id
    var data = new FormData()
    //
    const List_Content = document.querySelectorAll(".thuan-2022-home_slide_banner")
    let arr_data_img = []
    for (const itemSub of List_Content) {
        const _id_title = itemSub.querySelector(".thuan-2022-title-home_slide_banner").getAttribute("id")
        const _id_link = itemSub.querySelector(".thuan-2022-link-home_slide_banner").getAttribute("id")
        const _id_name_image = itemSub.querySelector(".thuan-2022-name-image-home_slide_banner").getAttribute("id")
        const tag_input_img = itemSub.querySelector(".thuan-2022-img-home_slide_banner")
        // console.log($(`#${_id_title}`).val())

        let name = $(`#${_id_name_image}`).val()
        const img = tag_input_img.files[0]
        data.append("home_slide_banner", img)
        if (typeof img != "undefined" && img != null) name = img.name
        arr_data_img.push({
            title: $(`#${_id_title}`).val(),
            link: $(`#${_id_link}`).val(),
            image: name,
        })
    }
    // console.log(arr_data_img)
    data.append("receive_data", JSON.stringify(arr_data_img))
    data.append("_id", _id)

    hidePopup("popup_home_slide_banner")
    // console.log(data)
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/home_slide_banner`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion home_slide_banner
//#region mobile_home_slide_banner_1
function load_data__mobile_home_slide_banner_1(index) {
    $($("#popup_mobile_home_slide_banner_1").find("#div__mobile_home_slide_banner_1")[0]).empty()
    const data_banner_mobile_home_slide_banner_1 = arrData[index].Content.mobile_home_slide_banner_1.Content
    check_slot = 0
    for (let i = 0; i < data_banner_mobile_home_slide_banner_1.length; i++) {
        check_slot++
        $($("#popup_mobile_home_slide_banner_1").find("#div__mobile_home_slide_banner_1")[0]).append(`
        <div style="position: relative; border-style: ridge; padding: 20px 20px; margin-bottom: 20px;" id="tr_mobile_home_slide_banner_1_${i}" class="thuan-2022-mobile_home_slide_banner_1">
            <div class="row">
                <i onclick="confirm_delete_banner_mobile_home_slide_banner_1('tr_mobile_home_slide_banner_1_${i}')" style="padding: 0px 0px; position: absolute; top: 0; left: 0;" class="fas fa-trash text-danger"></i>
                <div class="col col-md-9">
                    <div class="row" style="margin-top: 20px;">
                        <label class="col-md-2"><b>Tiêu đề:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-title-mobile_home_slide_banner_1" id="title_mobile_home_slide_banner_1_${i}" value="${data_banner_mobile_home_slide_banner_1[i]?.title}">
                    </div>
                    <div class="row" style="margin-top: 20px">
                        <label class="col-md-2"><b>Link bài viết:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-link-mobile_home_slide_banner_1" id="link_mobile_home_slide_banner_1_${i}" value="${data_banner_mobile_home_slide_banner_1[i]?.link}">
                    </div>
                </div>
                <div class="col col-md-3">
                    <img alt="Vui lòng chọn ảnh" style="width:200px; height: auto;" src="${URL_IMAGE_WEBSITE_COMPONENT}${data_banner_mobile_home_slide_banner_1[i]?.image}">
                    <input class="thuan-2022-name-image-mobile_home_slide_banner_1" style="display:none;" id="name_image_mobile_home_slide_banner_1_${i}" value="${data_banner_mobile_home_slide_banner_1[i]?.image}">
                    <input class="thuan-2022-img-mobile_home_slide_banner_1" autocomplete="off" accept="image/*" type="file" onchange="changeImage(this)" placeholder="Chọn file ảnh">
                </div>
                
            </div>
        </div>
        `)
    }
    $("#btn_Save_edit_mobile_home_slide_banner_1").attr("onclick", `confirmEdit_mobile_home_slide_banner_1(${index})`)
    showPopup(`popup_mobile_home_slide_banner_1`)
}
//mobile_home_slide_banner_1
function add_more_mobile_home_slide_banner_1() {
    check_slot++
    const numb = check_slot
    $($("#popup_mobile_home_slide_banner_1").find("#div__mobile_home_slide_banner_1")[0]).append(`
    <div style="position: relative; border-style: ridge; padding: 20px 20px; margin-bottom: 20px;" id="tr_mobile_home_slide_banner_1_${numb}"  class="thuan-2022-mobile_home_slide_banner_1">
    <i onclick="confirm_delete_banner_mobile_home_slide_banner_1('tr_mobile_home_slide_banner_1_${numb}')" style="padding: 0px 0px; position: absolute; top: 0; left: 0;" class="fas fa-trash text-danger"></i>
        <div class="row">
            <div class="col col-md-9">
                <div class="row" style="margin-top: 20px;">
                    <label class="col-md-2"><b>Tiêu đề:</b></label>
                    <input autocomplete="off" class="col-md-9 form-control thuan-2022-title-mobile_home_slide_banner_1" id="title_mobile_home_slide_banner_1_${numb}" value="">
                </div>
                <div class="row" style="margin-top: 20px">
                    <label class="col-md-2"><b>Link bài viết:</b></label>
                    <input autocomplete="off" class="col-md-9 form-control thuan-2022-link-mobile_home_slide_banner_1" id="link_mobile_home_slide_banner_1_${numb}" value="">
                </div>
            </div>
            <div class="col col-md-3">
                <img alt="Vui lòng chọn ảnh" style="width:200px; height: auto;" src="">
                <input class="thuan-2022-name-image-mobile_home_slide_banner_1" style="display:none;" id="name_image_mobile_home_slide_banner_1_${numb}" value="">
                <input class="thuan-2022-img-mobile_home_slide_banner_1" autocomplete="off" accept="image/*" type="file"  onchange="changeImage(this)" placeholder="Chọn file ảnh">
            </div>
        </div>
    </div>
    `)
}

function confirm_delete_banner_mobile_home_slide_banner_1(id_tr) {
    if (confirm("Bạn có muốn xóa banner này?") == true) {
        $(`#${id_tr}`).remove()
    }
}
function confirmEdit_mobile_home_slide_banner_1(index) {
    const _id = arrData[index]._id
    var data = new FormData()
    //
    const List_Content = document.querySelectorAll(".thuan-2022-mobile_home_slide_banner_1")
    let arr_data_img = []
    for (const itemSub of List_Content) {
        const _id_title = itemSub.querySelector(".thuan-2022-title-mobile_home_slide_banner_1").getAttribute("id")
        const _id_link = itemSub.querySelector(".thuan-2022-link-mobile_home_slide_banner_1").getAttribute("id")
        const _id_name_image = itemSub.querySelector(".thuan-2022-name-image-mobile_home_slide_banner_1").getAttribute("id")
        const tag_input_img = itemSub.querySelector(".thuan-2022-img-mobile_home_slide_banner_1")
        // console.log($(`#${_id_title}`).val())

        let name = $(`#${_id_name_image}`).val()
        const img = tag_input_img.files[0]
        data.append("mobile_home_slide_banner_1", img)
        if (typeof img != "undefined" && img != null) name = img.name
        arr_data_img.push({
            title: $(`#${_id_title}`).val(),
            link: $(`#${_id_link}`).val(),
            image: name,
        })
    }
    // console.log(arr_data_img)
    data.append("receive_data", JSON.stringify(arr_data_img))
    data.append("_id", _id)

    hidePopup("popup_mobile_home_slide_banner_1")
    // console.log(data)
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/mobile_home_slide_banner_1`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion mobile_home_slide_banner_1
//#region mobile_home_slide_banner_2
function load_data__mobile_home_slide_banner_2(index) {
    $($("#popup_mobile_home_slide_banner_2").find("#div__mobile_home_slide_banner_2")[0]).empty()
    const data_banner_mobile_home_slide_banner_2 = arrData[index].Content.mobile_home_slide_banner_2.Content
    check_slot = 0
    for (let i = 0; i < data_banner_mobile_home_slide_banner_2.length; i++) {
        check_slot++
        $($("#popup_mobile_home_slide_banner_2").find("#div__mobile_home_slide_banner_2")[0]).append(`
        <div style="position: relative; border-style: ridge; padding: 20px 20px; margin-bottom: 20px;" id="tr_mobile_home_slide_banner_2_${i}" class="thuan-2022-mobile_home_slide_banner_2">
            <div class="row">
                <i onclick="confirm_delete_banner_mobile_home_slide_banner_2('tr_mobile_home_slide_banner_2_${i}')" style="padding: 0px 0px; position: absolute; top: 0; left: 0;" class="fas fa-trash text-danger"></i>
                <div class="col col-md-9">
                    <div class="row" style="margin-top: 20px;">
                        <label class="col-md-2"><b>Tiêu đề:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-title-mobile_home_slide_banner_2" id="title_mobile_home_slide_banner_2_${i}" value="${data_banner_mobile_home_slide_banner_2[i]?.title}">
                    </div>
                    <div class="row" style="margin-top: 20px">
                        <label class="col-md-2"><b>Link bài viết:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-link-mobile_home_slide_banner_2" id="link_mobile_home_slide_banner_2_${i}" value="${data_banner_mobile_home_slide_banner_2[i]?.link}">
                    </div>
                </div>
                <div class="col col-md-3">
                    <img alt="Vui lòng chọn ảnh" style="width:200px; height: auto;" src="${URL_IMAGE_WEBSITE_COMPONENT}${data_banner_mobile_home_slide_banner_2[i]?.image}">
                    <input class="thuan-2022-name-image-mobile_home_slide_banner_2" style="display:none;" id="name_image_mobile_home_slide_banner_2_${i}" value="${data_banner_mobile_home_slide_banner_2[i]?.image}">
                    <input class="thuan-2022-img-mobile_home_slide_banner_2" autocomplete="off" accept="image/*" type="file" onchange="changeImage(this)" placeholder="Chọn file ảnh">
                </div>
                
            </div>
        </div>
        `)
    }
    $("#btn_Save_edit_mobile_home_slide_banner_2").attr("onclick", `confirmEdit_mobile_home_slide_banner_2(${index})`)
    showPopup(`popup_mobile_home_slide_banner_2`)
}
//mobile_home_slide_banner_2
function add_more_mobile_home_slide_banner_2() {
    check_slot++
    const numb = check_slot
    $($("#popup_mobile_home_slide_banner_2").find("#div__mobile_home_slide_banner_2")[0]).append(`
    <div style="position: relative; border-style: ridge; padding: 20px 20px; margin-bottom: 20px;" id="tr_mobile_home_slide_banner_2_${numb}"  class="thuan-2022-mobile_home_slide_banner_2">
    <i onclick="confirm_delete_banner_mobile_home_slide_banner_2('tr_mobile_home_slide_banner_2_${numb}')" style="padding: 0px 0px; position: absolute; top: 0; left: 0;" class="fas fa-trash text-danger"></i>
        <div class="row">
            <div class="col col-md-9">
                <div class="row" style="margin-top: 20px;">
                    <label class="col-md-2"><b>Tiêu đề:</b></label>
                    <input autocomplete="off" class="col-md-9 form-control thuan-2022-title-mobile_home_slide_banner_2" id="title_mobile_home_slide_banner_2_${numb}" value="">
                </div>
                <div class="row" style="margin-top: 20px">
                    <label class="col-md-2"><b>Link bài viết:</b></label>
                    <input autocomplete="off" class="col-md-9 form-control thuan-2022-link-mobile_home_slide_banner_2" id="link_mobile_home_slide_banner_2_${numb}" value="">
                </div>
            </div>
            <div class="col col-md-3">
                <img alt="Vui lòng chọn ảnh" style="width:200px; height: auto;" src="">
                <input class="thuan-2022-name-image-mobile_home_slide_banner_2" style="display:none;" id="name_image_mobile_home_slide_banner_2_${numb}" value="">
                <input class="thuan-2022-img-mobile_home_slide_banner_2" autocomplete="off" accept="image/*" type="file"  onchange="changeImage(this)" placeholder="Chọn file ảnh">
            </div>
        </div>
    </div>
    `)
}

function confirm_delete_banner_mobile_home_slide_banner_2(id_tr) {
    if (confirm("Bạn có muốn xóa banner này?") == true) {
        $(`#${id_tr}`).remove()
    }
}
function confirmEdit_mobile_home_slide_banner_2(index) {
    const _id = arrData[index]._id
    var data = new FormData()
    //
    const List_Content = document.querySelectorAll(".thuan-2022-mobile_home_slide_banner_2")
    let arr_data_img = []
    for (const itemSub of List_Content) {
        const _id_title = itemSub.querySelector(".thuan-2022-title-mobile_home_slide_banner_2").getAttribute("id")
        const _id_link = itemSub.querySelector(".thuan-2022-link-mobile_home_slide_banner_2").getAttribute("id")
        const _id_name_image = itemSub.querySelector(".thuan-2022-name-image-mobile_home_slide_banner_2").getAttribute("id")
        const tag_input_img = itemSub.querySelector(".thuan-2022-img-mobile_home_slide_banner_2")
        // console.log($(`#${_id_title}`).val())

        let name = $(`#${_id_name_image}`).val()
        const img = tag_input_img.files[0]
        data.append("mobile_home_slide_banner_2", img)
        if (typeof img != "undefined" && img != null) name = img.name
        arr_data_img.push({
            title: $(`#${_id_title}`).val(),
            link: $(`#${_id_link}`).val(),
            image: name,
        })
    }
    // console.log(arr_data_img)
    data.append("receive_data", JSON.stringify(arr_data_img))
    data.append("_id", _id)

    hidePopup("popup_mobile_home_slide_banner_2")
    // console.log(data)
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/mobile_home_slide_banner_2`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion mobile_home_slide_banner_2
//#region home_banner_gaming_market_01
function load_data__home_banner_gaming_market_01(index) {
    const _data = arrData[index].Content.home_banner_gaming_market_01
    //banner_00
    $(`#title_home_banner_gaming_market_01__banner_00`).val(_data.banner_00.title)
    $(`#link_home_banner_gaming_market_01__banner_00`).val(_data.banner_00.link)
    $(`#name_image_home_banner_gaming_market_01__banner_00`).attr("value", _data.banner_00.image)
    $(`#image_home_banner_gaming_market_01__banner_00`).attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${_data.banner_00.image}`)
    //banner_01
    $(`#title_home_banner_gaming_market_01__banner_01`).val(_data.banner_01.title)
    $(`#link_home_banner_gaming_market_01__banner_01`).val(_data.banner_01.link)
    $(`#name_image_home_banner_gaming_market_01__banner_01`).attr("value", _data.banner_01.image)
    $(`#image_home_banner_gaming_market_01__banner_01`).attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${_data.banner_01.image}`)
    //banner_02
    $(`#title_home_banner_gaming_market_01__banner_02`).val(_data.banner_02.title)
    $(`#link_home_banner_gaming_market_01__banner_02`).val(_data.banner_02.link)
    $(`#name_image_home_banner_gaming_market_01__banner_02`).attr("value", _data.banner_02.image)
    $(`#image_home_banner_gaming_market_01__banner_02`).attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${_data.banner_02.image}`)
    //banner_03
    $(`#title_home_banner_gaming_market_01__banner_03`).val(_data.banner_03.title)
    $(`#link_home_banner_gaming_market_01__banner_03`).val(_data.banner_03.link)
    $(`#name_image_home_banner_gaming_market_01__banner_03`).attr("value", _data.banner_03.image)
    $(`#image_home_banner_gaming_market_01__banner_03`).attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${_data.banner_03.image}`)
    //banner_04
    $(`#title_home_banner_gaming_market_01__banner_04`).val(_data.banner_04.title)
    $(`#link_home_banner_gaming_market_01__banner_04`).val(_data.banner_04.link)
    $(`#name_image_home_banner_gaming_market_01__banner_04`).attr("value", _data.banner_04.image)
    $(`#image_home_banner_gaming_market_01__banner_04`).attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${_data.banner_04.image}`)
    //banner_05
    $(`#title_home_banner_gaming_market_01__banner_05`).val(_data.banner_05.title)
    $(`#link_home_banner_gaming_market_01__banner_05`).val(_data.banner_05.link)
    $(`#name_image_home_banner_gaming_market_01__banner_05`).attr("value", _data.banner_05.image)
    $(`#image_home_banner_gaming_market_01__banner_05`).attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${_data.banner_05.image}`)
    //banner_06
    $(`#title_home_banner_gaming_market_01__banner_06`).val(_data.banner_06.title)
    $(`#link_home_banner_gaming_market_01__banner_06`).val(_data.banner_06.link)
    $(`#name_image_home_banner_gaming_market_01__banner_06`).attr("value", _data.banner_06.image)
    $(`#image_home_banner_gaming_market_01__banner_06`).attr("src", `${URL_IMAGE_WEBSITE_COMPONENT}${_data.banner_06.image}`)
    //
    $(`#btn_Save_edit_home_banner_gaming_market_01`).attr("onclick", `confirm_Save_Edit_home_banner_gaming_market_01(${index})`)
    showPopup(`popup_home_banner_gaming_market_01`)
}
function confirm_Save_Edit_home_banner_gaming_market_01(index) {
    const _id = arrData[index]._id
    var data = new FormData()
    //
    data.append("_id", _id)
    //banner_00
    const banner_00_title = $(`#title_home_banner_gaming_market_01__banner_00`).val()
    const banner_00_link = $(`#link_home_banner_gaming_market_01__banner_00`).val()
    let banner_00_name_image = $(`#name_image_home_banner_gaming_market_01__banner_00`).val()
    const banner_00_image = $(`#input_image_home_banner_gaming_market_01__banner_00`)[0].files[0] || null
    if (typeof banner_00_image != "undefined" && banner_00_image != null) banner_00_name_image = banner_00_image.name
    data.append("banner_00_image", banner_00_image)
    data.append("banner_00_title", banner_00_title)
    data.append("banner_00_link", banner_00_link)
    data.append("banner_00_name_image", banner_00_name_image)
    //banner_01
    const banner_01_title = $(`#title_home_banner_gaming_market_01__banner_01`).val()
    const banner_01_link = $(`#link_home_banner_gaming_market_01__banner_01`).val()
    let banner_01_name_image = $(`#name_image_home_banner_gaming_market_01__banner_01`).val()
    const banner_01_image = $(`#input_image_home_banner_gaming_market_01__banner_01`)[0].files[0] || null
    if (typeof banner_01_image != "undefined" && banner_01_image != null) banner_01_name_image = banner_01_image.name
    data.append("banner_01_image", banner_01_image)
    data.append("banner_01_title", banner_01_title)
    data.append("banner_01_link", banner_01_link)
    data.append("banner_01_name_image", banner_01_name_image)
    //banner_02
    const banner_02_title = $(`#title_home_banner_gaming_market_01__banner_02`).val()
    const banner_02_link = $(`#link_home_banner_gaming_market_01__banner_02`).val()
    let banner_02_name_image = $(`#name_image_home_banner_gaming_market_01__banner_02`).val()
    const banner_02_image = $(`#input_image_home_banner_gaming_market_01__banner_02`)[0].files[0] || null
    if (typeof banner_02_image != "undefined" && banner_02_image != null) banner_02_name_image = banner_02_image.name
    data.append("banner_02_image", banner_02_image)
    data.append("banner_02_title", banner_02_title)
    data.append("banner_02_link", banner_02_link)
    data.append("banner_02_name_image", banner_02_name_image)
    //banner_03
    const banner_03_title = $(`#title_home_banner_gaming_market_01__banner_03`).val()
    const banner_03_link = $(`#link_home_banner_gaming_market_01__banner_03`).val()
    let banner_03_name_image = $(`#name_image_home_banner_gaming_market_01__banner_03`).val()
    const banner_03_image = $(`#input_image_home_banner_gaming_market_01__banner_03`)[0].files[0] || null
    if (typeof banner_03_image != "undefined" && banner_03_image != null) banner_03_name_image = banner_03_image.name
    data.append("banner_03_image", banner_03_image)
    data.append("banner_03_title", banner_03_title)
    data.append("banner_03_link", banner_03_link)
    data.append("banner_03_name_image", banner_03_name_image)
    //banner_04
    const banner_04_title = $(`#title_home_banner_gaming_market_01__banner_04`).val()
    const banner_04_link = $(`#link_home_banner_gaming_market_01__banner_04`).val()
    let banner_04_name_image = $(`#name_image_home_banner_gaming_market_01__banner_04`).val()
    const banner_04_image = $(`#input_image_home_banner_gaming_market_01__banner_04`)[0].files[0] || null
    if (typeof banner_04_image != "undefined" && banner_04_image != null) banner_04_name_image = banner_04_image.name
    data.append("banner_04_image", banner_04_image)
    data.append("banner_04_title", banner_04_title)
    data.append("banner_04_link", banner_04_link)
    data.append("banner_04_name_image", banner_04_name_image)
    //banner_05
    const banner_05_title = $(`#title_home_banner_gaming_market_01__banner_05`).val()
    const banner_05_link = $(`#link_home_banner_gaming_market_01__banner_05`).val()
    let banner_05_name_image = $(`#name_image_home_banner_gaming_market_01__banner_05`).val()
    const banner_05_image = $(`#input_image_home_banner_gaming_market_01__banner_05`)[0].files[0] || null
    if (typeof banner_05_image != "undefined" && banner_05_image != null) banner_05_name_image = banner_05_image.name
    data.append("banner_05_image", banner_05_image)
    data.append("banner_05_title", banner_05_title)
    data.append("banner_05_link", banner_05_link)
    data.append("banner_05_name_image", banner_05_name_image)
    //banner_06
    const banner_06_title = $(`#title_home_banner_gaming_market_01__banner_06`).val()
    const banner_06_link = $(`#link_home_banner_gaming_market_01__banner_06`).val()
    let banner_06_name_image = $(`#name_image_home_banner_gaming_market_01__banner_06`).val()
    const banner_06_image = $(`#input_image_home_banner_gaming_market_01__banner_06`)[0].files[0] || null
    if (typeof banner_06_image != "undefined" && banner_06_image != null) banner_06_name_image = banner_06_image.name
    data.append("banner_06_image", banner_06_image)
    data.append("banner_06_title", banner_06_title)
    data.append("banner_06_link", banner_06_link)
    data.append("banner_06_name_image", banner_06_name_image)
    //put
    console.log(`data:`, data)
    hidePopup("popup_home_banner_gaming_market_01")
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/home_banner_gaming_market_01`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//#endregion home_banner_gaming_market_01
//
//#region contact_info
function confirm_Save_edit_contact_info(index) {
    const _id = arrData[index]._id
    const name_company = $("#input_contact_info__name_company").val()
    const address = $("#input_contact_info__address").val()
    const hotline = $("#input_contact_info__hotline").val()
    const email = $("#input_contact_info__email").val()
    var data = {
        _id: _id,
        name_company: name_company,
        address: address,
        hotline: hotline,
        email: email,
    }
    hidePopup("pupup_contact_info")
    callAPI("PUT", `${API_WEBSITE_COMPONENT}/contact_info`, data, () => {
        success("Thành công")
        getData()
    })
}
//#endregion contact_info
//#region function

function find_Product(id_div_display, div_input, loadmore = false) {
    $(`#${div_input}`).closest("div").find(".spinner-border").show()
    arr_product_find = []
    $(`#${id_div_display}`).empty()
    const _key = $(`#${div_input}`).val()
    if (isDefine(_key)) {
        $.ajax({
            type: "GET",
            url: `${API_SUBCATEGORY}`,
            // url: `${API_SUBCATEGORY}/byName?`,/api/subcategory?&limit=10&page=1&id_category=&key=b%C3%B3ng%20c%C6%B0%E1%BB%9Di&getOther=false
            headers: {
                token: ACCESS_TOKEN,
            },
            data: {
                key: _key,
                limit: limitProduct,
                page: page,
                getOther: false,
            },

            cache: false,
            success: function (data) {
                $(`#${div_input}`).closest("div").find(".spinner-border").hide()
                draw_div_product(data.data, id_div_display, div_input)
            },
            error: function (data) {
                errAjax(data)
            },
        })
    }
}
function draw_div_product(data, id_div_display, div_input) {
    for (let i = 0; i < data.length; i++) {
        arr_product_find.push(data[i])
        $(`#${id_div_display}`).append(`
            <li>
                <a onclick="select_Product('${div_input}','${id_div_display}',${arr_product_find.length - 1})" href="javascript:void(0)">${data[i].subcategory_name}</a>
            </li>
        `)
    }
}
function select_Product(div_input, id_div_display, index) {
    $(`#${div_input}`).val(arr_product_find[index].subcategory_name)
    $(`#${div_input}`).attr("name", arr_product_find[index]._id)
    data_product_search = arr_product_find[index]
    $(`#${id_div_display}`).empty()
}
function deleteRow(tagI) {
    $(tagI).closest("tr").remove()
}
function delete_parent(tagI) {
    $(tagI).parent().remove()
}
function changeImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader()
        reader.onload = function (e) {
            $($($(input).closest("div")).find("img")[0]).attr("src", e.target.result)
        }
        reader.readAsDataURL(input.files[0]) // convert to base64 strin
    }
}
function show_position_home_banner_gaming_market_01(status = true) {
    //
    // if (status) {
    //     hidePopup("popup_home_banner_gaming_market_01")
    //     showPopup(`popup_template-home_banner_gaming_market_01`)
    // } else {
    //     $("body").removeClass("modal-open")
    //     hidePopup("popup_template-home_banner_gaming_market_01")
    //     // showPopup(`popup_home_banner_gaming_market_01`)
    //     load_data__home_banner_gaming_market_01(flag_website_component)
    // }
    if (status) showPopup(`popup_template-home_banner_gaming_market_01`, false, `popup_home_banner_gaming_market_01`)
    else {
        $("#popup_home_banner_gaming_market_01").css({ overflow: "auto" })
        showPopup(`popup_home_banner_gaming_market_01`, false, `popup_template-home_banner_gaming_market_01`)
    }
}
$("#popup_template-home_banner_gaming_market_01")
    .modal()
    .on("shown", function () {
        $("body").css("overflow", "hidden")
    })
    .on("hidden", function () {
        $("body").css("overflow", "auto")
    })
//#endregion function
function load_data__menu_build_pc(index) {
    $("#pupup_menu_build_pc .modal-body .div-list-menu-build-pc").empty()
    const data = arrData[index].Content.menu_build_pc.array_category
    for (let i = 0; i < data.length; i++) {
        $("#pupup_menu_build_pc .modal-body .div-list-menu-build-pc").append(`
            <div class="item-menu-build-pc">
                <span name="${data[i]._id}">
                    ${data[i].category_name}
                </span>
                <i onclick="delete_row_item_menu_build_pc()" class="fas fa-trash text-danger"></i>
            </div>
        `)
    }
    $("#btn_Save_menu_build_pc").attr("onclick", `confirm_save_menu_build_pc(${index})`)
    showPopup("pupup_menu_build_pc")
}

const find_data_category = () => {
    const input = $("#input_find_category")
    const spinner = $("#pupup_menu_build_pc .div-find-category-menu-build-pc .spinner-border")
    const div_show = $("#pupup_menu_build_pc .show-data-find-category")
    const key = $(input).val().trim()
    if (key.length == 0) {
        $(div_show).empty()
        return
    }
    $(spinner).show()
    callAPI(
        "GET",
        `${API_CATEGORY}/client`,
        {
            key: $(input).val().trim(),
            limit: 10,
            page: 1,
        },
        (data) => {
            $(spinner).hide()
            $(div_show).empty()

            for (let i = 0; i < data.length; i++) {
                $(div_show).append(`
                <li><a href="javascript:void(0)" name="${data[i]._id}" onclick="select_category()">${data[i].category_name}<a/></li>
            `)
            }
        }
    )
}

function select_category() {
    const element = $(event.target)
    const id_category = $(element).attr("name")
    const name = $(element).text()

    const div_show = $("#pupup_menu_build_pc .show-data-find-category")
    $(div_show).empty()
    $("#input_find_category").val(name)
    $("#input_find_category").attr("name", id_category)
}

function add_category_to_menu() {
    const input = $("#input_find_category")
    const id_category = $(input).attr("name")
    const name = $(input).val()
    if (id_category) {
        $("#pupup_menu_build_pc .modal-body .div-list-menu-build-pc").append(`
        <div class="item-menu-build-pc">
            <span name="${id_category}">
                ${name}
            </span>
            <i onclick="delete_row_item_menu_build_pc()" class="fas fa-trash text-danger"></i>
        </div>
    `)
    }

    $(input).val(null)
    $(input).attr("name", null)
}

function delete_row_item_menu_build_pc() {
    $($(event.target).parent()).remove()
}

function confirm_save_menu_build_pc(index) {
    const items = $("#pupup_menu_build_pc .modal-body .div-list-menu-build-pc .item-menu-build-pc")
    const data = []
    for (let i = 0; i < items.length; i++) {
        const id_category = $($(items[i]).find("span")).attr("name")
        if (id_category && id_category.length == 24) {
            data.push(id_category)
        }
    }
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/menu_build_pc`,
        {
            array_category: JSON.stringify(data),
            id_menu: arrData[index]._id,
        },
        (data) => {
            hidePopup("pupup_menu_build_pc")
            success("Thành công")
            getData()
        }
    )
}

function success_find_subcategory_build_pc(data, parent) {
    for (let i = 0; i < data.length; i++) {
        arrSubCategory.push(data[i])
        $("#div_data_subcategory_build_pc").append(`
            <li><a onclick="select_subcategory_list_build_pc(${arrSubCategory.length - 1})" href="javascript:void(0)">${data[i].subcategory_name}</a></li>
        `)
    }
}

function add_subcategory_to_menu() {
    const input = $("#input_data_subcategory_build_pc")
    const id_subcategory = $(input).attr("name")
    const name = $(input).val()
    if (id_subcategory) {
        $("#pupup_list_subcategory_build_pc .modal-body .div-list-menu-build-pc").append(`
        <div class="item-menu-build-pc">
            <span name="${id_subcategory}">
                ${name}
            </span>
            <i onclick="delete_row_item_menu_build_pc()" class="fas fa-trash text-danger"></i>
        </div>
    `)
    }

    $(input).val(null)
    $(input).attr("name", null)
}
function select_subcategory_list_build_pc(index) {
    if (arrSubCategory[index].subcategory_export_price <= 0) {
        info("Sản phẩm hiển thị phải có giá lớn hơn 0")
        return
    }
    $("#input_data_subcategory_build_pc").val(arrSubCategory[index].subcategory_name)
    $("#input_data_subcategory_build_pc").attr("name", arrSubCategory[index]._id)
    const div_parent = $(event.target).closest("div").empty()
}

function load_data__list_subcategory_build_pc(index) {
    $("#pupup_list_subcategory_build_pc .modal-body .div-list-menu-build-pc").empty()
    const data = arrData[index].Content.list_subcategory_build_pc.array_subcategory
    for (let i = 0; i < data.length; i++) {
        $("#pupup_list_subcategory_build_pc .modal-body .div-list-menu-build-pc").append(`
            <div class="item-menu-build-pc">
                <span name="${data[i]._id}">
                    ${data[i].subcategory_name}
                </span>
                <i onclick="delete_row_item_menu_build_pc()" class="fas fa-trash text-danger"></i>
            </div>
        `)
    }
    $("#btn_Save_list_subcategory_build_pc").attr("onclick", `confirm_save_list_subcategory_build_pc(${index})`)
    showPopup("pupup_list_subcategory_build_pc")
}

function confirm_save_list_subcategory_build_pc(index) {
    const items = $("#pupup_list_subcategory_build_pc .modal-body .div-list-menu-build-pc .item-menu-build-pc")
    const data = []
    for (let i = 0; i < items.length; i++) {
        const id_subcategory = $($(items[i]).find("span")).attr("name")
        if (id_subcategory && id_subcategory.length == 24) {
            data.push(id_subcategory)
        }
    }
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/list_subcategory_build_pc`,
        {
            array_subcategory: JSON.stringify(data),
            id_menu: arrData[index]._id,
        },
        (data) => {
            hidePopup("pupup_list_subcategory_build_pc")
            success("Thành công")
            getData()
        }
    )
}

function load_data__banner_build_pc(index) {
    const images = arrData[index].Content.banner_build_pc.array_images
    $("#pupup_banner_build_pc .modal-body .old-images").empty()

    for (let i = 0; i < images.length; i++) {
        $("#pupup_banner_build_pc .modal-body .old-images").append(`
        <div class="item-old-image">
            <i class="fas fa-trash text-danger" onclick="delete_parent(this)"></i>
            <img src="${URL_IMAGE_WEBSITE_COMPONENT}${images[i]}">
            <input type="text" class="input-old-image" style="display:none" value="${images[i]}">
        </div>
        `)
    }
    $("#btn_Save_banner_build_pc").attr("onclick", `confirm_save_banner_build_pc(${index})`)
    showPopup("pupup_banner_build_pc")
}

function load_data__banner_news(index) {
    const images = arrData[index].Content.banner_news.array_images
    $("#pupup_banner_build_pc .modal-body .old-images").empty()

    for (let i = 0; i < images.length; i++) {
        $("#pupup_banner_build_pc .modal-body .old-images").append(`
        <div class="item-old-image">
            <i class="fas fa-trash text-danger" onclick="delete_parent(this)"></i>
            <img src="${URL_IMAGE_WEBSITE_COMPONENT}${images[i]}">
            <input type="text" class="input-old-image" style="display:none" value="${images[i]}">
        </div>
        `)
    }
    $("#btn_Save_banner_build_pc").attr("onclick", `confirm_save_banner_news(${index})`)
    showPopup("pupup_banner_build_pc")
}

function confirm_save_banner_build_pc(index) {
    const array_old_image = []

    const inputs = $("#pupup_banner_build_pc input.input-old-image")

    const formData = new FormData()
    for (var i = 0; i < totalFiles.length; i++) {
        formData.append("image_product", totalFiles[i].file) // ảnh sản phẩm
    }
    for (var i = 0; i < inputs.length; i++) {
        array_old_image.push($(inputs[i]).val())
    }
    formData.append("old_images", JSON.stringify(array_old_image)) // ảnh sản phẩm
    formData.append("id_menu", arrData[index]._id)
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/banner_build_pc`,
        formData,
        () => {
            hidePopup("pupup_banner_build_pc")
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}

function confirm_save_banner_news(index) {
    const array_old_image = []

    const inputs = $("#pupup_banner_build_pc input.input-old-image")

    const formData = new FormData()
    for (var i = 0; i < totalFiles.length; i++) {
        formData.append("image_product", totalFiles[i].file) // ảnh sản phẩm
    }
    for (var i = 0; i < inputs.length; i++) {
        array_old_image.push($(inputs[i]).val())
    }
    formData.append("old_images", JSON.stringify(array_old_image)) // ảnh sản phẩm
    formData.append("id_menu", arrData[index]._id)
    callAPI(
        "PUT",
        `${API_WEBSITE_COMPONENT}/banner_news`,
        formData,
        () => {
            hidePopup("pupup_banner_build_pc")
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
