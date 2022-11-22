var arrData = [];
getData()
var arrContent = []
function getData(isLoad = true) {
    isLoading(isLoading)
   
    limit = $("#selectLimit option:selected").val();
    key = $("#keyFind").val()
    $.ajax({
        type: 'GET',
        url: `../api/promotion-combo?`,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: {
            limit: tryParseInt(limit),
            page: tryParseInt(page),
            key: key,
        },

        cache: false,
        success: function (data) {

            isLoading(false);
            drawTable(data.data);
            pagination(data.count, data.data.length)
            changeURL(`?limit=${limit}&page=${page}&promotion_combo_name=${key}`)

            
        },
        error: function (data) {
            errAjax(data) 
        }
    })
}

function drawTable(data)
{
    $("#tbodyTable").empty()
    arrData = []
    for(let i =0;i<data.length;i++)
    {
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td class="center">${stt+i}</td>
                <td class="center">${data[i].promotion_combo_name}</td>
                <td class="center"><button onclick="detailCombo(${i})" class="btn btn-primary">Chi tiết</button></td>
            </tr>
        `)
    }

}

function addContentToDiv(idInput , idInputLink)
{
    const content = $(`#${idInput}`).val().trim()
    if(content.length > 0)
    {
        arrContent.push({
            Content: content,
            Link: $(`#${idInputLink}`).val().trim()
        })
        $(`#${idInput}`).val(null)
        $(`#${idInputLink}`).val(null)
        drawTableContent()

    }

}

function drawTableContent()
{
    $(`.div-contents`).empty()
    for(let i =0;i<arrContent.length;i++)
    {
        $(`.div-contents`).append(`<tr>
            <td class="center">${i+1}</td>
            <td><a href="${arrContent[i].Link}" target="_blank">${arrContent[i].Content}</a></td>
            <td class="center"><i onclick="deleteContent(${i}, this)" class="mdi mdi-delete text-danger"></i></td>
        </tr>`)
    }
}

function deleteContent(index, i)
{
    $(i).closest('tr').remove()
    arrContent.splice(index,1)
    drawTableContent()
}

function confirmAdd()
{
    const promotion_combo_name = $("#addName").val().trim()
    if(promotion_combo_name.length == 0) {
        info("Tên combo không được để trống")
        return
    }
    if(arrContent.length == 0)
    {
        info("Combo phải có ít nhất một giá trị")
        return
    }

    hidePopup('popupAdd')
    isLoading()
    $.ajax({
        type: 'post',
        url: `../api/promotion-combo`,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: {
            promotion_combo_name:promotion_combo_name,
            arrContent:arrContent
        },
        cache: false,
        success: function (data) {
           success("Thành công")
           getData()
            
        },
        error: function (data) {
            errAjax(data) 
        }
    })
}

function detailCombo(index)
{
    arrContent = []
    arrContent = arrData[index].promotion_combo_content
    $("#editName").val(arrData[index].promotion_combo_name)
    $("#btnConfirmEdit").attr("onclick",`confirmEdit(${index})`)
    drawTableContent()
    showPopup('popupEdit')
}

function confirmEdit(index)
{
    const promotion_combo_name = $("#editName").val().trim()
    if(promotion_combo_name.length == 0) {
        info("Tên combo không được để trống")
        return
    }
    if(arrContent.length == 0)
    {
        info("Combo phải có ít nhất một giá trị")
        return
    }

    hidePopup('popupEdit')
    isLoading()
    $.ajax({
        type: 'put',
        url: `../api/promotion-combo`,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: {
            promotion_combo_name:promotion_combo_name,
            arrContent:arrContent,
            id_combo:arrData[index]._id
        },
        cache: false,
        success: function (data) {
            isLoading(false);
           success("Thành công")
           getData()
          
            
        },
        error: function (data) {
            errAjax(data) 
        }
    })
}


function showPopupAdd(){
    arrContent = []
    showPopup('popupAdd',true)
}