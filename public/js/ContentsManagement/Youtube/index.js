var arrData = [];

getData()
function getData(isLoad=true)
{
  
    limit = $("#selectLimit option:selected").val();
    key = $("#keyFind").val()
    status_show = $("#selectStatus option:selected").val()

    callAPI('GET',API_YOUTUBE,{
        limit:tryParseInt(limit),
        page: tryParseInt(page),
        key: key,
        status:status_show,
    },(data)=>{
        drawTable(data.data);
        pagination(data.count,data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&status=${status_show}`)
    },undefined,undefined, isLoad)
}



function drawTable(data)
{
    $("#tbodyTable").empty()

    arrData = []
    for(let i = 0; i <data.length;i++)
    {
        arrData.push(data[i])
     
        $("#tbodyTable").append(`
            <tr>
                <td class="center">${stt+i}</td>
                <td>${data[i].youtube_id}</td>
                <td><a href="${data[i].youtube_id}" target="_blank">${data[i].youtube_link}</a></td>
                <td><input class="number form-control" oninput="inputNumber()" onchange="update_index(${i})" value="${money(data[i].youtube_index)}"></td>
                <td>${data[i].youtube_status?"Đang hiển thị":"Không hiển thị"}</td>
                <td class="center">
                    <i class="fas fa-edit text-warning" onclick="edit_youtube(${i})" title="Edit"></i>
                    <i class="fas fa-trash text-danger" onclick="delete_youtube(${i})" title="Xóa link"></i>
                </td>
            </tr>
        `)
    } 
}

function confirmAdd(){

    const youtube_link = $("#inputLink").val().trim()
    const youtube_id = $("#inputID").val().trim()
    const youtube_index = tryParseInt($("#inputIndex").val())

    if(youtube_link.length  == 0|| youtube_id.length == 0){
        info("Link và video không được để trống!")
        return
    }
    hidePopup('popupAdd')
    callAPI('POST',API_YOUTUBE,{
        youtube_link:youtube_link,
        youtube_id:youtube_id,
        youtube_index:youtube_index,
    }, ()=>{
        
        success("Thành công")
        getData()
    })
}


(()=>{
    $("#inputLink").on("change",()=>{
        const youtube_link = $("#inputLink").val().trim()
        if(youtube_link.length > 0){
            const id = youtube_link.split("=")[1].split("&")[0]
            $("#inputID").val(id)
        }
    })
    
    $("#inputLinkEdit").on("change",()=>{
        const youtube_link = $("#inputLinkEdit").val().trim()
        if(youtube_link.length > 0){
            const id = youtube_link.split("=")[1].split("&")[0]
            $("#inputIDEdit").val(id)
        }
    })
})()

const edit_youtube = (index)=>{
    $("#inputLinkEdit").val(arrData[index].youtube_link)
    $("#inputIDEdit").val(arrData[index].youtube_id)
    $("#inputIndexEdit").val(arrData[index].youtube_index)
    $("#inputStatusEdit").prop("checked",arrData[index].youtube_status)

    $("#popupEdit .modal-footer button:last-child").attr("onclick",`confirm_edit(${index})`)
    showPopup('popupEdit')
}


function confirm_edit(index){

    const youtube_link = $("#inputLinkEdit").val().trim()
    const youtube_id = $("#inputIDEdit").val().trim()
    const youtube_index = tryParseInt($("#inputIndexEdit").val())
    const youtube_status = $("#inputStatusEdit").is(":checked")
    const id_video = arrData[index]._id
    if(youtube_link.length  == 0|| youtube_id.length == 0){
        info("Link và video không được để trống!")
        return
    }
    update_video(youtube_link, youtube_id, youtube_index, youtube_status, id_video)
   
}

const update_index = (index)=>{
    const youtube_link = arrData[index].youtube_link
    const youtube_id = arrData[index].youtube_id
    const youtube_index = tryParseInt($(event.target).val())
    const youtube_status = arrData[index].youtube_status
    const id_video = arrData[index]._id
    update_video(youtube_link, youtube_id, youtube_index, youtube_status, id_video)
}

const update_video = (youtube_link, youtube_id, youtube_index, youtube_status, id_video)=>{
    callAPI('PUT',API_YOUTUBE,{
        youtube_link:youtube_link,
        youtube_id:youtube_id,
        youtube_index:youtube_index,
        youtube_status:youtube_status,
        id_video:id_video
    }, ()=>{
        hidePopup('popupEdit')
        success("Thành công")
        getData()
    })
}

function delete_youtube(index){
    $("#popupDelete .modal-footer button:last-child").attr("onclick",`confirm_delete(${index})`)
    showPopup('popupDelete')
}

const confirm_delete = (index) =>{
    hidePopup('popupDelete')
    callAPI('DELETE',API_YOUTUBE,{
        id_video:arrData[index]._id
    }, ()=>{

        success("Xóa Thành công")
        getData()
    })
}