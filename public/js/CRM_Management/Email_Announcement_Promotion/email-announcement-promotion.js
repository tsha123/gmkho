//client+
var arr_Data = []
$(document).ready(function () {
    limit = 10
    getData(true)
})
function getData(isLoad = true) {
    // console.log(`?`)
    isLoading(isLoad)
    limit = $("#selectLimit option:selected").val()
    key = $("#keyFind").val()
    let data = {
        key: key,
        limit: limit,
    }
    data = null
    callAPI("GET", `${API_EMAIL_ANNOUNCEMENT_PROMOTION}${window.location.search}`, data, (response) => {
        throwValue(response)
        stt = limit * (tryParseInt(response.page) - 1) + 1
        limit = response.limit
        $("#selectLimit").val(limit.toString())
        loadData(response.data)
        pagination2(response.total, response.page, `divPagination`)
    })
}
function loadData(data) {
    $("#tbodyTable").empty()
    arr_Data = []
    for (var i = 0; i < data.length; i++) {
        arr_Data.push(data[i])
        let html = ``
        html += `<tr>
            <td style="text-align:center;" >${stt + i}</td>
            <td>${data[i]["email"]}</td>
            <td>${data[i]["quantity_register"]}</td>
            <td><button onclick="sent_email_promotion(${i})" class="btn btn-primary btn-infos" title="Gửi email đến ${data[i]["email"]}"><i class="fas fa-envelope"></i></button></td>
        </tr>`

        $("#tbodyTable").append(html)
    }
}
function change_key_search() {
    const key = $(`#keyFind`).val()
    let theURL
    theURL = new URL(`${window.location.href}`)
    theURL.searchParams.set("key", key)
    const new_URL = theURL.toString()
    changeURL(new_URL)
    getData()
} //
function changeLimit() {
    const new_limit = $(`#selectLimit`).val()
    let theURL
    theURL = new URL(`${window.location.href}`)
    theURL.searchParams.set("limit", new_limit)
    theURL.searchParams.set("page", 1)
    // console.log(theURL.toString());
    const new_URL = theURL.toString()
    changeURL(new_URL)
    getData()
}
function sent_email_promotion(index) {
    const email = arr_Data[index].email
    if (isDefine(email)) {
        window.open(`mailto:${email}?subject=&body=`)
    } else {
        alert(`Có lỗi xảy ra hoặc không tìm thấy email cần gửi`)
    }
}
function download_excel_email_announcement_promotion() {
    callAPI("GET", `${API_EMAIL_ANNOUNCEMENT_PROMOTION}/download`, {}, (data) => {
        const _data = data.data
        const arrDownload = []
        for (let i = 0; i < _data.length; i++) {
            arrDownload.push({
                STT: i + 1,
                Email: _data[i].email,
            })
        }
        downloadExcelLocal(arrDownload, "Danh sách email đăng ký nhận thông báo khuyến mại")
    })
}
