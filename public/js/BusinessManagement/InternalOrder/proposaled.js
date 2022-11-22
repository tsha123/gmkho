checkPermission()
var offsetSubcategory = 1
var arrSubCategory = []
var arrData = []
function checkPermission() {
    callAPI('GET', `${API_INTERNAL_ORDER}/checkPermission`, null, data => {
        
        data.warehouses_of_branch.map(warehouse => {
            var is_selected = ""
            if(warehouse._id.toString() == id_warehouse) is_selected = "selected"
            $("select[name=warehouse]").append(`<option ${is_selected} value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })
        data.warehouses.map(warehouse => {
            $("select[name=to-warehouse]").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })
        getData() 
    })
}

function showPopupAdd() {
    $("#tbodyAdd").empty()
    drawTableAdd()
    showPopup('popupAdd',true)
}
function drawTableAdd(tbody = "#tbodyAdd") {
    $(`${tbody}`).append(`
    <tr>
        <td>
            <input oninput="findProduct(this)" class="form-control" name="" placeholder="Nhập tên sản phẩm . . .">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
            <div onscroll="loadmoreProduct()" class="div-product"></div>
        </td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập giá nhập . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập VAT . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập Chiết khấu . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập số lượng. . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập bảo hành . . ."></td>
        <td><i onclick="removeRow()" class="mdi mdi-delete-forever"></i></td>
    </tr>
    `)
    formatNumber()
}
function loadmoreProduct(){
    const div = $(event.path[0])
    if($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        offsetSubcategory ++
        const key = $($(div).closest('td').find('input')[0]).val().trim()

        const div_loading = $(div).closest('td').find('div')[0]
    
        if(key.length == 0){
            $(div).empty()
            return
        }
    
        $(div_loading).show()
        callAPI('GET',`${API_SUBCATEGORY}/client?`,{
            key:key,
            limit:10,
            page:offsetSubcategory
        }, data =>{
            $(div_loading).hide()
            for(let i =0;i<data.length;i++){
                arrSubCategory.push(data[i])
                $(div).append(`
                    <li><a onclick="selectProduct(${arrSubCategory.length - 1})" href="javascript:void(0)">${data[i].subcategory_name}</a></li>
                `)
            }
        }, (data) => {
            $(div_loading).hide()
            errAjax(data) 
        },false,false)
    }

}
function findProduct(input){
    
    offsetSubcategory = 1
    const key = $(input).val().trim()
    const div_subcategory = $(input).closest('td').find('div')[1]
    const div_loading = $(input).closest('td').find('div')[0]

    if(key.length == 0){
        $(div_subcategory).empty()
        return
    }

    $(div_loading).show()
    callAPI('GET',`${API_SUBCATEGORY}/client?`,{
        key:key,
        limit:10,
        page:offsetSubcategory
    }, data =>{
        $(div_loading).hide()
        arrSubCategory = []
        $(div_subcategory).empty()

        for(let i =0;i<data.length;i++){
            arrSubCategory.push(data[i])
            $(div_subcategory).append(`
                <li><a onclick="selectProduct(${arrSubCategory.length - 1})" href="javascript:void(0)">${data[i].subcategory_name}</a></li>
            `)
        }
    },(data)=>{
        $(div_loading).hide()
        errAjax(data) 
    },false,false)
}
function selectProduct(index){

    const tr = $(event.path[0]).closest('tr')
    const tbody = $(event.path[0]).closest('tbody')
    const td = $(event.path[0]).closest('td')
    $(td).find('.div-product').empty()
    $($(tr).find('input')[0]).val(arrSubCategory[index].subcategory_name)
    $($(tr).find('input')[0]).attr("name",arrSubCategory[index]._id)
    $($(tr).find('input')[0]).prop("disabled",true)
    $($(tr).find('input')[1]).val(money(arrSubCategory[index].subcategory_import_price))
    $($(tr).find('input')[2]).val(money(arrSubCategory[index].subcategory_vat))
    $($(tr).find('input')[3]).val(money(arrSubCategory[index].subcategory_ck))
    if($($(tr).find('input')[4]).val() == 0){
        $($(tr).find('input')[4]).val(1)
    }
    $($(tr).find('input')[5]).val(arrSubCategory[index].subcategory_warranty)

    changeMoney()
    if ($(tr).index() == $(tbody).find('tr').length - 1) {
        const idTabody = $(tbody).attr("id")
        drawTableAdd(`#${idTabody}`)
    }
}

function changeMoney() {
    
    const classes_input = $(event.path[0]).attr("class")
    if (typeof classes_input != 'undefined' && classes_input.includes('number')) {
        const input = $(event.path[0])
        if ($(input).val().trim().length == 0) {
            $(input).val(0)
        }
        $(input).val(money(tryParseInt($(input).val())))
    }
    const trs = $("#tbodyAdd").find('tr')
    let total = 0
    for(let i = 0 ;i <trs.length;i++){
        const inputs = $(trs[i]).find('input')
        const import_price = $(inputs[1]).val()
        const vat = $(inputs[2]).val()
        const ck = $(inputs[3]).val()
        const number = $(inputs[4]).val()
        const discount = 0

        total += totalMoney(import_price, vat, ck, discount, number)
    }

    $(".div-note tr:first-child th:last-child").html(money(total))
    
}

function removeRow(){
    const tr = $(event.path[0]).closest('tr')
    const tbody = $(event.path[0]).closest('tbody')

    if( $(tr).index() != $(tbody).find('tr').length-1 ){
        $(tr).remove()
        changeMoney()
    }
    
}

function confirmProposal() {
    const from_warehouse = $("#popupAdd select[name=warehouse] option:selected").val()
    const to_warehouse = $("#popupAdd select[name=to-warehouse] option:selected").val()
   
    var arrProduct = []
    const trs = $("#tbodyAdd").find('tr')
    for (let i = 0; i < trs.length; i++){
        const inputs = $(trs[i]).find('input')


        const id_subcategory = $(inputs[0]).attr("name")
        if (id_subcategory) {


            arrProduct.push({
                id_subcategory: id_subcategory,
                subcategory_export_price: tryParseInt($(inputs[1]).val()),
                subcategory_vat: tryParseInt($(inputs[2]).val()),
                subcategory_ck: tryParseInt($(inputs[3]).val()),
                subcategory_quantity: tryParseInt($(inputs[4]).val()),
                subcategory_warranty: tryParseInt($(inputs[5]).val()),
            })
        }
    }
    if (arrProduct.length == 0) {
        info("Hãy nhập ít nhất 1 sp")
    }
    hidePopup('popupAdd')
    const internal_order_note = $("#popupAdd textarea").val()
    callAPI('POST', API_INTERNAL_ORDER, {
        arrProduct: JSON.stringify(arrProduct),
        from_warehouse: from_warehouse,
        to_warehouse: to_warehouse,
        internal_order_note:internal_order_note
    }, data => {
        success("Thành công")
        getData()
    })
}

function getData() {

    limit = tryParseInt($("#selectLimit").val())
    key = $("#keyFind").val()
    fromdate = $("#fromdate").val()
    todate = $("#todate").val()
    id_warehouse = $("#selectWarehouse option:selected").val()
    const status = $("#selectStatus option:selected").val()
    callAPI('GET', API_INTERNAL_ORDER, {
        limit:limit,
        key:key,
        fromdate:fromdate,
        todate:todate,
        to_warehouse:id_warehouse,
        interal_order_status: status,
        page:page
    }, data => {
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&id_warehouse=${id_warehouse}&fromdate=${fromdate}&todate=${todate}`)
    })
}

function drawTable(data) {
    arrData = []
    $("#tbodyTable").empty()
    for (let i = 0; i < data.length; i++){
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i]._id}</td>
                <td>${formatDate( data[i].createdAt).fulldatetime}</td>
                <td>${data[i].fromWarehouse[0].warehouse_name}</td>
                <td>${data[i].toWarehouse[0].warehouse_name}</td>
                <td>${data[i].interal_order_product.length > 0 ? data[i].interal_order_product[0].subcategory_name : ""}</td>
                <td>${$(`#selectStatus option[value='${data[i].interal_order_status}']`).text()}</td>
                <td>
                    <i onclick="showEdit(${i})" class="fas fa-edit text-primary"></i>
                </td>
            </tr>
        `)
    }

}

function findData() {
    if (event.which == 13) {
        getData()
    }
}
function showEdit(index) {
    $("#div_proposal").show()
    $("#div_export").hide()
    $("#tabProposal").addClass("active")
    $("#tabExport").removeClass("active")
    $("#tabProposal").attr("onclick", `showEdit(${index})`)
    $("#tabExport").attr("onclick", `detailTabExport(${index})`)
    
    if (arrData[index].id_export_form) {
        $("#btnPrintExport").attr("onclick", `newPage('/export/print/${arrData[index].id_export_form}')`)
        $("#btnPrintExport").show()
        
    }
    else {
        $("#btnPrintExport").hide()
    }
    const table_info = $("#popupEdit").find('table')[0]
    $(table_info).html(`
        <tr>
            <th>Mã phiếu</th>
            <th>${arrData[index]._id}</th>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <th>Ngày đề xuất</th>
            <td>${formatDate(arrData[index].createdAt).fulldatetime}</td>
            <th>Ngày xuất</th>
            <td>${ arrData[index].interal_order_status != "Chưa xử lý"? formatDate(arrData[index].updatedAt).fulldatetime:""}</td>
        </tr>
        <tr>
            <th>Người tạo</th>
            <td>${arrData[index].from_employee_name}</td>
            <th>Người xuất</th>
            <td>${arrData[index].to_employee_name}</td>
        </tr>
        <tr>
            <th>Tổng giá trị</th>
            <td class="text-danger"><b>${money(totalMoneyProduct(arrData[index].interal_order_product))}</b></td>
            <th></th>
            <th></th>
        </tr>
        <tr>
            <th>Ghi chú</th>
            <td colspan="3"><b>${arrData[index].internal_order_note}</b></td>
        </tr>
    `)
   
    $("#tbodyEdit").empty()
    const isAbled = arrData[index].interal_order_status == "Chưa xử lý" ? "" : "disaled"
    for (let i = 0; i < arrData[index].interal_order_product.length; i++){
        const product = arrData[index].interal_order_product[i]
        $("#tbodyEdit").append(`
            <tr>
                <td>
                    <input oninput="findProduct(this)" class="form-control" disabled value="${product.subcategory_name}" name="${product.id_subcategory}" placeholder="Nhập tên sản phẩm . . .">
                    <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                    </div>
                    <div onscroll="loadmoreProduct()" class="div-product"></div>
                </td>
                <td><input ${isAbled} oninput="changeMoney()" value="${money(product.subcategory_export_price)}" class="number form-control" placeholder="Nhập giá nhập . . ."></td>
                <td><input ${isAbled} oninput="changeMoney()" value="${money(product.subcategory_vat)}" class="number form-control" placeholder="Nhập VAT . . ."></td>
                <td><input ${isAbled} oninput="changeMoney()" value="${money(product.subcategory_ck)}" class="number form-control" placeholder="Nhập Chiết khấu . . ."></td>
                <td><input ${isAbled} oninput="changeMoney()" value="${money(product.subcategory_quantity)}" class="number form-control" placeholder="Nhập số lượng. . ."></td>
                <td><input ${isAbled} oninput="changeMoney()" value="${money(product.subcategory_warranty)}" class="number form-control" placeholder="Nhập bảo hành . . ."></td>
                <td><i ${isAbled} onclick="removeRow()" class="mdi mdi-delete-forever"></i></td>
            </tr>
        `)
    }
    if (arrData[index].interal_order_status == "Chưa xử lý") {
        $("#btnSaveEdit").attr("onclick", `confirmEdit(${index})`)
        $("#btnExport").attr("href", `/internal-order-management/export/${arrData[index]._id}`)
        $("#btnExport").show()
        drawTableAdd("#tbodyEdit")
    }
    else {
        $("#btnSaveEdit").hide()
        $("#btnExport").hide()
    }
   
    formatNumber()
    showPopup('popupEdit')
}

function totalMoneyProduct(data) {
    let total = 0
    if (Array.isArray(data)) {
        data.map(product => {
            total += totalMoney(product.subcategory_export_price, product.subcategory_vat, product.subcategory_ck, product.subcategory_discount, product.subcategory_quantity)
        })
    }
    else {
        total += totalMoney(data.subcategory_export_price, data.subcategory_vat, data.subcategory_ck, data.subcategory_discount, data.subcategory_quantity)
    }
    return total
}

function confirmEdit(index) {
    var arrProduct = []
    const trs = $("#tbodyEdit").find('tr')
    for (let i = 0; i < trs.length; i++){
        const inputs = $(trs[i]).find('input')


        const id_subcategory = $(inputs[0]).attr("name")
        if (id_subcategory) {


            arrProduct.push({
                id_subcategory: id_subcategory,
                subcategory_export_price: tryParseInt($(inputs[1]).val()),
                subcategory_vat: tryParseInt($(inputs[2]).val()),
                subcategory_ck: tryParseInt($(inputs[3]).val()),
                subcategory_quantity: tryParseInt($(inputs[4]).val()),
                subcategory_warranty: tryParseInt($(inputs[5]).val()),
            })
        }
    }
    if (arrProduct.length == 0) {
        info("Hãy nhập ít nhất 1 sp")
    }
   
    hidePopup('popupEdit')
    callAPI('PUT', API_INTERNAL_ORDER, {
        arrProduct: JSON.stringify(arrProduct),
        id_internal_order:arrData[index]._id
    }, data => {
        success("Thành công")
        getData()
    })
}

function remove_form(index) {
    $("#btnDelete").attr("onclick", `confirmDelete(${index})`)
    showPopup('popupDelete')
}
function confirmDelete(index) {
    hidePopup('popupDelete')
    callAPI('delete', API_INTERNAL_ORDER, {
        id_internal_order:arrData[index]._id
    }, data => {
        success("Thành công")
        getData()
    })
}
function detailTabExport(index) {
   

    if (!arrData[index].id_export_form) {
        info("Phiếu này chưa được xuất kho")
        return
    }
    $("#div_proposal").hide()
    $("#div_export").show()
    $("#tabProposal").removeClass("active")
    $("#tabExport").addClass("active")
    callAPI('GET', API_EXPORT, {
        key:arrData[index].id_export_form
    }, data => {
       
        if (data.data.length > 0) {
            drawTabExport(data.data[0])
        }
        else {
            info("Không tìm thấy phiếu xuáta")
            return 
        }
    })

}
function drawTabExport(data) {
        
    const tableCustomer = $("#tableCustomerExport")
    const tbodyProduct = $("#tableProductTabeExport tbody")

    $(tableCustomer).empty()
    $(tbodyProduct).empty()
    $(tableCustomer).append(`
        <tr>
            <th>Mã phiếu</th>
            <td>${data._id}</td>
        </tr>
        <tr>
            <th>Khách hàng</th>
            <td><b>Tên </b>: ${data.user_fullname} &nbsp; &nbsp; <b> SĐT</b>: ${data.user_phone}  &nbsp; &nbsp; &nbsp;<b> Địa chỉ:</b> ${data.user_address} </td>
        </tr>
        <tr>
            <th>Ngày tạo phiếu</th>
            <td>${formatDate(data.createdAt).fulldatetime}</td>
        </tr>
        <tr>
            <th>Tổng tiền</th>
            <td >${money(calculateMoneyExport(data.export_form_product))}</td>
        </tr>
        <tr>
            <th>Đã thanh toán</th>
            <td >${data.fundbook_name}:${money(data.receive_form_money)} &emsp; Mã giảm giá: ${money(data.money_voucher_code)}&emsp; Đổi điểm: ${money(data.money_point)}</td>
        </tr>
        <tr>
            <th>Còn nợ</th>
            <td>${money(calculateMoneyExport(data.export_form_product)- data.receive_form_money - data.money_voucher_code-data.money_point)}</td>
        </tr>
        <tr>
            <th>HT thanh toán</th>
            <td>${data.fundbook_name}</td>
        </tr>
        <tr>
            <th>Ghi chú</th>
            <td>${data.export_form_note}</td>
        </tr>
   
    `)
    $("input[name=note]").val(data.export_form_note)
    const isable = "disabled"
    for (let i = 0; i < data.export_form_product.length; i++){
        
        $(tbodyProduct).append(`
            <tr>
                <td>${i+1}</td>
                <td>${data.export_form_product[i].subcategory_name}</td>
                <td>${data.export_form_product[i].id_product}/${data.export_form_product[i].id_product2 ? data.export_form_product[i].id_product2 : ""}</td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(data.export_form_product[i].product_export_price)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(data.export_form_product[i].product_vat)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(data.export_form_product[i].product_ck)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(data.export_form_product[i].product_quantity)}" disabled></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(data.export_form_product[i].product_warranty)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(data.export_form_product[i].product_discount)}" ></td>

                <td>${money(calculateMoneyExport(data.export_form_product[i]))}</td>
            </tr>
        `)
    }
   
    formatNumber()
}