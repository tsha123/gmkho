var arrFunction = []
var getOther = true
var arrSuperGroup = []
var arrGroup = []
getData()
function getData()
{
    isLoading();
    callAPI('GET',`${API_PERMISSION}/groupAndFunction?`,{getOther:getOther},(data)=>{
        if(getOther)
            {
                data.functions.forEach(func => {
                    arrFunction.push(func)
                });
                drawTablePermission()
                data.dataSuper.forEach(group => {
                    $(`select[name=selectSuperGroup]`).append(`<option value="${group._id}">${group.employee_super_group_name}</option>`)
                    arrSuperGroup.push(group)
                });
                getOther = false
            }
            drawTable(data.dataGroups)
    })
  
}

function  drawTable(data) {
    $("#divTable").html(`
    <table id="dataTable" class="table table-hover">
        <thead>
        <tr>
            <th>STT</th>
            <th>Chức danh</th>
            <th>Bộ phận</th>
            <th>Chi tiết</th>
        </tr>
        </thead>
        <tbody id="tbodyTable"></tbody>
    </table>`)

    arrGroup = []
    for(let i =0;i<data.length;i++)
    {
        arrGroup.push(data[i])
        for(let j =0;j<arrSuperGroup.length;j++)
        {
            if(arrSuperGroup[j]._id == data[i].id_super_group)
            {
                data[i].super_group_name = arrSuperGroup[j].employee_super_group_name
                break
            }
        }
        $("#tbodyTable").append(`
            <tr>
                <td>${i+1}</td>
                <td>${data[i].employee_group_name}</td>
                <td>${data[i].super_group_name}</td>
                <td>
                    <button onclick="showPopupEdit(${i})" class="btn btn-primary"><i class="mdi mdi-tooltip-edit"></i> Chỉnh sửa</button> 
                    <button onclick="detailPermission(${i})" class="btn btn-primary"><i class="mdi mdi-information"></i>Xem quyền</button>
                </td>
                
            </tr>
        `)
    }
    dataTable()
}

function drawTablePermission() {
   
    for(let i =0;i<arrFunction.length;i++)
    {
        if( i%2==0)
        {
            $("#divPer1").append(`
                <div class="form-check">
                <input class="form-check-input" value="${arrFunction[i]._id}" type="checkbox" value="" id="permission${i}">
                <label class="form-check-label" for="permission${i}">
                    ${arrFunction[i].function_name}
                </label>
                </div>
            `)
        }
        else
        {
            $("#divPer2").append(`
                <div class="form-check">
                <input class="form-check-input" value="${arrFunction[i]._id}" type="checkbox" value="" id="permission${i}">
                <label class="form-check-label" for="permission${i}">
                    ${arrFunction[i].function_name}
                </label>
                </div>
            `)
        }
    }
   
}

function  editPermission(data,index) {
    $("#divPer1 input[type=checkbox]").prop("checked",false)
    $("#divPer2 input[type=checkbox]").prop("checked",false)

    $("#divPer1 input[type=checkbox]").attr("onchange",`changePermission(this,${index})`)
    $("#divPer2 input[type=checkbox]").attr("onchange",`changePermission(this,${index})`)


    for(let i = 0;i<data.length;i++)
    {
        $(`input[type=checkbox][value="${data[i].id_function}"]`).prop("checked",data[i].permission_status)
    }

    showPopup('popupDetailPermission')
}
function showPopupEdit(index)
{
    $("#edit_employee_group_name").val(arrGroup[index].employee_group_name)
    $("#editSuperGroup").val(arrGroup[index].id_super_group).change()
    $("#btnEditGroup").attr("onclick",`confirmEditGroup(${index})`)
    showPopup('popupEditGroup')
}

function confirmEditGroup(index)
{
    const employee_group_name = $("#edit_employee_group_name").val().trim()
    if(employee_group_name.length == 0)
    {
        info("Tên chức danh không được để trống")
        return
    }
  
    hidePopup('popupEditGroup')
    callAPI('PUT', `${API_PERMISSION}/group`,{
        id_group:arrGroup[index]._id,
        employee_group_name: employee_group_name,
        id_super_group: $('#editSuperGroup option:selected').val()
    },()=>{
        success("Chỉnh sửa thành công")
        getData()
    })

}

function detailPermission(index) {

    callAPI('GET', `${API_PERMISSION}?`,{
        id_employee_group:arrGroup[index]._id
    },(data)=>{
        editPermission(data,index)
    })

}

function  changePermission(input, index) {
    var permission_status = false
    if($(input).is(":checked"))
    {
        permission_status = true
    }
    callAPI('PUT', `${API_PERMISSION}`,{
        permission_status:permission_status,
        id_function:$(input).val(),
        id_employee_group:arrGroup[index]._id
    },(data)=>{
       
    },undefined,false,false)
  
}