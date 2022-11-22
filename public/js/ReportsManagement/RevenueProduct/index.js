checkPermission()

function checkPermission(){
    callAPI('GET',`${API_EXPORT}/revenue_product/checkPermission`,null, data =>{
        data.warehouses.map( warehouse =>{
            let isSelected = ""
            if(warehouse._id == id_warehouse) isSelected = "selected"
            $(".page-header .row div:nth-child(4) select").append(`<option ${isSelected} value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })

        data.categories.map( category =>{
            let isSelected = ""
            if(category._id == id_category) isSelected = "selected"
            $(".page-header .row div:nth-child(3) select").append(`<option ${isSelected} value="${category._id}">${category.category_name}</option>`)
        })
    })
}


function getData(){
    const fromdate = $(".page-header .row div:nth-child(1) input").val()
    const todate = $(".page-header .row div:nth-child(2) input").val()
    const id_warehouse = $(".page-header .row div:nth-child(4) select option:selected").val()

    callAPI('GET',`${API_EXPORT}/revenue_product`,{
        fromdate:fromdate,
        todate:todate,
        id_warehouse:id_warehouse
    }, data =>{
        drawTable(data.dataExport, data.dataImport)
    })
}

$(".page-header .row div:nth-child(5) button").click( e =>{
    getData()
})

function drawTable(dataExport, dataImport){

    let stt = 1
    $(".container-fluid .div-table").html(`
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>Stt</th>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng bán</th>
                    <th>Lợi nhuận</th>
                    <th>Số lượng trả lại</th>
                    <th>Lợi nhuận trả lại</th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot></tfoot>
        </table>
    `)
    for(let i =0;i<dataExport.length ;i++){
        dataExport[i].product_quantity_return = 0
        for(let j = 0;j<dataImport.length;j++){
            if(dataExport[i]._id == dataImport[j]._id){
                dataExport[i].neg_revenue += dataImport[j].revenue
                dataExport[i].product_quantity_return ++
                dataImport.splice(j,1)
                break
            }
        }
    }


    for(let i =0 ;i<dataExport.length;i++){
        $(".container-fluid .div-table table tbody").append(`
            <tr>
                <td>${stt++}</td>
                <td>${dataExport[i].subcategory_name}</td>
                <td>${dataExport[i].product_quantity}</td>
                <td>${money(dataExport[i].revenue)}</td>
                <td>${dataExport[i].product_quantity_return}</td>
                <td>${money(dataExport[i].neg_revenue)}</td>
                <td><button class="btn btn-primary" onclick="detail_revenue('${dataExport[i]._id}')"><i class="fas fa-info"></i></button></td>
            </tr>
        `)
    }
    dataTable2($(".container-fluid .div-table table"))
}