var getOther = true
var arrData = []
checkPermission()
function checkPermission() {
    callAPI('GET',`${API_IMPORT}/import-supplier/checkPermission`,null,(data)=>{
        data.warehouses.map(warehouse =>{
            $("#selectWarehouse").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })

        data.fundbooks.map(fund =>{
            $("#selectTypePayment").append(`<option value="${fund._id}">${fund.fundbook_name}</option>`)
        })
        getData()
    })
}

function getData() {
    limit = tryParseInt($("#selectLimit option:selected").val())
    key = $("#inputFind").val()
    const fromdate = $("#fromdate").val()
    const todate = $("#todate").val()
    callAPI('GET', API_EXPORT, {
        limit: limit,
        key: key,
        id_warehouse: $("#selectWarehouse option:selected").val(),
        fromdate: fromdate,
        todate: todate,
        page: page,
        export_form_type:type_export
    }, data => {
      
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&fromdate=${fromdate}&todate=${todate}&key=${key}&warehouse_name=${$("#selectWarehouse option:selected").text()}`)
    })
}
function drawTable(data) {
    $("#tbodyTable").empty()
    arrData = []
    for (let i = 0; i < data.length; i++){
        
        
        let total = calculateMoneyExport(data[i].export_form_product)
        arrData.push(data[i])
        
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i]._id}</td>
                <td>${data[i].employee_fullname}</td>
                <td>${formatDate(data[i].createdAt).fulldatetime}</td>
                <td>${data[i].user_fullname} - SĐT: ${data[i].user_phone}</td>
                <td ><span class="substring">${data[i].export_form_product.length > 0 ? data[i].export_form_product[0].subcategory_name : ""}</span></td>
                <td>${money(total)}</td>
                <td>
                    <i onclick="showEdit(${i})" class="fas fa-edit text-warning text-infos"></i>
                    <i onclick= newPage('/export/print/${data[i]._id}') class="fas fa-print text-primary"></i>
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
                <td>${arrData[index].export_form_product[i].id_product || ""}</td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_export_price)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_vat)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_ck)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_quantity)}" disabled></td>
                <td><input oninput="changeMoney()" class="number form-control"  type="text" value="${money(arrData[index].export_form_product[i].product_warranty)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_discount)}" ></td>

                <td class="div-employee-setting">
                    <input oninput="findEmployee()" value="${arrData[index].export_form_product[i].employee_fullname}" name="${arrData[index].export_form_product[i].id_employee}" class="form-control" placeholder="Nhập tên nhân viên . . .">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <div onscroll="loadmoreEmployee()" class="div-employee"></div>
                </td>
                <td class="div-employee-setting">
                    <input oninput="findEmployee()" value="${arrData[index].export_form_product[i].employee_setting_fullname}" name="${arrData[index].export_form_product[i].id_employee_setting}" class="form-control" placeholder="Nhập tên nhân viên . . .">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <div onscroll="loadmoreEmployee()" class="div-employee"></div>
                </td>
                <td class="center"><i onclick="delete_product(${index},${i})" class="fas fa-trash text-danger"></i></td>
            </tr>
        `)
    }

    if(arrData[index].id_fundbook){
        $("#selectTypePayment").val(arrData[index].id_fundbook).change()
        $("#paid").val(money(arrData[index].receive_form_money))
        $("#note").val(arrData[index].export_form_note)
    }

    if (isable) {
        $("#btnAddMore").hide()
        // $("#btnSaveEdit").hide()
        $(".div-payment").hide()
        $("#btnSaveEdit").attr("onclick",`confirmUpdateEmployee(${index})`)
    }
    else {
        $("#btnAddMore").show()
        $("#btnSaveEdit").show()
        $(".div-payment").show()
        $("#payment_zero").val('false')
        $("#payment_zero").prop('checked',false)
        $("#btnSaveEdit").attr("onclick",`confirmSaveEdit(${index})`)
        $("#btnAddMore").attr("href",`/export-product-to-${type_export=="Xuất hàng để bán"?'sale':'return'}/add/${arrData[index]._id}`)
    } 
    changeMoney()
    formatNumber()

    showPopup('popupEdit')
}

function findEmployee(isMore=false) {
    
    const td = $(event.target).parent()
    const input = $(td).find('input')[0]
    $(input).attr("name",null)
    const div_loading = $(td).find('.spinner-border')[0]
    const div_employee = $(td).find(".div-employee")[0]
    if ($(input).val().trim().length == 0) {
        $(div_employee).empty()
        arrEmployee = []
    }
    $(div_loading).show()
    if (!isMore) {
        offsetEmployee = 1
        $(div_employee).empty()
            
    }
    
    callAPI('GET', `${API_EMPLOYEE}/info`, {
        key: $(input).val(),
        limit: 5,
        page:offsetEmployee
    }, data => {
        if ($(input).val().trim().length > 0) {
            if (!isMore) {
                $(div_employee).empty()
                arrEmployee = []
            }
            
            data.map(employee => {
                
                arrEmployee.push(employee)
                $(div_employee).append(`<li><a onclick="selectEmployee(${arrEmployee.length-1})" href="javascript:void(0)">${employee.employee_fullname} &emsp; ${employee.employee_phone} </a></li>`)
            })
        }
        else {
            $(div_employee).empty()
        }
        $(div_loading).hide()
    }, err => {
        $(div_loading).show()
        errAjax(err)
    },false, false)
}

function loadmoreEmployee() {
    const div = $(event.target)
    if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        offsetEmployee++
        findEmployee(true)
    }
}

function selectEmployee(index) {
    const parent_one = $(event.target).parent().parent().parent()
    // console.log(parent_one)
    const input = $(parent_one).find('input')[0]
    const div_employee = $(parent_one).find(".div-employee")[0]
    $(div_employee).empty()
    $(input).val(arrEmployee[index].employee_fullname)
    $(input).attr("name", arrEmployee[index]._id)
    // $(input).prop("disabled",true)

}


function confirmSaveEdit(index) {
    const modelBoby = $("#popupEdit .modal-body")
    const tableProduct = $(modelBoby).find('table')[1]
    const trs = $(tableProduct).find('tbody tr')

    var arrProduct = []
    arrData[index].export_form_product.map(product => {
        arrProduct.push({...product})
    })
    for (let i =0; i < trs.length; i++){
        const product_export_price = tryParseInt($($(trs[i]).find('input')[0]).val())
        const product_vat = tryParseInt($($(trs[i]).find('input')[1]).val())
        const product_ck = tryParseInt($($(trs[i]).find('input')[2]).val())
        const product_quantity = tryParseInt($($(trs[i]).find('input')[3]).val())
        const product_warranty = tryParseInt($($(trs[i]).find('input')[4]).val())
        const product_discount = tryParseInt($($(trs[i]).find('input')[5]).val())
        const id_employee = $($(trs[i]).find('input')[6]).attr("name")
        const id_employee_setting = $($(trs[i]).find('input')[7]).attr("name")
        arrProduct[i] = {
            ...arrProduct[i],
            product_export_price: product_export_price,
            product_vat : product_vat,
            product_ck : product_ck,
            product_discount : product_discount,
            product_warranty:product_warranty,
            id_employee:id_employee && id_employee.length == 24?id_employee:null,
            id_employee_setting:id_employee_setting && id_employee_setting.length == 24?id_employee_setting:null,
        }
    }
    const id_fundbook = $("#selectTypePayment option:selected").val().trim()
    if (id_fundbook.length == 0) {
        info("Hãy chọn hình thức thanh toán")
        return
    }
    const receive_form_money = tryParseInt($("#paid").val()) // tiền khách thanh toán
    const export_form_note = $("input[name=note]").val()
    const is_payment_zero = $("#payment_zero").val()

    hidePopup('popupEdit')
    callAPI('PUT', API_EXPORT, {
        arrProduct: JSON.stringify(arrProduct),
        id_fundbook: id_fundbook,
        receive_form_money: receive_form_money,
        export_form_note:export_form_note,
        id_export: arrData[index]._id,
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
        const product_export_price = tryParseInt($($(trs[i]).find('input')[0]).val())
        const product_vat = tryParseInt($($(trs[i]).find('input')[1]).val())
        const product_ck = tryParseInt($($(trs[i]).find('input')[2]).val())
        const product_quantity = tryParseInt($($(trs[i]).find('input')[3]).val())
        const product_discount = tryParseInt($($(trs[i]).find('input')[5]).val())
        total += totalMoney(product_export_price, product_vat, product_ck, product_discount, product_quantity)
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

function delete_product(index, indexOfProduct){
    $("#popupDelete .modal-footer button:first-child").attr(`onclick`,`confirmDelete(${index},${indexOfProduct})`)
    showPopup('popupDelete')
}

function confirmDelete(index,indexOfProduct){
    hidePopup('popupEdit')
    callAPI('delete',`${API_EXPORT}/product`,{
        id_export:arrData[index]._id,
        indexOfProduct:indexOfProduct
    },(data)=>{
        getData()

    })
}

function confirmUpdateEmployee(index){
    const modelBoby = $("#popupEdit .modal-body")
    const tableProduct = $(modelBoby).find('table')[1]
    const trs = $(tableProduct).find('tbody tr')

    var arrProduct = []
    arrData[index].export_form_product.map(product => {
        arrProduct.push({...product})
    })
    for (let i =0; i < trs.length; i++){
        const product_export_price = tryParseInt($($(trs[i]).find('input')[0]).val())
        const product_vat = tryParseInt($($(trs[i]).find('input')[1]).val())
        const product_ck = tryParseInt($($(trs[i]).find('input')[2]).val())
        const product_quantity = tryParseInt($($(trs[i]).find('input')[3]).val())
        const product_warranty = tryParseInt($($(trs[i]).find('input')[4]).val())
        const product_discount = tryParseInt($($(trs[i]).find('input')[5]).val())
        const id_employee = $($(trs[i]).find('input')[6]).attr("name")
        const id_employee_setting = $($(trs[i]).find('input')[7]).attr("name")
        arrProduct[i] = {
            ...arrProduct[i],
            product_export_price: product_export_price,
            product_vat : product_vat,
            product_ck : product_ck,
            product_discount : product_discount,
            product_warranty:product_warranty,
            id_employee:id_employee,
            id_employee_setting:id_employee_setting
        }
    }
    const id_fundbook = $("#selectTypePayment option:selected").val().trim()
    if (id_fundbook.length == 0) {
        info("Hãy chọn hình thức thanh toán")
        return
    }
    const receive_form_money = tryParseInt($("#paid").val()) // tiền khách thanh toán
    const export_form_note = $("input[name=note]").val()
    const is_payment_zero = $("#payment_zero").val()
   
    hidePopup('popupEdit')
    callAPI('PUT', `${API_EXPORT}/employee`, {
        arrProduct: JSON.stringify(arrProduct),
        id_fundbook: id_fundbook,
        receive_form_money: receive_form_money,
        export_form_note:export_form_note,
        id_export: arrData[index]._id,
        is_payment_zero:is_payment_zero
    }, (data) => {
        getData()
        success("Thành công")
        
    })
}

function selectSupplier(index){
    $("#input_edit_supplier").val(arrSupplier[index].user_fullname)
    $("#input_edit_supplier").attr("name",arrSupplier[index]._id)
    $("#td_info_supplier").html(`<b> SĐT</b>: ${arrSupplier[index].user_phone}  &nbsp; &nbsp; &nbsp;<b> Địa chỉ:</b> ${arrSupplier[index].user_address} `)

    $("#div_list_supplier").empty()
}

function save_change_supplier(index){

    const id_supplier = $("#input_edit_supplier").attr("name")
    callAPI('PUT',`${API_EXPORT}/change-customer`,{
        id_user:id_supplier,
        id_export:arrData[index]._id
    }, data =>{
        arrData[index] = {
            ...arrData[index],
            ...data,
            
        }
        success("Thành công")
    })
}