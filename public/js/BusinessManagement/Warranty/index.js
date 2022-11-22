var arrSupplier = []
var id_user = null
var arrData = []
var pageSupplier = 1
var arrProduct = []
var arrSubCategory = []
checkPermission()

function checkPermission() {

    callAPI('GET', `${API_WARRANTY}/checkPermission`, null, data => {
        data.map(warehouse => {
            let isSelected = ""
            if (warehouse._id == id_warehouse) isSelected = "selected"
            $('select[name=select_warehouse]').append(`<option ${isSelected} value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })
        getData()
    })
}

function getData() {


    const id_warehouse = $("#selectWarehouse option:selected").val()
    const name_customer = $("#find_name_customer").val()
    const phone_customer = $("#find_phone_customer").val()
    const fromdate = $("#fromdate").val()
    const todate = $("#todate").val()
    const subcategory_name = $("#subcategory_name").val()
    const id_product = $("#id_product").val()
    const status_send_supplier = $("#status_send_supplier option:selected").val()
    const status_receive_supplier = $("#status_receive_supplier option:selected").val()
    const status_change_supplier = $("#status_change_supplier option:selected").val()
    const status_return_customer = $("#status_return_customer option:selected").val()
    const status_change_customer = $("#status_change_customer option:selected").val()
    const status_failed = $("#status_failed option:selected").val()
    const status_success = $("#status_success option:selected").val()
    const date_send_supplier = $("#date_send_supplier").val()
    const supplier_name = $("#supplier_name").val()
    limit = $("#selectLimit option:selected").val()


    callAPI('GET', API_WARRANTY, {
        name_customer: name_customer,
        phone_customer: phone_customer,
        fromdate: fromdate,
        todate: todate,
        limit: limit,
        page: page,
        id_warehouse: id_warehouse,
        subcategory_name: subcategory_name,
        id_product: id_product,
        status_send_supplier: status_send_supplier,
        status_receive_supplier: status_receive_supplier,
        status_change_supplier: status_change_supplier,
        status_return_customer: status_return_customer,
        status_change_customer: status_change_customer,
        status_failed: status_failed,
        status_success: status_success,
        date_send_supplier: date_send_supplier,
        supplier_name: supplier_name,
    }, data => {
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&fromdate=${fromdate}&todate=${todate}&id_warehouse=${id_warehouse}`)
    })
}


function showPopupAdd() {
    $("#popupAdd .modal-body tbody").empty()
    drawTableAdd()
    showPopup('popupAdd', true)
}

function drawTable(data) {

    arrData = []
    $("#dataTable tbody").empty()
    for (let i = 0; i < data.length; i++) {

        const status_send_supplier = data[i].status_send_supplier ? "checked" : ""
        const status_receive_supplier = data[i].status_receive_supplier ? "checked" : ""
        const status_change_supplier = data[i].status_change_supplier ? data[i].status_change_supplier : ""
        const status_return_customer = data[i].status_return_customer ? "checked" : ""
        const status_change_customer = data[i].status_change_customer ? data[i].status_change_customer : ""
        const status_failed = data[i].status_failed ? "checked" : ""
        const status_success = data[i].status_success ? "checked" : ""
        const date_send_supplier = status_send_supplier ? formatDate(data[i].date_send_supplier).fulldate : ""

        arrData.push(data[i])
        $("#dataTable tbody").append(`
            <tr t_body>
                <td>${i+1}</td>
                <td>${data[i].user_fullname}</td>
                <td>${data[i].user_phone}</td>
                <td>${formatDate(data[i].createdAt).fulldate}</td>
                <td><span class="substring" title="${data[i].subcategory_name}">${data[i].subcategory_name}</span></td>
                <td>${data[i].id_product}/${data[i].id_product2?data[i].id_product2:""}</td>
                <td><input type="checkbox" ${status_send_supplier} ></td>
                <td><input type="checkbox" ${status_receive_supplier} ></td>
                <td> ${status_change_supplier} </td>
                <td><input type="checkbox" ${status_return_customer} ></td>
                <td>${status_change_customer}</td>
                <td><input type="checkbox" ${status_failed} ></td>
                <td><input type="checkbox" ${status_success} ></td>
                <td>${date_send_supplier}</td>
                <td>${data[i].supplier_name} - ${data[i].supplier_phone}</td>
                <td>${data[i].note}</td>
            </tr>
        `)
    }
}

function drawTableAdd() {
    $("#popupAdd .modal-body tbody").append(`
        <tr>
            <td>
                <input class="form-control" onkeypress="find_id_product_callback(success_find_id_product_add)" type="text" placeholder="Nhập mã sản phẩm">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </td>
            <td><input class="form-control" type="text" disabled placeholder="Tên sản phẩm"></td>
            <td><input class="form-control" type="text" disabled placeholder="Ngày xuất bán"></td>
            <td><input class="form-control" type="text" disabled placeholder="Bảo hành"></td>
            <td><input class="form-control" type="text" disabled placeholder="Thời gian còn lại"></td>
            <td>
                <input class="form-control" type="text" oninput="find_customer_callback(success_get_supplier_add)" placeholder="Nhà cc">
                <div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>
                <div onscroll="loadmore_customer(success_get_supplier_add)"></div>
            </td>
            <td><input class="form-control" type="text" placeholder="Ghi chú"></td>
            <td><i onclick="delete_row()" class="fas fa-trash text-danger"></i></td>
            
        </tr>
    `)
    $("#popupAdd tbody tr:last-child td:first-child input").focus()
}

function success_find_id_product_add(data, element) {
    const tr = $(element).parent().parent()
    if (data.product_status == 0) {
        info("Sản phẩm này chưa xuất kho! Không thể bảo hành")
        $($(tr).find('input')[0]).val(null)
        return
    }


    $($(tr).find('input')[0]).val(data._id)
    $($(tr).find('input')[0]).prop("disabled", true)
    $($(tr).find('input')[1]).val(data.subcategory_name)
    $($(tr).find('input')[2]).val(formatDate(data.product_export_date).fulldate)
    $($(tr).find('input')[3]).val(data.product_export_warranty)
    $($(tr).find('input')[3]).attr("name", data.id_export_form)
    $($(tr).find('input')[4]).val(getRemaintTimeWarranty(data.product_export_date, data.product_export_warranty))
    $($(tr).find('input')[5]).val(data.supplier_fullname)
    $($(tr).find('input')[5]).attr("name", data.id_supplier)

    if (!id_user) {
        id_user = data.id_user
        $($("#popupAdd .row-supplier").find('input')[0]).val(data.user_fullname)
        $($("#popupAdd .row-supplier").find('input')[0]).attr("name", data.id_user)
        $($("#popupAdd .row-supplier").find('input')[1]).val(data.user_phone)
        $($("#popupAdd .row-supplier").find('input')[2]).val(data.user_address)
    }
    drawTableAdd()



}

function getRemaintTimeWarranty(time, warranty) {
    const date1 = new Date(time);
    const date2 = Date.now();
    const diffTime = date2 - date1
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (isNaN(parseInt(warranty))) parseInt(warranty) = 0;
    const dateWarranty = parseInt(warranty) * 30; // quy số tháng bảo hành ra ngày
    var currentWarranty = dateWarranty - diffDays; // lấy số ngày bảo hành trừ đi ngày đã sử dụng
    if (currentWarranty < 0) currentWarranty = 0;

    if (currentWarranty < 30) // nếu nhỏ 30 thì in ra số ngày thôi
    {
        return parseInt(currentWarranty) + " Ngày"
    } else // in ra số ngày và số tháng
    {
        const numberMonth = parseInt(currentWarranty / 30);
        return numberMonth - 1 + " Tháng - " + parseInt(currentWarranty % 30) + " Ngày"
    }
}

function delete_row() {
    const tr = $(event.target).parent().parent()
    const trs = $("#popupAdd tbody tr")
    if ($("#popupAdd tbody tr").index(tr) < trs.length - 1) {
        $(tr).remove()
    }
}

function success_get_customer_add(data) {

    const div_supplier = $("#popupAdd .modal-body .row-supplier div:first-child div:last-child")

    for (let i = 0; i < data.length; i++) {
        arrSupplier.push(data[i])
        $(div_supplier).append(`
            <li><a onclick="select_supplier(${arrSupplier.length-1})" href="javascript:void(0)">${data[i].user_fullname} - ${data[i].user_phone}</a></li>
        `)
    }

}

function success_get_supplier_add(data, element) {

    const div_supplier = $(element).find('div:last-child')
    for (let i = 0; i < data.length; i++) {
        arrSupplier.push(data[i])
        $(div_supplier).append(`
            <li><a onclick="select_supplier_row(${arrSupplier.length-1})" href="javascript:void(0)">${data[i].user_fullname} - ${data[i].user_phone}</a></li>
        `)
    }
}

function select_supplier(index) {
    const parent_child = $(event.target).parent().parent()
    $(parent_child).empty()
    const parent = $(parent_child).parent().parent()

    $($(parent).find('input')[0]).attr("name", arrSupplier[index]._id)
    $($(parent).find('input')[0]).val(arrSupplier[index].user_fullname)
    $($(parent).find('input')[1]).val(arrSupplier[index].user_phone)
    $($(parent).find('input')[2]).val(arrSupplier[index].user_address)
}

function select_supplier_row(index) {
    const parent_child = $(event.target).parent().parent()

    $(parent_child).empty()
    const parent = $(parent_child).parent()
    $($(parent).find('input')[0]).attr("name", arrSupplier[index]._id)
    $($(parent).find('input')[0]).val(arrSupplier[index].user_fullname)
}

function confirmSave() {
    const id_user_add = $("#popupAdd .modal-body .row-supplier div:first-child input").attr("name")
    if (!id_user_add) {
        info("Hãy chọn khách hàng")
        $("#popupAdd .modal-body .row-supplier div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popupAdd .modal-body .row-supplier select option:selected").val()
    if (!id_warehouse || id_warehouse.length == 0) {
        info("Hãy chọn kho")
        return
    }
    const trs = $("#popupAdd .modal-body div:nth-child(2) tbody tr")
    const arrProduct = []
    for (let i = 0; i < trs.length; i++) {
        const id_product = $($(trs[i]).find('input')[0]).val()
        const id_supplier = $($(trs[i]).find('input')[5]).attr("name")
        const note = $($(trs[i]).find('input')[6]).val()
        const id_export_form = $($(trs[i]).find('input')[3]).attr("name")
        if (id_product.length == 24) {
            if (!id_supplier) {
                info(`Nhà cung cấp tại dòng ${i+1} không được để trống`)
                $($(trs[5]).find('input')[5]).focus()
                return
            }
            arrProduct.push({
                id_product: id_product,
                id_supplier: id_supplier,
                note: note,
                id_export_form: id_export_form
            })
        }

    }
    if (arrProduct.length == 0) {
        info("Hãy nhập ít nhất một sản phẩm")
        return
    }

    hidePopup('popupAdd')

    callAPI('POST', API_WARRANTY, {
        arrProduct: JSON.stringify(arrProduct),
        id_user: id_user_add,
        id_warehouse: id_warehouse
    }, data => {
        success("Thành công")
        getData()
    })
}

function show_popup_send_supplier(){
    arrProduct = []
    $("#popup_send_supplier .div-product").empty()
    showPopup('popup_send_supplier',true)
}

function success_get_customer_send_supplier(data){
    const div_supplier = $("#popup_send_supplier .modal-body .row-supplier div:first-child div:last-child")

    for (let i = 0; i < data.length; i++) {
        arrSupplier.push(data[i])
        $(div_supplier).append(`
            <li><a onclick="select_supplier(${arrSupplier.length-1})" href="javascript:void(0)">${data[i].user_fullname} - ${data[i].user_phone}</a></li>
        `)
    }
}


function success_get_supplier_receive(data){
    const div_supplier = $("#popup_receive_supplier .modal-body .row-supplier div:first-child div:last-child")

    for (let i = 0; i < data.length; i++) {
        arrSupplier.push(data[i])
        $(div_supplier).append(`
            <li><a onclick="select_supplier(${arrSupplier.length-1})" href="javascript:void(0)">${data[i].user_fullname} - ${data[i].user_phone}</a></li>
        `)
    }
}


function find_product_send_supplier(){
    const id_supplier = $("#popup_send_supplier .modal-body div:first-child div:first-child input").attr("name")
    if(!id_supplier){
        info("Hãy chọn khách hàng")
        $("#popup_send_supplier .modal-body div:first-child div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popup_send_supplier .modal-body div:first-child div:nth-child(4) select option:selected").val()
    if(!id_warehouse || id_warehouse.length == 0){
        info("Hãy chọn kho")
        return
    }

    callAPI('GET',`${API_WARRANTY}/find-product`,{
        id_supplier:id_supplier,
        id_warehouse:id_warehouse,
        type:"send_supplier"
    }, data =>{
        arrProduct= []
        $("#popup_send_supplier .div-product").html(`
            <table class="table">
                <thead> 
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>Mã sản phẩm</th>
                        <th>Tên khách hàng</th>
                        <th>Ngày nhận bh</th>
                        <th>Ghi chú</th>
                        <th>Gửi</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `)
        for(let i =0;i<data.length;i++){
            arrProduct.push({
                ...data[i],
                checked:true
            })
            $("#popup_send_supplier .div-product tbody").append(`
                <tr>
                    <td>${i+1}</td>
                    <td><span>${data[i].subcategory_name}</span></td>
                    <td>${data[i].id_product}/${data[i].id_product2?data[i].id_product2:""}</td>
                    <td>${data[i].user_fullname} - ${data[i].user_phone}</td>
                    <td>${formatDate(data[i].createdAt).fulldate}</td>
                    <td>${data[i].note}</td>
                    <td class="center">
                        <input type="checkbox" onchange="change_checked_product(${arrProduct.length-1})" checked>
                    </td>
                </tr>
            `)
        }

        dataTable2($("#popup_send_supplier .div-product table"))
    })
}

function change_checked_product(index){
    const element = $(event.target)
    arrProduct[index].checked = $(element).is(":checked")
}

function confirm_send_supplier(){
    
    const id_supplier = $("#popup_send_supplier .modal-body div:first-child div:first-child input").attr("name")
    if(!id_supplier){
        info("Hãy chọn khách hàng")
        $("#popup_send_supplier .modal-body div:first-child div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popup_send_supplier .modal-body div:first-child div:nth-child(4) select option:selected").val()
    if(!id_warehouse || id_warehouse.length == 0){
        info("Hãy chọn kho")
        return
    }
    hidePopup('popup_send_supplier')

    callAPI('POST',`${API_WARRANTY}/send_supplier`,{
        id_user:id_supplier,
        id_warehouse:id_warehouse,
        arrProduct: JSON.stringify(arrProduct)
    }, data =>{
        newPage(`export/print/${data}`)
        success("Thành công")
        getData()
    })
}

function show_receive_supplier(){
    arrProduct = []
    $("#popup_receive_supplier div-product tbody").empty()
    showPopup('popup_receive_supplier',true)
}

function find_product_receive_supplier(){
    const id_supplier = $("#popup_receive_supplier .modal-body div:first-child div:first-child input").attr("name")
    if(!id_supplier){
        info("Hãy chọn khách hàng")
        $("#popup_receive_supplier .modal-body div:first-child div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popup_receive_supplier .modal-body div:first-child div:nth-child(4) select option:selected").val()
    if(!id_warehouse || id_warehouse.length == 0){
        info("Hãy chọn kho")
        return
    }

    callAPI('GET',`${API_WARRANTY}/find-product`,{
        id_supplier:id_supplier,
        id_warehouse:id_warehouse,
        type:"receive_supplier"
    }, data =>{
        arrProduct= []
        $("#popup_receive_supplier .div-product").html(`
            <table class="table">
                <thead> 
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>Mã sản phẩm</th>
                        <th>Tên khách hàng</th>
                        <th>Ngày nhận bh</th>
                        <th>Ngày gửi ncc</th>
                        <th>Ghi chú</th>
                        <th>Nhận</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `)
        for(let i =0;i<data.length;i++){
            arrProduct.push({
                ...data[i],
                checked:false
            })
            $("#popup_receive_supplier .div-product tbody").append(`
                <tr>
                    <td>${i+1}</td>
                    <td><span>${data[i].subcategory_name}</span></td>
                    <td>${data[i].id_product}/${data[i].id_product2?data[i].id_product2:""}</td>
                    <td>${data[i].user_fullname} - ${data[i].user_phone}</td>
                    <td>${formatDate(data[i].createdAt).fulldate}</td>
                    <td>${formatDate(data[i].date_send_supplier).fulldate}</td>
                    <td>${data[i].note}</td>
                    <td class="center">
                        <input type="checkbox" onchange="change_checked_product(${arrProduct.length-1})">
                    </td>
                </tr>
            `)
        }

        dataTable2($("#popup_receive_supplier .div-product table"))
    })
}

function confirm_receive_supplier(){
    const id_supplier = $("#popup_receive_supplier .modal-body div:first-child div:first-child input").attr("name")
    if(!id_supplier){
        info("Hãy chọn khách hàng")
        $("#popup_receive_supplier .modal-body div:first-child div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popup_receive_supplier .modal-body div:first-child div:nth-child(4) select option:selected").val()
    if(!id_warehouse || id_warehouse.length == 0){
        info("Hãy chọn kho")
        return
    }
    hidePopup('popup_receive_supplier')

    callAPI('POST',`${API_WARRANTY}/receive_supplier`,{
        id_user:id_supplier,
        id_warehouse:id_warehouse,
        arrProduct: JSON.stringify(arrProduct)
    }, data =>{
        newPage(`import/print/${data}`)
        success("Thành công")
        getData()
    })
}

function show_change_supplier(){
   
    arrProduct = []
    $("#popup_change_supplier .div-product tbody").empty()
    showPopup('popup_change_supplier',true)
    
}

function show_change_customer(){
   
    arrProduct = []
    $("#popup_change_customer .div-product tbody").empty()
    showPopup('popup_change_customer',true)
    
}

function success_get_supplier_change(data){
    const div_supplier = $("#popup_change_supplier .modal-body .row-supplier div:first-child div:last-child")
    for (let i = 0; i < data.length; i++) {
        arrSupplier.push(data[i])
        $(div_supplier).append(`
            <li><a onclick="select_supplier(${arrSupplier.length-1})" href="javascript:void(0)">${data[i].user_fullname} - ${data[i].user_phone}</a></li>
        `)
    }
}

function success_get_customer_change(data){
    const div_supplier = $("#popup_change_customer .modal-body .row-supplier div:first-child div:last-child")
    for (let i = 0; i < data.length; i++) {
        arrSupplier.push(data[i])
        $(div_supplier).append(`
            <li><a onclick="select_supplier(${arrSupplier.length-1})" href="javascript:void(0)">${data[i].user_fullname} - ${data[i].user_phone}</a></li>
        `)
    }
}

function find_product_change_supplier(){
    const id_supplier = $("#popup_change_supplier .modal-body div:first-child div:first-child input").attr("name")
    if(!id_supplier){
        info("Hãy chọn khách hàng")
        $("#popup_change_supplier .modal-body div:first-child div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popup_change_supplier .modal-body div:first-child div:nth-child(4) select option:selected").val()
    if(!id_warehouse || id_warehouse.length == 0){
        info("Hãy chọn kho")
        return
    }

    callAPI('GET',`${API_WARRANTY}/find-product`,{
        id_supplier:id_supplier,
        id_warehouse:id_warehouse,
        type:"receive_supplier"
    }, data =>{
        arrProduct= []
        $("#popup_change_supplier .div-product").html(`
            <table class="table">
                <thead> 
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>Mã sản phẩm</th>
                        <th>Tên khách hàng</th>
                        <th>Ngày nhận bh</th>
                        <th>Ngày gửi ncc</th>
                        <th>Ghi chú</th>
                        <th>Đổi</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `)
        for(let i =0;i<data.length;i++){
            arrProduct.push({
                ...data[i],
                checked:false
            })
            $("#popup_change_supplier .div-product tbody").append(`
                <tr>
                    <td>${i+1}</td>
                    <td><span>${data[i].subcategory_name}</span></td>
                    <td>${data[i].id_product}/${data[i].id_product2?data[i].id_product2:""}</td>
                    <td>${data[i].user_fullname} - ${data[i].user_phone}</td>
                    <td>${formatDate(data[i].createdAt).fulldate}</td>
                    <td>${formatDate(data[i].date_send_supplier).fulldate}</td>
                    <td>${data[i].note}</td>
                    <td>
                        <div>
                            <div><button onclick="change_new(${arrProduct.length-1})" class="btn btn-primary">Mới</button></div>
                            <div><button class="btn btn-warning" onclick="change_other(${arrProduct.length-1})">Khác</button></div>
                        </div>
                    </td>
                </tr>
            `)
        }

        dataTable2($("#popup_change_supplier .div-product table"))
    })
}


function find_product_change_customer(){
    const id_supplier = $("#popup_change_customer .modal-body div:first-child div:first-child input").attr("name")
    if(!id_supplier){
        info("Hãy chọn khách hàng")
        $("#popup_change_customer .modal-body div:first-child div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popup_change_customer .modal-body div:first-child div:nth-child(4) select option:selected").val()
    if(!id_warehouse || id_warehouse.length == 0){
        info("Hãy chọn kho")
        return
    }

    callAPI('GET',`${API_WARRANTY}/find-product`,{
        id_supplier:id_supplier,
        id_warehouse:id_warehouse,
        type:"return_customer"
    }, data =>{
        arrProduct= []
        $("#popup_change_customer .div-product").html(`
            <table class="table">
                <thead> 
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>Mã sản phẩm</th>
                        <th>Tên khách hàng</th>
                        <th>Ngày nhận bh</th>
                        <th>Ngày gửi ncc</th>
                        <th>Ghi chú</th>
                        <th>Đổi</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `)
        for(let i =0;i<data.length;i++){
            arrProduct.push({
                ...data[i],
                checked:false
            })
            $("#popup_change_customer .div-product tbody").append(`
                <tr>
                    <td>${i+1}</td>
                    <td><span>${data[i].subcategory_name}</span></td>
                    <td>${data[i].id_product}/${data[i].id_product2?data[i].id_product2:""}</td>
                    <td>${data[i].user_fullname} - ${data[i].user_phone}</td>
                    <td>${formatDate(data[i].createdAt).fulldate}</td>
                    <td>${formatDate(data[i].date_send_supplier).fulldate}</td>
                    <td>${data[i].note}</td>
                    <td>
                        <div>
                            <div><button class="btn btn-warning" onclick="change_other_customer(${arrProduct.length-1})">Đổi</button></div>
                        </div>
                    </td>
                </tr>
            `)
        }

        dataTable2($("#popup_change_customer .div-product table"))
    })
}


function show_return_customer(){
    arrProduct = []
    $("#popup_return_customer div-product tbody").empty()
    showPopup('popup_return_customer',true)
}

function find_product_return_customer(){
    const id_supplier = $("#popup_return_customer .modal-body div:first-child div:first-child input").attr("name")
    if(!id_supplier){
        info("Hãy chọn khách hàng")
        $("#popup_return_customer .modal-body div:first-child div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popup_return_customer .modal-body div:first-child div:nth-child(4) select option:selected").val()
    if(!id_warehouse || id_warehouse.length == 0){
        info("Hãy chọn kho")
        return
    }

    callAPI('GET',`${API_WARRANTY}/find-product`,{
        id_supplier:id_supplier,
        id_warehouse:id_warehouse,
        type:"return_customer"
    }, data =>{
        arrProduct= []
        $("#popup_return_customer .div-product").html(`
            <table class="table">
                <thead> 
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>Mã sản phẩm</th>
                        <th>Tên khách hàng</th>
                        <th>Ngày nhận bh</th>
                        <th>Ghi chú</th>
                        <th>Trả</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `)
        for(let i =0;i<data.length;i++){
            arrProduct.push({
                ...data[i],
                checked:false
            })
            $("#popup_return_customer .div-product tbody").append(`
                <tr>
                    <td>${i+1}</td>
                    <td><span>${data[i].subcategory_name}</span></td>
                    <td>${data[i].id_product}/${data[i].id_product2?data[i].id_product2:""}</td>
                    <td>${data[i].user_fullname} - ${data[i].user_phone}</td>
                    <td>${formatDate(data[i].createdAt).fulldate}</td>
                    <td>${data[i].note}</td>
                    <td class="center">
                        <input type="checkbox" onchange="change_checked_product(${arrProduct.length-1})">
                    </td>
                </tr>
            `)
        }

        dataTable2($("#popup_return_customer .div-product table"))
    })
}

function success_get_customer_return_customer(data){
    const div_supplier = $("#popup_return_customer .modal-body .row-supplier div:first-child div:last-child")
    for (let i = 0; i < data.length; i++) {
        arrSupplier.push(data[i])
        $(div_supplier).append(`
            <li><a onclick="select_supplier(${arrSupplier.length-1})" href="javascript:void(0)">${data[i].user_fullname} - ${data[i].user_phone}</a></li>
        `)
    }
}

function confirm_return_customer(){
    const id_supplier = $("#popup_return_customer .modal-body div:first-child div:first-child input").attr("name")
    if(!id_supplier){
        info("Hãy chọn khách hàng")
        $("#popup_return_customer .modal-body div:first-child div:first-child input").focus()
        return
    }
    const id_warehouse = $("#popup_return_customer .modal-body div:first-child div:nth-child(4) select option:selected").val()
    if(!id_warehouse || id_warehouse.length == 0){
        info("Hãy chọn kho")
        return
    }
    hidePopup('popup_return_customer')

    callAPI('POST',`${API_WARRANTY}/return-customer`,{
        id_user:id_supplier,
        id_warehouse:id_warehouse,
        arrProduct: JSON.stringify(arrProduct)
    }, data =>{
        newPage(`export/print/${data}`)
        success("Thành công")
        getData()
    })
}

function change_new(index){
    $("#popup_change_new .modal-footer button:nth-child(2)").attr("onclick",`confirm_change_new(${index})`)
    showPopup('popup_change_new',true,'popup_change_supplier')
}

function success_get_subcategory(data)
{
    arrSubCategory = []
    for(let i =0;i<data.length;i++){
        arrSubCategory.push(data[i])
        $("#popup_change_new .modal-body div:first-child div").append(`<li><a onclick="select_subcategory(${arrSubCategory.length-1})" href="javascript:void(0)">${data[i].subcategory_name}</a></li>`)
    }
}

function select_subcategory(index){
    $("#popup_change_new .modal-body div:first-child div").empty()
    $("#popup_change_new .modal-body div:first-child input").val(arrSubCategory[index].subcategory_name)
    $("#popup_change_new .modal-body div:first-child input").attr("name",arrSubCategory[index]._id)
}

function confirm_change_new(index){
    const id_subcategory = $("#popup_change_new .modal-body div:first-child input").attr("name")
    const id_product2 = $("#popup_change_new .modal-body div:nth-child(2) input").val()
    const id_supplier = arrProduct[index].id_supplier
    const id_warranty = arrProduct[index]._id
    const note = $("#popup_change_new .modal-body div:nth-child(3) input").val()
    if(!id_subcategory){
        info("Hãy nhập tên sản phẩm")
        return
    }

    callAPI('POST',`${API_WARRANTY}/change-new/supplier`,{
        id_subcategory:id_subcategory,
        id_product2:id_product2,
        id_user:id_supplier,
        id_warranty:id_warranty,
        id_product: arrProduct[index].id_product,
        note:note
    }, data =>{
        const id_form = data.insertImport._id
        newPage(`/import/print/${id_form}`)
       
        const arrExcel = [{
            "Mã sản phẩm": data.product._id,
            "Mã phụ": data.product.id_product2?data.product.id_product2:"",
            "Tên sản phẩm": data.product.subcategory_name,
        }]
      
        downloadExcelLocal(arrExcel,"Danh sách mã sản phẩm")

        success("Thành công")
        getData()
    })

}

function change_other(index){
    $("#popup_change_other .close-model").attr("onclick",`showPopup('popup_change_supplier',false,'popup_change_other')`)
    $("#popup_change_other .modal-footer button:nth-child(2)").attr("onclick",`confirm_change_other(${index})`)
    showPopup('popup_change_other',true,'popup_change_supplier')
}

function change_other_customer(index){
    $("#popup_change_other .close-model").attr("onclick",`showPopup('popup_change_customer',false,'popup_change_other')`)
    $("#popup_change_other .modal-footer button:nth-child(2)").attr("onclick",`confirm_change_other_customer(${index})`)
    showPopup('popup_change_other',true,'popup_change_customer')
}


function find_product_id_to_change(data){
    
    $("#popup_change_other .modal-body div:first-child input").val(data._id)
    $("#popup_change_other .modal-body div:nth-child(2) input").val(data.subcategory_name)
}

function confirm_change_other(index){
    const id_product_change = $("#popup_change_other .modal-body div:first-child input").val().trim()
    const id_product = arrProduct[index].id_product
    const id_supplier = arrProduct[index].id_supplier
    const id_warranty = arrProduct[index]._id

    const note = $("#popup_change_other .modal-body div:nth-child(3) input").val()
    if(id_product_change == id_product) {
        info("Không được đổi cùng mã sản phẩm")
        return
    }
    if(id_product_change.length == 0){
        info("Hãy nhập mã sản phẩm")
        return
    }

    hidePopup('popup_change_other')

    callAPI('POST',`${API_WARRANTY}/change-other/supplier`,{
        id_product_change: id_product_change,
        id_product:id_product,
        id_user:id_supplier,
        id_warranty:id_warranty,
        note:note
    }, data =>{
        newPage(`/import/print/${data}`)
        success("Đổi thành công")
        getData()
    })
}

function confirm_change_other_customer(index){
    const id_product_change = $("#popup_change_other .modal-body div:first-child input").val().trim()
    const id_product = arrProduct[index].id_product
    const id_supplier = arrProduct[index].id_supplier
    const id_warranty = arrProduct[index]._id

    const note = $("#popup_change_other .modal-body div:nth-child(3) input").val()
    if(id_product_change == id_product) {
        info("Không được đổi cùng mã sản phẩm")
        return
    }
    if(id_product_change.length == 0){
        info("Hãy nhập mã sản phẩm")
        return
    }

    hidePopup('popup_change_other')

    callAPI('POST',`${API_WARRANTY}/change-other/customer`,{
        id_product_change: id_product_change,
        id_product:id_product,
        id_user:id_supplier,
        id_warranty:id_warranty,
        note:note
    }, data =>{
        newPage(`/export/print/${data}`)
        success("Đổi thành công")
        getData()
    })
}