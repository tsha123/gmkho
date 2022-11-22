

var arrData = [];
getData()
function getData() {
    isLoading();
    callAPI('GET', `${API_BRANCH}?`, null, (data) => {
        drawTable(data)
    })
}

function drawTable(data) {
    $("#divTable").empty()
    $("#divTable").html(`
    <table id="dataTable" class="table table-hover">
        <thead>
        <tr>
            <th>STT</th>
            <th>Tên chi nhánh</th>
            <th>Số điện thoại</th>
            <th>Login in phiếu</th>
            <th>Ảnh</th>
            <th>Chi tiết</th>
        </tr>
        </thead>
        <tbody id="tbodyTable"></tbody>
    </table>`)
    arrData = []
    for (let i = 0; i < data.length; i++) {
        arrData.push(data[i])
        const active = data[i].branch_active?"checked":""
        $("#tbodyTable").append(`
            <tr>
                <td class="center">${i + 1}</td>
                <td>${data[i].branch_name}</td>
                <td>${data[i].branch_phone}</td>
                <td class="text-center">${data[i].branch_logo == null ? "" : `<img src="${URL_IMAGE_BRANCH}${data[i].branch_logo}">`}</td>
                <td class="text-center">${data[i].branch_image == null ? "" : `<img src="${URL_IMAGE_BRANCH}${data[i].branch_image}">`}</td>
                <td class="text-center">
                    <button onclick="editBranch(${i})" class="btn btn-primary"><i class="mdi mdi-tooltip-edit">Chỉnh sửa</i></button>
                </td>
            </tr>
        `)
    }
    dataTable(null, false)
}

function editBranch(index) {

    $("#editName").val(arrData[index].branch_name)
    $("#editPhone").val(arrData[index].branch_phone)
    $("#editAddress").val(arrData[index].branch_address)

    $("#email_edit").val(arrData[index].branch_email)
    
    $("#inputEditLogo").val(null)
    $("#inputEditImage").val(null)

    if (!arrData[index].branch_logo) {
        $(`#logoEdit`).css({ "height": "200px" })
        $("#logoEdit").attr("src", IMAGE_NULL)
        $(`#imageEdit`).css({ "height": "200px" })
        $("#imageEdit").attr("src", IMAGE_NULL)
    }
    else {
        $(`#logoEdit`).css({ "height": "auto" })
        $("#logoEdit").attr("src", URL_IMAGE_BRANCH + arrData[index].branch_logo)

        $(`#imageEdit`).css({ "height": "auto" })
        $("#imageEdit").attr("src", URL_IMAGE_BRANCH + arrData[index].branch_image)

    }
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
    const branch_name = $("#editName").val().trim()
    const branch_phone = $("#editPhone").val().trim()
    const branch_address = $("#editAddress").val().trim()
    const branch_logo = $("#inputEditLogo")[0].files[0];
    const branch_image = $("#inputEditImage")[0].files[0];

    const branch_email = $("#email_edit").val().trim()

    if (branch_name.length == 0) {
        info("Tên chi nhánh không được để trống!")
        return;
    }
    if (typeof branch_logo != 'undefined' && branch_logo.size > MAX_SIZE_IMAGE) {
        info("Ảnh logo có kích thước quá lớn, sẽ ảnh hưởng đến việc in phiếu.")
        return
    }

    const data = new FormData()
    data.append(`branch_email`,branch_email)

    data.append('branch_logo', branch_logo)
    data.append('branch_phone', branch_phone)
    data.append('branch_address', branch_address)
    data.append('branch_image', branch_image)
    data.append('branch_name', branch_name)
    data.append('id_branch', arrData[index]._id)

    hidePopup('popupEdit')
    callAPI('put', `${API_BRANCH}`, data, (data) => {
        success("Thành công")
        getData()
    }, undefined, true)

}

function confirmAdd() {
    const branch_name = $("#addName").val().trim()
    const branch_phone = $("#addPhone").val().trim()
    const branch_address = $("#addAddress").val().trim()
    const branch_logo = $("#inputAddLogo")[0].files[0];
    const branch_image = $("#inputAddImage")[0].files[0];
    const branch_email = $("#email_add").val().trim()

    if (branch_name.length == 0) {
        info("Tên chi nhánh không được để trống!")
        return;
    }
    if (typeof branch_logo != 'undefined' && branch_logo.size > MAX_SIZE_IMAGE) {
        info("Ảnh logo có kích thước quá lớn, sẽ ảnh hưởng đến việc in phiếu.")
        return
    }

    const data = new FormData()
    data.append('branch_logo', branch_logo)
    data.append('branch_phone', branch_phone)
    data.append('branch_address', branch_address)
    data.append('branch_image', branch_image)
    data.append('branch_name', branch_name)
    data.append(`branch_email`,branch_email)

    hidePopup('popupAdd')
    callAPI('post', `${API_BRANCH}`, data, (data) => {
        success("Thành công")
        getData()
    }, undefined, true)

}

function get_ip_wifi(){
    callAPI('GET',`${API_TIMEKEEPING}/check-ipwifi`,null, data=>{
        info(`IP WIFI của bạn là: ${data}`)
    })
}

function change_active(index){

    const branch_active = $(event.target).is(":checked")
    const id_branch = arrData[index]._id
    callAPI('PUT',`${API_BRANCH}/active`,{
        id_branch:id_branch,
        branch_active:branch_active
    },undefined,undefined,undefined,false)
}
