var arr_Data = []
var check_slot_add = 0
var check_slot_edit = 0
$(document).ready(function () {
    getData(true)
})
function getData(isLoad = true) {
    // console.log(`?`)
    isLoading(isLoad)
    limit = $("#selectLimit option:selected").val()
    key = $("#keyFind").val()
    let data = {
        key: key,
        limit: limit,
    }
    data = null
    callAPI("GET", `${API_SLIDE_BANNER}${window.location.search}`, data, (response) => {
        throwValue(response)
        stt = limit * (tryParseInt(response.page) - 1) + 1
        limit = response.limit
        $("#selectLimit").val(limit.toString())
        loadData(response.data)
        pagination2(response.total, response.page, `divPagination`)
    })
}
function loadData(data) {
    $("#tbodyTable").empty()
    arr_Data = []
    for (var i = 0; i < data.length; i++) {
        arr_Data.push(data[i])

        const checked = data[i].Active_Mobile?"checked":""
        let html = ``
        html += `<tr>
            <td style="text-align:center;" >${stt + i}</td>
            <td>${data[i]["Title"]}</td>
            <td>${data[i]["Description"]}</td>
            <td>
                <input ${checked} onchange="updateActiveMobile(${arr_Data.length-1})" type="checkbox" >
            </td>
            <td><button onclick="Show_popup_edit(${i})" class="btn btn-primary btn-infos" title="Sửa"><i class="fas fa-user-edit"></i></button></td>
        </tr>`

        $("#tbodyTable").append(html)
    }
}

function Show_popup_edit(index) {
    const data = arr_Data[index]
    const data_slide_banner = data?.SlideBanner || []
    //
    $(`#title_edit_slide_banner`).val(data.Title)
    $(`#des_edit_slide_banner`).val(data.Description)
    //
    const tag = `edit_slide_banner`
    $(`#div_${tag}`).empty()
    //
    for (let i = 0; i < data_slide_banner.length; i++) {
        $(`#div_${tag}`).append(`
        <div style="position: relative; border-style: ridge; padding: 20px 20px; margin-bottom: 20px;" id="tr_${tag}_${i}" class="thuan-2022-${tag}">
            <div class="row">
                <i onclick="confirm_delete__slide_banner('tr_${tag}_${i}')" style="padding: 0px 0px; position: absolute; top: 0; left: 0;" class="fas fa-trash text-danger"></i>
                <div class="col col-md-9">
                    <div class="row" style="margin-top: 20px;">
                        <label class="col-md-2"><b>Tiêu đề:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-title-${tag}" id="title_${tag}_${i}" value="${data_slide_banner[i]?.title}">
                    </div>
                    <div class="row" style="margin-top: 20px">
                        <label class="col-md-2"><b>Link bài viết:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-link-${tag}" id="link_${tag}_${i}" value="${data_slide_banner[i]?.link}">
                    </div>
                </div>
                <div class="col col-md-3">
                    <img alt="Vui lòng chọn ảnh" style="width:200px; height: auto;" src="${URL_IMAGE_SLIDE_BANNER}/${data_slide_banner[i]?.image}">
                    <input class="thuan-2022-name-image-${tag}" style="display:none;" id="name_image_${tag}_${i}" value="${data_slide_banner[i]?.image}">
                    <input class="thuan-2022-img-${tag}" autocomplete="off" accept="image/*" type="file" onchange="changeImage(this)" placeholder="Chọn file ảnh">
                </div>
                
            </div>
        </div>
        `)
        check_slot_edit++
    }
    $(`#btn_Save_edit_slide_banner`).attr("onclick", `confirm_save_edit_slide_banner(${index})`)
    showPopup(`popup_edit_slide_banner`)
}
//
function add_more__slide_banner(tag) {
    let numb = 0
    if (tag == `edit_slide_banner`) {
        numb = check_slot_edit
        check_slot_edit++
    } else {
        numb = check_slot_add
        check_slot_add++
    }
    $(`#div_${tag}`).append(`
        <div style="position: relative; border-style: ridge; padding: 20px 20px; margin-bottom: 20px;" id="tr_${tag}_${numb}" class="thuan-2022-${tag}">
            <div class="row">
                <i onclick="confirm_delete__slide_banner('tr_${tag}_${numb}')" style="padding: 0px 0px; position: absolute; top: 0; left: 0;" class="fas fa-trash text-danger"></i>
                <div class="col col-md-9">
                    <div class="row" style="margin-top: 20px;">
                        <label class="col-md-2"><b>Tiêu đề:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-title-${tag}" id="title_${tag}_${numb}" value="">
                    </div>
                    <div class="row" style="margin-top: 20px">
                        <label class="col-md-2"><b>Link bài viết:</b></label>
                        <input autocomplete="off" class="col-md-9 form-control thuan-2022-link-${tag}" id="link_${tag}_${numb}" value="">
                    </div>
                </div>
                <div class="col col-md-3">
                    <img alt="Vui lòng chọn ảnh" style="width:200px; height: auto;" src="">
                    <input class="thuan-2022-name-image-${tag}" style="display:none;" id="name_image_${tag}_${numb}" value="">
                    <input class="thuan-2022-img-${tag}" autocomplete="off" accept="image/*" type="file" onchange="changeImage(this)" placeholder="Chọn file ảnh">
                </div>
                
            </div>
        </div>
        `)
}
//
function confirm_save_edit_slide_banner(index) {
    const _id = arr_Data[index]._id
    var data = new FormData()
    const List_Content = document.querySelectorAll(".thuan-2022-edit_slide_banner")
    let arr_data_img = []
    //
    for (const itemSub of List_Content) {
        const _id_title = itemSub.querySelector(".thuan-2022-title-edit_slide_banner").getAttribute("id")
        const _id_link = itemSub.querySelector(".thuan-2022-link-edit_slide_banner").getAttribute("id")
        const _id_name_image = itemSub.querySelector(".thuan-2022-name-image-edit_slide_banner").getAttribute("id")
        const tag_input_img = itemSub.querySelector(".thuan-2022-img-edit_slide_banner")
        // console.log($(`#${_id_title}`).val())

        let name = $(`#${_id_name_image}`).val()
        const img = tag_input_img.files[0]
        data.append("image_slide_banner", img)
        if (typeof img != "undefined" && img != null) name = img.name
        arr_data_img.push({
            title: $(`#${_id_title}`).val(),
            link: $(`#${_id_link}`).val(),
            image: name,
        })
    }
    const title = $(`#title_edit_slide_banner`).val()
    const des = $(`#des_edit_slide_banner`).val()
    //
    data.append("receive_data", JSON.stringify(arr_data_img))
    data.append("_id", _id)
    data.append("Title", title)
    data.append("Description", des)
    //
    hidePopup("popup_edit_slide_banner")
    //
    callAPI(
        "PUT",
        `${API_SLIDE_BANNER}`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
function showPopupAdd_new_slide_banner() {
    $(`#title_add_slide_banner`).val(null)
    $(`#des_add_slide_banner`).val(null)
    $(`#title_add_slide_banner`).val(null)
    $(`#div_add_slide_banner`).empty()
    add_more__slide_banner(`add_slide_banner`)
    showPopup(`popup_add_slide_banner`)
}
//
function confirm_save_add_slide_banner() {
    var data = new FormData()
    const List_Content = document.querySelectorAll(".thuan-2022-add_slide_banner")
    let arr_data_img = []
    for (const itemSub of List_Content) {
        const _id_title = itemSub.querySelector(".thuan-2022-title-add_slide_banner").getAttribute("id")
        const _id_link = itemSub.querySelector(".thuan-2022-link-add_slide_banner").getAttribute("id")
        const _id_name_image = itemSub.querySelector(".thuan-2022-name-image-add_slide_banner").getAttribute("id")
        const tag_input_img = itemSub.querySelector(".thuan-2022-img-add_slide_banner")
        // console.log($(`#${_id_title}`).val())

        let name = $(`#${_id_name_image}`).val()
        const img = tag_input_img.files[0]
        data.append("image_slide_banner", img)
        if (typeof img != "undefined" && img != null) name = img.name
        arr_data_img.push({
            title: $(`#${_id_title}`).val(),
            link: $(`#${_id_link}`).val(),
            image: name,
        })
    }
    //
    const title = $(`#title_add_slide_banner`).val()
    const des = $(`#des_add_slide_banner`).val()
    //
    data.append("receive_data", JSON.stringify(arr_data_img))
    data.append("Title", title)
    data.append("Description", des)
    //
    callAPI(
        "POST",
        `${API_SLIDE_BANNER}`,
        data,
        () => {
            success("Thành công")
            getData()
        },
        undefined,
        true
    )
}
//
function confirm_delete__slide_banner(id_tr) {
    if (confirm("Bạn có muốn xóa banner này?") == true) {
        $(`#${id_tr}`).remove()
    }
}
//
function changeLimit() {
    const new_limit = $(`#selectLimit`).val()
    let theURL
    theURL = new URL(`${window.location.href}`)
    theURL.searchParams.set("limit", new_limit)
    theURL.searchParams.set("page", 1)
    // console.log(theURL.toString());
    const new_URL = theURL.toString()
    changeURL(new_URL)
    getData()
}
function change_key_search() {
    const key = $(`#keyFind`).val()
    let theURL
    theURL = new URL(`${window.location.href}`)
    theURL.searchParams.set("key", key)
    const new_URL = theURL.toString()
    changeURL(new_URL)
    getData()
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

function deleteRow(tagI) {
    $(tagI).closest("tr").remove()
}


function updateActiveMobile(index){
    const element = $(event.target)
    const status_active = $(element).is(":checked")

    callAPI('PUT',`${API_SLIDE_BANNER}/active-mobile`,{
        id_banner: arr_Data[index]._id,
        status_active:status_active
    })
}