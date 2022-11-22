getData()
function getData(){
    callAPI('GET',`${API_PAYMENT}/print`,{
        id_payment:id_payment
    }, data =>{
        drawTable(data.dataBranch, data.dataPayment)
    })
}

function drawTable(dataBranch, dataPayment) {

    $(".div-print .logo-branch").attr("src",`${URL_IMAGE_BRANCH}/${dataBranch.branch_logo}`)
    $(".div-print .info-branch .branch-header-content").html(`${dataBranch.branch_header_content}`)
    $(".div-print .info-branch .branch-name").html(`<b>Chi nhánh: </b>${dataBranch.branch_name}`)
    $(".div-print .info-branch .branch-address").html(`<b>Địa chỉ: </b>${dataBranch.branch_address}`)
    $(".div-print .info-branch .branch-phone").html(`<b>Số điện thoại: </b>${dataBranch.branch_phone}`)

    let title = "PHIẾU CHI"
    const dateExport = new Date(dataPayment.createdAt);
   
    $(".div-print .info-date").html(`
        <b>${title}</b><br>
        <label>Ngày thu: ${addZero(dateExport.getDate())} tháng ${addZero(dateExport.getMonth()+1)} năm ${dateExport.getFullYear()}</label><br>
        <label>Ngày in: ${formatDate().fulldatetime}</label>
    `)
    $(".div-print .info-customer").html(`
        <label><b>Khách hàng: </b> ${dataPayment.user_fullname}</label><br>
        <label><b>Số ĐT: </b> ${dataPayment.user_phone}</label> &ensp; &ensp; <b>Địa chỉ</b>: ${dataPayment.user_address}<br>
        <label><b>Ghi chú: </b>${dataPayment.payment_note}</label>
    `)

    $(".div-print .content-product").html(`
        <div><b>Số tiền:</b> ${money(dataPayment.payment_money)} &ensp; &ensp; Hình thức thanh toán: ${dataPayment.fundbook_name}</div>
        <label><b>Bằng chữ: ${tranfer_number_to_text(dataPayment.payment_money)}</b></label><br>
        <label><b>Khoản mục chi: </b>${dataPayment.accounting_entry_name}</label>
    `)
    $(`.div-print .note`).html(`
        <b>${dataBranch.branch_note}</b>
    `)
    create_barcode(id_payment, "#lbbarcode")
    var loadImage = new Image();
    loadImage.src = $(".div-print .logo-branch").attr('src');
    loadImage.onload = function() {
        document.body.innerHTML =  $("#content_print").html()
        window.print();
    }
}

function group_product_export(arr){
    
    for(let i =0;i<arr.length;i++){
        for(let j = i+1; j<arr.length;j++){
            if( (arr[i].id_subcategory == arr[j].id_subcategory) &&
                (arr[i].product_export_price == arr[j].product_export_price) && 
                (arr[i].product_vat == arr[j].product_vat) && 
                (arr[i].product_ck == arr[j].product_ck) && 
                (arr[i].product_discount == arr[j].product_discount) && 
                (arr[i].product_warranty == arr[j].product_warranty) 
            )
            {
                arr[i].product_quantity +=  arr[j].product_quantity
                arr.splice(j,1)
                j--
            }
        }
    }
    return arr
}