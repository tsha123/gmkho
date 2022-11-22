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

    callAPI('GET',`${API_PRODUCT}/product_sold_by_date`,{
        fromdate:fromdate,
        todate:todate,
        id_warehouse:id_warehouse
    }, data =>{
        drawTable(data.dataExport, data.dataImportReturn)
    })
}

$(".page-header .row div:nth-child(5) button").click( e =>{
    getData()
})

function drawTable(dataExport, dataImport){
  
    // console.log(dataExport)
    const arrData = []
    for(let i = 0; i<dataExport.length;i++){
        let isSame = false
        for(let j =0;j<arrData.length;j++){
            if(dataExport[i].id_subcategory.toString() == arrData[j].id_subcategory.toString()){
                isSame = true
                arrData[j].quantity += 1
                arrData[j].details.push({
                    ...dataExport[i],
                    type:"export"
                })
                arrData[j].money_revenue += calculateMoneyExport(dataExport[i])
                arrData[j].money_import += dataExport[i].product_import_price

                dataExport.splice(i,1)
                i--
                break
            }
           
        }
        if(!isSame){
            arrData.push({
                id_subcategory: dataExport[i].id_subcategory,
                id_category: dataExport[i].id_category,
                quantity:1,
                details:[{
                    ...dataExport[i],
                    type:"export"
                }],
                subcategory_name:dataExport[i].subcategory_name,
                money_revenue :calculateMoneyExport(dataExport[i]),
                money_import :dataExport[i].product_import_price
            })
            dataExport.splice(i,1)
            i--
        }
       
    }
    for(let i = 0; i<dataImport.length;i++){
        let isSame = false
        for(let j =0;j<arrData.length;j++){
            if(dataImport[i].id_subcategory == arrData[j].id_subcategory){
                isSame = true
                arrData[j].quantity -= 1
                arrData[j].details.push({
                    ...dataImport[i],
                    type:"import"
                })
                arrData[j].money_revenue -= (dataImport[i].product_import_price_return)
                arrData[j].money_import -= dataImport[i].product_export_price
                dataImport.splice(i,1)
                i--
                break
            }
           
        }
        if(!isSame){
            arrData.push({
                id_subcategory: dataImport[i].id_subcategory,
                id_category: dataImport[i].id_category,
                quantity:-1,
                details:[{
                    ...dataImport[i],
                    type:"import"
                }],
                subcategory_name:dataImport[i].subcategory_name,
                money_revenue :-dataImport[i].product_import_price_return,
                money_import :-dataImport[i].product_export_price
            })
            dataImport.splice(i,1)
            i--
        }
       
    }
    $(".container-fluid .div-table").html(`
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>Stt</th>
                    <th>Danh mục</th>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng</th>
                    <th>ĐVT</th>
                    <th>Doanh thu</th>
                    <th>Lợi nhuận</th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot></tfoot>
        </table>
    `)

    let total_quantity = 0
    let total_revenue = 0
    let total_profit = 0
    for(let i =0;i<arrData.length;i++){
        total_quantity += arrData[i].quantity
        total_revenue +=arrData[i].money_revenue
        
        const profit =  arrData[i].money_revenue - arrData[i].money_import
        total_profit +=profit
        $(".container-fluid .div-table tbody").append(`
             <tr>
                 <td>${i+1}</td>
                 <td>${$(`#selectCategory option[value="${arrData[i].id_category}"]`).text()}</td>
                 <td><span>${arrData[i].subcategory_name}</span></td>
                 <td><span>${arrData[i].quantity}</span></td>
                 <td><span>Chiếc</span></td>
                 <td><span>${money(arrData[i].money_revenue)}</span></td>
                 <td><span>${money(profit)}</span></td>
                 <td></td>
             </tr>
         `)
    }
    $(".container-fluid .div-table tfoot").html(`
        <tr style="background-color: antiquewhite;">
            <td>Tổng</td>
            <td></td>
            <td></span></td>
            <td><span>${total_quantity}</span></td>
            <td><span>Chiếc</span></td>
            <td><span>${money(total_revenue)}</span></td>
            <td><span>${money(total_profit)}</span></td>
            <td></td>
        </tr>
    `)
    // let stt = 1
    // $(".container-fluid .div-table").html(`
    //     <table class="table table-hover">
    //         <thead>
    //             <tr>
    //                 <th>Stt</th>
    //                 <th>Mã sản phẩm</th>
    //                 <th>Tên sản phẩm</th>
    //                 <th>Giá xuất</th>
    //                 <th>Giá nhập</th>
    //                 <th>Lợi nhuận</th>
    //                 <th>% Lợi nhuận</th>
    //                 <th>Mã phiếu</th>
    //             </tr>
    //         </thead>
    //         <tbody></tbody>
    //         <tfoot></tfoot>
    //     </table>
    // `)
    // let total_revenue = 0
    // var index = 1

    // for(let i =0;i<dataExport.length ;i++){
    //     const revenue = totalMoney(dataExport[i].product_export_price,0, dataExport[i].product_ck,dataExport[i].product_discount) - dataExport[i].product_import_price
    //     total_revenue += revenue
    //     $(".container-fluid .div-table tbody").append(`
    //         <tr>
    //             <td>${index++}</td>
    //             <td><span>${dataExport[i].id_product}</span></td>
    //             <td><span>${dataExport[i].subcategory_name}</span></td>
    //             <td><span>${money(dataExport[i].product_export_price)}</span></td>
    //             <td><span>${money(dataExport[i].product_import_price)}</span></td>
    //             <td><span>${money(revenue )}</span></td>
    //             <td><span>${calculate_revenue_percent(dataExport[i].product_import_price,totalMoney(dataExport[i].product_export_price,0, dataExport[i].product_ck,dataExport[i].product_discount))}</span></td>
    //             <td><a href="/export/print/${dataExport[i]._id}" target="_blank">Xuất: ${dataExport[i]._id}</a></td>
    //         </tr>
    //     `)
    // }
    // // dataImport[i].product_import_price  đây là giá nhập lại , còn return là giá nhập ban đầu
    // for(let i =0;i<dataImport.length ;i++){
    //     const revenue = totalMoney(dataImport[i].product_export_price,0, dataImport[i].product_ck,dataImport[i].product_discount) - dataImport[i].product_import_price 
    //     total_revenue += revenue
    //     $(".container-fluid .div-table tbody").append(`
    //         <tr>
    //             <td>${index++}</td>
    //             <td><span>${dataImport[i].id_product}</span></td>
    //             <td><span>${dataImport[i].subcategory_name}</span></td>
    //             <td><span>${money(dataImport[i].product_export_price)}</span></td>
    //             <td><span>${money(dataImport[i].product_import_price)}</span></td>
    //             <td><span>${money(revenue)}</span></td>
    //             <td><span>${calculate_revenue_percent(dataImport[i].product_import_price,totalMoney(dataImport[i].product_export_price,0, dataImport[i].product_ck,dataImport[i].product_discount))}</span></td>
    //             <td><a href="/import/print/${dataImport[i]._id}" target="_blank">Nhập trả: ${dataImport[i]._id}</a></td>
    //         </tr>
    //     `)
    // }
    // $(".container-fluid .div-table tfoot").append(`
    //     <tr>
    //         <td></td>
    //         <td></td>
    //         <td></td>
    //         <td></td>
    //         <td></td>
    //         <td>${money(total_revenue)}</td>
    //         <td></td>
    //         <td></td>
    //     </tr>
    // `)

    dataTable2($(".container-fluid .div-table table"))

}

function calculate_revenue_percent(import_price, export_price){
   
    const money_revenue = export_price - import_price
    const percent = money_revenue == 0?0:(import_price/money_revenue).toFixed(2)
    return percent
}