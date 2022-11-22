var arrData = []
checkPermission()
function checkPermission()
{
    callAPI('GET',`${API_CHANGE_WAREHOUSE}/check-permission`,null,(data)=>{
        data.warehouses.map(warehouse =>{
            $("select[name=select_warehouse]").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })

        // data.fundbooks.map(fund =>{
        //     $("#selectTypePayment").append(`<option value="${fund._id}">${fund.fundbook_name}</option>`)
        // })

        getData()
    })
}


function getData(){
    const fromdate = $("#fromdate").val()
    const todate = $("#todate").val()
    const key = $("#inputFind").val()
    limit = $("#selectLimit option:selected").val()
    const id_fromwarehouse = $("#from_warehouse option:selected").val()
    const to_warehouse = $("#to_warehouse option:selected").val()

    callAPI('GET',API_CHANGE_WAREHOUSE,{
        fromdate:fromdate,
        todate:todate,
        key:key,
        limit:limit,
        page:page,
        id_fromwarehouse:id_fromwarehouse,
        id_towarehouse:to_warehouse
    }, data =>{
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&from_warehouse=${id_fromwarehouse}&to_warehouse=${to_warehouse}`)
    })
}

function drawTable(data){
  
    arrData = []
    $("#tbodyTable").empty()
    for(let i =0;i<data.length;i++){
        arrData.push(data[i])
        const name_product = data[i].export_form_product.length > 0 ?data[i].export_form_product[0].subcategory_name:""
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].id_export_form}</td>
                <td>${formatDate(data[i].createdAt).fulldate}</td>
                <td>${data[i].from_warehouse_name}</td>
                <td>${data[i].to_warehouse_name}</td>
                <td>${name_product}</td>
                <td>
                    <i onclick="showDetail(${i})" class="fas fa-info">Chi tiết</i>
                </td>
            </tr>
        `)
    }
}

function showDetail(index) {
    const modelBoby = $("#popupEdit .modal-body")
    const tableCustomer = $(modelBoby).find('table')[0]
    const tableProduct = $(modelBoby).find('table')[1]
    const tbodyProduct = $(tableProduct).find('tbody')[0]
    $(tableCustomer).empty()
    $(tbodyProduct).empty()
    
    $(tableCustomer).append(`
        <tr>
            <th>Mã phiếu</th>
            <td>${arrData[index].id_export_form}</td>
        </tr>
       
        <tr>
            <th>Ngày tạo phiếu</th>
            <td>${formatDate(arrData[index].createdAt).fulldatetime}</td>
        </tr>
        <tr>
            <th>Tổng tiền</th>
            <td >${money(calculateMoneyExport(arrData[index].export_form_product))}</td>
        </tr>
        <tr>
            <th>Ghi chú</th>
            <td>${arrData[index].export_form_note}</td>
        </tr>
   
    `)
    $("input[name=note]").val(arrData[index].export_form_note)
    const isable = arrData[index].export_form_status_paid?"disabled":""
    for (let i = 0; i < arrData[index].export_form_product.length; i++){
        
        $(tbodyProduct).append(`
            <tr>
                <td>${i+1}</td>
                <td>${arrData[index].export_form_product[i].subcategory_name}</td>
                <td>${arrData[index].export_form_product[i].id_product || ""}</td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_export_price)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_vat)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_ck)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_quantity)}" disabled></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_warranty)}" ></td>
                <td><input oninput="changeMoney()" class="number form-control" ${isable} type="text" value="${money(arrData[index].export_form_product[i].product_discount)}" ></td>

                <td>${money(calculateMoneyExport(arrData[index].export_form_product[i]))}</td>
                <td class="center"><i onclick="delete_product(${index},${i})" class="fas fa-trash text-danger"></i></td>
            </tr>
        `)
    }
    if (isable) {
        $("#btnAddMore").hide()
        $("#btnSaveEdit").hide()
        $(".div-payment").hide()
    }
   
    formatNumber()

    showPopup('popupEdit')
}
