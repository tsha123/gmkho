var arrSubCategory = []
var offsetSubcategory = 1
var id_user = null
var pageSupplier = 1
var arrSupplier = []
checkPermission()
function checkPermission()
{
    drawTable()
    callAPI('GET', `${API_IMPORT}/import-supplier/more/${id_import}`, null, (data) => {
        arrSupplier.push({  // cho khách hàng cũ vào mảng và ko cho nhân viên chọn nữa
            _id: data.dataImport.id_user,
            user_fullname:data.dataImport.user_fullname,
            user_phone:data.dataImport.user_phone,
            user_address:data.dataImport.user_address,
        })
        $("input[name=note]").val(data.dataImport.import_form_note)
        selectSupplier(0)
        data.warehouses.map(warehouse => { //danh sách kho
            let isSelect = ""
            if(warehouse._id == data.dataImport.id_warehouse) isSelect = "selected"
            $("#selectWarehouse").append(`<option ${isSelect} value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })        
        data.fundbooks.map(fund =>{ // hình thức thanh toán
            $("#selectTypePayment").append(`<option value="${fund._id}">${fund.fundbook_name}</option>`)
        })
    })
}


function drawTable(){  // thêm dòng vào bảng
    $("#tbodyTable").append(`
    <tr>
        <td>
            <input oninput="findProduct(this)" class="form-control" name="" placeholder="Nhập tên sản phẩm . . .">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
            <div onscroll="loadmoreProduct()" class="div-product"></div>
        </td>
        <td><input oninput="inputID_Product2()" onkeypress="inputID_Product2()" class="form-control" placeholder="Nhập mã sản phẩm nếu có . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập giá nhập . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập VAT . . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập Chiết khấu . . ."></td>
        <td><input oninput="changeNumber()" value="0" class="number form-control" placeholder="Nhập số lượng. . ."></td>
        <td><input oninput="changeMoney()" value="0" class="number form-control" placeholder="Nhập bảo hành . . ."></td>
        <td><i onclick="removeRow()" class="mdi mdi-delete-forever"></i></td>
    </tr>
    `)
    formatNumber() // chạy lại hàm này để thực hiện việc input vào class number tự format money
}

// function findSupplier() {  // tìm kiếm nhà cung cấp từ input
    
//     id_user = null
//     const type = event.type
//     const div = $("#div_find_supplier")
    
//     const input = $(div).find('input')[0]
//     const divLoading = $(div).find('.spinner-border')[0]
//     const div_show = $(div).find('div')[1]
//     if (type == 'input')  pageSupplier = 1
//     if (type == 'scroll') pageSupplier++

    
//     if ($(input).val().trim().length > 0) {
//         $(divLoading).show()
//         callAPI('GET', `${API_USER}/findOther?`, {
//             key: $(input).val(),
//             limit: 10,
//             page:pageSupplier
//         }, users => {
//             $(divLoading).hide()
//             if (type == 'input') {
//                 $(div_show).empty()
//                 arrSupplier = []
//             }
           
//             users.map(user => {
//                 $(div_show).append(`
//                     <li><a href="javascript:void(0)" onclick="selectSupplier(${arrSupplier.length})" >Tên: ${user.user_fullname} - SĐT: ${user.user_phone}</a></li>
//                 `)
//                 arrSupplier.push(user)
//             })
//         } ,undefined, undefined,false)
//     }
//     else {
//         $(div_show).empty()
//     }
   
// }

function findProduct(input){  //tìm kiếm sản phẩm
    
    offsetSubcategory = 1
    const key = $(input).val().trim()   // từ khóa tìm kiếm 
    const div_subcategory = $(input).closest('td').find('div')[1] // đây là thẻ div để hiển thị danh sách sản phẩm được lấy ra
    const div_loading = $(input).closest('td').find('div')[0]  // đây là loading khi tìm

    if(key.length == 0){
        $(div_subcategory).empty()
        return
    }

    $(div_loading).show()
    callAPI('GET',`${API_SUBCATEGORY}/client?`,{
        key:key,
        limit:10,
        page:offsetSubcategory
    }, data =>{
        $(div_loading).hide()
        arrSubCategory = []
        $(div_subcategory).empty()

        for(let i =0;i<data.length;i++){
            arrSubCategory.push(data[i])
            $(div_subcategory).append(`
                <li><a onclick="selectProduct(${arrSubCategory.length - 1})" href="javascript:void(0)">${data[i].subcategory_name}</a></li>
            `)
        }
    },(data)=>{
        $(div_loading).hide()
        errAjax(data) 
    },false,false)
}

function loadmoreProduct(){  // khi kéo thẻ div xuống sẽ load thêm sản phẩm
    const div = $(event.target)
    if($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
        offsetSubcategory ++
        const key = $($(div).closest('td').find('input')[0]).val().trim()

        const div_loading = $(div).closest('td').find('div')[0]
    
        if(key.length == 0){
            $(div).empty()
            return
        }
    
        $(div_loading).show()
        callAPI('GET',`${API_SUBCATEGORY}/client?`,{
            key:key,
            limit:10,
            page:offsetSubcategory
        }, data =>{
            $(div_loading).hide()
            for(let i =0;i<data.length;i++){
                arrSubCategory.push(data[i])
                $(div).append(`
                    <li><a onclick="selectProduct(${arrSubCategory.length - 1})" href="javascript:void(0)">${data[i].subcategory_name}</a></li>
                `)
            }
        }, (data) => {
            $(div_loading).hide()
            errAjax(data) 
        },false,false)
    }

}

function selectProduct(index){ //chọn sản phẩm trên từng dòng

    const tr = $(event.target).closest('tr')
    const tbody = $(event.target).closest('tbody')
    const td = $(event.target).closest('td')
    $(td).find('.div-product').empty()
    $($(tr).find('input')[0]).val(arrSubCategory[index].subcategory_name)  // tên sản phẩm
    $($(tr).find('input')[0]).attr("name",arrSubCategory[index]._id) // mã sản phảm được gán vào name của input
    $($(tr).find('input')[0]).prop("disabled",true)
    $($(tr).find('input')[2]).val(money(arrSubCategory[index].subcategory_import_price)) // giá nhập
    $($(tr).find('input')[3]).val(money(arrSubCategory[index].subcategory_vat))  //vat
    $($(tr).find('input')[4]).val(money(arrSubCategory[index].subcategory_ck)) //ck
    if($($(tr).find('input')[5]).val() == 0){  // đây là cột số lượng , nếu số lượng ở cột đang bằng 0 thì gán lại = 1
        $($(tr).find('input')[5]).val(1)
    }
    $($(tr).find('input')[6]).val(arrSubCategory[index].subcategory_warranty) // cột bảo hành

    changeMoney()
    if( $(tr).index() == $(tbody).find('tr').length-1 ){
        drawTable()
    }
}

function changeMoney() {
    
    const classes_input = $(event.target).attr("class")
    if (typeof classes_input != 'undefined' && classes_input.includes('number')) {
        const input = $(event.target)
        if ($(input).val().trim().length == 0) {
            $(input).val(0)
        }
        $(input).val(money(tryParseInt($(input).val())))
    }
    const trs = $("#table-main tbody").find('tr')
    let total = 0
    for(let i = 0 ;i <trs.length;i++){
        const inputs = $(trs[i]).find('input')
        const import_price = $(inputs[2]).val()
        const vat = $(inputs[3]).val()
        const ck = $(inputs[4]).val()
        const number = $(inputs[5]).val()
        const discount = 0

        total += totalMoney(import_price, vat, ck, discount, number)
    }
    $("#totalMoney").val(money(total))
    const paid = tryParseInt($("#paid").val())
   $("#debt").val(money(total - paid))
}

function removeRow(){  // xóa dòng
    const tr = $(event.target).closest('tr')
    const tbody = $(event.target).closest('tbody')

    if( $(tr).index() != $(tbody).find('tr').length-1 ){ // nếu không phải dòng cuối dùng thì xóa bình thường
        $(tr).remove()
        changeMoney() // cập nhập lại tiền sau khi xóa
    }
    
}

function inputID_Product2() {  // sự kiện nhập mã phụ
    const tr = $(event.target).closest('tr')
    const inputName = $($(tr).find('input')[0]).val().trim()  // cột giá trị
    const inputNumber = $(tr).find('input')[5]  // cột số lượng
    let number = 0
    let stringid = $($(tr).find('input')[1]).val().trim()
    if(event.type == 'keypress'){  // ấn enter với coi như là nhập
        if(event.which == '13'){
            
            stringid =  stringid.split('/')  // chi nhỏ ra theo dấu /
            let newStringId = ""
            stringid.map(id =>{
                if(id.trim() != '/' && id.trim().length > 0){
                    number ++;
                    newStringId += `${id.trim()} / `
                }
            })
            $(event.target).val(newStringId)  // gán lại giá trị vào ô giá trị
            $(inputNumber).val(money(number)) // gán lại số lượng
      
            if(number == 0 && inputName.length > 0){
                $(inputNumber).val(1)
            }
        }
    }
    else {
        if(inputName.length == 0 && stringid.length == 0){
            $(inputNumber).val(0)
        }
    }
    changeMoney()
}

function changeNumber() { // cập nhập số lượng, có 2 trường hợp , nếu ô mã phụ rỗng thì lên bình thường , còn lại ko đc sửa vì mã phụ quyết định số lượng
    const tr = $(event.target).closest('tr')
    const inputNumber = $(tr).find('input')[5] // input số lượng
    let number = 0
    let stringid = $($(tr).find('input')[1]).val().trim()
    if (stringid.length > 0) { // nếu có mã phụ thì số lượng không dudợc thay đổi
        stringid =  stringid.split('/')
        let newStringId = ""
        stringid.map(id =>{
            if(id.trim() != '/' && id.trim().length > 0){
                number ++;
                newStringId += `${id.trim()} / `
            }
        })
        $(inputNumber).val(money(number))
    }
    else { // còn không có thì thay đổi bình thường, cập nhập lại tiền
        changeMoney()
    }
   
}



// function loadmoreSupplier() {  // load more nhà cung cấp khi kéo thẻ div
//     const div = $(event.target)
//     if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight) {
//         findSupplier()
//     }
// }

function selectSupplier(index) {
    $($(event.target).closest('div')).empty()
    const div = $("#div_find_supplier").parent()
    id_user = arrSupplier[index]._id
    $($(div).find('input')[0]).val(arrSupplier[index].user_fullname)
    $($(div).find('input')[1]).val(arrSupplier[index].user_phone)
    $($(div).find('input')[2]).val(arrSupplier[index].user_address)
}

function getParent(element, selector) {
    while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
            return element.parentElement
        }
        element = element.parentElement;
    }
}

$("#btnConfirm").click(e => {  // xác nhận nhập
    if (!id_user) {
        info("Nhà cung cấp không được để trống")
        return
    }
    let arrProduct = [] // mảng này sẽ gửi về server sử lý
    const trs = $("#table-main tbody").find('tr') // tr là các dòng sản phẩm có trong bảng
 
    for (let i = 0; i < trs.length; i++){
        const inputs = $(trs[i]).find('input')
       
        if ($(inputs[0]).val().length > 0) {

            const id_subcategory = $(inputs[0]).attr("name").trim()
            const id_product2s = $(inputs[1]).val().trim()
            const import_price = tryParseInt($(inputs[2]).val())
            const vat = tryParseInt($(inputs[3]).val())
            const ck = tryParseInt($(inputs[4]).val())
            const number = tryParseInt($(inputs[5]).val())
            const warranty = tryParseInt($(inputs[6]).val())
            const discount = tryParseInt(0)

            if (id_subcategory.length > 0) {
                if (id_product2s.length > 0) { // nếu cột mã phụ có giá trị , phải tách từng mã ra
                    let stringid =  id_product2s.split('/')
                    stringid.map(id =>{
                        if(id.trim() != '/' && id.trim().length > 0){
                            arrProduct.push({
                                id_subcategory: id_subcategory,
                                id_product2: id.trim(),
                                product_import_price: import_price,
                                product_vat: vat,
                                product_ck: ck,
                                product_quantity: 1,
                                product_discount: discount,
                                product_quantity: 1,
                                product_warranty:warranty
                            })
                        }
                    })
                }
                else { // thêm zô bình thường
                    arrProduct.push({
                        id_subcategory: id_subcategory,
                        id_product2: null,
                        product_import_price: import_price,
                        product_vat: vat,
                        product_ck: ck,
                        product_quantity: 1,
                        product_discount: discount,
                        product_quantity: number,
                        product_warranty:warranty
                    })
                }
            }
           
        }
        
    }
    if (arrProduct.length == 0) {
        info("Hãy chọn ít nhật một sản phẩm")
        return
    }
    const id_fundbook = $("#selectTypePayment option:selected").val().trim()
    if (id_fundbook.length == 0) {
        info("Hãy chọn hình thức thanh toán")
        return
    }
    const id_warehouse = $("#selectWarehouse option:selected").val().trim()
    if (id_warehouse.length == 0) {
        info("Hãy chọn kho để nhập hàng")
        return
    }
    const payment_form = tryParseInt($("#paid").val()) // giá trị đã thanh toán
    const import_form_note = $("input[name=note]").val() // ghi chú của nhân viên
    const url_api = `${API_IMPORT}/${type_import == "Nhập hàng từ nhà cung cấp"?'import-supplier':`import-period`}/add/more` 
    hidePopup('popupConfirm')
    callAPI('POST', url_api, {
        type_import: type_import,
        arrProduct: JSON.stringify(arrProduct),
        id_user: id_user,
        id_warehouse: id_warehouse,
        id_fundbook: id_fundbook,
        payment_form_money: payment_form,
        import_form_note: import_form_note,
        id_import:id_import
    }, (data) => {
        success("Thành công")
       
        $("#tbodyTable").empty()
        $("#paid").val(0)
        $("#totalMoney").val(0)
        drawTable()
        changeMoney()

        const id_form = data.insertImport._id
        const products = data.insertProducts
        var arrExcel = []
      
        products.map(product => { // đownload excel cho sản phẩm vừa nhập
            arrExcel.push({
                "Mã sản phẩm": product._id,
                "Mã phụ": product.id_product2?product.id_product2:"",
                "Tên sản phẩm": product.subcategory_name,
            })
        })
        downloadExcelLocal(arrExcel,"Danh sách mã sản phẩm")
    })
})
