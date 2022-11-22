
var arrSupplier = []
var id_user = null
var arrData = []
function selectSupplier(index){
    $("#div_list_supplier").empty()
    $("#div_find_supplier input").val(arrSupplier[index].user_fullname)
    $("#div_find_supplier input").attr("name",arrSupplier[index]._id)

    callAPI('GET',`${API_USER}/history`,{
        id_user:arrSupplier[index]._id
    },data =>{
        drawTable(data)
    })
}

function drawTable(data){
    arrData = []
    for(let i =0;i<data.dataExport.length;i++){
        arrData.push({
            ...data.dataExport[i],
            type_form:"export"
        })
    }

    for(let i =0;i<data.dataImport.length;i++){
        arrData.push({
            ...data.dataImport[i],
            type_form:"import"
        })
    }

    arrData.sort( (a, b) =>{
        return a._id - b._id
    })

    $("#divTable").html(`
        <table class="table">
            <thead>
                <tr>
                    <th>Stt</th>
                    <th>Ngày</th>
                    <th>Hành động</th>
                    <th>Sản phẩm</th>
                    <th>Mã phiếu</th>
                    <th>Chi tiết</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `)

   
    for(let i =0;i<arrData.length;i++){

        const date =  formatDate(arrData[i].createdAt).fulldate
        const action = arrData[i].type_form == "import"?arrData[i].import_form_type:arrData[i].export_form_type
        const product_name = arrData[i].type_form == "import"?arrData[i].import_form_product.length>0?arrData[i].import_form_product[0].subcategory_name:"":arrData[i].export_form_product.length>0?arrData[i].export_form_product[0].subcategory_name:""
        $("#divTable tbody").append(`
            <tr>
                <td>${i+1}</td>
                <td>${date}</td>
                <td>${action}</td>
                <td>${product_name}</td>
                <td>${arrData[i]._id}</td>
                <td><button class="btn btn-primary" onclick="showDetail(${i})">Chi tiết</button></td>
            </tr>
        `)
    }
}

function showDetail(index){
    if(arrData[index].type_form == "export"){
        showEditExport(index)
    }
    else{
        showEditImport(index)
    }
}

function showEditExport(index) {
    const modelBoby = $("#popupEditExport .modal-body")
    const tableCustomer = $(modelBoby).find('table')[0]
    const tableProduct = $(modelBoby).find('table')[1]
    const tbodyProduct = $(tableProduct).find('tbody')[0]
    $(tableCustomer).empty()
    $(tbodyProduct).empty()
    
    $(tableCustomer).append(`
        <tr>
            <th>Mã phiếu</th>
            <td>${arrData[index]._id}</td>
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
            <td >${money(calculateMoneyExport(arrData[index].export_form_product))}</td>
        </tr>
        <tr>
            <th>Đã thanh toán</th>
            <td >${arrData[index].fundbook_name}:${money(arrData[index].receive_form_money)} &emsp; Mã giảm giá: ${money(arrData[index].money_voucher_code)}&emsp; Đổi điểm: ${money(arrData[index].money_point)}</td>
        </tr>
        <tr>
            <th>Còn nợ</th>
            <td>${money(calculateMoneyExport(arrData[index].export_form_product )- arrData[index].receive_form_money - arrData[index].money_voucher_code-arrData[index].money_point)}</td>
        </tr>
        <tr>
            <th>HT thanh toán</th>
            <td>${arrData[index].fundbook_name}</td>
        </tr>
        <tr>
            <th>Ghi chú</th>
            <td>${arrData[index].export_form_note}</td>
        </tr>
   
    `)
    $("input[name=note]").val(arrData[index].export_form_note)
    const isable = arrData[index].export_form_status_paid?"disabled":""
    for (let i = 0; i < arrData[index].export_form_product.length; i++){
        
        $(tbodyProduct).append(`
            <tr>
                <td>${i+1}</td>
                <td>${arrData[index].export_form_product[i].subcategory_name}</td>
                <td>${arrData[index].export_form_product[i].id_product ? arrData[index].export_form_product[i].id_product : ""}</td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_export_price)}" ></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_vat)}" ></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_ck)}" ></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_quantity)}" disabled></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_warranty)}" ></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_discount)}" ></td>

                <td>${money(calculateMoneyExport(arrData[index].export_form_product[i]))}</td>
            </tr>
        `)
    }
 

    // changeMoney()
    formatNumber()

    showPopup('popupEditExport')
}


function showEditImport(index) {
    const modelBoby = $("#popupEditImport .modal-body")
    const tableCustomer = $(modelBoby).find('table')[0]
    const tableProduct = $(modelBoby).find('table')[1]
    const tbodyProduct = $(tableProduct).find('tbody')[0]
    $(tableCustomer).empty()
    $(tbodyProduct).empty()
    
    $(tableCustomer).append(`
        <tr>
            <th>Mã phiếu</th>
            <td>${arrData[index]._id}</td>
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
            <td >${money(calculateMoneyImport(arrData[index].import_form_product))}</td>
        </tr>
        <tr>
            <th>Còn nợ</th>
            <td>${money(calculateMoneyImport(arrData[index].import_form_product )- arrData[index].payment_form_money)}</td>
        </tr>
        <tr>
            <th>HT thanh toán</th>
            <td>${arrData[index].fundbook_name}</td>
        </tr>
        <tr>
            <th>Ghi chú</th>
            <td>${arrData[index].import_form_note}</td>
        </tr>
   
    `)
    $("input[name=note]").val(arrData[index].import_form_note)
    const isable = arrData[index].import_form_status_paid?"disabled":""
    for (let i = 0; i < arrData[index].import_form_product.length; i++){
        
        $(tbodyProduct).append(`
            <tr>
                <td>${i+1}</td>
                <td>${arrData[index].import_form_product[i].subcategory_name}</td>
                <td>${arrData[index].import_form_product[i].id_product ? arrData[index].import_form_product[i].id_product : ""}</td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_import_price)}" ></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_vat)}" ></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_ck)}" ></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_quantity)}" disabled></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_warranty)}" ></td>
                <td><input class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_discount)}" disabled></td>

                <td>${money(calculateMoneyImport(arrData[index].import_form_product[i]))}</td>
            </tr>
        `)
    }


    formatNumber()

    showPopup('popupEditImport')
}

