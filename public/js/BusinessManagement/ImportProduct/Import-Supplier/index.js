var getOther = true
var arrData = []
checkPermission()
function checkPermission() {
    callAPI('GET',`${API_IMPORT}/import-supplier/checkPermission`,null,(data)=>{
        data.warehouses.map(warehouse => {
            $("#selectWarehouse").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })
        getData()
        data.fundbooks.map(fund => {
            $("#selectTypePayment").append(`<option value="${fund._id}">${fund.fundbook_name}</option>`)
        })
    })
}

function getData() {
    limit = tryParseInt($("#selectLimit option:selected").val())
    key = $("#inputFind").val()
    callAPI('GET', `${API_IMPORT}/import-supplier`, {
        limit: limit,
        key: key,
        id_warehouse: $("#selectWarehouse option:selected").val(),
        fromdate: $("#fromdate").val(),
        todate: $("#todate").val(),
        page: page,
        import_form_type:type_import
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

        let total = calculateMoneyImport(data[i].import_form_product)
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i]._id}</td>
                <td>${formatDate(data[i].createdAt).fulldatetime}</td>
                <td>${data[i].user_fullname} - SĐT: ${data[i].user_phone}</td>
                <td>${data[i].import_form_product.length > 0 ? data[i].import_form_product[0].subcategory_name : ""}</td>
                <td>${money(total)}</td>
                <td>
                    <i onclick="showEdit(${i})" class="fas fa-edit text-warning text-infos"></i>
                    <i onclick="newPage('/import/print/${data[i]._id}')" class="fas fa-print text-primary"></i>
                    <i onclick="downloadID(${i})" class="fas fa-download text-success"></i>
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
    const isable = arrData[index].import_form_status_paid?"disabled":""

    $(tableCustomer).append(`
        <tr>
            <th>Mã phiếu</th>
            <td>${arrData[index]._id}</td>
        </tr>
        <tr>
            <th>Khách hàng</th>
            <td>
                <div id="div_find_supplier" style="position: relative" class="relative">
                    <input id="input_edit_supplier" value="${arrData[index].user_fullname}" name="${arrData[index].id_user}" placeholder="Nhập tên nhà cung cấp hoặc số điện thoại" type="text" oninput="findSupplier()" class="form-control">
                    <button onclick="save_change_supplier(${index})" class="btn btn-danger" style="position:absolute; top:12px;right:10px">Lưu</button>
                    <div style="width:15px; height:15px; position:absolute; top:21px;right:67px; display:none" class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <div style="position: absolute;z-index: 200;background-color: antiquewhite;"  onscroll="loadmoreSupplier()" id="div_list_supplier"></div>
                </div>
            </td>
        </tr>
        <tr>
            <th>Thông tin khách hàng</th>
            <td id="td_info_supplier"><b> SĐT</b>: ${arrData[index].user_phone}  &nbsp; &nbsp; &nbsp;<b> Địa chỉ:</b> ${arrData[index].user_address} </td>
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
   
    for (let i = 0; i < arrData[index].import_form_product.length; i++){
        
        $(tbodyProduct).append(`
            <tr>
                <td>${i+1}</td>
                <td>${arrData[index].import_form_product[i].subcategory_name}</td>
                <td>${arrData[index].import_form_product[i].id_product2 ? arrData[index].import_form_product[i].id_product2 : ""}</td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_import_price)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_vat)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_ck)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_quantity)}" disabled></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_warranty)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].import_form_product[i].product_discount)}" disabled></td>

                <td>${money(calculateMoneyImport(arrData[index].import_form_product[i]))}</td>
            </tr>
        `)
    }
    if (isable) {
        $("#btnAddMore").hide()
        $("#btnSaveEdit").hide()
        $(".div-payment").hide()
    }
    else {
        if (type_import == "Nhập hàng khách trả lại") {
            $("#btnAddMore").hide()
        }
        else {
            $("#btnAddMore").show()
        }
            $("#btnSaveEdit").show()
            $(".div-payment").show()
            $("#payment_zero").val('false')
            $("#payment_zero").prop('checked',false)
            $("#btnSaveEdit").attr("onclick",`confirmSaveEdit(${index})`)
            $("#btnAddMore").attr("href",`/import-product-from-supplier/import/import-supplier/add/${arrData[index]._id}`)
        
        
    } 
    changeMoney()
    formatNumber()

    showPopup('popupEdit')
}



function confirmSaveEdit(index) {
    const modelBoby = $("#popupEdit .modal-body")
    const tableProduct = $(modelBoby).find('table')[1]
    const trs = $(tableProduct).find('tbody tr')

    var arrProduct = []
    arrData[index].import_form_product.map(product => {
        arrProduct.push({...product})
    })
    for (let i =0; i < trs.length; i++){
        const product_import_price = tryParseInt($($(trs[i]).find('input')[0]).val())
        const product_vat = tryParseInt($($(trs[i]).find('input')[1]).val())
        const product_ck = tryParseInt($($(trs[i]).find('input')[2]).val())
        const product_quantity = tryParseInt($($(trs[i]).find('input')[3]).val())
        const product_warranty = tryParseInt($($(trs[i]).find('input')[4]).val())
        const product_discount = tryParseInt($($(trs[i]).find('input')[5]).val())
        arrProduct[i] = {
            ...arrProduct[i],
            product_import_price: product_import_price,
            product_vat : product_vat,
            product_ck : product_ck,
            product_discount : product_discount,
            product_warranty:product_warranty
        }
    }
    const id_fundbook = $("#selectTypePayment option:selected").val().trim()
    if (id_fundbook.length == 0) {
        info("Hãy chọn hình thức thanh toán")
        return
    }
    const payment_form = tryParseInt($("#paid").val()) // tiền khách thanh toán
    const import_form_note = $("input[name=note]").val()
    const is_payment_zero = $("#payment_zero").val()
   
    hidePopup('popupEdit')
    
    callAPI('PUT', `${API_IMPORT}/import-supplier`, {
        arrProduct: JSON.stringify(arrProduct),
        id_fundbook: id_fundbook,
        payment_form_money: payment_form,
        import_form_note:import_form_note,
        id_import: arrData[index]._id,
        is_payment_zero:is_payment_zero
    }, (data) => {
        getData()
        success("Thành công")
        
    })
    
}

function changeMoney() {

    const input = $(event.path[0])
    $(input).val(money(tryParseInt($(input).val())))
    const modelBoby = $("#popupEdit .modal-body")
    const tableProduct = $(modelBoby).find('table')[1]
    const trs = $(tableProduct).find('tbody tr')

    let total = 0
    for (let i =0; i < trs.length; i++){
        const product_import_price = tryParseInt($($(trs[i]).find('input')[0]).val())
        const product_vat = tryParseInt($($(trs[i]).find('input')[1]).val())
        const product_ck = tryParseInt($($(trs[i]).find('input')[2]).val())
        const product_quantity = tryParseInt($($(trs[i]).find('input')[3]).val())
        const product_discount = tryParseInt($($(trs[i]).find('input')[5]).val())
        total += totalMoney(product_import_price, product_vat, product_ck, product_discount, product_quantity)
    }

    $('#totalMoney').val(money(total))
    const paid = tryParseInt($('#paid').val())
    $('#debt').val(money(total - paid))
}

$("#payment_zero").change(e => {

    if ($("#payment_zero").is(":checked")) {
        $("#payment_zero").val(true)
    }
    else {
        $("#payment_zero").val(false)
    }
})

function downloadID(index) {
    callAPI('GET', `${API_IMPORT}/import-supplier/download`, {
        id_import:arrData[index]._id
    }, (data => {
        const arrDownload = []
        for (let i = 0; i < data.length; i++){
            arrDownload.push({
                "Mã sản phẩm": data[i]._id,
                "Mã có sẵn": data[i].id_product2,
                "Tên sản phẩm":data[i].subcategory_name,
                "Giá nhập":data[i].product_import_price,
                "VAT":data[i].product_vat,
                "Chiết khấu":data[i].product_ck,
            })
        }
        downloadExcelLocal(arrDownload,"Danh sách mã sản phẩm")
    }))
}

function selectSupplier(index){
    $("#input_edit_supplier").val(arrSupplier[index].user_fullname)
    $("#input_edit_supplier").attr("name",arrSupplier[index]._id)
    $("#td_info_supplier").html(`<b> SĐT</b>: ${arrSupplier[index].user_phone}  &nbsp; &nbsp; &nbsp;<b> Địa chỉ:</b> ${arrSupplier[index].user_address} `)

    $("#div_list_supplier").empty()
}

function save_change_supplier(index){

    const id_supplier = $("#input_edit_supplier").attr("name")
    callAPI('PUT',`${API_IMPORT}/import-supplier/change_supplier`,{
        id_user:id_supplier,
        id_import:arrData[index]._id
    }, data =>{
        arrData[index] = {
            ...arrData[index],
            ...data,
            
        }
        success("Thành công")
    })
}