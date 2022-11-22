var arrData = []
var isOther = true
var arrAccounting = []
var arrSupplier = []
var id_user = null
getData()

function getData() {
    limit = tryParseInt($("#selectLimit option:selected").val())
    key = $("#keyFind").val()
    fromdate = $("#fromdate").val()
    todate = $("#todate").val()
    const from_money = !$("#from_money").val() ? '' : tryParseInt($("#from_money").val())
    const to_money = !$("#to_money").val() ? '' : tryParseInt($("#to_money").val())
    const accounting_id = $("#find_select_accounting option:selected").val()
    callAPI('GET', API_PAYMENT, {
        isOther: isOther,
        limit: limit,
        page: page,
        fromdate: fromdate,
        todate: todate,
        from_money: from_money,
        to_money: to_money,
        key: key,
        accounting_id:accounting_id
    }, data => {

        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&fromdate=${fromdate}&todate=${todate}`)
        if (isOther) {
            isOther = false
            data.accountingentries.map(account => {
                $("select[name=select_accounting]").append(`<option value="${account._id}">${account.accounting_entry_name}</option>`)
                arrAccounting.push(account)
            })

            data.fundbooks.map(fund => {
                $("select[name=select_fundbook]").append(`<option value="${fund._id}">${fund.fundbook_name}</option>`)
            })
        }
        drawTable(data.data)
    })
}

function drawTable(data) {

    arrData = []
    $("#tbodyTable").empty()
    for (let i = 0; i < data.length; i++) {
        data[i].name_content = ""
        for (let j = 0; j < arrAccounting.length; j++) {
            if (data[i].payment_content == arrAccounting[j]._id) {
                data[i].name_content = arrAccounting[j].accounting_entry_name
                break
            }
        }
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i]._id}</td>
                <td>${formatDate(data[i].createdAt).fulldatetime}</td>
                <td>${data[i].user_fullname} - ${data[i].user_phone}</td>
                <td>${data[i].name_content}</td>
                <td class="right">${money(data[i].payment_money)}</td>
                <td>
                    <i onclick="showEdit(${i})" class="fas fa-edit text-warning"></i>
                    <i onclick="newPage('/payment/print/${data[i]._id}')" class="fas fa-print text-primary"></i>
                    <i class="fas fa-trash text-danger" onclick="delete_payment(${i})"></i>
                </td>
            </tr>
        `)
    }
}

function showEdit(index) {
    $("#popupEdit tr:first-child th:nth-child(2)").html(`Tên KH: ${arrData[index].user_fullname} - SĐT: ${arrData[index].user_phone}-  Địa chỉ: ${arrData[index].user_address}`)
    $("#popupEdit tr:nth-child(2) th:nth-child(2)").html(`${formatDate(arrData[index].createdAt).fulldatetime}`)
    $("#popupEdit tr:nth-child(3) th:nth-child(2)").html(`${arrData[index].employee_fullname}`)
    $("#popupEdit select[name=select_fundbook]").val(arrData[index].id_fundbook).change()
    $("#popupEdit select[name=select_accounting]").val(arrData[index].payment_content).change()
    $("#popupEdit tr:nth-child(6) input").val(money(arrData[index].payment_money))
    $("#popupEdit tr:nth-child(7) input").val(arrData[index].payment_note)

    var source = ""
    if (arrData[index].payment_type == "export") source = `Phiếu xuất , mã phiếu xuất ${arrData[index].id_form}`
    if (arrData[index].payment_type == "import") source = `Phiếu nhập , mã phiếu nhập ${arrData[index].id_form}`
    $("#popupEdit tr:nth-child(8) th:nth-child(2)").html(source)
    $("#btnSaveEdit").attr("onclick", `confirmEdit(${index})`)
    showPopup('popupEdit')

}

function confirmEdit(index) {
    hidePopup('popupEdit')
    const id_fundbook = $("#popupEdit select[name=select_fundbook] option:selected").val()
    const payment_content = $("#popupEdit select[name=select_accounting] option:selected").val()
    const payment_money = tryParseInt($("#popupEdit tr:nth-child(6) input").val())
    const payment_note = $("#popupEdit tr:nth-child(7) input").val()
    callAPI('put', API_PAYMENT, {
        id_fundbook: id_fundbook,
        payment_content: payment_content,
        payment_money: payment_money,
        payment_note: payment_note,
        id_payment: arrData[index]._id,

    }, data => {
        success("Thành công")
        getData()
    })
}

function selectSupplier(index) {
    $($(event.path[0]).closest('div')).empty()
    $("#div_find_supplier input").val(arrSupplier[index].user_fullname)
    $("#div_find_supplier input").attr("name", arrSupplier[index]._id)
    id_user = arrSupplier[index]._id

}

function confirmSave() {
    if (!$("#div_find_supplier input").val() || !id_user) {
        info("Khách hàng không được để trống")
        return
    }
    hidePopup('popupAdd')
    const id_fundbook = $("#popupAdd select[name=select_fundbook] option:selected").val()
    const payment_content = $("#popupAdd select[name=select_accounting] option:selected").val()
    const payment_money = tryParseInt($("#popupAdd tr:nth-child(4) input").val())
    const payment_note = $("#popupAdd tr:nth-child(5) input").val()
    callAPI('post', API_PAYMENT, {
        id_fundbook: id_fundbook,
        payment_content: payment_content,
        payment_money: payment_money,
        payment_note: payment_note,
        id_user: id_user

    }, data => {
        success("Thành công")
        getData()
    })
}

function delete_payment(index) {
    $("#popupDelete .modal-footer button:last-child").attr("onclick", `confirm_delete(${index})`)
    showPopup('popupDelete')
}

function confirm_delete(index) {
    callAPI('DELETE', API_PAYMENT, {
        id_payment: arrData[index]._id
    }, () => {
        success()
        getData()
    })
}

function confirmAddUser() {
    const inputs = $("#popupAddUser input")
    const user_phone = $(inputs[0]).val().trim()
    const user_fullname = $(inputs[1]).val().trim()
    const user_birthday = $(inputs[2]).val().trim()
    const user_gender = $("#popupAddUser select option:selected").val()
    const password = $(inputs[3]).val().trim().length > 0 ? sha512($(inputs[3]).val().trim()).toString() : null
    const user_email = $(inputs[4]).val().trim()
    const user_address = $(inputs[5]).val().trim()

    if (user_phone.length == 0) {
        info("Số điện thoại không được để trống")
        return
    }
    if (user_fullname.length == 0) {
        info("Tên khách hàng không được để trống")
        return
    }
    hidePopup('popupAddUser')
    callAPI('POST', API_USER, {
        data: JSON.stringify({
            user_phone: user_phone,
            user_fullname: user_fullname,
            user_birthday: user_birthday,
            user_gender: user_gender,
            user_password: password,
            user_email: user_email,
            user_address: user_address
        })
    }, data => {
        success("Thêm thành công")
        id_user = data._id
        $("#div_find_supplier input").val(data.user_fullname)
        $("#div_find_supplier input").attr("name", id_user)
        showPopup('popupAdd')

    })
}