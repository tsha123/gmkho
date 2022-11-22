var id_user = null
var pageSupplier = 1
var arrSupplier = []
var money_code_discount = 0;
var money_point = 0;
var is_click_discount = false
var dataPoint = null
var offsetEmployee = 0
var arrEmployee = []
var dataInternal = {}
checkPermission()

function checkPermission() {
    drawTable()
    callAPI('GET', `${API_INTERNAL_ORDER}/checkPermission/export?`, { id_internal_order: id_internal_order }, (data) => {
        dataInternal = data.dataInternal

        const div_head = $("#div_find_supplier").parent()
        const inputs = $(div_head).find('input')
        $(inputs[0]).val(dataInternal.user_fullname)
        $(inputs[0]).attr("name", dataInternal.from_user)
        $(inputs[1]).val(dataInternal.user_phone)
        $(inputs[2]).val(dataInternal.user_address)
        id_user = dataInternal.from_user
        data.warehouses.map(warehouse => {
            $("#selectWarehouse").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })

        data.fundbooks.map(fund => {
            $("#selectTypePayment").append(`<option value="${fund._id}">${fund.fundbook_name}</option>`)
        })
    })
}


function drawTable() {
    $("#tbodyTable").append(`
    <tr>
        <td>
            <input onkeypress="findProduct()" class="form-control" name="" placeholder="Nhập mã sản phẩm. . .">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </td>
        <td><input class="form-control" placeholder="Tên sp"></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control price" placeholder="Nhập giá nhập . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control vat" placeholder="Nhập VAT . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control ck" placeholder="Nhập Chiết khấu . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control discount" placeholder="Nhập giảm giá. . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control warranty" placeholder="Nhập bảo hành . . ."></td>
        <td>
            <input oninput="findEmployee()" value="" disabled class="form-control" placeholder="Nhập tên nhân viên . . .">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <div onscroll="loadmoreEmployee()" class="div-employee"></div>
        </td>
        <td>
            <input oninput="findEmployee()" disabled value="" class="form-control" placeholder="Nhập tên nhân viên . . .">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <div onscroll="loadmoreEmployee()" class="div-employee"></div>
        </td>
        <td><i onclick="removeRow()" class="mdi mdi-delete-forever"></i></td>
    </tr>
    `)

    const tr = $("#tbodyTable").find('tr')[$("#tbodyTable").find('tr').length - 1]

    $($(tr).find('input')[0]).focus()
    formatNumber()
}


function findSupplier() {

    id_user = null
    const type = event.type
    const div = $("#div_find_supplier")

    const input = $(div).find('input')[0]
    const divLoading = $(div).find('.spinner-border')[0]
    const div_show = $(div).find('div')[1]
    if (type == 'input') pageSupplier = 1
    if (type == 'scroll') pageSupplier++


        if ($(input).val().trim().length > 0) {
            $(divLoading).show()
            callAPI('GET', `${API_USER}/findOther?`, {
                key: $(input).val(),
                limit: 10,
                page: pageSupplier
            }, users => {
                $(divLoading).hide()
                if (type == 'input') {
                    $(div_show).empty()
                    arrSupplier = []
                }

                users.map(user => {
                    $(div_show).append(`
                    <li><a href="javascript:void(0)" onclick="selectSupplier(${arrSupplier.length})" >Tên: ${user.user_fullname} - SĐT: ${user.user_phone}</a></li>
                `)
                    arrSupplier.push(user)
                })
            }, undefined, undefined, false)
        } else {
            $(div_show).empty()
        }

}

function findProduct() {
    if (event.which == 13) {
        const input = $(event.path[0])
        const tr = $(input).closest('tr')
        const key = $(input).val().trim()
        const div_loading = $(input).closest('td').find('div')[0]

        $(div_loading).show()
        callAPI('GET', API_PRODUCT, {
            key: key,
        }, data => {
            console.log(data)
            if (data.product_status) {
                info("Sản phẩm này đã xuất kho")
                $(div_loading).hide()
                $(input).val(null)
                return
            }

            $(div_loading).hide()
            $(input).val(data._id)
            $(input).attr("name", data.subcategory_name)
            $(input).prop("disabled", true)
            let isSame = false
            for (let i = 0; i < dataInternal.interal_order_product.length; i++) {
                if (dataInternal.interal_order_product[i].id_subcategory.toString() == data.id_subcategory.toString()) {
                    isSame = true
                    $($(tr).find('input')[1]).val(money(data.subcategory_name))
                    $($(tr).find('input')[2]).val(money(data.product_import_price))
                    $($(tr).find('input')[3]).val(money(data.subcategory_vat))
                    $($(tr).find('input')[4]).val(money(data.subcategory_ck))
                    $($(tr).find('input')[5]).val(money(data.subcategory_discount))
                    $($(tr).find('input')[6]).val(money(data.subcategory_warranty))
                    break

                }
            }
            if (!isSame) {
                $($(tr).find('input')[1]).val(money(data.subcategory_name))
                $($(tr).find('input')[2]).val(money(data.product_import_price))
                $($(tr).find('input')[3]).val(money(data.subcategory_vat))
                $($(tr).find('input')[4]).val(money(data.subcategory_ck))
                $($(tr).find('input')[5]).val(money(data.subcategory_discount))
                $($(tr).find('input')[6]).val(money(data.subcategory_warranty))
            }

            changeMoney()
            drawTable()
        }, (data) => {
            $(div_loading).hide()
            errAjax(data)
        }, false, false)
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
    var arrProduct = []
    const trs = $("#table-main tbody").find('tr')
    let total = 0
    for (let i = 0; i < trs.length; i++) {

        const inputs = $(trs[i]).find('input')

        const subcategory_name = $(inputs[0]).attr("name")
        if (subcategory_name.length > 0) {
            const subcategory_export_price = $(inputs[2]).val()
            const subcategory_vat = $(inputs[3]).val()
            const subcategory_ck = $(inputs[4]).val()
            const subcategory_discount = $(inputs[5]).val()

            total += totalMoney(subcategory_export_price, subcategory_vat, subcategory_ck, subcategory_discount, 1)
            arrProduct.push({
                subcategory_name: subcategory_name,
                subcategory_export_price: subcategory_export_price,
                subcategory_vat: subcategory_vat,
                subcategory_ck: subcategory_ck,
                subcategory_discount: subcategory_discount,
                money_total: totalMoney(subcategory_export_price, subcategory_vat, subcategory_ck, subcategory_discount, 1),
                subcategory_quantity: 1
            })
        }

    }
    for (let i = 0; i < arrProduct.length; i++) { // gộp mảng sp để vẽ vào bảng bên cạnh
        for (let j = i + 1; j < arrProduct.length; j++) {

            if (arrProduct[i].subcategory_name == arrProduct[j].subcategory_name &&
                arrProduct[i].subcategory_ck == arrProduct[j].subcategory_ck &&
                arrProduct[i].subcategory_vat == arrProduct[j].subcategory_vat &&
                arrProduct[i].subcategory_discount == arrProduct[j].subcategory_discount &&
                arrProduct[i].subcategory_export_price == arrProduct[j].subcategory_export_price
            ) {
                arrProduct[i].subcategory_quantity += arrProduct[j].subcategory_quantity
                arrProduct[i].money_total += arrProduct[j].money_total
                arrProduct.splice(j, 1)
                j--
            }
        }
    }
    $("#tbodySmall").empty()
    for (let i = 0; i < arrProduct.length; i++) {
        $("#tbodySmall").append(`
            <tr>
                <td><span class="substring" title="${arrProduct[i].subcategory_name}">${arrProduct[i].subcategory_name}</span></td>
                <td class="center">${arrProduct[i].subcategory_quantity}</td>
                <td>${money(arrProduct[i].money_total)}</td>
            </tr>
        `)
    }

    $("#totalMoney").val(money(total - money_code_discount))
    const paid = tryParseInt($("#paid").val()) // số tiền đã thanh toán
    $("#debt").val(money(total - money_code_discount - money_point - paid))
    $("#divPagination td[colspan=3] span").html(`Mã giảm giá: ${money(money_code_discount)}         &emsp;&emsp; &emsp;&emsp;     Điểm: ${money(money_point)}`) // hiển thị lại giá đã giảm giá,  tiền đổi điểm
    return total
}

function removeRow() {
    if (!is_click_discount) {
        const tr = $(event.path[0]).closest('tr')
        const tbody = $(event.path[0]).closest('tbody')

        if ($(tr).index() != $(tbody).find('tr').length - 1) {
            $(tr).remove()
            changeMoney()
        }
    }


}



function loadmoreSupplier() {
    const div = $(event.path[0])
    if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        findSupplier()
    }
}

function selectSupplier(index) {
    $($(event.path[0]).closest('div')).empty()
    const div = $("#div_find_supplier").parent()
    id_user = arrSupplier[index]._id
    $($(div).find('input')[0]).val(arrSupplier[index].user_fullname)
    $($(div).find('input')[1]).val(arrSupplier[index].user_phone)
    $($(div).find('input')[2]).val(arrSupplier[index].user_address)
    $($(div).find('input')[3]).val(arrSupplier[index].user_point)
}

function getParent(element, selector) {
    while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
            return element.parentElement
        }
        element = element.parentElement;
    }
}

$("#btnConfirm").click(e => {
    if (!id_user) {
        info("Nhà cung cấp/khách hàng không được để trống")
        return
    }
    let arrProduct = []
    const trs = $("#tbodyTable").find('tr')

    for (let i = 0; i < trs.length; i++) {
        const inputs = $(trs[i]).find('input')

        if ($(inputs[0]).val().length == 24) {

            const id_product = $(inputs[0]).val().trim()
            const product_export_price = tryParseInt($(inputs[2]).val())
            const product_vat = tryParseInt($(inputs[3]).val())
            const product_ck = tryParseInt($(inputs[4]).val())
            const product_discount = tryParseInt($(inputs[5]).val())
            const product_warranty = tryParseInt($(inputs[6]).val())
            const product_quantity = 1
            const id_employee = $(inputs[7]).attr("name")
            const id_employee_setting = $(inputs[8]).attr("name")

            arrProduct.push({
                id_product: id_product,
                product_export_price: product_export_price,
                product_vat: product_vat,
                product_ck: product_ck,
                product_discount: product_discount,
                product_warranty: product_warranty,
                product_quantity: product_quantity,
                id_employee: id_employee,
                id_employee_setting:id_employee_setting
            })

        }

    }
    if (arrProduct.length == 0) {
        info("Hãy chọn ít nhất một sản phẩm")
        return
    }
    const id_fundbook = $("#selectTypePayment option:selected").val().trim()
    if (id_fundbook.length == 0) {
        info("Hãy chọn hình thức thanh toán")
        return
    }
    const code_discount = is_click_discount ? $("#input_code_discount").val().trim() : null
    const point_number = tryParseInt($("#input_point").val())
    const receive_money = tryParseInt($("#paid").val()) // số tiền khách hàng đã trả
    const export_form_note = $("input[name=note]").val()

    hidePopup('popupConfirm')
    callAPI('POST', `${API_INTERNAL_ORDER}/export`, {
        arrProduct: JSON.stringify(arrProduct),
        id_user: id_user,
        receive_money: receive_money,
        export_form_note: export_form_note,
        code_discount: code_discount,
        point_number: point_number,
        type_export: "Xuất hàng để bán",
        id_fundbook: id_fundbook,
        id_internal_order: id_internal_order
    }, (data) => {
        success("Thành công")
        resetPage()
        newPage(`/export/print/${data._id}`)
    })
})

function getValueCodeDiscount() {
    const td = $(event.path[0]).parent()
    const input = $(td).find('input')[0]
    const voucher_code = $($(td).find('input')[0]).val()
    const totalMoney = changeMoney()

    callAPI('GET', `${API_VOUCHER}/value`, {
        voucher_code: voucher_code,
        totalMoney: totalMoney
    }, (data) => {

        is_click_discount = true
        money_code_discount = data
        $(input).prop("disabled", true)
        success(`Áp dụng thành công, bạn được giảm ${money(data)}`)
        disAble()

        changeMoney()
    }, (err) => {
        is_click_discount = false
        money_code_discount = 0
        errAjax(err)
    })
}

function disAble() {
    $("#tbodyTable input").prop("disabled", true)
}

function getMoneyPoint() {

    if (!id_user) {
        info("Hãy chọn khách hàng trước khi đổi điểm")
        error_change_point()
        return
    }
    const parent = $(event.path[0]).parent()
    const input = $(parent).find('input')[0]
    $(input).val(money(tryParseInt($(input).val())))
    const point_number = tryParseInt($(input).val())
    if (!dataPoint) {
        callAPI('GET', `${API_POINT}/check`, {
            id_user: id_user,
            point_number: point_number
        }, data => {
            dataPoint = data.dataPoint
            money_point = data.result
            changeMoney()
        }, err => {
            error_change_point()
            errAjax(err)
        })
    } else {
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
    money_code_discount = 0
    $("#input_point").val(0)
    changeMoney()
}

function findEmployee(isMore = false) {

    const td = $(event.path[0]).parent()
    const input = $(td).find('input')[0]
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
        page: offsetEmployee
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
        } else {
            $(div_employee).empty()
        }
        $(div_loading).hide()
    }, err => {
        $(div_loading).show()
        errAjax(err)
    }, false)
}

function loadmoreEmployee() {
    const div = $(event.path[0])
    if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        offsetEmployee++
        findEmployee(true)
    }
}

function selectEmployee(index) {
    const parent_one = $(event.path[0]).closest('td')
    const input = $(parent_one).find('input')[0]
    const div_employee = $(parent_one).find(".div-employee")[0]
    $(div_employee).empty()
    $(input).val(arrEmployee[index].employee_fullname)
    $(input).attr("name", arrEmployee[index]._id)
    $(input).prop("disabled", true)

}

function resetPage() {

    id_user = null
    pageSupplier = 1
    arrSupplier = []
    money_code_discount = 0;
    money_point = 0;
    is_click_discount = false
    dataPoint = null
    offsetEmployee = 0
    arrEmployee = []
    $("#tbodyTable").empty()
    $(".header-table input").val(null)
    $(".header-table .number").val(0)

    $("#totalMoney").val(0)
    $("#paid").val(0)
    $("input[name=note]").val(null)
    $("#input_code_discount").val(null)
    $("#input_code_discount").prop("disabled", false)
    $("#input_point").prop("disabled", false)
    $("#input_point").val(0)
    drawTable()
    changeMoney()


}