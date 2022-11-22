var arrData = []
getData()
function getData(){
    limit = $("#selectLimit option:selected").val();
    key = $("#keyFind").val()
    type = $("#selectType option:selected").val()

    let data = {
        limit: tryParseInt(limit),
        page: tryParseInt(page),
        key: key,
        type: type,
    }

    callAPI('GET',`${API_ACCOUNTING_ENTRY}?`,data,(data)=>{    
        drawTable(data.data);
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&type=${type}`)
    })
}

function findByName(){
    if(event.which == '13'){
        getData()
    }
}

function drawTable(data){
    arrData = []
    $("#tbodyTable").empty()
    for(let i =0;i<data.length;i++){
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td class="center">${i+1}</td>
                <td>${data[i].accounting_entry_name}</td>
                <td >${$(`#selectType option[value=${data[i].accounting_entry_type}]`).text()}</td>
                <td>${data[i].accounting_entry_create_debt?'Không':'Có'}</td>
                <td class="center"><i onclick="editAccoungting(${i})" class="fas fa-edit text-primary"></i></td>
            </tr>
        `)
    }
}

function confirmAdd(){
    const accounting_entry_name = $("#addName").val().trim()
    if(accounting_entry_name.length == 0){
        info("Tên bút toán không được để trống")
        return
    }
    const accounting_entry_type = $("input[name=addType]:checked").val()
    const accounting_entry_create_debt = $("input[name=addDebt]:checked").val()
    hidePopup('popupAdd')
    callAPI('post',API_ACCOUNTING_ENTRY,{
        accounting_entry_name:accounting_entry_name,
        accounting_entry_type:accounting_entry_type,
        accounting_entry_create_debt:accounting_entry_create_debt,
        
    },()=>{
        success("Thành công")
        getData()
    })
}

function editAccoungting(index){
    $(`#editName`).val(arrData[index].accounting_entry_name)
    $(`input[name=editType][value=${arrData[index].accounting_entry_type}]`).prop("checked",true)
    $(`input[name=editDebt][value=${arrData[index].accounting_entry_create_debt}]`).prop("checked",true)
    $(`#btnConfirmEdit`).attr("onclick",`confirmEdit(${index})`)
    showPopup('popupEdit')
}

function confirmEdit(index){
    const accounting_entry_name = $("#editName").val().trim()
    if(accounting_entry_name.length == 0){
        info("Tên bút toán không được để trống")
        return
    }
    const accounting_entry_type = $("input[name=editType]:checked").val()
    const accounting_entry_create_debt = $("input[name=editDebt]:checked").val()
    hidePopup('popupEdit')
    callAPI('put',API_ACCOUNTING_ENTRY,{
        accounting_entry_name:accounting_entry_name,
        accounting_entry_type:accounting_entry_type,
        accounting_entry_create_debt:accounting_entry_create_debt,
        id_accounting_entry:arrData[index]._id
        
    },()=>{
        success("Thành công")
        getData()
    })
}