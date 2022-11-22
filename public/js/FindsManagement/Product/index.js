var arrImport = []
var arrExport = []
function getData(){
   
    const key = $("#keyFind").val()
    if(key && key.length > 0){
        callAPI('GET',`${API_PRODUCT}/history`,{
            key:key
        },data =>{
            drawTable(data.dataProduct, data.dataSubCategory, data.dataExport, data.dataImport)
        })
    }
}

function drawTable(dataProduct, dataSubcategory, export_forms , import_forms){
    $("#divTable").html(`
    <b>Lịch sử sản phẩm</b>
                    <table id="dataTable" class="table table-hover">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Ngày</th>
                                <th>Hành động</th>
                                <th>Khách hàng</th>
                                <th>Tại Chi nhánh</th>
                                <th>Tại Kho</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
    `)
    arrExport = []
    arrImport = []
    $("#divTable tbody").empty()
    $("#header_info input").val(null)
    stt = 1
    const header_input = $("#header_info input")
    $(header_input[0]).val(dataSubcategory.subcategory_name)
    $(header_input[1]).val(dataProduct._id)
    $(header_input[2]).val(dataProduct.id_product2)
    $(header_input[3]).val(dataProduct.category_name)
    $(header_input[4]).val(dataProduct.warehouse_name)
    $(header_input[5]).val(formatDate(dataProduct.createdAt).fulldatetime)
    $(header_input[6]).val(total_inventory(dataSubcategory.subcategory_warehouses))
    $(header_input[7]).val(dataProduct.product_status==true?"Đã xuất":"Chưa xuất")

    export_forms.map( form =>{
        arrExport.push(form)
        $("#divTable tbody").append(`
        <tr>
            <td>${stt++}</td>
            <td>${formatDate(form.createdAt).fulldatetime}</td>
            <td>${form.export_form_type}</td>
            <td>${form.user_fullname}</td>
            <td>${form.branch_name}</td>
            <td>${form.warehouse_name}</td>
            <td>
                <i onclick="showEditExport(${arrExport.length-1})" class="fas fa-info-circle text-warning text-infos"></i>
                <i onclick= newPage('/export/print/${form._id}') class="fas fa-print text-primary"></i>
            </td>
        </tr>
    <
   `)
    })

    import_forms.map( form =>{
        arrImport.push(form)
       $("#divTable tbody").append(`
            <tr>
                <td>${stt++}</td>
                <td>${formatDate(form.createdAt).fulldatetime}</td>
                <td>${form.import_form_type}</td>
                <td>${form.user_fullname}</td>
                <td>${form.branch_name}</td>
                <td>${form.warehouse_name}</td>

                <td>
                    <i onclick="showEditImport(${arrImport.length-1})" class="fas fa-info-circle text-warning text-infos"></i>
                    <i onclick="newPage('/import/print/${form._id}')" class="fas fa-print text-primary"></i>
                </td>
            </tr>
        <
       `)
    })
    dataTable("dataTable",false)
}

function total_inventory(data){
    let total = 0
    for(let i =0;i<data.length;i++){
        total += data[i].current_inventory
    }
    return total
}

function showEditImport(index) {
    const modelBoby = $("#popupDetailImport .modal-body")
    const tableCustomer = $(modelBoby).find('table')[0]
    const tableProduct = $(modelBoby).find('table')[1]
    const tbodyProduct = $(tableProduct).find('tbody')[0]
    $(tableCustomer).empty()
    $(tbodyProduct).empty()
    
    $(tableCustomer).append(`
        <tr>
            <th>Mã phiếu</th>
            <td>${arrImport[index]._id}</td>
        </tr>
        <tr>
            <th>Khách hàng</th>
            <td><b>Tên </b>: ${arrImport[index].user_fullname} &nbsp; &nbsp; <b> SĐT</b>: ${arrImport[index].user_phone}  &nbsp; &nbsp; &nbsp;<b> Địa chỉ:</b> ${arrImport[index].user_address} </td>
        </tr>
        <tr>
            <th>Ngày tạo phiếu</th>
            <td>${formatDate(arrImport[index].createdAt).fulldatetime}</td>
        </tr>
        <tr>
            <th>Tổng tiền</th>
            <td >${money(calculateMoneyImport(arrImport[index].import_form_product))}</td>
        </tr>
        <tr>
            <th>Còn nợ</th>
            <td>${money(calculateMoneyImport(arrImport[index].import_form_product )- arrImport[index].payment_form_money)}</td>
        </tr>
        <tr>
            <th>HT thanh toán</th>
            <td>${arrImport[index].fundbook_name}</td>
        </tr>
        <tr>
            <th>Ghi chú</th>
            <td>${arrImport[index].import_form_note}</td>
        </tr>
   
    `)
    $("input[name=note]").val(arrImport[index].import_form_note)
    const isable = "disabled"
    for (let i = 0; i < arrImport[index].import_form_product.length; i++){
        
        $(tbodyProduct).append(`
            <tr>
                <td>${i+1}</td>
                <td>${arrImport[index].import_form_product[i].subcategory_name}</td>
                <td>${arrImport[index].import_form_product[i].id_product2 ? arrImport[index].import_form_product[i].id_product2 : ""}</td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrImport[index].import_form_product[i].product_import_price)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrImport[index].import_form_product[i].product_vat)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrImport[index].import_form_product[i].product_ck)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrImport[index].import_form_product[i].product_quantity)}" disabled></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrImport[index].import_form_product[i].product_warranty)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrImport[index].import_form_product[i].product_discount)}" disabled></td>

                <td>${money(calculateMoneyImport(arrImport[index].import_form_product[i]))}</td>
            </tr>
        `)
    }
    showPopup('popupDetailImport')
}

function showEditExport(index) {
    const modelBoby = $("#popupDetailExport .modal-body")
    const tableCustomer = $(modelBoby).find('table')[0]
    const tableProduct = $(modelBoby).find('table')[1]
    const tbodyProduct = $(tableProduct).find('tbody')[0]
    $(tableCustomer).empty()
    $(tbodyProduct).empty()
    
    $(tableCustomer).append(`
        <tr>
            <th>Mã phiếu</th>
            <td>${arrExport[index]._id}</td>
        </tr>
        <tr>
            <th>Khách hàng</th>
            <td><b>Tên </b>: ${arrExport[index].user_fullname} &nbsp; &nbsp; <b> SĐT</b>: ${arrExport[index].user_phone}  &nbsp; &nbsp; &nbsp;<b> Địa chỉ:</b> ${arrExport[index].user_address} </td>
        </tr>
        <tr>
            <th>Ngày tạo phiếu</th>
            <td>${formatDate(arrExport[index].createdAt).fulldatetime}</td>
        </tr>
        <tr>
            <th>Tổng tiền</th>
            <td >${money(calculateMoneyExport(arrExport[index].export_form_product))}</td>
        </tr>
        <tr>
            <th>Đã thanh toán</th>
            <td >${arrExport[index].fundbook_name}:${money(arrExport[index].receive_form_money)} &emsp; Mã giảm giá: ${money(arrExport[index].money_voucher_code)}&emsp; Đổi điểm: ${money(arrExport[index].money_point)}</td>
        </tr>
        <tr>
            <th>Còn nợ</th>
            <td>${money(calculateMoneyExport(arrExport[index].export_form_product )- arrExport[index].receive_form_money - arrExport[index].money_voucher_code-arrExport[index].money_point)}</td>
        </tr>
        <tr>
            <th>HT thanh toán</th>
            <td>${arrExport[index].fundbook_name}</td>
        </tr>
        <tr>
            <th>Ghi chú</th>
            <td>${arrExport[index].export_form_note}</td>
        </tr>
   
    `)
    $("input[name=note]").val(arrExport[index].export_form_note)
    const isable = "disabled"
    for (let i = 0; i < arrExport[index].export_form_product.length; i++){
        
        $(tbodyProduct).append(`
            <tr>
                <td>${i+1}</td>
                <td>${arrExport[index].export_form_product[i].subcategory_name}</td>
                <td>${arrExport[index].export_form_product[i].id_product ? arrExport[index].export_form_product[i].id_product : ""}</td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrExport[index].export_form_product[i].product_export_price)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrExport[index].export_form_product[i].product_vat)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrExport[index].export_form_product[i].product_ck)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrExport[index].export_form_product[i].product_quantity)}" disabled></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrExport[index].export_form_product[i].product_warranty)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrExport[index].export_form_product[i].product_discount)}" ></td>

                <td>${money(calculateMoneyExport(arrExport[index].export_form_product[i]))}</td>
            </tr>
        `)
    }

    showPopup('popupDetailExport')
}

$(".div-input i").on("click",()=>{
    $(".div-input input").val(null)
})