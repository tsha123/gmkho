getData()
function getData(){
    callAPI('GET',`${API_EXPORT}/print`,{
        id_export:id_export
    }, data =>{
        drawTable(data.dataBranch, data.dataExport)
    })
}

function drawTable(dataBranch, dataExport) {
    
    $(".div-print .logo-branch").attr("src",`${URL_IMAGE_BRANCH}/${dataBranch.branch_logo}`)
    $(".div-print .info-branch .branch-header-content").html(`${dataBranch.branch_header_content}`)
    $(".div-print .info-branch .branch-name").html(`<b>Chi nhánh: </b>${dataBranch.branch_name}`)
    $(".div-print .info-branch .branch-address").html(`<b>Địa chỉ: </b>${dataBranch.branch_address}`)
    $(".div-print .info-branch .branch-phone").html(`<b>Số điện thoại: </b>${dataBranch.branch_phone}`)

    let title = "PHIẾU XUẤT BÁN"
    if(dataExport.export_form_type == "Xuất hàng trả lại nhà cung cấp") title = "XUẤT TRẢ NHÀ CUNG CẤP"
    if(dataExport.export_form_type == "Xuất bảo hành") title = "XUẤT BẢO HÀNH"
    if(dataExport.export_form_type == "Xuất hàng dịch vụ sửa chữa ngoài") title = "XUẤT HÀNG DỊCH VỤ SỬA CHỮA NGOÀI"
    const dateExport = new Date(dataExport.createdAt);
   
    $(".div-print .info-date").html(`
        <b>${title}</b><br>
        <label>Ngày xuất: ${addZero(dateExport.getDate())} tháng ${addZero(dateExport.getMonth()+1)} năm ${dateExport.getFullYear()}</label><br>
        <label>Ngày in: ${formatDate().fulldatetime}</label>
    `)
    $(".div-print .info-customer").html(`
        <label><b>Khách hàng: </b> ${dataExport.user_fullname}</label><br>
        <label><b>Số ĐT: </b> ${dataExport.user_phone}</label> &ensp; &ensp; Địa chỉ: ${dataExport.user_address}<br>
        <label><b>Ghi chú: </b>${dataExport.export_form_note}</label>
    `)

    const total = calculateMoneyExport(dataExport.export_form_product)
    var total_number = 0
    var total_vat = 0
    var total_ck = 0
    var total_discount = 0
    var total_price = 0
    var total_one = 0
    const arrProduct = group_product_export(dataExport.export_form_product)

    for(let i =0; i<arrProduct.length;i++){
        total_number += arrProduct[i].product_quantity
        // total_vat += arrProduct[i].product_export_price/100*arrProduct[i].product_vat
        total_vat += arrProduct[i].product_vat

        // total_ck += arrProduct[i].product_export_price/100*arrProduct[i].product_ck
        total_ck += arrProduct[i].product_ck
        total_discount += arrProduct[i].product_discount
        total_price += arrProduct[i].product_export_price
        total_one += arrProduct[i].product_export_price*arrProduct[i].product_quantity
        const money_product = totalMoney(arrProduct[i].product_export_price,arrProduct[i].product_vat,arrProduct[i].product_ck,arrProduct[i].product_discount, arrProduct[i].product_quantity)
        $(`.div-print .content-product table tbody`).append(`
            <tr>
                <td>${i+1}</td>
                <td>${arrProduct[i].subcategory_name}</td>
                <td>${arrProduct[i].subcategory_unit}</td>
                <td>${money(arrProduct[i].product_quantity)}</td>
                <td>${money(arrProduct[i].product_export_price)}</td>
                <td>${money(arrProduct[i].product_export_price * arrProduct[i].product_quantity)}</td>
                <td>${money(arrProduct[i].product_vat)}</td>
                <td>${money(arrProduct[i].product_ck)}</td>
                <td>${money(arrProduct[i].product_discount)}</td>
                <td>${money(money_product)}</td>
                <td>${money(arrProduct[i].product_warranty)}</td>
            </tr>
        `)
    }
    $(`.div-print .content-product table tfoot`).html(`
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>${money(total_number)}</td>
            <td>${money(total_price)}</td>
            <td>${money(total_one)}</td>
            <td>${money(total_vat)}</td>
            <td>${money(total_ck)}</td>
            <td>${money(total_discount)}</td>
            <td>${money(total)}</td>
            <td></td>
        </tr>
    `)

    $(`.div-print .text-number`).html(`
        <b>Bằng chữ: ${tranfer_number_to_text(total)}</b>
    `)
    $(`.div-print .div-money`).html(`
        <div class="col col-md-4"><b>Hình thức thanh toán: ${dataExport.fundbook_name}</b></div>
        <div class="col col-md-4"><b>Thanh toán: ${money(dataExport.receive_money)}</b></div>
        <div class="col col-md-4"><b>Còn nợ: ${money(total - dataExport.receive_money )}</b></div>
    `)
    
    $(`.div-print .note`).html(`
        <b>${dataBranch.branch_note}</b>
    `)
    create_barcode(id_export, "#lbbarcode")
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