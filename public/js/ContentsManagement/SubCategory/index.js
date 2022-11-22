var arrData = [];
var getOther = true;
var arrCategory = []
var arrAddExcel = []

function getData(isLoad=true)
{
    isLoading(isLoad)
    if(!getOther)
    {
        id_category = $("#selectCategory option:selected").val()
    }
    limit = $("#selectLimit option:selected").val();
    key = $("#keyFind").val()
    subcategory_status = $("#selectStatus option:selected").val()

    callAPI('GET',`${API_SUBCATEGORY}?`,{
        limit:tryParseInt(limit),
        page: tryParseInt(page),
        id_category: id_category,
        key: key,
        subcategory_status:subcategory_status,
        getOther:getOther
    },(data)=>{
        if(getOther)
        {
            arrCategory= []
            $("#selectCategory").append(`<option value="">Tất cả</option>`)
            data.arrCategory.map( category =>{
                arrCategory.push(category)
                if(id_category == category._id)
                {
                    $("select[name=selectCategory]").append(`<option selected value="${category._id}">${category.category_name}</option>`)
                }
                else
                {
                    $("select[name=selectCategory]").append(`<option value="${category._id}">${category.category_name}</option>`)
                }
            })
            getOther = false
        }
        drawTable(data.data);
        pagination(data.count,data.data.length)
        changeURL(`?limit=${limit}&page=${page}&subcategory_name=${key}&id_category=${id_category}&subcategory_status=${subcategory_status}`)
    })
  
}



function drawTable(data)
{
    $("#tbodyTable").empty()

    arrData = []
    for(let i = 0; i <data.length;i++)
    {
        data[i].category_name = ""
        for(let j = 0;j<arrCategory.length;j++)
        {
            if(data[i].id_category == arrCategory[j]._id)
            {
                data[i].category_name = arrCategory[j].category_name
                break
            }
        }
        arrData.push(data[i])
     
        $("#tbodyTable").append(`
            <tr>
                <td class="center">${stt+i}</td>
                <td >${data[i].subcategory_name.length > 50?data[i].subcategory_name.substring(0,50)+"...":data[i].subcategory_name}</td>
                <td class="right">${money(data[i].subcategory_export_price)}</td>
                <td class="right">${money(data[i].subcategory_discount)}</td>
                <td class="center">${data[i].subcategory_images.length > 0?`<img src="${URL_IMAGE_PRODUCT + data[i].subcategory_images[0]}">`:""}</td>
                <td class="center">${data[i].subcategory_stt}</td>
                <td class="right">${$(`#selectStatus option[value=${data[i].subcategory_status}]`).text()}</td>
                <td class="center">
                    <a class="mdi mdi-grease-pencil detail text-success" title="sửa nội dung" target="_blank" href="/subcategory-contents-management?id_subcategory=${data[i]._id}"></a>
                    <i class="mdi mdi-information" onclick="showPopupEdit(${i})" title="Chiết tiết"></i>
                </td>
            </tr>
        `)
    } 
}

function showPopupEdit(index)
{
    $("#edit_stt").val(arrData[index].subcategory_stt)
    $(`input[name=edit_stt][value=${arrData[index].subcategory_status}]`).prop("checked",true)
    $("#btnConfirmEdit").attr("onclick",`confirmSave(${index})`)
    showPopup('popupEdit')
}

function confirmSave(index)
{
    hidePopup('popupEdit')
    callAPI('put',`${API_SUBCATEGORY}/up-to-website/stt_status`,{
        id_subcategory:arrData[index]._id,
        subcategory_stt: tryParseInt($("#edit_stt").val()),
        subcategory_status:$(`input[name=edit_stt]:checked`).val(),
    },()=>{
        success("Thành công")
            getData()
    })
}