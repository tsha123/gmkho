var arrMenu = []
var MAX_SERIAL_NUMBER = 0
var DATA_ALL_MENU = []
var DATA_ALL_CATEGORY = []
var DATA_ALL_WEBSITE_COMPONENT = []
var id_website_component = ``
//==================================================================================================================

$(function () {
    const page = 1
    getData(page)
})
function getData(page = 1) {
    isLoading()
    limit = parseInt($("#selectLimit").val())
    let key = $("#keyFind").val()
    $.ajax({
        type: "GET",
        url: `${URL_API}/menu`,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: {
            key: key,
            id_parent: $("#select_Menu option:selected").val() || ``,
            id_website_component: $("#select_website_component option:selected").val() || ``,
            limit: limit,
            page: page,
        },
        cache: false,
        success: function (data) {
            isLoading(false)
            throwValue(data)
            MAX_SERIAL_NUMBER = data?.max_serial_number + 10 || 10
            DATA_ALL_MENU = data.data_all
            DATA_ALL_CATEGORY = data.data_all_category
            draw_List_category_website(data.id_parent)
            //
            id_website_component = data?.id_website_component || ``
            DATA_ALL_WEBSITE_COMPONENT = data.data_website_component
            draw_List_data_website_component(id_website_component, `select_website_component`)
            //
            drawTable(data.data, data.page)
            // pagination2(data.count, data.data.length)
            pagination2(data.count, data.page)
        },
        error: function (data) {
            errAjax(data)
        },
    })
}
function draw_List_data_website_component(id_website_component, _div_select) {
    let html = ``
    html += `<option value="">____ Chọn website ____</option>`
    for (let i = 0; i < DATA_ALL_WEBSITE_COMPONENT.length; i++) {
        if (DATA_ALL_WEBSITE_COMPONENT[i]._id + "" == id_website_component + "") {
            html += `<option selected value="${DATA_ALL_WEBSITE_COMPONENT[i]._id}">${DATA_ALL_WEBSITE_COMPONENT[i].Description}</option>`
        } else {
            html += `<option value="${DATA_ALL_WEBSITE_COMPONENT[i]._id}">${DATA_ALL_WEBSITE_COMPONENT[i].Description}</option>`
        }
    }
    $(`#${_div_select}`).empty()
    $(`#${_div_select}`).html(html)
}
function draw_List_category_website(id_parent) {
    $(`#select_Menu`).empty()
    //nếu là menu cha cao nhất
    if (id_parent + "" == "top") {
        $("#select_Menu").append(`<option value="">__Tất cả__</option>`)
        $("#select_Menu").append(`<option selected value="top">__Menu cao nhất__</option>`)
    } else {
        //hiển thị các menu con
        let check = 0
        DATA_ALL_MENU.forEach((element) => {
            if (element["_id"] + "" == id_parent + "") {
                check++
                $("#select_Menu").append(`<option selected value="${element["_id"]}">${element["name"]}</option>`)
                $("#select_Menu").append(`<option value="">__Tất cả__</option>`)
                $("#select_Menu").append(`<option value="top">__Menu cao nhất__</option>`)
                return
            }
        })
        if (check == 0) {
            $("#select_Menu").append(`<option selected value="">__Tất cả__</option>`)
            $("#select_Menu").append(`<option value="top">__Menu cao nhất__</option>`)
        }
    }
    load_parent_menu("select_Menu", null, "")
}
function drawTable(data, current_page) {
    let stt_table = (current_page - 1) * data.length + 1
    arrMenu = []
    $("#tbodyTable").empty()
    for (let i = 0; i < data.length; i++) {
        arrMenu.push(data[i])
        let image = `<img style="width:80px ; height:80px" src="${URL_IMAGE_MENU}${data[i]["Image"]}">`
        if (data[i]["Image"] == null || typeof data[i]["Image"] == "undefined") image = ""
        $("#tbodyTable").append(`
            <tr>
                <td class="center">${stt_table}</td>
                <td class="text-center"><input onchange="change_serial_number('${data[i]._id}',this)" type="number" value="${data[i].serial_number}" class="form-control"></td>
                <td>${data[i].name}</td>
                <td>${data[i]?.data_parent?.name || "---"}</td>
                <td>${data[i]["link"]}</td>
                <td>${data[i]?.data_website_component?.Description ? data[i]?.data_website_component?.Description : "---"}</td>
                <td class="center">
                    <button onclick="showPopupEdit(${i})" class="btn btn-primary">Chi tiết</button>
                    <button onclick="showPopupDelete(${i})" class="btn btn-danger"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `)
        stt_table++
    }
}
function showPopupDelete(index) {
    const _data = arrMenu[index]
    if (confirm(`Bạn có muốn xóa menu <b>${_data.name}</b>? Thao tác này không thể hoàn tác!`) == true) {
        const data = {
            _id: _data._id,
        }
        callAPI(
            "DELETE",
            API_MENU,
            data,
            () => {
                success("Xóa thành công")
                getData()
            },
        )
    }
}
function showPopupEdit(index) {
    $("#btnConfirmEdit").attr("onclick", `confirmEdit(${index})`)
    const _data = arrMenu[index]
    //load parent categỏy+
    const idcategory = _data._id
    const parent_id = typeof _data.id_parent == "undefined" ? null : _data.id_parent
    const id_represent_category = typeof _data.id_parent == "undefined" ? null : _data.id_represent_category
    const name = _data.name
    const serial_number = _data.serial_number
    const link = _data.link
    //
    const id_website_component = _data.id_website_component
    draw_List_data_website_component(id_website_component, `edit_select_website_component`)
    //

    $(`#serial_number_edit`).val(serial_number)
    $(`#link_edit`).val(link)
    $(`#select_parent_menu_edit`).empty()
    $("#idEditCategory").val(idcategory)
    $("#name_Menu_edit").val(name)
    let check = 0
    DATA_ALL_MENU.forEach((element) => {
        if (element["_id"] + "" == parent_id + "") {
            check++
            $("#select_parent_menu_edit").append(`<option selected value="${element["_id"]}">${element["name"]}</option>`)
            $("#select_parent_menu_edit").append(`<option value="">_____________________</option>`)
            return
        }
    })
    if (check == 0) {
        $("#select_parent_menu_edit").append(`<option selected value="">_____________________</option>`)
    }
    load_parent_menu("select_parent_menu_edit", null, "") //
    let check1 = 0
    $("#select_represent_category_edit").empty()
    DATA_ALL_CATEGORY.forEach((element) => {
        if (element["_id"] + "" == id_represent_category + "") {
            check1++
            $("#select_represent_category_edit").append(`<option selected value="${element["_id"]}">${element["category_name"]}</option>`)
            $("#select_represent_category_edit").append(`<option value="">_____________________</option>`)
            return
        }
    })
    if (check1 == 0) {
        $("#select_represent_category_edit").append(`<option selected value="">_____________________</option>`)
    }
    load_parent_category("select_represent_category_edit", null, "")
    //
    $("#display_app_edit").prop("checked", tryParseBoolean(_data.display_app))
    $("#display_app_edit").val(tryParseBoolean(_data.display_app))
    $("#display_website_edit").prop("checked", tryParseBoolean(_data.display_website))
    $("#display_website_edit").val(tryParseBoolean(_data.display_website))
    $("#display_tree_edit").prop("checked", tryParseBoolean(_data.display_tree))
    $("#display_tree_edit").val(tryParseBoolean(_data.display_tree))
    $("#display_home_edit").prop("checked", tryParseBoolean(_data.display_home))
    $("#display_home_edit").val(tryParseBoolean(_data.display_home))

    $(`#edit_image_menu`).attr(`src`, `${URL_IMAGE_MENU}${_data?.image}`)
    $(`#edit_icon_menu`).attr(`src`, `${URL_IMAGE_MENU}${_data?.icon}`)
    //
    showPopup(`popupEdit`)
}
function confirmEdit(index) {
    const _id = arrMenu[index]._id
    const name = $("#name_Menu_edit").val()
    const link_edit = $("#link_edit").val()
    const serial_number = $("#serial_number_edit").val()
    //
    const display_app = $("#display_app_edit").val()
    const display_website = $("#display_website_edit").val()
    const display_tree = $("#display_tree_edit").val()
    const display_home = $("#display_home_edit").val()
    //
    const id_parent = $("#select_parent_menu_edit").val()
    const id_represent_category = $("#select_represent_category_edit").val()
    const id_website_component = $("#edit_select_website_component").val()
    //
    const image = $("#edit_input_image_menu")[0].files[0]
    const check_delete_image = $("#edit_image_menu_change").val()
    const icon = $("#edit_input_icon_menu")[0].files[0]
    const check_delete_icon = $("#edit_icon_menu_change").val()
    var data = new FormData()
    data.append(`_id`, _id)
    data.append(`name`, name)
    data.append(`link`, link_edit)
    data.append(`id_parent`, id_parent)
    data.append(`check_parent_category`, 1)
    data.append(`id_represent_category`, id_represent_category)
    data.append(`check_id_represent_category`, 1)
    data.append(`id_website_component`, id_website_component)
    data.append(`check_id_website_component`, 1)
    data.append(`serial_number`, serial_number)
    //
    data.append(`display_app`, display_app)
    data.append(`display_website`, display_website)
    data.append(`display_tree`, display_tree)
    data.append(`display_home`, display_home)
    //
    data.append(`image`, image)
    data.append(`check_delete_image`, check_delete_image)
    data.append(`icon`, icon)
    data.append(`check_delete_icon`, check_delete_icon)
    //
    hidePopup("popupEdit")
    callAPI(
        "PUT",
        API_MENU,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true,
        true
    )
}
function showPopupAdd() {
    //load parent categỏy+
    draw_List_data_website_component(``, `add_select_website_component`)
    $("#check_delete_image_add").val(0)
    $("#serial_number_add").val(MAX_SERIAL_NUMBER)
    $(`#name_Menu_add`).val(null)
    $(`#link_add`).val(null)
    $(`#select_parent_menu_add`).empty()
    $("#select_parent_menu_add").append(`<option value="">_____________________</option>`)
    load_parent_menu("select_parent_menu_add", null, "")
    $(`#select_represent_category_add`).empty()
    $("#select_represent_category_add").append(`<option value="">_____________________</option>`)
    load_parent_category("select_represent_category_add", null, "")
    //empty img
    $(`#add_input_image_menu`).val(null)
    $(`#add_image_menu`).attr(`src`, null)
    $(`#add_input_icon_menu`).val(null)
    $(`#add_icon_menu`).attr(`src`, null)
    //
    $("#popupAddMenu").modal({ backdrop: "static", keyboard: false })
}
function confirmAdd() {
    const name = $("#name_Menu_add").val()
    const link_add = $("#link_add").val()
    const display_app = $("#display_app_add").val()
    const display_website = $("#display_website_add").val()
    const display_tree = $("#display_tree_add").val()
    const display_home = $("#display_home_addd").val()
    const id_parent = $("#select_parent_menu_add").val()
    const id_represent_category = $("#select_represent_category_add").val()
    const id_website_component = $("#add_select_website_component").val()
    const serial_number = $("#serial_number_add").val()
    const image = $("#add_input_image_menu")[0].files[0]
    // const check_delete_image = $("#edit_image_menu_change").val()
    const icon = $("#add_input_icon_menu")[0].files[0]
    // const check_delete_icon = $("#edit_icon_menu_change").val()
    var data = new FormData()
    data.append(`name`, name)
    data.append(`link`, link_add)
    data.append(`id_parent`, id_parent)
    data.append(`id_represent_category`, id_represent_category)
    data.append(`id_website_component`, id_website_component)
    data.append(`serial_number`, serial_number)
    data.append(`display_app`, display_app)
    data.append(`display_website`, display_website)
    data.append(`display_tree`, display_tree)
    data.append(`display_home`, display_home)
    data.append(`image`, image)
    // data.append(`check_delete_image`, check_delete_image)
    data.append(`icon`, icon)
    // data.append(`check_delete_icon`, check_delete_icon)
    hidePopup("popupAddMenu")
    callAPI(
        "POST",
        API_MENU,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true,
        true
    )
}
function change_serial_number(_id, input) {
    const serial_number = tryParseInt($(input).val().trim())
    var data = {
        _id: _id,
        serial_number: serial_number,
    }
    callAPI(
        "PUT",
        API_MENU,
        data,
        () => {
            // success("Thành công")
            // getData()
        },
        false,
        false
    )
}
//
function load_parent_menu(id_div_select, _id, text = "") {
    DATA_ALL_MENU.forEach((element) => {
        text = text.replace("|_", "")
        if (element["id_parent"] + "" == _id + "") {
            $(`#${id_div_select}`).append(`<option value="${element["_id"]}">${text}${element["name"]}</option>`)
            // console.log(text)
            load_parent_menu(id_div_select, element["_id"], text + "&emsp;.&emsp;|_&nbsp;")
        }
    })
}
function load_parent_category(id_div_select, _id, text = "") {
    // console.log(DATA_ALL_CATEGORY)
    DATA_ALL_CATEGORY.forEach((element) => {
        // text+='-'
        if (element["id_parent_category"] + "" == _id + "") {
            $(`#${id_div_select}`).append(`<option value="${element["_id"]}">${text}${element["category_name"]}</option>`)
            load_parent_category(id_div_select, element["_id"], text + "--")
        }
    })
}

function changeShow(input) {
    if ($(input).is(":checked")) {
        $(input).val(true)
    } else {
        $(input).val(false)
    }
}

function showImageEdit(input, id_tag_img, id_change) {
    $(`#${id_change}`).val(0)
    if (input.files && input.files[0]) {
        var reader = new FileReader()
        reader.onload = function (e) {
            $(`#${id_tag_img}`).attr("src", e.target.result)
        }
        reader.readAsDataURL(input.files[0]) // convert to base64 string
        $(`#${id_change}`).val(0)
    }
}
//delete this image
function delete_curent_image(id_change, id_tag_img, id_input_img) {
    $(`#${id_tag_img}`).attr("src", "")
    $(`#${id_change}`).val(1)
    $(`#${id_input_img}`).val(null)
}
