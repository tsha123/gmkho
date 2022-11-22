var arrData = []
checkPermission()

function checkPermission() {
    callAPI("GET", API_INVENTORY + "/checkPermission", null, (data) => {
        data.warehouses.map((warehouse) => {
            $("#selectWarehouse").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })
        data.categories.map((category) => {
            $("#selectCategory").append(`<option value="${category._id}">${category.category_name}</option>`)
        })
        getData()
    })
}

function getData() {
    const fromdate = $("#fromdate").val()
    const todate = $("#todate").val()
    const id_warehouse = $("#selectWarehouse option:selected").val()

    callAPI(
        "GET",
        API_INVENTORY, {
            fromdate: fromdate,
            todate: todate,
            id_warehouse: id_warehouse,
        },
        (data) => {
            console.log(data)
            changeURL(`?fromdate=${fromdate}&todate=${todate}&id_warehouse=${id_warehouse}`)
            arrData = data
            changeCategory(arrData)
        }
    )
}

function changeCategory(data) {
    const inventory = $("#selectInventory option:selected").val()
    const category = $("#selectCategory option:selected").val()

    $("#divTable").empty();
    $("#divTable").html(`
    <table id="dataTable" width="100%" cellspacing="0">
    <thead>
        <tr>
            <th>STT</th>
          
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Đơn giá</th>
            <th>Đơn VT</th>
            <th>Tồn đầu</th>
            <th>Giá trị tồn đầu</th>
            <th>Số lượng nhập</th>
            <th>Giá trị hàng nhập</th>
            <th>Đã xuất</th>
            <th>Giá trị xuất</th>
            <th>Tồn cuối</th>
            <th>Giá trị tồn</th>
        </tr>

    </thead>
    <tbody id="tbodyTable"></tbody>
    <tbody id="tfootTable"></tbody>
    </table>`);
    stt = 1

    for (let i = 0; i < data.length; i++) {
        if (category && category.length > 0) {
            if (data[i].ID_Category == category) {
                if (inventory == "lt" && caculateInventory(data[i]) < 0) {
                    drawTable(data[i])
                } else if (inventory == "gt" && caculateInventory(data[i]) > 0) {
                    drawTable(data[i])
                } else if (inventory == "ne" && caculateInventory(data[i]) != 0) {
                    drawTable(data[i])
                } else if (inventory == "all") {
                    drawTable(data[i])
                }
            }
        } else {
            if (inventory == "lt" && caculateInventory(data[i]) < 0) {
                drawTable(data[i])
            } else if (inventory == "gt" && caculateInventory(data[i]) > 0) {
                drawTable(data[i])
            } else if (inventory == "ne" && caculateInventory(data[i]) != 0) {
                drawTable(data[i])
            } else if (inventory == "all") {

                drawTable(data[i])
            }
        }
    }

    dataTable()
}

function drawTable(data) {
    $("#tbodyTable").append(`
    <tr>
        <td class="center">${stt++}</td>
        <td>${data.Name}</td>
        <td>${$(`#selectCategory option[value="${data.ID_Category}"]`).text()}</td>
        <td class="right">${money(data.ImportNew)}</td>
        <td>${data.Unit}</td>
        <td class="center">${data.QuantityPeriod- data.QuantityExportPeriod}</td>
        <td class="right">${money(data.ImportPeriod- data.ImportOfExportPeriod)}</td>
        <td class="center">${money(data.QuantityCurrent)}</td>
        <td class="right">${money(data.ImportCurrent)}</td>
        <td class="center">${money(data.QuantityExportCurrent)}</td>
        <td class="right">${money(data.ExportCurrent)}</td>
        <td class="center">${money( data.QuantityPeriod- data.QuantityExportPeriod  + data.QuantityCurrent - data.QuantityExportCurrent )}</td>
        <td class="center">${money(data.ImportPeriod- data.ImportOfExportPeriod + data.ImportCurrent - data.ImportOfExportCurrent )}</td>
    </tr>`)
}

function caculateInventory(data) {
    return data.QuantityPeriod - data.QuantityExportPeriod + (data.QuantityCurrent - data.QuantityExportCurrent)
}

function caculateMoneyInventory(data) {
    return data.ImportPeriod - data.ImportOfExportPeriod + (data.ImportCurrent - data.ImportOfExportCurrent)
}

function changeDraw() {
    changeCategory(arrData)
}