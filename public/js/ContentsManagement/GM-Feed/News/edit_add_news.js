
var old_img = null
checkData()
function checkData(){
    // if(!id_news || id_news.length != 24) return

    callAPI('GET',`${API_NEWS}/byId`,{
        id_news:id_news
    }, data =>{

        for(let i =0;i<data.data_type.length;i++){
            let isSelected = ""
            if(data.data && data.data.id_type == data.data_type[i]._id) isSelected = "selected"
            $("#select_type_news").append(`<option ${isSelected} value="${data.data_type[i]._id}">${data.data_type[i].type_news_name}</option>`)
        }
        drawTable(data.data)
    })
}

function drawTable(data){
    if(!data) return
    CKEDITOR.instances.editor.setData(data.news_content)
    
    $("input[name=title_news]").val(data.news_title)
    $("#new_brief").val(data.news_brief)

    if(data.news_image){
        old_img = data.news_image
        $(".image_warp img").attr("src",`${URL_IMAGE_NEWS}${data.news_image}`)
    }
    console.log(data)
    $("#inputIndex").val(data.news_index)
}

function confirmSave(){
    const title_news = $("input[name=title_news]").val()
    if(!title_news || title_news.trim().length == 0)  {
        info("Tiêu đề không được để trống")
        return
    }
  

    const formData = new FormData();
    const image = $("#news_image")[0].files[0]
    const news_brief = $("#new_brief").val()
    formData.append("image_news", image); // ảnh sản phẩm
    formData.append('news_content', CKEDITOR.instances.editor.getData())
    formData.append('id_news', id_news)
    formData.append('old_image', old_img)
    formData.append('title_news', title_news)
    formData.append('news_brief', news_brief)
    formData.append('id_type', $("#select_type_news option:selected").val())
    formData.append('news_index', tryParseInt($("#inputIndex").val()))



    callAPI('POST',API_NEWS, formData, data =>{
        success("Thành công")
        location.reload()
    },undefined, true)
}

$(".image_warp").click( e =>{
    
    $("#news_image").click();
})

function paste_Image(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $(`.image_warp img`).attr("src", e.target.result)
        }
        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
}
