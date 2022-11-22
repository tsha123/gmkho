
var arrSubCategory = []
var arrCustomer = []
var arrData = []

var offsetSubcategory = 1
checkPermission()
var type_process = null


function checkPermission(){
    callAPI('GET',`${API_DEVICE_SEPARATION}/checkPermission`,null, data =>{
        data.map( warehouse =>{
            
            const is_selected =  (warehouse._id == id_warehouse)?"selected":""
            $("select[name=select_warehouse]").append(`<option ${is_selected} value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })
        getData()
    })
}

function showPopupAdd(){
    $("#popupAdd tbody").empty()
    draw_input()
    draw_output()
    showPopup('popupAdd',true)
}

function getData(){
    limit = $("#selectLimit option:selected").val()
    const key = $("#keyFind").val()
    const id_warehouse = $("#select_warehouse option:selected").val()

    const fromdate = $("#fromdate").val()
    const todate = $("#todate").val()
    callAPI('GET',API_DEVICE_SEPARATION,{
        limit:limit,
        key:key,
        page: page,
        id_warehouse:id_warehouse,
        fromdate:fromdate,
        todate:todate
    }, data =>{
        drawTable(data.data)
        pagination(data.count, data.data.length)
        changeURL(`?limit=${limit}&page=${page}&key=${key}&fromdate=${fromdate}&todate=${todate}&id_warehouse=${id_warehouse}`)
       
    })
}



function draw_input(){
    const trs = $("#div_input tbody tr")
    $("#div_input tbody").append(`
        <tr>
            <td>${trs.length + 1}</td>
            <td>
                <input class="form-control" onkeypress="find_id_product_callback(success_find_id)" autocomplete="off"  placeholder="Nhập mã sản phẩm" type="text">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </td>
            <td>
                <input class="form-control" disabled placeholder="Tên sản phẩm" type="text">
            </td>
            <td>
                <input class="form-control number" oninput="change_money()" value="0" placeholder="Đơn giá xuất" type="text">
            </td>
            <td>
                <input class="form-control number" oninput="change_money()" value="0" placeholder="Bảo hành" type="text">
            </td>
            <td>
                <i onclick="delete_row()" class="fas fa-trash text-danger"></i>
            </td>
        </tr>
    `)
    $("#div_input tbody tr:last-child td:nth-child(2) input").focus()
}

function change_id2(){
    const input = $(event.target)
    if(event.which == '13'){
        const data_id2 = get_arr_id_product2($(input).val())
        $(input).val(data_id2.html)
        $($(input).parent().parent().find('input')[2]).val(money(data_id2.array_id.length))

        change_money()
    }
}

function get_arr_id_product2(str){
    const arrID = str.split('/');
    var idlist = "";
    let isSameId2 = 0;
    const arr_id = []
    for (let i = 0; i < arrID.length; i++) {
        if (arrID[i].trim().length > 0) {

            if (i != arrID.length - 1 && arrID[arrID.length - 1].trim() == arrID[i].trim()) {
                isSameId2 = arrID[i];
            }
            if (isSameId2 != 0) {
                if (i != (arrID.length - 1)) {
                    idlist += arrID[i].trim() + ' / ';
                    arr_id.push(arrID[i].trim())
                }
            } else {
                arr_id.push(arrID[i].trim())
                idlist += arrID[i].trim() + ' / ';

            }
        }

    }
    if (isSameId2 != 0) {
        info("Mã " + isSameId2 + " đã được nhập trước đó");
        return{
            array_id : [],
            html : idlist,
        }
    }
    return{
        array_id : arr_id,
        html : idlist,
    }
}

function draw_output(){
    const trs = $("#div_output tbody tr")
    $("#div_output tbody").append(`
        <tr>
            <td>${trs.length +1}</td>
            <td>
                <input class="form-control" oninput="findSubCategory(false,find_subcategory)" placeholder="Nhập tên sản phẩm được tách" type="text">
                 <div class="spinner-border" role="status">
                     <span class="sr-only">Loading...</span>
                 </div>
                 <div onscoll="loadmoreSubCategory(find_subcategory)"></div>
            </td>
            <td>
                <input class="form-control"  onkeypress="change_id2()" placeholder="Mã phụ" type="text">
            </td>
            <td>
                <input class="form-control number" oninput="change_money()" value="0" placeholder="Số lượng" type="text">
            </td>
            <td>
                <input class="form-control number" oninput="change_money()" value="0" placeholder="Đơn giá" type="text">
            </td>
            <td>
                <input class="form-control number" oninput="change_money()" value="0" placeholder="Bảo hành" type="text">
            </td>
            <td>
                <i onclick="delete_row()" class="fas fa-trash text-danger"></i>
            </td>
        </tr>
    `)
}

function success_find_id(data, element){
    const inputs = $(element).parent().parent().find('input')

    if(data.product_status){
        info("Thất bại! Sản phẩm này đã xuất khỏi kho, không thể thực hiện bóc tách")
        $(inputs[0]).val(null)
        return
    }
    
    $(inputs[0]).val(data._id)
    $(inputs[0]).prop("disabled",true)
    $(inputs[1]).val(data.subcategory_name)
    $(inputs[2]).val(money(data.product_import_price))
    $(inputs[3]).val(data.product_warranty)

    draw_input()
    change_money()
}

function change_money(){
    if($(event.target)[0].localName == "input" && $(event.target).hasClass("number")){
        $(event.target).val(money(tryParseInt($(event.target).val())))
    }

    const trs_input = $("#div_input tbody tr")
    const trs_output = $("#div_output tbody tr")
    const arr_input = []
    const arr_output = []

    let total_input = 0
    let total_output = 0
    for(let i = 0 ;i<trs_input.length; i++){
        const inputs = $(trs_input[i]).find('input')

        if($(inputs[0]).val().trim().length == 24){
            const price = tryParseInt($(inputs[2]).val())
            const warranty = tryParseInt($(inputs[3]).val())
            arr_input.push({
                id_product:$(inputs[0]).val().trim(),
                export_price:price,
                warranty:warranty
            })
            total_input += price
        }
    }
    for(let i = 0 ;i<trs_output.length; i++){
        const inputs = $(trs_output[i]).find('input')

        if($(inputs[0]).attr("name")){
            const data_id2 = get_arr_id_product2($(inputs[1]).val())

            // const quantity = tryParseInt($(inputs[2]).val())
            const price = tryParseInt($(inputs[3]).val())
            const warranty = tryParseInt($(inputs[4]).val())
            if(data_id2.array_id.length > 0){
                $(inputs[2]).val(money(data_id2.array_id.length))

                for(let j =0;j<data_id2.array_id.length;j++){
                    arr_output.push({
                        id_subcategory:$(inputs[0]).attr("name"),
                        import_price:price,
                        quantity:1,
                        warranty:warranty,
                        id_product2:data_id2.array_id[j].trim()
                    })
                    total_output += price
                }
            }
            else{
                const quantity = tryParseInt($(inputs[2]).val())
                arr_output.push({
                    id_subcategory:$(inputs[0]).attr("name"),
                    import_price:price,
                    quantity:quantity,
                    warranty:warranty,
                    id_product2:null
                })
                total_output += price*quantity
            }
            
        }
    }
    $("#total_input").html(money(total_input))
    $("#total_output").html(money(total_output))

    return {
        arr_input:arr_input,
        arr_output:arr_output,
        total_input:total_input,
        total_output:total_output
    }
}

function delete_row(){
    const tr = $(event.target).parent().parent()
    const trs = $(event.target).parent().parent().parent().find('tr')

  
    if(trs.index(tr) < trs.length -1){
        $(tr).remove()
        change_money()
    }

}
function find_subcategory( data, element){
    
    const div_show = $(element).find('div:last-child')
    
    for(let i =0;i<data.length;i++){
        arrSubCategory.push(data[i])
        $(div_show).append(`<li><a href="javascript:void(0)" onclick="select_subcategory(${arrSubCategory.length-1})">${data[i].subcategory_name}</a></li>`)
    }
}

function select_subcategory(index){
    const div_show = $(event.target).parent().parent()
    const parent = $(event.target).parent().parent().parent().parent()
    const inputs = $(parent).find('input')

    $(inputs[0]).val(arrSubCategory[index].subcategory_name)
    $(inputs[0]).attr("name",arrSubCategory[index]._id)
    $(inputs[0]).prop("disabled",true)

    const number = tryParseInt($(inputs[2]).val())
    if(number == 0) $(inputs[2]).val(1)
    $(inputs[3]).val(money(arrSubCategory[index].subcategory_import_price))
    $(div_show).empty()
    draw_output()
    change_money()
}

function confirm_process(){
    const data_process = change_money()
    // if(data_process.total_input != data_process.total_output){
    //     info("")
    // }
    if(data_process.arr_input.length == 0 || data_process.arr_output.length == 0){
        info("Sản phẩm bóc tách không thể để trống")
        return
    }
    if(data_process.total_input > data_process.total_output){
        info("Giá trị đầu ra không thể nhỏ hơn giá trị đầu vào")
        return
    }
    const note = $("#popupAdd .modal-body textarea").val()
    // hidePopup('popupAdd')
    callAPI('POST',API_DEVICE_SEPARATION,{
        arr_input: JSON.stringify(data_process.arr_input),
        arr_output: JSON.stringify(data_process.arr_output),
        note:note
    }, data =>{
        console.log(data)
        success("Thành công")
        newPage(`import/print/${data.id_import}`)
        const arrDownload = []
        for(let i =0;i<data.insertPro.length;i++){
            arrDownload.push({
                "Mã sản phẩm": data.insertPro[i]._id,
                "Tên sản phẩm": data.insertPro[i].subcategory_name,
                "Giá nhập": money( data.insertPro[i].product_import_price),
                // "VAT":money( data.insertPro[i].VAT),
                "Mã phụ": data.insertPro[i].id_product2,
            })
        }
        downloadExcelLocal(arrDownload,"Danh sách sản phẩm")
        getData()
    })
}

function drawTable(data){
   
    arrData = []
    $("#tbodyTable").empty()
  
    for(let i =0;i<data.length;i++){
        arrData.push(data[i])
        $("#tbodyTable").append(`
            <tr>
                <td>${stt+i}</td>
                <td>${data[i].employee_name}</td>
                <td><span class="substring">${data[i].data_export.export_form_product.length > 0?data[i].data_export.export_form_product[0].subcategory_name:""}</span></td>
                <td class="text-right">${money(calculateMoneyExport(data[i].data_export.export_form_product))}</td>
                <td><span class="substring">${data[i].data_import.import_form_product.length > 0?data[i].data_import.import_form_product[0].subcategory_name:""}</span></td>
                <td class="text-right">${money(calculateMoneyImport(data[i].data_import.import_form_product))}</td>
                <td>${data[i].warehouse_name}</td>
                <td>${data[i].data_export.export_form_note}</td>
                <td><i onclick="detail_separation(${i})" class="fas fa-info text-primary"></i></td>
            </tr>
        `)
    }
}

function detail_separation(index){
    $("#detail_input").empty()
    $("#detail_output").empty()

    $("#detail_input").html(`
        <div>
            <label><b>Mã phiếu xuất: </b> <a target="_blank" href="/export/print/${arrData[index].id_export_form}">${arrData[index].id_export_form}</a></label>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>Stt</th>
                    <th>Mã sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá trị đầu vào</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `)
    $("#detail_output").html(`
        <div>
            <label><b>Mã phiếu nhập: </b> <a target="_blank" href="/import/print/${arrData[index].id_import_form}">${arrData[index].id_import_form}</a></label>
            <br>
            <label class="text-warning"><a class="text-warning" onclick="download_id_product(${index})" href="javascript:void(0)">Tải mã</a></label>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>Stt</th>
                    <th>Tên sản phẩm</th>
                    <th>Mã phụ</th>
                    <th>Giá trị đầu ra</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `)
    
    let stt_index = 1
    arrData[index].data_export.export_form_product.map( pro =>{
        $("#detail_input tbody").append(`
            <tr>
                <td>${stt_index++}</td>
                <td>${pro.id_product}/${pro.id_product2||""}</td>
                <td><span>${pro.subcategory_name}</span></td>
                <td class="text-right">${money(pro.product_export_price)}</td>
            </tr>
        `)
    })
    stt_index = 1

    arrData[index].data_import.import_form_product.map( pro =>{
        $("#detail_output tbody").append(`
            <tr>
                <td>${stt_index++}</td>
                <td><span>${pro.subcategory_name}</span></td>
                <td>${pro.id_product2||""}</td>
                <td class="text-right">${money(pro.product_import_price)}</td>
            </tr>
        `)
    })
    showPopup('popupDetail')
}

function download_id_product(index) {
    // socket.emit("admin-get-list-idproduct", { idimport: idimport, password: password, idadmin: idadmin, groupuser: groupuser, func: id });
    callAPI('GET',`${API_FORMIMPORT}/download-idproduct`,{
        id_formimport : arrData[index].id_import_form
    }, data =>{
        const dataDownload = [];
        for(let i =0;i<data.length;i++)
        {
            dataDownload.push({"Mã sản phẩm":data[i]._id,"Tên sản phẩm":data[i].Name,"Giá nhập":data[i].ImportPrice})
        }
        const opts = [{sheetid:'One',header:true},{sheetid:'Two',header:true}];
        alasql('SELECT INTO XLSX("Danh sách mã sản phẩm.xlsx",?) FROM ?',
                         [opts,[dataDownload]]);
    })
   
}