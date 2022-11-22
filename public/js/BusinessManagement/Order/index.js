var arrData = []
var id_user = null
var arrSupplier = []
var offsetSubcategory = 1
var arrSubCategory = []
var is_click_discount = false
var money_code_discount = 0 
var money_point = 0
var dataPoint = null
var is_click_point = false
var get_other = true
function getData() {

    key = $("#keyFind").val()
    limit = tryParseInt($("#selectLimit option:selected").val())
    fromdate = $("#fromdate").val()
    todate = $("#todate").val()
    order_status = $("#selectStatus option:selected").val()

    callAPI('GET', API_ORDER, {
        key: key,
        limit: limit,
        fromdate: fromdate,
        todate: todate,
        order_status: order_status,
        page:page,
        get_other:get_other
    }, data => {
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&fromdate=${fromdate}&todate=${todate}&order_status=${order_status}`)

        if(get_other){
            get_other = false
            data.employees.map(item =>{
                $("select[name=select_employee]").append(`<option value="${item._id}">${item.employee_fullname}</option>`)
            })
        }
    })
}
getData()

function drawTable(data) {
    arrData = []
    $("#tbodyTable").empty()
    for (let i = 0; i < data.length; i++){
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].user_fullname}</td>
                <td>SĐT: ${data[i].order_phone}/ ĐC: ${data[i].order_address} </td>
                <td>${formatDate(data[i].createdAt).fulldatetime}</td>
                <td><span class="substring">${data[i].order_product[0].subcategory_name}</span> </td>
                <td>${data[i].order_status}</td>
                <td>${money(calculateMoneyExport(data[i].order_product))}</td>
                <td>
                    <i onclick="showEdit(${i})" class="fas fa-edit text-warning"></i>
                    ${data[i].order_status == "Đang giao hàng"?`<i class="fas fa-upload" title="cập nhập hoàn thành" onclick="showPopupFinish(${i})"></i>`:""}
                    ${!data[i].id_export_form?"":`<i class="fas fa-print text-primary" onclick="newPage('/export/print/${data[i].id_export_form}')"></i>`}
                    ${data[i].id_employee_manager?``:`<i onclick="tranfer_employee(${arrData.length-1})" class="fas fa-exchange-alt"></i>`}
                </td>
            </tr>
        `)
    }
}

function showEdit(index) {
    $("#popupEdit .div-customer").html(`
        <table class="table">
            <tr>
                <td>Khách hàng</td>
                <th>${arrData[index].user_fullname} - SĐT: ${arrData[index].user_phone}</th>
                <td>Thông tin liên hệ</td>
                <th colspan="5">SĐT: ${arrData[index].order_phone} - ĐC: ${arrData[index].order_address}</th>
            </tr>
            <tr>
                <td>Ngày đặt hàng: </td>
                <th>${formatDate(arrData[index].createdAt).fulldatetime}</th>
                <td>Ngày nhận</td>
                <th>${arrData[index].order_status == "Hoàn thành" ? formatDate(arrData[index].createdAt).fulldatetime : ""}</th>
                <td>Mã đơn: </td>
                <th>${arrData[index]._id}</th>
                <td>Mã phiếu xuất:</td>
                <th>${!arrData[index].id_export_form?"":arrData[index].id_export_form}</th>
            </tr>
            <tr>
                <td>Tổng tiền: </td>
                <th>Tổng đơn: ${ money( calculateMoneyExport(arrData[index].order_product))}  &emsp; Đổi điểm: ${arrData[index].money_point} &emsp; Mã giảm giá:  ${arrData[index].money_voucher_code}  => <b>${money(calculateMoneyExport(arrData[index].order_product) - arrData[index].money_point - arrData[index].money_voucher_code)}</b></th>
                <td>Hình thức thanh toán</td>
                <th colspan="5">${arrData[index].fundbook_name}</th>
            </tr>
            <tr>
                <td>Đã thanh toán</td>
                <th>${money(arrData[index].receive_money)}  => Nợ nợ :<span style="color:blue"> ${money(calculateMoneyExport(arrData[index].order_product) - arrData[index].money_point - arrData[index].money_voucher_code - arrData[index].receive_money) }</span></th>
                <td>Ghi chú</td>
                <th colspan="5">${!arrData[index].order_note?"":arrData[index].order_note }</td>
            </tr>
        </table>
    `)

    $("#popupEdit .div-product tbody").empty()
    for (let i = 0; i < arrData[index].order_product.length; i++){
        $("#popupEdit .div-product tbody").append(`
            <tr>
                <td>${i + 1}</td>
                <td class="substring">${arrData[index].order_product[i].subcategory_name}</td>
                <td>${!arrData[index].order_product[i].id_product?"":arrData[index].order_product[i].id_product}/${!arrData[index].id_product2?"":arrData[index].id_product2}</td>
                <td>${money(arrData[index].order_product[i].product_export_price)}</td>
                <td>${money(arrData[index].order_product[i].product_vat)} %</td>
                <td>${money(arrData[index].order_product[i].product_ck)} %</td>
                <td>${money(arrData[index].order_product[i].product_discount)}</td>
                <td>${money(arrData[index].order_product[i].product_quantity)}</td>
            </tr>
        `)
    }
    if (!arrData[index].id_export_form) {
        $("#btnExport").show()
        $("#btnPrint").hide()
        $("#btnExport").attr("onclick",`newPage('/order-management/export/${arrData[index]._id}')`)
    }
    else {
        $("#btnPrint").attr("onclick",`newPage('/export/print/${arrData[index].id_export_form}')`)
        $("#btnPrint").show()
        $("#btnExport").hide()
    }
    showPopup('popupEdit')
}

function showPopupFinish(index) {
    $("#btnSaveStatus").attr("onclick",`confirmUpdateStatus(${index})`)
    showPopup('popupUpdateStatus')
}

function confirmUpdateStatus(index) {
    hidePopup('popupUpdateStatus')
    callAPI('PUT', `${API_ORDER}/status`, {
        id_order:arrData[index]._id
    }, data => {
        success("Thành công")
        getData()
    })
}

function showPopupCreate(){

    $("#popupCreateForm input[type=text]").prop("disabled",false)
    money_code_discount = 0;
    money_point = 0
    id_user = null
    is_click_point = false
    is_click_discount = false

    $("#popupCreateForm .modal-body .div-product tbody").empty()
    drawTableCreadtd()
    showPopup('popupCreateForm',true)
}

function selectSupplier(index){
    id_user = arrSupplier[index]._id
    $("#popupCreateForm .modal-body .row div:first-child input").val(arrSupplier[index].user_fullname)
    $("#popupCreateForm .modal-body .row div:nth-child(2) input").val(arrSupplier[index].user_phone)
    $("#popupCreateForm .modal-body .row div:nth-child(3) input").val(arrSupplier[index].user_address)
    $("#point_current").val(money(arrSupplier[index].user_point))
    $(event.target).parent().parent().empty()

}

function drawTableCreadtd(){
    $("#popupCreateForm .modal-body .div-product tbody").append(`
        <tr>
            <td>
                <input oninput="findSubCategory()" class="form-control" name="" placeholder="Nhập tên sản phẩm . . .">
                <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
                </div>
                <div onscroll="loadmoreSubCategory()" class="div-product"></div>
            </td>
            <td><input value="0" type="text" oninput="changeMoney()" class="number form-control"></td>
            <td><input value="0" type="text" oninput="changeMoney()" class="number form-control"></td>
            <td><input value="0" type="text" oninput="changeMoney()" class="number form-control"></td>
            <td><input value="0" type="text" oninput="changeMoney()" class="number form-control"></td>
            <td><input value="0" type="text" oninput="changeMoney()" class="number form-control"></td>
            <td><input value="0" type="text" oninput="changeMoney()" class="number form-control"></td>
            <td><i class="fas fa-trash text-danger" onclick="deleteRow()"></i></td>
        </tr>
    `)
    formatNumber()
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
    $(input[1]).val(money(arrSubCategory[index].subcategory_export_price_web))
    $(input[2]).val(1)
    $(input[3]).val(money(0))
    $(input[4]).val(money(0))
    $(input[5]).val(money(arrSubCategory[index].subcategory_export_price_web - arrSubCategory[index].subcategory_export_price))
    $(input[6]).val(money(arrSubCategory[index].subcategory_warranty))
    changeMoney()
    drawTableCreadtd()
}

function deleteRow(){
    
    const tr = $(event.target).parent().parent()
    const tbody = $(event.target).parent().parent().parent()

    const trs = $(tbody).find('tr')
    
    if( $(trs).index(tr) != trs.length -1 ){
        $(tr).remove()
    }
    
}
$("#popupCreateForm .div-customer .row div:nth-child(5) button").click( e =>{
    const input = $(event.target).parent().find('input')
    const key = $(input).val().trim()
    if(!key || key.length == 0){
        info("Hãy nhập mã giảm giá")
        return
    }


    callAPI('GET', `${API_VOUCHER}/value`, {
        voucher_code: key,
        totalMoney:calculateMoneyExport(changeMoney())
    }, (data) => {
        
        is_click_discount = true
        money_code_discount = data
        $(input).prop("disabled",true)
        success(`Áp dụng thành công, bạn được giảm ${money(data)}`)

        $("#popupCreateForm .div-product tbody input").prop("disabled",true)
        $("#popupCreateForm .div-product tbody i").attr("onclick",null)
        changeMoney()
    }, (err) => {
        is_click_discount = false
        money_code_discount = 0

        errAjax(err)
    })
})

function changeMoney(){

   
    if(event.type && event.type == 'input' )
        $(event.target).val(money(tryParseInt($(event.target).val())))

    const trs = $("#popupCreateForm tbody tr")
    const arrProduct = []
    for(let i =0 ;i<trs.length; i++){
        const inputs = $(trs[i]).find('input')
        const id_subcategory =  $(inputs[0]).attr("name")
        if(id_subcategory.length == 24){
            const product_export_price = tryParseInt($(inputs[1]).val())
            const product_quantity = tryParseInt($(inputs[2]).val())
            const product_vat = tryParseInt($(inputs[3]).val())
            const product_ck = tryParseInt($(inputs[4]).val())
            const product_discount = tryParseInt($(inputs[5]).val())
            const product_warranty = tryParseInt($(inputs[6]).val())
            arrProduct.push({
                id_subcategory:id_subcategory,
                product_export_price :product_export_price,
                product_quantity :product_quantity,
                product_vat :product_vat,
                product_ck :product_ck,
                product_discount :product_discount,
                product_warranty :product_warranty,
            })
        }
    }
    const total = calculateMoneyExport(arrProduct)

    $("#popupCreateForm .modal-body .div-customer .row div:nth-child(7) .money").html(`Tổng: ${money(total)} &nbsp; Giảm giá: ${money(money_code_discount)} &nbsp; Điểm: ${money(money_point)} => <b>${money(total- money_code_discount - money_point)}</b>`)
    return arrProduct
}

$("#popupCreateForm .div-customer .row div:nth-child(6)").click( e =>{
    getMoneyPoint()
})
function getMoneyPoint() {

    if (!id_user) {
        info("Hãy chọn khách hàng trước khi đổi điểm")
        error_change_point()
        return
    }
    const parent = $(event.target).parent()
    const input = $(parent).find('input')[0]
    $(input).val(money(tryParseInt($(input).val())))
    const point_number = tryParseInt($(input).val())
    if (!dataPoint) {
        callAPI('GET', `${API_POINT}/check`, {
            id_user: id_user,
            point_number:point_number
        }, data => {
            is_click_point = true
            dataPoint = data.dataPoint
            money_point = data.result
            changeMoney()
        }, err => {
            error_change_point()
            errAjax(err)
        })
    }
    else {
        const point_current = tryParseInt($("#point_current").val())
        if (point_number > point_current) {
            info(`Khách hàng không đủ ${point_number} điểm để thực hiện quy đổi`)
            error_change_point()
            return
        }
        money_point = (dataPoint.point_value / dataPoint.point_number) * point_number
        changeMoney()
    }
    
}

function error_change_point() {
    money_point = 0
    $("#input_point").val(0)
    changeMoney()
}

$("#popupCreateForm .modal-footer button:last-child").click(e =>{
    const arrProduct = changeMoney()
    if(arrProduct.length == 0) {
        info("Hãy chọn ít nhất một sản phẩm")
        return
    }
    if(!id_user){
        info("Hãy chọn khách hàng")
        return
    }

    const voucher_code = is_click_discount? $("#popupCreateForm .modal-body .row div:nth-child(5) input").val():null
    const point_number = is_click_point? $("#popupCreateForm .modal-body .row div:nth-child(6) input").val():0

    hidePopup('popupCreateForm')
    callAPI('POST',API_ORDER,{
        id_user:id_user,
        voucher_code:voucher_code,
        point_number:point_number,
        arrProduct: JSON.stringify(arrProduct),
    }, () =>{
        success("Thành công")
        getData()
    })
    
})

function tranfer_employee(index){
    $("#popupTranfer .modal-footer button:last-child").attr("onclick",`confirm_tranfer(${index})`)
    showPopup('popupTranfer')
}

function confirm_tranfer(index){
    const id_employee = $("#select_employee_tranfer option:selected").val()
    if(id_employee.length == 0){
        info("Hãy chọn nhân viên")
        return
    }

    callAPI('PUT',`${API_ORDER}/tranfer-employee-manager`,{
        id_employee:id_employee,
        id_order:arrData[index]._id
    }, data =>{
        hidePopup('popupTranfer')
        success("Thành công")
    })
}