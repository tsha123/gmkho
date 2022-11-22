var arrData = []
var getOther = true
var arrSuperCategory = []
getData()
var DATA_ALL_CATEGORY = []
var DATA_ALL_SLIDE_BANNER = []

function getData(isLoad = true) {
    isLoading(isLoading)
    limit = $("#selectLimit option:selected").val()
    key = $("#keyFind").val()

    let data = {
        limit: tryParseInt(limit),
        page: tryParseInt(page),
        key: key,
    }

    callAPI("GET", `${API_CATEGORY}?`, data, (data) => {
        throwValue(data)
        DATA_ALL_CATEGORY = data.data_all
        DATA_ALL_SLIDE_BANNER = data.data_slide_banner
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&category_name=${key}`)
    })
}
function draw_List_data_slide_banner(id_slide_banner, _div_select) {
    let html = ``
    html += `<option value="">____ Chọn website ____</option>`
    for (let i = 0; i < DATA_ALL_SLIDE_BANNER.length; i++) {
        if (DATA_ALL_SLIDE_BANNER[i]._id + "" == id_slide_banner + "") {
            html += `<option selected value="${DATA_ALL_SLIDE_BANNER[i]._id}">${DATA_ALL_SLIDE_BANNER[i].Title}</option>`
        } else {
            html += `<option value="${DATA_ALL_SLIDE_BANNER[i]._id}">${DATA_ALL_SLIDE_BANNER[i].Title}</option>`
        }
    }
    $(`#${_div_select}`).empty()
    $(`#${_div_select}`).html(html)
}
function drawTable(data) {
    $("#tbodyTable").empty()
    arrData = []
    for (let i = 0; i < data.length; i++) {
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt + i}</td>
                <td>${data[i].category_name}</td>
                <td>${data[i].category_image != null ? `<img src="${URL_IMAGE_CATEGORY}${data[i].category_image}">` : ""} </td>
                <td>${data[i].category_status ? "Đang hoạt động" : "Đã ẩn"}</td>
                <td>${data[i]?.data_parent?.category_name || "---"}</td>
                <td>${data[i]?.data_slide_banner?.Title || "---"}</td>
                <td>
                    <button onclick="showPopupEdit(${i})" class="btn btn-primary"><i class="mdi mdi-information"></i> Chi tiết</button>
                    <button onclick="showKeys(${i})" class="btn btn-success"><i class="mdi mdi-key-minus"></i> Từ khóa</button>
                    <button onclick="newPage('/category-management/edit-content?id_category=${data[i]._id}')" class="btn btn-danger"><i class="fas fa-edit"></i>Bài viết</button>
                    <button onclick="delete_category(${i})" class="btn btn-warning"><i class="fas fa-trash"></i>Xóa</button>
                </td>
            </tr>
        `)
    }
}

function showPopupEdit(index) {
    const parent_id = typeof arrData[index].id_parent_category == "undefined" ? null : arrData[index].id_parent_category
    //name
    $("#editName").val(arrData[index].category_name)
    //status
    $(`input[type=radio][name=editStatus][value="${arrData[index].category_status}"]`).prop("checked", true)
    //image
    if (!arrData[index].category_image) $("#imgEdit").attr("src", IMAGE_NULL)
    else $("#imgEdit").attr("src", URL_IMAGE_CATEGORY + arrData[index].category_image)
    $("#inputEditImage").val(null)
    //danh muc cha
    $(`#select_parent_category_edit`).empty()
    let check = 0
    DATA_ALL_CATEGORY.forEach((element) => {
        if (element["_id"] + "" == parent_id + "") {
            check++
            $("#select_parent_category_edit").append(`<option selected value="${element["_id"]}">${element["category_name"]}</option>`)
            $("#select_parent_category_edit").append(`<option value="">_____________________</option>`)
            return
        }
    })
    //vẽ data slide bannner
    const _id_slide_banner = arrData[index].id_slide_banner
    draw_List_data_slide_banner(_id_slide_banner, `select_slide_banner_edit`)
    //
    if (check == 0) {
        $("#select_parent_category_edit").append(`<option selected value="">_____________________</option>`)
    }
    load_parent_category("select_parent_category_edit", null, "")
    //status display
    if (arrData[index].display_app) {
        $("#display_app_edit").prop("checked", true)
        $("#display_app_edit").val(`${arrData[index].display_app}`)
    } else {
        $("#display_app_edit").prop("checked", false)
        $("#display_app_edit").val(`${arrData[index].display_app}`)
    }
    if (arrData[index].display_website) {
        $("#display_website_edit").prop("checked", true)
        $("#display_website_edit").val(`${arrData[index].display_website}`)
    } else {
        $("#display_website_edit").prop("checked", false)
        $("#display_website_edit").val(`${arrData[index].display_website}`)
    }
    $("#confirmEdit").attr("onclick", `confirmEdit(${index})`)

    showPopup("popupEdit")
}

function changeImage(input) {
    $(`#${input}`).click()
}

function paste_Image(input, image) {
    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $(`#${image}`).css({ height: "auto" })
            $(`#${image}`).attr("src", e.target.result)
        }
        reader.readAsDataURL(input.files[0]) // convert to base64 string
    }
}

function confirmEdit(index) {
    const _id = arrData[index]._id
    const category_name = $("#editName").val().trim()
    const category_status = $(`input[type=radio][name=editStatus]:checked`).val()
    const category_image = $("#inputEditImage")[0].files[0]
    const display_app = $("#display_app_edit").val()
    const display_website = $("#display_website_edit").val()
    const id_parent_category = $("#select_parent_category_edit").val()
    const id_slide_banner = $("#select_slide_banner_edit").val()
    const part = tryParseInt($("#editPart").val())

    if (!category_name) {
        info("Tên danh mục không được để trống")
        return
    }

    var data = new FormData()
    data.append("category_name", category_name)
    data.append("category_status", category_status)
    data.append("category_image", category_image)
    data.append("display_app", display_app)
    data.append("display_website", display_website)
    data.append("id_parent_category", id_parent_category)
    data.append("id_slide_banner", id_slide_banner)
    data.append("pard", part)
    data.append("_id", _id)

    hidePopup("popupEdit")
    callAPI(
        "put",
        API_CATEGORY,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
function showPopupAdd() {
    $(`#addName`).val(null)
    draw_List_data_slide_banner(``, `select_slide_banner_add`)
    //
    $(`#select_parent_category_add`).empty()
    $("#select_parent_category_add").append(`<option value="">_____________________</option>`)
    //empty img
    $(`#inputAddImage`).val(null)
    $(`#imgAdd`).attr(`src`, null)
    //
    load_parent_category("select_parent_category_add", null, "")
    showPopup(`popupAdd`)
}
function confirmAdd() {
    const category_name = $("#addName").val().trim()
    const category_status = $(`input[type=radio][name=addStatus]:checked`).val()
    const category_image = $("#inputAddImage")[0].files[0] || null
    const display_app = $("#display_app_add").val()
    const display_website = $("#display_website_add").val()
    const id_parent_category = $("#select_parent_category_add").val()
    const id_slide_banner = $("#select_slide_banner_add").val()
    const part = tryParseInt($("#addPart").val())
    if (!category_name) {
        info("Tên danh mục không được để trống")
        return
    }

    var data = new FormData()
    data.append("category_name", category_name)
    data.append("category_status", category_status)
    data.append("category_image", category_image)
    data.append("display_app", display_app)
    data.append("display_website", display_website)
    data.append("id_parent_category", id_parent_category)
    data.append("id_slide_banner", id_slide_banner)
    data.append("part", part)

    hidePopup("popupAdd")
    callAPI(
        "post",
        API_CATEGORY,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}

function confirmAddSuper() {
    const super_category_name = $("#addNameSuper").val().trim()
    if (!super_category_name) {
        info("Tên danh mục không được để trống")
        return
    }

    hidePopup("popupAddSuper")
    callAPI("post", `../api/supercategory`, { super_category_name: super_category_name }, () => {
        success("Thành công")
        getOther = true
        getData()
    })
}

function showKeys(index) {
    $("#tbodyKey").empty()
    if (arrData[index].category_options) {
        let html = ""
        for (let i = 0; i < arrData[index].category_options.length; i++) {
            html += `<tr>
                        <td class="center">${i}</td>
                        <td >${arrData[index].category_options[i].category_options_name}</td>
                        <td>${arrData[index].category_options[i].category_options_alt}</td>
                        <td>`
            arrData[index].category_options[i].category_options_values.forEach((val) => {
                html += `${val}, `
            })
            html += `</td>
                <td>
                    <i onclick="editKey(${index},${i})" class="fas fa-edit text-primary"></i>
                    <i onclick="showPopupDeleteKey(${index},${i})" class="fas fa-trash text-danger"></i>
                </td></tr>`
        }
        $("#tbodyKey").append(html)
    }
    $("#confirmAddKey").attr("onclick", `confirmSaveAddKey(${index})`)
    showPopup("popupDetailKey")
}

function changeValueKey(input) {
    if (event.which == "13") {
        const str = $(input).val().trim().split(" /")
        var result = ""
        for (let i = 0; i < str.length; i++) {
            if (str[i].trim() != "/" && str[i].trim().length > 0) {
                result += str[i].trim() + " / "
            }
        }
        $(input).val(result)
    }
}

function confirmSaveAddKey(index) {
    var arrKey = []

    const category_options_name = $("#add_category_options_name").val().trim()
    if (category_options_name.length == 0) {
        info("Từ khóa không được để trống")
        return
    }
    const category_options_alt = $("#add_category_options_alt").val().trim()
    if (category_options_alt.length == 0) {
        info("Tên thay thế không được để trống")
        return
    }
    const category_options_values = $("#add_category_options_values").val().trim().split(" /")
    for (let i = 0; i < category_options_values.length; i++) {
        if (category_options_values[i].trim() != "/" && category_options_values[i].trim().length > 0) {
            arrKey.push(category_options_values[i].trim())
        }
    }
    if (arrKey.length == 0) {
        info("Phải có ít nhất 1 giá trị")
        return
    }
    hidePopup("popupAddKey")
    hidePopup("popupDetailKey")

    callAPI(
        "POST",
        `../api/category/key`,
        {
            category_options_name: category_options_name,
            category_options_alt: category_options_alt,
            category_options_values: arrKey,
            id_category: arrData[index]._id,
        },
        (data) => {
            success("Thành công")
            arrData[index].category_options = data.category_options
            showKeys(index)
        }
    )
}

function editKey(index, indexOption) {
    $("#edit_category_options_name").val(arrData[index].category_options[indexOption].category_options_name)
    $("#edit_category_options_alt").val(arrData[index].category_options[indexOption].category_options_alt)
    var strVal = ""
    for (let i = 0; i < arrData[index].category_options[indexOption].category_options_values.length; i++) {
        strVal += arrData[index].category_options[indexOption].category_options_values[i] + " / "
    }
    $("#edit_category_options_values").val(strVal)
    $("#btnconfirmEditKey").attr("onclick", `confirmEditKey(${index},'${indexOption}')`)
    showPopup("popupEditKey", false, "popupDetailKey")
}

function confirmEditKey(index, indexOption) {
    var arrKey = []
    const category_options_name = $("#edit_category_options_name").val().trim()
    const category_options_alt = $("#edit_category_options_alt").val().trim()
    if (category_options_name.length == 0) {
        info("Từ khóa không được để trống")
        return
    }
    if (category_options_alt.length == 0) {
        info("Tên thay thế không được để trống")
        return
    }

    const str = $("#edit_category_options_values").val().split(" /")
    for (let i = 0; i < str.length; i++) {
        if (str[i].trim() != "/" && str[i].trim().length > 0) {
            arrKey.push(str[i].trim())
        }
    }
    if (arrKey.length == 0) {
        info("Phải có ít nhất 1 giá trị")
        return
    }
    hidePopup("popupEditKey")
    var data = {
        category_options_name: category_options_name,
        category_options_alt: category_options_alt,
        category_options_values: arrKey,
        indexOption: indexOption,
        id_category: arrData[index]._id,
    }

    callAPI("PUT", `../api/category/key`, data, (data) => {
        success("Thành công")
        arrData[index].category_options = data.category_options
        showKeys(index)
    })
}

function showPopupDeleteKey(index, indexOption) {
    $("#btnconfirmDeleteKey").attr("onclick", `confirmDeleteKey(${index},${indexOption})`)
    showPopup("popupDeleteKey")
}

function confirmDeleteKey(index, indexOption) {
    hidePopup("popupDeleteKey")
    isLoading()
    var data = {
        indexOption: indexOption,
        id_category: arrData[index]._id,
    }
    callAPI("DELETE", `../api/category/key`, data, (data) => {
        success("Thành công")
        arrData[index].category_options = data.category_options
        showKeys(index)
    })
}

function downloadCategory() {
    var arrDownload = []
    for (let i = 0; i < arrData.length; i++) {
        arrDownload.push({
            "Mã danh mục": arrData[i]._id,
            "Tên danh mục": arrData[i].category_name,
        })
    }
    downloadExcelLocal(arrDownload, "Danh sách danh mục")
}
//=====
function changeValueStatus(input) {
    if ($(input).is(":checked")) {
        $(input).val(true)
    } else {
        $(input).val(false)
    }
}

function load_parent_category(id_div_select, _id, text = "") {
    DATA_ALL_CATEGORY.forEach((element) => {
        // text+='-'
        if (element["id_parent_category"] + "" == _id + "") {
            $(`#${id_div_select}`).append(`<option value="${element["_id"]}">${text}${element["category_name"]}</option>`)
            load_parent_category(id_div_select, element["_id"], text + "--")
        }
    })
}

function delete_category(index){
    $("#popupDelete .modal-footer button:last-child").attr("onclick",`confirm_delete(${index})`)
    showPopup('popupDelete')
}

const confirm_delete = (index)=>{
    callAPI('DELETE',API_CATEGORY,{
        id_category:arrData[index]._id
    },()=>{
        success("Thành công")
        getData()
    })
}