getData()

function getData()
{
    callAPI('GET',API_CATEGORY,{
        key:id_category
    },data =>{
        
        drawTable(data.data)
    })
    
}

function drawTable(data){
    CKEDITOR.instances.editor.setData(data[0].category_content);
}

function confirmSave(){
    const category_content = CKEDITOR.instances.editor.getData();
    callAPI('PUT',`${API_CATEGORY}/edit-content`,{
        category_content:category_content,
        id_category:id_category
    }, () =>{
        success("Thành công")
    })
}