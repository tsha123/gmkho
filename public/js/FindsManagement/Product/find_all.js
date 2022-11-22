var arrSubCategory = []
var offsetSubcategory = 1
getWarehouse()
function getWarehouse(){
    callAPI('GET',`${API_PRODUCT}/checkPermission/filter`,null, warehouses =>{
        warehouses.map( warehouse =>{
            $("select[name=select_warehouse]").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })
    })
}
function success_get_subcategory(data , parent){
    const div_show = $(parent).find('div:last-child')
    for(let i =0;i<data.length;i++){
        arrSubCategory.push(data[i])
        $(div_show).append(`<li><a href="javascript:void(0)" onclick="selectSubCategory(${arrSubCategory.length - 1})">${data[i].subcategory_name}</a> </li>`)
    }
}

function selectSubCategory(index){
    const div_show = $(event.target).parent().parent()
    const parent = $(div_show).parent().parent()
    $(div_show).empty()
    const input = $(parent).find('input')
    
    $(input[0]).val(arrSubCategory[index].subcategory_name)
    $(input[0]).attr("name",arrSubCategory[index]._id)

    getData()
}

function getData(){
    const id_subcategory = $(".header-table .row div:first-child input").attr("name")
    const id_warehouse = $("#select_warehouse option:selected").val()
    // const status =  $("select[name=select_warehouse] option:selected").val()
   
    if(id_subcategory && id_subcategory.length == 24){

        callAPI('GET',`${API_PRODUCT}/find-all-imported`, {
            id_subcategory:id_subcategory,
            id_warehouse:id_warehouse,
            // status:status,
            
        },data =>{
            drawTable(data)
        })
    }
}

function drawTable(data){
    $(".div-table").html(`
        <table class="table">
            <thead>
                <tr>
                    <th>STT</th>                
                    <th>Ngày nhập</th>
                    <th>Kho hiện tại</th>           
                    <th>Trạng thái</th>
                    <th>Ngày xuất</th>
                    <th>Giá (nhập gần nhất)</th>
                    <th>Mã chính</th>
                    <th>Mã phụ</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot></tfoot>
        </table>
    `)


    for(let i =0;i<data.length;i++){
        
        $(".div-table tbody").append(`
            <tr>
                <td>${i+1}</td>
                <td>${formatDate(data[i].createdAt).fulldate}</td>
                <td>${data[i].warehouse_name}</td>
                <td>${data[i].product_status?"Đã xuất":"Chưa xuất"}</td>
                <td>${data[i].product_status?formatDate(data[i].date_export).fulldate:""}</td>
                <td class="right">${money(data[i].product_import_price)}</td>
                <td>${data[i].id_product}</td>
                <td>${data[i].id_product2?data[i].id_product2:""}</td>
            </tr>
        `)
    }
    dataTable2($(".div-table table"))

}