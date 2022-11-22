var arrData = []
var id_user = null
getData()

function getData() {
    key = $("#keyFind").val()
    limit = $("#selectLimit option:selected").val()
    debt = $("#selectDebt option:selected").val( )
    callAPI('GET', API_DEBT, {
        key: key,
        limit: limit,
        page: page,
        debt:debt
    }, data => {
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&debt=${debt}`)
    })
}

function drawTable(data) {

    arrData = []
    $("#tbodyTable").empty()
    for (let i = 0; i < data.length; i++){
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt + i}</td>
                <td>${data[i].user_fullname}</td>
                <td>${data[i].user_phone}</td>
                <td>${data[i].total_debt < 0 ? `(${money(data[i].total_debt * -1)})` : money(data[i].total_debt)}</td>
                <td><i class="fas fa-info primary" onclick="showDetail(${i})"></i></td>
            </tr>
        `)

    }
}
function selectSupplier(index) {
    $($(event.path[0]).closest('div')).empty()
    $("#div_find_supplier input").val(arrSupplier[index].user_fullname)
    $("#div_find_supplier input").attr("name", arrSupplier[index]._id)
    id_user = arrSupplier[index]._id
    $("#popupAdd input[name=info]").val(`SĐT: ${arrSupplier[index].user_phone} - Địa chỉ: ${arrSupplier[index].user_address}`)
   
}

function confirmSave() {
    if (!id_user) {
        info("Khách hàng không được để trống")
        return
    }
    const debt_type = $("#popupAdd input[type=radio]:checked").val()
    const debt_money = tryParseInt($("#popupAdd input[name=debt_money]").val())
    const debt_note = $("#popupAdd input[name=note]").val()

    hidePopup('popupAdd')
    callAPI('POST', API_DEBT, {
        debt_type: debt_type,
        debt_money: debt_money,
        debt_note: debt_note,
        id_user:id_user
    }, data => {
        success("Thành công")
        getData()
    })
}

function showDetail(index) {
    $($("#popupSelectTime input[type=date]")[0]).val(getTime().startMonth)
    $($("#popupSelectTime input[type=date]")[1]).val(getTime().current)
    $("#popupSelectTime .modal-footer button:last-child()").attr("onclick",`getDetailReport(${index})`)
    showPopup('popupSelectTime')   
}

function getDetailReport(index) {
    const fromdate = $($("#popupSelectTime input[type=date]")[0]).val()
    const todate = $($("#popupSelectTime input[type=date]")[1]).val()
    if (new Date(fromdate) == 'Invalid Date' || new Date(todate) == 'Invalid Date') {
        info("Hãy chọn thời gian phù hợp")
        return
    }
    
    hidePopup('popupSelectTime')
    callAPI('GET', `${API_DEBT}/report`, {
        id_user: arrData[index]._id,
        fromdate: fromdate,
        todate:todate
    }, data => {

        $("#popupDetail .modal-body").empty()
        $("#popupDetail .modal-body").html(`
            <table id="tableDetail" class="table table-hover">
                <thead>
                    <tr>
                        <th rowspan="2" style="width:0%;">STT</th>
                        <th rowspan="2">Ngày tạo</th>
                        <th rowspan="2">Chứng từ</th>
                        <th class="center" colspan="3">Nội dung</th>
                        <th rowspan="2">Phải thu</th>
                        <th rowspan="2">Đã thu</th>
                        <th rowspan="2">Phải chi</th>
                        <th rowspan="2">Đã chi</th>
                        <th rowspan="2">Tổng nợ</th>
                        <th rowspan="2">Nợ cuối</th>
                    </tr>
                    <tr>    
                        <th rowspan="1" colspan="1">Tên hàng</th>
                        <th rowspan="1" colspan="1">ĐVT</th>
                        <th rowspan="1" colspan="1">Số lượng</th>
                    </tr>
                </thead>
                <tbody></tbody>
                <tfoot></tfoot>
            </table>
        `)
        let final_debt = 0
        for (let i = 0; i < data.periodDebt.length; i++){
            final_debt += data.periodDebt[i].total_period
            $("#popupDetail tbody").append(`
                <tr>
                    <td>0</td>
                    <td>_</td>
                    <td>_</td>
                    <td>Tồn đầu kỳ</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="right">${money(data.periodDebt[i].total_period)}</td>
                    <td class="right">${money(final_debt)}</td>
                </tr>
            `)
            
        }

        for (let i = 0; i < data.currentDebt.length; i++){
          
            final_debt += calculateDebt(data.currentDebt[i])
            $("#popupDetail tbody").append(`
                <tr>
                    <td>${i + 1}</td>
                    <td>${formatDate(data.currentDebt[i].createdAt).fulldatetime}</td>
                    <td>${data.currentDebt[i].id_form?data.currentDebt[i].id_form:""}</td>
                    ${getHtmlContent(data.currentDebt[i])}
                    <td class="right">${money(data.currentDebt[i].debt_money_export)}</td>
                    <td class="right">${money(data.currentDebt[i].debt_money_receive)}</td>
                    <td class="right">${money(data.currentDebt[i].debt_money_import)}</td>
                    <td class="right">${money(data.currentDebt[i].debt_money_payment)}</td>
                    <td class="right"> ${ calculateDebt(data.currentDebt[i]) < 0?`(${calculateDebt(data.currentDebt[i])*-1})`: money(calculateDebt(data.currentDebt[i])) }</td>
                    <td class="right">${money(final_debt)}</td>
                </tr>
            `)
        }
        $("#popupDetail tfoot").append(`
                <tr>
                    <td>Tổng nợ</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>${money(final_debt)}</td>
                </tr>
            `)
        dataTable_detail('tableDetail',fromdate, todate, arrData[index].user_fullname)
        showPopup('popupDetail')
    })
}

function getHtmlContent(data) {
    let html = ""
    
    if (data.debt_type == "export" && data.content_debt) {
        const arrDataProduct = []
        for (let i = 0; i < data.content_debt.export_form_product.length; i++){
            arrDataProduct.push(data.content_debt.export_form_product[i])
        }
        for (let i = 0; i < arrDataProduct.length; i++){
            for (let j = i + 1; j < arrDataProduct.length; j++){
                if (arrDataProduct[i].id_subcategory == arrDataProduct[j].id_subcategory) {
                    arrDataProduct[i].product_quantity += arrDataProduct[j].product_quantity 
                    arrDataProduct.splice(j, 1)
                    j--
                }
            }
        }
        
        html = '<td>'
        let htmlNumber = '<td>'
        let htmlUnit = '<td>'
        for (let i = 0; i <arrDataProduct.length; i++){
            html += `
                <p class="substring" title="${arrDataProduct[i].subcategory_name}">${arrDataProduct[i].subcategory_name}</p>
            `
            htmlNumber += `<p>${arrDataProduct[i].product_quantity}</p>`
            htmlUnit += `<p>Chiếc</p>`
        }
        htmlNumber += `</td>`
        htmlUnit+= `</td>`
        html += '</td>' + htmlUnit + htmlNumber
    }
    if (data.debt_type == "import" && data.content_debt) {
        const arrDataProduct = []
        for (let i = 0; i < data.content_debt.import_form_product.length; i++){
            arrDataProduct.push(data.content_debt.import_form_product[i])
        }
        for (let i = 0; i < arrDataProduct.length; i++){
            for (let j = i + 1; j < arrDataProduct.length; j++){
                if (arrDataProduct[i].id_subcategory == arrDataProduct[j].id_subcategory) {
                    arrDataProduct[i].product_quantity += arrDataProduct[j].product_quantity 
                    arrDataProduct.splice(j, 1)
                    j--
                }
            }
        }
        
        html = '<td>'
        let htmlNumber = '<td>'
        let htmlUnit = '<td>'
        for (let i = 0; i <arrDataProduct.length; i++){
            html += `
            <p class="substring" title="${arrDataProduct[i].subcategory_name}">${arrDataProduct[i].subcategory_name}</p>
            `
            htmlNumber += `<p>${arrDataProduct[i].product_quantity}</p>`
            htmlUnit += `<p>Chiếc</p>`
        }
        htmlNumber += `</td>`
        htmlUnit+= `</td>`
        html += '</td>' + htmlUnit + htmlNumber
    }
    if ( (data.debt_type == "payment" || data.debt_type == "receive" ) && data.content_debt ) { 
        html = `<td>${data.content_debt}</td><td></td><td></td>`
    }
    if (data.debt_type == "period" ) { 
        html = `<td>Nhập công nợ đầu kỳ</td><td></td><td></td>`
    }
    return html
}

function dataTable_detail(id, fromdate , todate , user_fullname){

    if (typeof id == "undefined" || id == null) {
        id = "dataTable"
    }

    $(`#${id} thead tr`)
        .clone(true)
        .addClass('filters')
        .appendTo(`#${id} thead`);
    $(`#${id}`).DataTable({
        dom: "Bfrtip",
        lengthChange: true,
        paging: true,
        orderable: true,
        lengthMenu: [
            [10, 30, 40, 50, -1],
            [10, 30, 40, 50, "Tất cả"],
        ],
        buttons: [
            {
                extend: 'print',
                title:`
                    <div>
                        <p style="font-size: 20px; margin-bottom: 3px;">Công ty TNHH Thương Mại Dịch Vụ Công Nghệ Số Hùng Mạnh</p>
                        <h3 style="font-size: 16px;margin-bottom: 2px;">Sửa chữa Laptop24h.com - Hải Phòng</h3>
                        <h3 style="font-size: 16px">Điện thoại: 02256556555 / 0988979333</h3>
                    </div>
                    <div  style="align: center; margin: 24px 0 28px;text-align:center"">
                        <h2  style="align: center; margin-bottom: 4px;">CÁO CÁO CHI TIẾT CÔNG NỢ NHÀ CUNG CẤP</h2>
                        <p style="font-size: 14px; margin-bottom: 3px;">
                        <i>Từ ${fromdate} - đến ${todate}</i> 
                        </p>
                    </div>

                    <div>
                        <p style="font-size: 14px"><i>Tên khách hàng: ${user_fullname}</i></p>
                    </div>
                    <div>

                `,
                exportOptions: {
                    columns: [ 0,1,3,4,5,6,7,8,9,10]
                }
            },
            "csv", 
            "excel", 
            "pdf", 
        ],
        orderCellsTop: true,
        fixedHeader: true,
        initComplete: function() {
            var api = this.api();

            // For each column
            api
                .columns()
                .eq(0)
                .each(function(colIdx) {
                    // Set the header cell to contain the input element
                    var cell = $('.filters th').eq(
                        $(api.column(colIdx).header()).index()
                    );
                    var title = $(cell).text();
                    $(cell).html('<input type="text" placeholder="' + title + '" />');

                    // On every keypress in this input
                    $(
                            'input',
                            $('.filters th').eq($(api.column(colIdx).header()).index())
                        )
                        .off('keyup change')
                        .on('change', function(e) {
                            // Get the search value
                            $(this).attr('title', $(this).val());
                            var regexr = '({search})'; //$(this).parents('th').find('select').val();

                            // var cursorPosition = this.selectionStart;
                            // Search the column for that value
                            api
                                .column(colIdx)
                                .search(
                                    this.value != '' ?
                                    regexr.replace('{search}', '(((' + this.value + ')))') :
                                    '',
                                    this.value != '',
                                    this.value == ''
                                )
                                .draw();
                        })
                        .on('keyup', function(e) {
                            e.stopPropagation();

                        $(this).trigger('change');
                        $(this)
                            .focus()[0]
                            .setSelectionRange(cursorPosition, cursorPosition);
                    });
                });
        },

    })
    
}