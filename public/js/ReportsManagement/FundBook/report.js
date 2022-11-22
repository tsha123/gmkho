checkPermission()

function checkPermission() {
    callAPI('GET', API_FUNDBOOK, null, (warehouses) => {
        warehouses.map(warehouse => {
            $(".page-header .row select").append(`<option value="${warehouse._id}">${warehouse.fundbook_name}</option>`)
        })
        $(".page-header .row select").val(id_fundbook.trim()).change()
    })
}

$(".page-header .row div:nth-child(4) button").click(e => {
    id_fundbook = $(".page-header .row select option:selected").val()
    const fromdate = $(".page-header .row div:nth-child(2) input").val()
    const todate = $(".page-header .row div:nth-child(3) input").val()

    callAPI('GET', `${API_FUNDBOOK}/report`, {
        id_fundbook: id_fundbook,
        fromdate: fromdate,
        todate: todate
    }, data => {
        changeURL(`?fromdate=${fromdate}&todate=${todate}&id_fundbook=${id_fundbook}`)
        drawTable(data.arrData, data.total_period)
    })
})

async function drawTable(data, total_period) {
    $("#divTable").html(`
        <table id="dataTable" class="table">   
            <thead>
                <tr>
                    <th>Số TT</th>
                    <th>Mã phiếu</th>
                    <th>Chứng từ</th>
                    <th>Loại</th>
                    <th>Nội dung</th>
                    <th>Ghi chú</th>
                    <th>Tổng thu</th>
                    <th>Tổng chi</th>
                    <th>Tổng quỹ</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot></tfoot>
        </table>
    `)
    await $("#dataTable tbody").append(`<tr>
        <td>${0}</td>
        <td>Tồn đầu kỳ</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${money(total_period)}</td>
    </tr>`)
    let totalMoney = total_period
    let totalReceive = 0
    let totalPayment = 0

    for (let i = 0; i < data.length; i++) {
        var type = "Phiếu thu"

        if (data[i].receive_type && data[i].receive_type == "export") type = "Phiếu xuất"
        if (data[i].payment_type && data[i].payment_type == "import") type = "Phiếu nhập"
        if (data[i].payment_type && data[i].payment_type == "payment") type = "Phiếu chi"
        if (data[i].receive_type && data[i].receive_type == "hide") type = "Tồn"

        if (data[i].receive_money) {
            totalMoney += data[i].receive_money
            totalReceive += data[i].receive_money
        }

        if (data[i].payment_money) {
            totalMoney -= data[i].payment_money
            totalPayment += data[i].payment_money
        }
        var note = ""
        if (type == "Phiếu nhập" || type == "Phiếu chi") note = data[i].payment_note
        if (type == "Phiếu xuất" || type == "Phiếu thu") note = data[i].receive_note

        $("#dataTable tbody").append(`
            <tr>
                <td>${i+1}</td>
                <td>${data[i]._id}</td>
                <td>${data[i].id_form?data[i].id_form:""}</td>
                <td>${type}</td>
                <td>${data[i].accounting_entry_name}</td>
                <td>${note}</td>
                <td>${data[i].receive_money?money(data[i].receive_money):0}</td>
                <td>${data[i].payment_money?money(data[i].payment_money):0}</td>
                <td>${money(totalMoney)}</td>
            </tr>
        `)
    }
    await $("#dataTable tfoot").append(`
    <tr>
        <td></td>
        <td>Tồn cuối</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${money(totalReceive)}</td>
        <td>${money(totalPayment)}</td>
        <td>${money(totalMoney)}</td>
    </tr>`)
    dataTable2($("#divTable table"))
}