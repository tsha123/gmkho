var arrData = [];

getData()

function getData()
{
    callAPI('GET',`${API_WAREHOUSE}?`,null, (data)=>{
        drawTable(data)
    })
}

function drawTable(data)
{
    $("#divTable").empty()
    $("#divTable").html(`
    <table id="dataTable" class="table table-hover">
        <thead>
        <tr>
            <th>STT</th>
            <th>Tên kho</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Trạng thái</th>
            <th>Chi tiết</th>
        </tr>
        </thead>
        <tbody id="tbodyTable"></tbody>
    </table>`)
    arrData = []
    for(let i =0;i<data.length;i++)
    {
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${i+1}</td>
                <td>${data[i].warehouse_name}</td>
                <td>${data[i].warehouse_phone}</td>
                <td>${data[i].warehouse_address}</td>
                <td>${data[i].warehouse_status?"Đang hoạt động":"Đã dừng hoạt động"}</td>

                <td>
                    <button onclick="editWarehouse(${i})" class="btn btn-primary"><i class="mdi mdi-tooltip-edit">Chỉnh sửa</i></button>
                </td>
            </tr>
        `)
    }
    dataTable(null,false)
}

function editWarehouse(index)
{
    $("#editName").val(arrData[index].warehouse_name)
    $("#editPhone").val(arrData[index].warehouse_phone)
    $("#editAddress").val(arrData[index].warehouse_address)
    $(`input[type=radio][value=${arrData[index].warehouse_status}]`).prop("checked",true)
    $("#btnConfirmEdit").attr("onclick",`confirmEdit(${index})`)
    showPopup('popupEdit')
}



function confirmEdit(index)
{
    const warehouse_name = $("#editName").val().trim()
    const warehouse_phone = $("#editPhone").val().trim()
    const warehouse_address = $("#editAddress").val().trim()
    const warehouse_status = $(`input[type=radio]:checked`).val()
    if(warehouse_name.length == 0)
    {
        info("Tên kho không được để trống!")
        return ;
    }
   
    hidePopup('popupEdit')
    callAPI('PUT',`${API_WAREHOUSE}`,{
        warehouse_name:warehouse_name,
        warehouse_phone:warehouse_phone,
        warehouse_address:warehouse_address,
        warehouse_status:warehouse_status,
        id_warehouse:arrData[index]._id
    }, ()=>{
        success("Thành công")
        getData()
    })
}

function confirmAdd()
{
    const warehouse_name = $("#addName").val().trim()
    const warehouse_phone = $("#addPhone").val().trim()
    const warehouse_address = $("#addAddress").val().trim()
    
    if(warehouse_name.length == 0)
    {
        info("Tên kho không được để trống!")
        return ;
    }
    hidePopup('popupAdd')
    callAPI('post',`${API_WAREHOUSE}`,{
        warehouse_name:warehouse_name,
        warehouse_phone:warehouse_phone,
        warehouse_address:warehouse_address,
    }, ()=>{
        success("Thành công")
        getData()
    })
}