var array_image_delete = []

checkData()
function checkData(){
    if(!id_promotion || id_promotion.length != 24) return

    callAPI('GET',`${API_PROMOTION}/byId`,{
        id_promotion:id_promotion
    }, data =>{
        drawTable(data)
    })
}

function drawTable(data){
    CKEDITOR.instances.editor.setData(data.promotion_content)
    $("input[name=title_promotion]").val(data.promotion_title)
    $("input[name=promotion_url]").val(data.promotion_url)
    $("input[name=promotion_index]").val(tryParseInt(data.promotion_index))

    for(let i =0;i<data.promotion_images.length;i++)
    {
        $(".div-image-period").append(`
            <div class="col-md-2 relative">
                <img src="${URL_IMAGE_PROMOTION}${data.promotion_images[i]}">
                <input type="text" value="${data.promotion_images[i]}">
                <i onclick="removeImagePeriod(this)" class="mdi mdi-delete-forever text-danger"></i>
                
              </div>
        `)
    }
}
function removeImagePeriod(btnRemove)
{
    const image_delete = $($($(btnRemove).closest('div').find('input'))[0]).val()
    array_image_delete.push(image_delete)
    $(btnRemove).closest('div').remove()
}
function confirmSave(){
    const title_promotion = $("input[name=title_promotion]").val()
    if(!title_promotion || title_promotion.trim().length == 0)  {
        info("Tiêu đề không được để trống")
        return
    }
    const promotion_url = $("input[name=promotion_url]").val()
    const promotion_index = tryParseInt($("input[name=promotion_index]").val())
    
    const formData = new FormData();
    for (var i = 0; i < totalFiles.length; i++) {
        formData.append("image_promotion", totalFiles[i].file); // ảnh sản phẩm
    }
    formData.append('promotion_content', CKEDITOR.instances.editor.getData())
    formData.append('title_promotion', title_promotion)
    formData.append('promotion_url', promotion_url)
    formData.append('id_promotion', id_promotion)
    formData.append('promotion_index', promotion_index)
    formData.append('array_image_delete', JSON.stringify(array_image_delete))


    callAPI('POST',API_PROMOTION, formData, data =>{
        success("Thành công")
        location.reload()
    },undefined, true)
}

