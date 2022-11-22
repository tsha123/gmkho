checkPermission()
function checkPermission(){
    callAPI('GET',`${API_NEWS}/check-permission`,{

    }, data =>{
        $("#select_type").html(`<option value="">Tất cả</option>`)
        for(let i =0;i<data.length;i++){
            const isSelected = data[i]._id == type_news.trim()?"selected":""
            $("#select_type").append(`<option ${isSelected} value="${data[i]._id}">${data[i].type_news_name}</option>`)
        }
        getData()
    })
}

function getData(){
    limit = tryParseInt($("#selectLimit option:selected").val())
    key = $("#keyFind").val()

    type_news = $("#select_type option:selected").val()
    const fromdate = $("#fromdate").val()
    const todate = $("#todate").val()
    callAPI('GET',API_NEWS,{
        limit:limit,
        key:key,
        page:page,
        fromdate:fromdate,
        todate:todate,
        type_news:type_news
    }, data =>{
        drawTable(data.data);
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&type_news=${type_news}`)
    })
}

function drawTable(data){

    $("#tbodyTable").empty()

    for(let i =0;i<data.length;i++){
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].news_title}</td>
                <td><input class="number form-control" value="${data[i].news_index}"></td>
                <td>${$(`#select_type option[value="${data[i].id_type}"]`).text()}</td>
                <td> <img src=${URL_IMAGE_NEWS}/${data[i].news_image}></td>
                <td><i onclick="newPage('/news-management/edit-news?id_news=${data[i]._id}')" class="fas fa-edit text-primary"></i></td>
            </tr>
        `)
    }
}

function paste_Image(input, image) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $(`#${image}`).attr("src", e.target.result)
        }
        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
}

function confirm_add_type(){
    const type_news_name = $("#input_add_type").val().trim()
    if(type_news_name.length == 0) return
    
    hidePopup('popup_add_type')
    callAPI('POST',`${API_NEWS}/type-news`,{
        type_news_name:type_news_name
    },() =>{
        success("Thành công")
        checkPermission()
    })
}