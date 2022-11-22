var arrData = []

checkPermission()

function checkPermission() {
    callAPI('GET', `${API_TRANFER_FUNDBOOK}/checkPermission`, {}, data => {
        data.map(item => {

            $(`select[name=select_fundbook]`).append(`<option value="${item._id}">${item.fundbook_name}</option>`)
        })
        getData()
    })
}

function getData(offset = 0, isLoad) {

    limit = $("#selectLimit option:selected").val()
    const from_money = $("#from_money").val()
    const to_money = $("#to_money").val()
    const fromdate = $("#fromdate").val()
    const todate = $("#todate").val()

    const from_fundbook = $("#select_from_fundbook").val()
    const to_fundbook = $("#select_to_fundbook").val()
    // const key = $("#keyFind").val()
    page = offset
    if (page == 0) stt = 1

    callAPI('GET', API_TRANFER_FUNDBOOK, {
        from_money: tryParseInt(from_money),
        to_money: tryParseInt(to_money),
        todate: todate,
        fromdate: fromdate,
        from_fundbook: from_fundbook,
        to_fundbook: to_fundbook,
        limit: tryParseInt(limit),
        page: page,
        // key:key

    }, data => {
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&fromdate=${fromdate}&todate=${todate}`)
    }, undefined, undefined, isLoad)
}

function drawTable(data) {
    arrData = []
    $("#tbodyTable").empty()

    for (let i = 0; i < data.length; i++) {
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].employee_fullname}</td>
                <td>${formatDate(data[i].createdAt).fulldatetime}</td>
                <td>${$($(`select[name=select_fundbook] option[value="${data[i].from_fundbook}"]`)[0]).text()}</td>
                <td>${$($(`select[name=select_fundbook] option[value="${data[i].to_fundbook}"]`)[0]).text()}</td>
                <td class="text-right">${money(data[i].money)}</td>
                <td >${data[i].note}</td>
                <td><i title="xóa" onclick="deleteForm(${i})" class="fas fa-trash text-danger"></i></td>
            </tr>
        `)
    }
}

function showPopupAdd(){
    $("#popupAdd input").val(null)
    $("#popupAdd .number").val(0)
    showPopup('popupAdd')
}

function saveAdd(){
    const from_fundbook = $("#popupAdd .modal-body div:first-child div:first-child select option:selected").val()
    const to_fundbook = $("#popupAdd .modal-body div:first-child div:nth-child(2) select option:selected").val()

    const money = tryParseInt($("#popupAdd .modal-body div:nth-child(2) input").val())
    const note = $("#popupAdd .modal-body div:nth-child(3) input").val()
    if(from_fundbook == to_fundbook){
        info("Không thể chuyển cùng một sổ quỹ")
        return ;
    }
    if(money == 0){
        info("Hãy điền giá tiền > 0")
        return
    }
    hidePopup('popupAdd')

    callAPI('post',API_TRANFER_FUNDBOOK,{
        from_fundbook:from_fundbook,
        to_fundbook:to_fundbook,
        money:money,
        note:note
    }, data =>{
        success("Thành công")
        getData()
    })
}




function deleteForm(index){
    $("#btn_confirm_delete").attr("onclick",`confirmDelete(${index})`)
    showPopup('popupDelete')
}

function confirmDelete(index){
    hidePopup('popupDelete')

    callAPI('DELETE',API_TRANFER_FUNDBOOK,{
        id_tranfer: arrData[index]._id
    }, () =>{
        success("Xóa thành công")
        getData()
    })
}