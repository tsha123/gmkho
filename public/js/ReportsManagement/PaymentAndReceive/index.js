$(".page-header .row div:nth-child(3) button").click( e =>{
    getData()
})

function getData(){
    const fromdate = $(".page-header .row div:first-child input").val()
    const todate = $(".page-header .row div:nth-child(2) input").val()

    callAPI('GET',`${API_PAYMENT}/report`,{
        fromdate:fromdate,
        todate:todate
    }, data =>{
        drawTable(data.dataPayment, data.dataReceive, data.dataAccounting)
    })
}

function drawTable(dataPayment, dataReceive, dataAccounting){
    let total_receive = 0
    let total_payment = 0
    for(let i =0; i<dataAccounting.length ; i++){
        dataAccounting[i].money = 0
        for(let j =0;j<dataPayment.length;j++){
            if(dataAccounting[i]._id == dataPayment[j]._id && dataAccounting[i].accounting_entry_type != 'hide' ){
                total_payment += dataPayment[j].payment_money
                dataAccounting[i].money += dataPayment[j].payment_money
            }
        }

        for(let j =0;j<dataReceive.length;j++){
            if(dataAccounting[i]._id == dataReceive[j]._id && dataAccounting[i].accounting_entry_type != 'hide'){
                total_receive += dataReceive[j].receive_money
                dataAccounting[i].money += dataReceive[j].receive_money
            }
        }
    }
    $("#table_payment").html(`
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Nội dung chi</th>
                    <th>Tổng tiền</th>
                    <th>Tỷ lệ</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot></tfoot>
        </table>
    `)

    $("#table_receive").html(`
        <table  class="table table-hover">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Nội dung thu</th>
                    <th>Tổng tiền</th>
                    <th>Tỷ lệ</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot></tfoot>
        </table>
    `)

    let stt_payment = 1;
    let stt_receive = 1;

    for(let i =0 ;i<dataAccounting.length;i++){

        if(dataAccounting[i].accounting_entry_type == "payment"){
            $("#table_payment tbody").append(`
            <tr>
                <td>${stt_payment++}</td>
                <td>${dataAccounting[i].accounting_entry_name}</td>
                <td>${money(dataAccounting[i].money)}</td>
                <td>${( isNaN(dataAccounting[i].money/total_payment*100)?0:(dataAccounting[i].money/total_payment*100)).toFixed(2)}</td>
            </tr>
            `)
        }

        if(dataAccounting[i].accounting_entry_type == "receive"){
            $("#table_receive tbody").append(`
            <tr>
                <td>${stt_receive++}</td>
                <td>${dataAccounting[i].accounting_entry_name}</td>
                <td>${money(dataAccounting[i].money)}</td>
                <td>${( isNaN(dataAccounting[i].money/total_receive*100)?0:(dataAccounting[i].money/total_receive*100)).toFixed(2)}</td>
            </tr>
            `)
        }
       
    }

    $("#table_payment tfoot").html(`<tr><td>Tổng</td><td></td><td>${money(total_payment)}</td><td></td></tr>`)
    $("#table_receive tfoot").html(`<tr><td>Tổng</td><td></td><td>${money(total_receive)}</td><td></td></tr>`)

    dataTable2($("#table_payment table"), true, false, false)
    dataTable2($("#table_receive table"),true,false, false)
}