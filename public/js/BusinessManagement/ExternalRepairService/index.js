var getOther = true
var arrData = []

checkPermission()
function checkPermission(){
    callAPI('GET',`${API_EXTERNAL_REPAIR_SERVICE}/checkPermission`,null, data =>{
        data.warehouses.map(warehouse =>{
            $("select[name=select_warehouse]").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })

        getData();
    })
}

function getData() {
    limit = tryParseInt($("#selectLimit option:selected").val())
    key = $("#inputFind").val()
    callAPI('GET', API_EXTERNAL_REPAIR_SERVICE, {
        limit: limit,
        key: key,
        id_warehouse: $("#selectWarehouse option:selected").val(),
        fromdate: $("#fromdate").val(),
        todate: $("#todate").val(),
        page: page,
    }, data => {
      
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&warehouse_name=${$("#selectWarehouse option:selected").text()}`)
    })
}
function drawTable(data) {
    $("#tbodyTable").empty()
    arrData = []
    for (let i = 0; i < data.length; i++){

        let total = calculateMoneyExport(data[i].external_repair_service_product)
        arrData.push(data[i])
        
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].id_export_form}</td>
                <td>${formatDate(data[i].createdAt).fulldatetime}</td>
                <td>${data[i].user_fullname} - SĐT: ${data[i].user_phone}</td>
                <td ><span class="substring">${data[i].external_repair_service_product.length > 0 ? data[i].external_repair_service_product[0].subcategory_name : ""}</span></td>
                <td ><span class="substring">${data[i].external_repair_service_product[0].status_repair ?"Đã sửa xong":"Đang sửa"}</span></td>
                <td>${money(total)}</td>
                <td>
                    <i onclick="showEdit(${i})" class="fas fa-edit text-warning text-infos"></i>
                    <i onclick= newPage('/export/print/${data[i].id_export_form}') class="fas fa-print text-primary"></i>
                </td>
            </tr>
        `)
    }
}

function findData() {
    if (event.which == 13) {
        page=1
        getData()
    }
}
function showEdit(index) {
    const modelBoby = $("#popupEdit .modal-body")
    const tableCustomer = $(modelBoby).find('table')[0]
    const tableProduct = $(modelBoby).find('table')[1]
    const tbodyProduct = $(tableProduct).find('tbody')[0]
    $(tableCustomer).empty()
    $(tbodyProduct).empty()
    
    $(tableCustomer).append(`
        <tr>
            <th>Mã phiếu</th>
            <td>${arrData[index].id_export_form}</td>
        </tr>
        <tr>
            <th>Khách hàng</th>
            <td><b>Tên </b>: ${arrData[index].user_fullname} &nbsp; &nbsp; <b> SĐT</b>: ${arrData[index].user_phone}  &nbsp; &nbsp; &nbsp;<b> Địa chỉ:</b> ${arrData[index].user_address} </td>
        </tr>
        <tr>
            <th>Ngày tạo phiếu</th>
            <td>${formatDate(arrData[index].createdAt).fulldatetime}</td>
        </tr>
        <tr>
            <th>Tổng tiền</th>
            <td >${money(calculateMoneyExport(arrData[index].external_repair_service_product))}</td>
        </tr>  
        <tr>
            <th>Ghi chú</th>
            <td>${arrData[index].external_repair_service_note}</td>
        </tr>
   
    `)
    $("input[name=note]").val(arrData[index].export_form_note)
    const isable = arrData[index].export_form_status_paid?"disabled":""
    for (let i = 0; i < arrData[index].external_repair_service_product.length; i++){
        
        $(tbodyProduct).append(`
            <tr>
                <td>${i+1}</td>
                <td>${arrData[index].external_repair_service_product[i].subcategory_name}</td>
                <td>${arrData[index].external_repair_service_product[i].id_product || ""}</td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].external_repair_service_product[i].product_export_price)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].external_repair_service_product[i].product_vat)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].external_repair_service_product[i].product_ck)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].external_repair_service_product[i].product_quantity)}" disabled></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].external_repair_service_product[i].product_warranty)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].external_repair_service_product[i].product_discount)}" ></td>

                <td>${arrData[index].external_repair_service_product[i].status_repair?"Đã nhận lại":"Đang sửa"}</td>
              
            </tr>
        `)
    }

    formatNumber()
    showPopup('popupEdit')
}
