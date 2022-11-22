var arrData = [];
var getAllUser = true;

getData()

function getData(isLoad = true) {
   
    if (!getAllUser) {
        id_employee_group = $("#selectEmployeeGroup option:selected").val()
    }

    limit = $("#selectLimit option:selected").val();
    key = $("#keyFind").val()

    callAPI('GET', `${API_EMPLOYEE}?`, {
        limit: tryParseInt(limit),
        page: tryParseInt(page),
        key: key,
        id_employee_group: id_employee_group,
        getGroup: getAllUser
    }, (data) => {
        drawTable(data.data);
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&id_employee_group=${id_employee_group}`)

        if (getAllUser) {
            data.arrGroup.forEach(group => {
                if (group._id == id_employee_group)
                    $("select[name=selectGroup]").append(`<option value="${group._id}" selected>${group.employee_group_name}</option>`)
                else $("select[name=selectGroup]").append(`<option value="${group._id}">${group.employee_group_name}</option>`)

            })
            data.supperGroup.forEach(supper_group => {
                $("select[name=supper_group]").append(`<option value="${supper_group._id}" selected>${supper_group.employee_super_group_name}</option>`)

            })
            getAllUser = false
        }
    },undefined,undefined,isLoad)
}



function drawTable(data) {
    $("#tbodyTable").empty()
    arrData = []
    for (let i = 0; i < data.length; i++) {
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt + i}</td>
                <td>${data[i].employee_fullname}</td>
                <td>${data[i].employee_phone}</td>
                <td>${data[i].employee_address}</td>
                <td>${data[i].employee_group_name}</td>
                <td>${data[i].employee_status ? "Đang hoạt động" : "Đã nghỉ"}</td>
                <td><button onclick="showPopupEdit(${i})" class="btn btn-primary"><i class="mdi mdi-information"></i> Chi tiết</button></td>
            </tr>
        `)
    }
}

function showPopupEdit(index) {
    $("#editName").val(arrData[index].employee_fullname)
    $("#editPhone").val(arrData[index].employee_phone)
    $("#editAddress").val(arrData[index].employee_address)
    $("#editBanknumber").val(arrData[index].employee_bank_number)
    $("#editBankname").val(arrData[index].employee_bank_name)
    $("#editSelectGroup").val(arrData[index].id_employee_group).change()
    $("#editLevel").val(arrData[index].employee_level)
    $("#editSalary").val(money(arrData[index].employee_salary))
    $("#editSalaryDuty").val(money(arrData[index].employee_salary_duty))
    $("#editLunchAllowance").val(money(arrData[index].employee_lunch_allowance))
    $("#editPercent").val(money(arrData[index].employee_revenue_percent))

    $(`input[type=radio][name=editStatus][value="${arrData[index].employee_status}"]`).prop('checked', true)

    if (!arrData[index].employee_image) $("#imageEdit").attr("src", IMAGE_NULL)
    else $("#imageEdit").attr("src", URL_IMAGE_EMPLOYEE + arrData[index].employee_image)
    $("#inputEditImage").val(null)
    $("#editPassword").val(null)
    $("#edit_select_branch").val(arrData[index].id_branch).change()
    $("#confirmEdit").attr("onclick", `confirmEdit(${index})`)
    showPopup('popupEdit')
}

function changeImage(input) {
    $(`#${input}`).click()
}

function paste_Image(input, image) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $(`#${image}`).css({ "height": "auto" })
            $(`#${image}`).attr("src", e.target.result)
        }
        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
}

function confirmEdit(index) {
    const employee_fullname = $("#editName").val().trim()
    const employee_phone = $("#editPhone").val().trim()
    const employee_address = $("#editAddress").val().trim()
    const employee_bank_number = $("#editBanknumber").val().trim()
    const employee_bank_name = $("#editBankname").val().trim()
    const id_employee_group = $("#editSelectGroup option:selected").val().trim()
    const employee_level = $("#editLevel").val().trim()
    const employee_salary = tryParseInt($("#editSalary").val())
    const employee_salary_duty = tryParseInt($("#editSalaryDuty").val())
    const employee_lunch_allowance = tryParseInt($("#editLunchAllowance").val())
    const password = $("#editPassword").val().trim().length == 0 ? null : sha512($("#editPassword").val().trim())
    const employee_revenue_percent = isNaN(parseFloat($("#editPercent").val())) ? 0 : parseFloat($("#editPercent").val())
    const employee_status = $(`input[type=radio][name=editStatus]:checked`).val()
    const employee_image = $("#inputEditImage")[0].files[0];
    const id_branch = $("#edit_select_branch option:selected").val()
    if (!employee_fullname) {
        info("Tên nhân viên không được để trống")
        return
    }
    if (!employee_phone) {
        info("Số điện thoại")
        return
    }
    var data = new FormData()
    data.append('employee_fullname', employee_fullname)
    data.append('employee_phone', employee_phone)
    data.append('employee_address', employee_address)
    data.append('employee_bank_number', employee_bank_number)
    data.append('employee_bank_name', employee_bank_name)
    data.append('id_employee_group', id_employee_group)
    data.append('employee_level', employee_level)
    data.append('employee_salary', employee_salary)
    data.append('employee_salary_duty', employee_salary_duty)
    data.append('employee_lunch_allowance', employee_lunch_allowance)
    data.append('password', password)
    data.append('employee_revenue_percent', employee_revenue_percent)
    data.append('employee_image', employee_image)
    data.append('employee_status', employee_status)
    data.append('id_employee', arrData[index]._id)
    data.append('id_branch', id_branch)

    hidePopup('popupEdit')
    callAPI('PUT', `${API_EMPLOYEE}`, data, () => {
        success("Thành công")
        getData()
    }, undefined, true)

}

function confirmAdd() {
    const employee_fullname = $("#addName").val().trim()
    const employee_phone = $("#addPhone").val().trim()
    const employee_address = $("#addAddress").val().trim()
    const employee_bank_number = $("#addBanknumber").val().trim()
    const employee_bank_name = $("#addBankname").val().trim()
    const id_employee_group = $("#addSelectGroup option:selected").val().trim()
    const employee_level = $("#addLevel").val().trim()
    const employee_salary = tryParseInt($("#addSalary").val())
    const employee_salary_duty = tryParseInt($("#addSalaryDuty").val())
    const employee_lunch_allowance = tryParseInt($("#addLunchAllowance").val())
    const password = $("#addPassword").val().trim().length == 0 ? null : sha512($("#addPassword").val().trim())
    const employee_revenue_percent = isNaN(parseFloat($("#addPercent").val())) ? 0 : parseFloat($("#addPercent").val())
    // const employee_status =  $(`input[type=radio][name=addStatus]:checked`).val()
    const employee_image = $("#inputAddImage")[0].files[0];
    if (!employee_fullname) {
        info("Tên nhân viên không được để trống")
        return
    }
    if (!employee_phone) {
        info("Số điện thoại")
        return
    }
    var data = new FormData()
    data.append('employee_fullname', employee_fullname)
    data.append('employee_phone', employee_phone)
    data.append('employee_address', employee_address)
    data.append('employee_bank_number', employee_bank_number)
    data.append('employee_bank_name', employee_bank_name)
    data.append('id_employee_group', id_employee_group)
    data.append('employee_level', employee_level)
    data.append('employee_salary', employee_salary)
    data.append('employee_salary_duty', employee_salary_duty)
    data.append('employee_lunch_allowance', employee_lunch_allowance)
    data.append('password', password)
    data.append('employee_revenue_percent', employee_revenue_percent)
    data.append('employee_image', employee_image)
    // data.append('employee_status',employee_status)

    hidePopup('popupAdd')
    callAPI('post', `${API_EMPLOYEE}`, data, () => {
        success("Thành công")
        getData()
    }, undefined, true)

}

function confirm_add_group(){
    const group_name = $("#popupAddGroup .modal-body input[type=text]").val().trim()
    const id_supper = $("#popupAddGroup .modal-body select[name=supper_group] option:selected").val()

    if(group_name.length == 0){
        info("Tên chức danh không được trống!")
        return
    }
    hidePopup('popupAddGroup')
    callAPI('POST',`${API_EMPLOYEE}/add-group`,{
        group_name:group_name,
        id_supper:id_supper
    }, ()=>{
        success("Thành công")
        location.reload()
    })
}