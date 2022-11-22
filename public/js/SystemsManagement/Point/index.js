getData()
var arrData = []
function getData() {
    callAPI('GET', API_POINT, null, data => {
        drawTable(data)
    })
}
function drawTable(data) {
    arrData = []
    arrData.push(data)
    $(".div-table tbody").empty()
    for (let i = 0; i < arrData.length; i++){
        $(".div-table tbody").append(`
        <tr>
            <td>${stt}</td>
            <td>${arrData[0].point_number}</td>
            <td>${money(arrData[0].point_value)}</td>
            <td><i onclick="editPoint(${0})" class="fas fa-edit btn btn-primary">Chỉnh sửa</i></td>
        </tr>
    `)
    }
    
}

function editPoint(index) {

    $($("#popupEdit .modal-body input")[0]).val(money(arrData[index].point_number))
    $("#popupEdit .modal-body input:last-child").val(money(arrData[index].point_value))
    $("#btnConfirmEdit").attr("onclick", `confirmEdit(${index})`)
    showPopup('popupEdit')
}

function confirmEdit(index) {
    const point_number = tryParseInt($($("#popupEdit .modal-body input")[0]).val())
    const point_value = tryParseInt($("#popupEdit .modal-body input:last-child").val())

    hidePopup('popupEdit')
    callAPI('PUT', API_POINT, {
        point_number: point_number,
        point_value: point_value,
        id_point : arrData[index]._id
    }, () => {
        success("Thành công")
        getData()
    })
}