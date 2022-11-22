var arrAddCombo = []
var arrCombo = []
var arrEditCombo = []
//API_POLICY
function getData() {
    limit = parseInt($("#selectLimit option:selected").val())
    offset = 0
    stt = 1
    let key = $("#inputKey").val()
    $("#pagePatigation").empty()
    $("#tbodyTable").empty()
    isLoading(true)
    $.ajax({
        type: "GET",
        url: `${API_POLICY}`,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: {
            key: key,
            limit: limit,
            offset: offset,
        },
        cache: false,
        success: function (data) {
            isLoading(false)
            throwValue(data)
            drawTable(data.data)
            pagination2(data.total, data.page, `divPagination`)
        },
        error: function (data) {
            isLoading(false)
            if (data.status == 503 || data.status == 502) error("Server bị ngắt kết nối , hãy kiểm tra lại mạng của bạn")
            if (data != null && data.status != 503 && data.status != 502) {
                error(data.responseText)
            }
        },
    })
}
function comfirmEditCombo(index) {
    const Name = $("#editNameCombo").val()
    const Note = $("#editNoteCombo").val()
    const Active_Website_GamingMarket_edit = $("#Active_Website_GamingMarket_edit").val()
    if (Name.length == 0) {
        info("Tên combo không được để trống")
    } else {
        let arr = []
        for (let i = 0; i < arrEditCombo.length; i++) {
            if (arrEditCombo[i] != null) {
                arr.push({ Content: arrEditCombo[i]["Content"], Link: arrEditCombo[i]["Link"], Description: arrEditCombo[i].Description })
            }
        }
        if (arr.length == 0) {
            info("Hãy thêm nội dung cho combo")
        } else {
            isLoading(true)
            $("#popupEdit").modal("hide")
            //
            var data = {
                _id: arrCombo[index]["_id"],
                Name: Name,
                Note: Note,
                Content: arr,
                Active_Website_GamingMarket: Active_Website_GamingMarket_edit,
            }
            callAPI("PUT", API_POLICY, data, () => {
                success("Thành công")
                $("#divEditContentCombo").empty()
                arrAddCombo = []
                getData()
            })
        }
    }
}
function showPopupAdd() {
    $(`#addNameCombo`).val(null)
    $(`#addNoteCombo`).val(null)
    $(`#inputaddContentCombo`).val(null)
    $(`#inputLink`).val(null)
    $(`#add_description`).val(null)
    $("#divAddContentCombo").empty()
    showPopup(`popupAdd`)
}
function comfirmAddNew() {
    const Name = $("#addNameCombo").val()
    const Note = $("#addNoteCombo").val()
    const Active_Website_GamingMarket = $("#Active_Website_GamingMarket").val()
    if (Name.length == 0) {
        info("Tên combo không được để trống")
    } else {
        let arr = []
        for (let i = 0; i < arrAddCombo.length; i++) {
            if (arrAddCombo[i] != null) {
                arr.push(arrAddCombo[i])
            }
        }
        if (arr.length == 0) {
            info("Hãy thêm nội dung cho combo")
        } else {
            isLoading(true)
            $("#popupAdd").modal("hide")
            //
            var data = {
                Name: Name,
                Note: Note,
                Content: arr,
                Active_Website_GamingMarket: Active_Website_GamingMarket,
            }
            callAPI("POST", API_POLICY, data, () => {
                success("Thành công")
                $("#divAddContentCombo").empty()
                $("#addNameCombo").val(null)
                arrAddCombo = []
                getData()
            })
        }
    }
}
function drawTable(data) {
    arrCombo = []
    for (let i = 0; i < data.length; i++) {
        arrCombo.push(data[i])
        $("#tbodyTable").append(`
        <tr>
            <td class="text-center">${stt + i}</td>
            <td>${data[i]["Name"]}</td>
            <td>${data[i]["Note"]}</td>
            <td class="text-center">
                <button onclick="editCombo(${i})" class="btn btn-primary"><i class="fas fa-edit"></i></button>
                <button onclick="delete_combo(${i})" class="btn btn-danger"><i class="fas fa-trash"></i></button>
            </td>
            </tr>
        `)
    }
}
function delete_combo(index) {
    if (confirm(`Bạn có chắc chắn muốn xóa "${arrCombo[index]["Name"]}"?`) == true) {
        var data = {
            _id: arrCombo[index]["_id"],
        }
        callAPI("DELETE", API_POLICY, data, () => {
            success("Thành công")
            getData()
        })
    }
}
function editCombo(index) {
    //
    $(`#edit_description`).val(null)
    //
    $("#btnConfirmEdit").attr("onclick", "comfirmEditCombo(" + index + ")")
    $("#editNameCombo").val(arrCombo[index]["Name"])
    $("#editNoteCombo").val(arrCombo[index]["Note"])
    //
    if (arrCombo[index].Active_Website_GamingMarket) {
        $("#Active_Website_GamingMarket_edit").prop("checked", true)
        $("#Active_Website_GamingMarket_edit").val(`${arrCombo[index].Active_Website_GamingMarket}`)
    } else {
        $("#Active_Website_GamingMarket_edit").prop("checked", false)
        $("#Active_Website_GamingMarket_edit").val(`${arrCombo[index].Active_Website_GamingMarket}`)
    }
    //
    arrEditCombo = []
    $("#divEditContentCombo").empty()
    for (let i = 0; i < arrCombo[index]["Content"].length; i++) {
        let html = ""
        html += '<div id="divEdit' + arrEditCombo.length + '" class="row">'
        html += '    <div class="col col-md-11">'
        html += '        <a style="border:none;" href="javascript:void(0)" onclick="rowEditPromotion(' + i + ')" class="form-control">' + arrCombo[index]["Content"][i]["Content"] + " </a>"
        html += "    </div>"
        html += '    <div class="col col-md-1">'
        html += '        <i onclick="deleteEditRow(' + arrEditCombo.length + ')" class="fas fa-trash text-danger"></i>'
        html += "    </div>"
        html += "</div>"
        $("#divEditContentCombo").append(html)
        arrEditCombo.push({ Content: arrCombo[index]["Content"][i]["Content"], Link: arrCombo[index]["Content"][i]["Link"], Description: arrCombo[index]["Content"][i]["Description"] })
    }
    $("#popupEdit").modal({ backdrop: "static", keyboard: false })
}
function deleteEditRow(index) {
    arrEditCombo[index] = null
    $("#divEdit" + index).remove()
}

function addRowComboEdit() {
    $("#btnEditContent").hide()
    let contentEdit = $("#inputeditContentCombo").val().trim()
    let linkEdit = $("#inputLinkEdit").val().trim()

    if (linkEdit.length == 0) linkEdit = null
    if (contentEdit.length > 0) {
        let html = ""
        html += '<div id="divEdit' + arrEditCombo.length + '" class="row">'
        html += '    <div class="col col-md-11">'
        html += '        <a onclick="rowEditPromotion(' + arrEditCombo.length + ')"  style="border: none;" class="form-control">' + contentEdit + "</a>"
        html += "    </div>"
        html += '    <div class="col col-md-1">'
        html += '        <i onclick="deleteEditRow(' + arrEditCombo.length + ')" class="fas fa-trash text-danger"></i>'
        html += "    </div>"
        html += "</div>"
        $("#divEditContentCombo").prepend(html)
        arrEditCombo.push({ Content: contentEdit, Link: linkEdit })
        $("#inputeditContentCombo").val(null)
        $("#inputLinkEdit").val(null)
    }
}

function rowEditPromotion(flag) {
    $("#btnEditContent").attr("onclick", "saveContentEdit(" + flag + ")")
    $("#btnEditContent").show()

    $("#inputeditContentCombo").val(arrEditCombo[flag]["Content"])
    $("#inputLinkEdit").val(arrEditCombo[flag]["Link"])
    $("#edit_description").val(arrEditCombo[flag]["Description"])
}
function saveContentEdit(index) {
    $("#btnEditContent").hide()
    const contentedit = $("#inputeditContentCombo").val().trim()
    const linkedit = $("#inputLinkEdit").val().trim()
    const description = $("#edit_description").val().trim()

    if (linkedit.length == 0) linkedit = null
    if (contentedit.length == 0) {
        info("Nội dung không được để trống")
    } else {
        arrEditCombo[index] = { Content: contentedit, Link: linkedit, Description: description }
        $("#divEdit" + index + " a").text(contentedit)
        $("#inputeditContentCombo").val(null)
        $("#inputLinkEdit").val(null)
        $("#edit_description").val(null)
    }
}

function addRowCombo() {
    let Content = $("#inputaddContentCombo").val().trim()
    let linkcombo = $("#inputLink").val().trim()
    const description = $("#add_description").val()
    if (Content.length > 0) {
        let html = ""
        html += '<div id="divAdd' + arrAddCombo.length + '" class="row">'
        html += '    <div class="col col-md-11">'
        html += '        <a target="_blank" style="border: none;" href="' + linkcombo + '" class="form-control">' + Content + "</a>"
        html += "    </div>"
        html += '    <div class="col col-md-1">'
        html += '        <i onclick="deleteAddRow(' + arrAddCombo.length + ')" class="fas fa-trash text-danger"></i>'
        html += "    </div>"
        html += "</div>"
        $("#divAddContentCombo").prepend(html)

        arrAddCombo.push({ Content: Content, Link: linkcombo, Description: description })
        $("#inputaddContentCombo").val(null)
        $("#inputLink").val(null)
        $("#add_description").val(null)
    } else {
        info("Nội dung không được để trống !")
    }
}

function deleteAddRow(index) {
    $("#divAdd" + index).remove()
    arrAddCombo[index] = null
}
function changeShow(input) {
    if ($(input).is(":checked")) {
        $(input).val(true)
    } else {
        $(input).val(false)
    }
}
