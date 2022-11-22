var arrSubCategory = []
var offsetSubcategory = 1
var id_user = null
var pageSupplier = 1
var arrSupplier = []
checkPermission()
function checkPermission()
{
    drawTable()
    callAPI('GET',`${API_IMPORT}/import-supplier/checkPermission`,null,(data)=>{
        data.warehouses.map(warehouse =>{
            $("#selectWarehouse").append(`<option value="${warehouse._id}">${warehouse.warehouse_name}</option>`)
        })

        data.fundbooks.map(fund =>{
            $("#selectTypePayment").append(`<option value="${fund._id}">${fund.fundbook_name}</option>`)
        })
    })
}


function drawTable(){
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
    formatNumber()
}

// function findSupplier() {
    
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

function findProduct(input){
    
    offsetSubcategory = 1
    const key = $(input).val().trim()
    const div_subcategory = $(input).closest('td').find('div')[1]
    const div_loading = $(input).closest('td').find('div')[0]

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

function loadmoreProduct(){
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

function selectProduct(index){

    const tr = $(event.target).closest('tr')
    const tbody = $(event.target).closest('tbody')
    const td = $(event.target).closest('td')
    $(td).find('.div-product').empty()
    $($(tr).find('input')[0]).val(arrSubCategory[index].subcategory_name)
    $($(tr).find('input')[0]).attr("name",arrSubCategory[index]._id)
    $($(tr).find('input')[0]).prop("disabled",true)
    $($(tr).find('input')[2]).val(money(arrSubCategory[index].subcategory_import_price))
    $($(tr).find('input')[3]).val(money(arrSubCategory[index].subcategory_vat))
    $($(tr).find('input')[4]).val(money(arrSubCategory[index].subcategory_ck))
    if($($(tr).find('input')[5]).val() == 0){
        $($(tr).find('input')[5]).val(1)
    }
    $($(tr).find('input')[6]).val(arrSubCategory[index].subcategory_warranty)

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

function removeRow(){
    const tr = $(event.target).closest('tr')
    const tbody = $(event.target).closest('tbody')

    if( $(tr).index() != $(tbody).find('tr').length-1 ){
        $(tr).remove()
        changeMoney()
    }
    
}

function inputID_Product2() {
    const tr = $(event.target).closest('tr')
    const inputName = $($(tr).find('input')[0]).val().trim()
    const inputNumber = $(tr).find('input')[5]
    let number = 0
    let stringid = $($(tr).find('input')[1]).val().trim()
    if(event.type == 'keypress'){
        if(event.which == '13'){
            
            stringid =  stringid.split('/')
            let newStringId = ""
            stringid.map(id =>{
                if(id.trim() != '/' && id.trim().length > 0){
                    number ++;
                    newStringId += `${id.trim()} / `
                }
            })
            $(event.target).val(newStringId)
            $(inputNumber).val(money(number))
      
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

function changeNumber() {
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



// function loadmoreSupplier() {
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

$("#btnConfirm").click(e => {
    if (!id_user) {
        info("Nhà cung cấp không được để trống")
        return
    }
    let arrProduct = []
    const trs = $("#table-main tbody").find('tr')
 
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
                if (id_product2s.length > 0) {
                    let stringid =  id_product2s.split('/')
                    stringid.map(id =>{
                        if(id.trim() != '/' && id.trim().length > 0){
                            arrProduct.push({
                                id_subcategory: id_subcategory,
                                id_product2: id.trim(),
                                product_import_price: import_price,
                                product_vat: vat,
                                product_ck: ck,
                                product_discount: discount,
                                product_quantity: 1,
                                product_warranty: warranty,
                        
                            })
                        }
                    })
                }
                else {
                    arrProduct.push({
                        id_subcategory: id_subcategory,
                        id_product2: null,
                        product_import_price: import_price,
                        product_vat: vat,
                        product_ck: ck,
                        product_discount: discount,
                        product_quantity: number,
                        product_warranty: warranty,                   
                    })
                }
            }
           
        }
        
    }
    if (arrProduct.length == 0) {
        info("Hãy chọn ít nhật một sản phẩm")
        return
    }
    const id_fundbook = $("#selectTypePayment option:selected").val()
    if (!id_fundbook) {
        info("Hãy chọn hình thức thanh toán")
        return
    }
    const id_warehouse = $("#selectWarehouse option:selected").val()
    if (!id_warehouse) {
        info("Hãy chọn kho để nhập hàng")
        return
    }

    const payment_form = tryParseInt($("#paid").val())
    const import_form_note = $("input[name=note]").val()
    const url_api = `${API_IMPORT}/${ type_import == "Nhập hàng từ nhà cung cấp" ?'import-supplier':'import-period'}`
    hidePopup('popupConfirm')
    callAPI('POST', url_api, {
        type_import: type_import,
        arrProduct: JSON.stringify(arrProduct),
        id_user: id_user,
        id_warehouse: id_warehouse,
        id_fundbook: id_fundbook,
        payment_form_money: payment_form,
        import_form_note:import_form_note
    }, (data) => {
        success("Thành công")
        id_user = null
        $("#tbodyTable").empty()
        $("#div_find_supplier input").val(null)
        $("input[name=note]").val(null)
        $("#paid").val(0)
        $("#totalMoney").val(0)
        drawTable()
        changeMoney()

        const id_form = data.insertImport._id
        newPage(`/import/print/${id_form}`)
        const products = data.insertProducts
        var arrExcel = []
      
        products.map(product => {
            arrExcel.push({
                "Mã sản phẩm": product._id,
                "Mã phụ": product.id_product2?product.id_product2:"",
                "Tên sản phẩm": product.subcategory_name,
                "Giá nhập": product.product_import_price,
            })
        })
        downloadExcelLocal(arrExcel,"Danh sách mã sản phẩm")

        location.reload()
    })
})

function confirmAdd() {
    const inputs = $("#popupAdd input")
    const user_phone = $(inputs[0]).val().trim()
    const user_fullname = $(inputs[1]).val().trim()
    const user_birthday = $(inputs[2]).val().trim()
    const user_gender = $("#popupAdd select option:selected").val()
    const password = $(inputs[3]).val().trim().length > 0 ? sha512($(inputs[3]).val().trim()).toString() : null
    const user_email = $(inputs[4]).val().trim()
    const user_address = $(inputs[5]).val().trim()

    if (user_phone.length == 0) {
        info("Số điện thoại không được để trống")
        return
    }
    if (user_fullname.length == 0) {
        info("Tên khách hàng không được để trống")
        return
    }
    hidePopup('popupAdd')
    callAPI('POST', API_USER, {
        data: JSON.stringify({
            user_phone: user_phone,
            user_fullname: user_fullname,
            user_birthday: user_birthday,
            user_gender: user_gender,
            user_password: password,
            user_email: user_email,
            user_address: user_address
        })
    }, data => {
        success("Thêm thành công")
        const div = $("#div_find_supplier").parent()
        id_user = data._id
        $($(div).find('input')[0]).val(data.user_fullname)
        $($(div).find('input')[0]).attr("name",data._id)
        $($(div).find('input')[1]).val(data.user_phone)
        $($(div).find('input')[2]).val(data.user_address)
        $($(div).find('input')[3]).val(data.user_point)
    })
}
