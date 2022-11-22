var offsetEmployee = 1
var arrEmployee = []
var arrData = []
checkPermission()
function checkPermission() {
    callAPI('GET', `${API_BORROW}/checkPermission`, null, data => {
        $(`#selectStatus`).val(borrow_status).change()
        $(`#selectStatus`).attr("onchange",`getData()`)
        data.map(warehouse => {
            var isSelected = ""
            if (warehouse._id == id_warehouse) isSelected = "selected"
            $("#selectWarehouse").append(`<option ${isSelected} value="${warehouse._id}" >${warehouse.warehouse_name}</option>`)
        })
        getData()
    })
   
}

function getData() {
    key = $("#keyFind").val()
    limit = tryParseInt($("#selectLimit").val())
    fromdate = $("#fromdate").val()
    todate = $("#todate").val()
    id_warehouse = $("#selectWarehouse option:selected").val()
   
    borrow_status = $("#selectStatus option:selected").val()
    callAPI('GET', API_BORROW, {
        key: key,
        fromdate: fromdate,
        todate: todate,
        limit: limit,
        page: page,
        id_warehouse: id_warehouse,
        borrow_status:borrow_status
    }, data => {
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&fromdate=${fromdate}&todate=${todate}&id_warehouse=${id_warehouse}&borrow_status=${borrow_status}`)
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
                <td>${formatDate(data[i].createdAt).fulldatetime}</td>
                <td>${data[i].employee_fullname}</td>
                <td  title="${data[i].borrow_product[0].subcategory_name}"><span class="substring">${data[i].borrow_product[0].subcategory_name}</span></td>
                <td>${data[i].borrow_status}</td>
                <td><i onclick="showPopupEdit(${i})" class="fas fa-edit text-warning"></i></td>
            </tr>
        `)
    }
}
 //
function findEmployee(isMore = false) {
    const div = $("#inputFindEmployee").closest('div')
    const spinner = $(div).find('.spinner-border')
    const div_show = $(div).find('div:last-child()')
    const input = $(div).find('input')
    $(input).attr("name")
    $(spinner).show()
    if (isMore) {
        offsetEmployee += 1
    }
    else {
        offsetEmployee = 1
    }

    callAPI('GET', `${API_EMPLOYEE}/info`, {
        key: $(input).val(),
        limit: 5,
        page: offsetEmployee,
        id_branch:true
    }, data => {
        if ($(input).val().trim().length > 0) {
            if (!isMore) {
                $(div_show).empty()
                arrEmployee = []
            }
            
            data.map(employee => {
                
                arrEmployee.push(employee)
                $(div_show).append(`<li><a onclick="selectEmployee(${arrEmployee.length-1})" href="javascript:void(0)">${employee.employee_fullname} &emsp; ${employee.employee_phone} </a></li>`)
            })
        }
        else {
            $(div_show).empty()
        }
        $(spinner).hide()
    }, err => {
        $(spinner).hide()
        errAjax(err)
    },false)
}

function selectEmployee(index) {
    const div = $("#inputFindEmployee").closest('div')
    const spinner = $(div).find('.spinner-border')
    const div_show = $(div).find('div:last-child()')
    const input = $(div).find('input')
    $(div_show).empty()
    $(input).val(arrEmployee[index].employee_fullname)
    $(input).attr("name", arrEmployee[index]._id)
    
    $("#popupAdd input[name=phone_employee]").val(arrEmployee[index].employee_phone)
    $("#popupAdd input[name=address_employee]").val(arrEmployee[index].employee_address)

}

function loadmoreEmployee() {
    const div = $(event.path[0])
    if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        offsetEmployee++
        findEmployee(true)
    }
}
function drawTableAdd() {
    $("#popupAdd table tbody").append(`
        <tr>
            <td>
                <input type="text" onkeypress="findProduct()" placeholder="nhập mã sản phẩm" class="form-control">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </td>
            <td>
                <input class="form-control" placeholder="tên sản phẩm" disabled>
            </td>
            <td><i class="fas fa-trash text-danger" onclick="deleteRowAdd()" ></i></td>
        </tr>
    `)
}

function deleteRowAdd() {
    const tr = $(event.path[0]).closest('tr')
        const tbody = $(event.path[0]).closest('tbody')
    
        if( $(tr).index() != $(tbody).find('tr').length-1 ){
            $(tr).remove()
        }
}

function showPopupAdd() {
    $("#popupAdd table tbody").empty()
    drawTableAdd()
    showPopup('popupAdd',true)
}

function findProduct() {
    if(event.which != 13) return
    const parent = $(event.path[0]).parent()
    const input = $(parent).find('input')[0]
    const spinner = $(parent).find('.spinner-border')

    const supperParent = $(parent).parent()
    const inputName = $(supperParent).find('input:last-child()')
    $(spinner).show()
    callAPI('GET',API_PRODUCT,{
        key:$(input).val(),
    }, data => {
        $(spinner).hide()
        if (data.product_status) {
            info("Sản phẩm này đã xuất kho")
            $(spinner).hide()
            $(input).val(null)
            return
        }
        $(input).val(data._id)
        $(input).prop("disabled",true)
        $(inputName).val(data.subcategory_name)

        drawTableAdd()
    },(data)=>{
        $(spinner).hide()
        errAjax(data) 
    },false,false)
}

function confirmAdd() {
    const id_employee = $("#inputFindEmployee").attr("name")
    if (!id_employee || id_employee.length == 0) {
        info("Hãy chọn nhân viên")
        return
    }

    var arrProduct = []
    const trs = $("#popupAdd tbody tr")
    for (let i = 0; i < trs.length; i++){
        const id_product = $($(trs[i]).find('input:first-child()')).val()
        if (id_product) {
            arrProduct.push(id_product)
        }
    }
    if (arrProduct.length == 0) {
        info("Hãy chọn ít nhất 1 sp")
        return
    }
    const note = $("#input_note").val()
    hidePopup('popupAdd')
    callAPI('POST', API_BORROW, {
        arrProduct: JSON.stringify(arrProduct),
        id_employee:id_employee,
        note:note
    }, data => {
        success("Thành công")
        getData()
    })
}

function showPopupEdit(index) {
   
    $("#popupEdit .info-employee").html(`
        <tr>
            <td>Nhân viên mươn</td>
            <td>${arrData[index].employee_fullname} - SĐT: ${arrData[index].employee_phone}</td>
        </tr>
        <tr>
            <td>Ngày mượn</td>
            <td>${formatDate(arrData[index].createdAt).fulldatetime}</td>
        </tr>
        <tr>
            <td>Trạng thái</td>
            <td>${arrData[index].borrow_status}</td>
        </tr>
        <tr>
            <td>Ngày trả</td>
            <td>${arrData[index].borrow_status == 'Đang mượn'?"":formatDate(arrData[index].updatedAt).fulldatetime }</td>
        </tr>
        <tr>
            <td>Người xuất</td>
            <td>${arrData[index].id_employee_created_fullname}</td>
        </tr>
        <tr>
        <tr>
            <td>Ghi chú</td>
            <td>${arrData[index].borrow_note}</td>
        </tr>
        
    </tr>
    `)
    $("#popupEdit table:last-child() tbody").empty()
    for (let i = 0; i < arrData[index].borrow_product.length; i++){
        $("#popupEdit table:last-child() tbody").append(`
            <tr>
                <td>${i + 1}</td>
                <td>${arrData[index].borrow_product[i].id_product} / ${arrData[index].borrow_product[i].id_product2}</td>
                <td><span class="substring">${arrData[index].borrow_product[i].subcategory_name}</span></td>
                <td>${arrData[index].borrow_product[i].product_status? formatDate(arrData[index].borrow_product[i].product_time_return).fulldatetime:"" }</td>
                <td>${arrData[index].borrow_product[i].product_status?`<b>Đã trả</b>`:`<i title="Cập nhập trả hàng" onclick="updateReturnProduct(${index},'${arrData[index].borrow_product[i].id_product}')" class="fas fa-random btn btn-primary"></i>` }</td>
            </tr>
        `)
    }
    showPopup('popupEdit')
}

function updateReturnProduct(index, id_product) {
    callAPI('PUT', API_BORROW, {
        id_borrow: arrData[index]._id,
        id_product:id_product
    }, data => {
        arrData[index] = {
            ...arrData[index],
            ...data
        }
        showPopupEdit(index)
    })
    
}