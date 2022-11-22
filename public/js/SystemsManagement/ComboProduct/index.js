var arrData = []
var arr_subcategory_combo = []
getData()
function showPopupAdd(){
    arr_subcategory_combo = []
    drawTable_popup(arr_subcategory_combo,'popupAdd')
    showPopup('popupAdd',true)
}

function drawTable_popup(arr = [], popup){
    const tbody = $(`#${popup}`).find('.div-table-subcategory tbody')
    $(tbody).empty()
    let index_stt = 1
    for(let i =0;i<arr.length;i++){
        $(tbody).append(`
            <tr>
                <td>${index_stt++}</td>
                <td>
                    <span>${arr[i].subcategory_name}</span>
                    <input type="text" value="${arr[i].id_subcategory}" style="display:none">
                </td>
                <td><input type="text" class="form-control number" value="${money(arr[i].quantity)}" oninput="change_quantity(${arr.length-1})" ></td>
                <td><i onclick="delete_row()" class="fas fa-trash text-danger"></i></td>
            </tr>
        `)
    }
    for(let i = 5; i> arr.length;i--){
        $(tbody).append(`
            <tr>
                <td>${index_stt++}</td>
                <td>
                    <span></span>
                    <input type="text" style="display:none">
                </td>
                <td><input type="text" oninput="inputNumber()" style="display:none"></td>
                <td><i onclick="delete_row()" class="fas fa-trash text-danger"></i></td>
            </tr>
        `)
    }
}

function callback_subcategory(data, parent){
    const div_product = $(parent).find('.div-product')
    for(let i =0;i<data.length;i++){
        arrSubCategory.push(data[i])
        $(div_product).append(`
            <li><a onclick="select_subcategory(${arrSubCategory.length-1})" href="javascript:void(0)">${data[i].subcategory_name}</a></li>
        `)
    }

}

function select_subcategory(index){
    const tagI = $(event.target)
    const div_show = $(tagI).parent().parent()
    const input = $(div_show).parent().find('input')
    $(input).val(null)
    $(div_show).empty()

    const popup = $(div_show).closest('div.modal').attr("id")
    arr_subcategory_combo.push({
        id_subcategory:arrSubCategory[index]._id, 
        subcategory_name:arrSubCategory[index].subcategory_name,
        quantity:1
    })

    drawTable_popup(arr_subcategory_combo, popup)
    
}

function delete_row(){
    const tagI = $(event.target)
    const tr = $(event.target).parent().parent()
    const popup = $(tr).closest('div.modal').attr("id")
    const id_subcategory = $(tr).find('input').val()
    if(id_subcategory && id_subcategory.length == 24){
        for(let i =0;i<arr_subcategory_combo.length;i++){
            if(id_subcategory == arr_subcategory_combo[i].id_subcategory){
                arr_subcategory_combo.splice(i,1)
                break
            }
        }
    }
    drawTable_popup(arr_subcategory_combo,popup)
}

function confirm_add(){
    const combo_type = $("#select_type option:selected").val()

    const array_sub = get_arr_product_by_table("#table_add")
    if(array_sub.length == 0){
        info("Hãy chọn ít nhất 1 sản phẩm")
        return
    }
    const combo_name = $("#add_combo_name").val().trim()
    if(combo_name.length == 0) {
        info("Tên combo không được để trống")
        return
    }
    if(combo_type.length == 0) {
        info("Hãy chọn loại combo")
        return
    }
    hidePopup('popupAdd')
    callAPI('POST',API_COMBO_PRODUCT_TO_SALE,{
        array_subcategory:JSON.stringify(array_sub),
        combo_name:combo_name,
        combo_type:combo_type
    }, data =>{
        success("Thành công")
        getData()
    })

}

function change_quantity(index){
    arr_subcategory_combo[index].quantity = tryParseInt($(event.target).val())
    $(event.target).val(money(tryParseInt($(event.target).val())))
}

function get_arr_product_by_table(table){
    
    const trs = $(table).find('tbody tr')
    const data = []
    for(let i =0;i<trs.length;i++){
        const inputs = $(trs[i]).find('input')
        const id_subcategory = $(inputs[0]).val()
        const quantity = tryParseInt($(inputs[1]).val())
        if(id_subcategory && id_subcategory.length == 24){
            data.push({
                id_subcategory:id_subcategory,
                quantity:quantity
            })
        }
    }
    return data
}


function getData(offset = 0){
    limit = $("#selectLimit option:selected").val()
    const combo_type = $("#find_select_type option:selected").val()
    page = offset
    if(page == 0){
        stt = 1
    }
    const key = $("#keyFind").val().trim()

    callAPI('GET',API_COMBO_PRODUCT_TO_SALE,{
        key:key,
        limit:limit,
        page:page,
        combo_type:combo_type
    }, data =>{
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&combo_type=${combo_type}`)
    })
}

function drawTable(data){
    arrData = []
    $("#tbodyTable").empty()

    for(let i =0;i<data.length;i++){
        arrData.push(data[i])

        const subcategory_name = data[i].array_subcategory.length > 0?data[i].array_subcategory[0].subcategory_name:""
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].employee_fullname}</td>
                <td>${data[i].combo_name}</td>
                <td>${data[i].combo_type}</td>
                <td>${subcategory_name}</td>
                <td>
                    <i onclick="edit_combo(${arrData.length-1})" class="fas fa-edit text-warning" title="Chỉnh sửa"></i>
                    <i  onclick="delete_combo(${arrData.length-1})" class="fas fa-trash text-danger" title="Xóa"></i>
                </td>
            </tr>
        `)
    }
}

function edit_combo(index){
    $("#edit_combo_name").val(arrData[index].combo_name)
    arr_subcategory_combo = [...arrData[index].array_subcategory]
    drawTable_popup(arr_subcategory_combo, 'popupEdit')
    $("#btn_confirm_save").attr("onclick",`confirm_edit(${index})`)
    $("#edit_select_type").val(arrData[index].combo_type).change()
    showPopup('popupEdit')
}

function delete_combo(index){
    $("#popupDelete .modal-footer button:first-child").attr("onclick",`confirm_delete(${index})`)
    showPopup('popupDelete')
}

function confirm_edit(index){
    const array_sub = get_arr_product_by_table("#table_edit")
    if(array_sub.length == 0){
        info("Hãy chọn ít nhất 1 sản phẩm")
        return
    }
    const combo_name = $("#edit_combo_name").val().trim()
    if(combo_name.length == 0) {
        info("Tên combo không được để trống")
        return
    }
    const combo_type = $("#edit_select_type option:selected").val()
    hidePopup('popupEdit')
    callAPI('POST',API_COMBO_PRODUCT_TO_SALE,{
        array_subcategory:JSON.stringify(array_sub),
        combo_name:combo_name,
        id_combo:arrData[index]._id,
        combo_type:combo_type
    }, data =>{
        success("Thành công")
        getData()
    })
}

function confirm_delete(index){
    callAPI('DELETE',API_COMBO_PRODUCT_TO_SALE,{
        id_combo:arrData[index]._id
    },() =>{
        success("Xóa thành công")
        getData()
    })
}