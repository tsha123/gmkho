checkPermission()

function checkPermission() {
    callAPI('GET', `${API_EXPORT}/revenue_product/checkPermission`, null, data => {
        data.warehouses.map(warehouse => {
            let isSelected = ""
            if (warehouse._id == id_warehouse) isSelected = "selected"
            $(".page-header .row div:nth-child(4) select").append(`<option ${isSelected} value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })

        data.categories.map(category => {
            let isSelected = ""
            if (category._id == id_category) isSelected = "selected"
            $(".page-header .row div:nth-child(3) select").append(`<option ${isSelected} value="${category._id}">${category.category_name}</option>`)
        })
    })
}


function getData() {
    const fromdate = $(".page-header .row div:nth-child(1) input").val()
    const todate = $(".page-header .row div:nth-child(2) input").val()
    const id_employee = $("#select_employee option:selected").val()

    callAPI('GET', `${API_EXPORT}/revenue-product-by-employee`, {
        fromdate: fromdate,
        todate: todate,
        id_employee: id_employee
    }, data => {
        drawTable(data)
    })
}

$(".page-header button").click(e => {
    getData()
})

function drawTable(data) {


    $(".container-fluid .div-table").html(`
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>Stt</th>
                    <th>Mã sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Hành động</th>
                    <th>Giá bán/Nhập lại</th>
                    <th>Giá vốn</th>
                    <th>Thưởng</th>
                    <th>Mã phiếu</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot></tfoot>
        </table>
    `)



    for (let i = 0; i < data.length; i++) {
        const part = money(data[i].subcategory_part)
        $(".container-fluid .div-table table tbody").append(`
            <tr>
                <td>${i+1}</td>
                <td>${data[i].id_product}</td>
                <td>${data[i].subcategory_name}</td>
                <td>${data[i].type =="export"?"Xuất bán":"Nhập trả"}</td>
                <td>${money(data[i].product_price)}</td>
                <td>${money(data[i].product_import_price)}</td>
                <td>${data[i].type =="export"?part:`(${part})`}</td>
                <td>${data[i]._id}</td>
                
            </tr>
        `)
    }
    dataTable2($(".container-fluid .div-table table"))
}