
getData()
function getData(){
    limit = tryParseInt($("#selectLimit option:selected").val())
    key = $("#keyFind").val()
    const fromdate = $("#fromdate").val()
    const todate = $("#todate").val()
    callAPI('GET',API_PROMOTION,{
        limit:limit,
        key:key,
        page:page,
        fromdate:fromdate,
        todate:todate
    }, data =>{
        drawTable(data.data);
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}`)
    })
}

function drawTable(data){

    $("#tbodyTable").empty()

    for(let i =0;i<data.length;i++){
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].promotion_title}</td>
                <td> <img src=${URL_IMAGE_PROMOTION}/${data[i].promotion_images.length > 0?data[i].promotion_images[0]:""}></td>
                <td><a href="${data[i].promotion_url}" target="_blank" class="btn btn-warning">Bài viết</a></td>
                <td><input class="number form-control" oninput="inputNumber()" value="${data[i].promotion_index}"></td>
                <td><i onclick="newPage('/promotion-news-management/edit-promotion?id_promotion=${data[i]._id}')" class="fas fa-edit text-primary"></i></td>
            </tr>
        `)
    }
}