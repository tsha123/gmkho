var arrData = [];
var getOther = true;
var arrCategory = []
var arrAddExcel = []
getData()

function getData(isLoad=true)
{
    isLoading(isLoading)
    if(!getOther)
    {
        id_category = $("#selectCategory option:selected").val()
    }
    limit = $("#selectLimit option:selected").val();
    key = $("#keyFind").val()

    callAPI('GET',`${API_SUBCATEGORY}?`,{
        limit:tryParseInt(limit),
        page: tryParseInt(page),
        id_category: id_category,
        key: key,
        getOther:getOther
    },(data)=>{
        if(getOther)
        {
            arrCategory= []
            $("#selectCategory").append(`<option value="">Tất cả</option>`)
            data.arrCategory.map( category =>{
                arrCategory.push(category)
                if(id_category == category._id)
                {
                    $("select[name=selectCategory]").append(`<option selected value="${category._id}">${category.category_name}</option>`)
                }
                else
                {
                    $("select[name=selectCategory]").append(`<option value="${category._id}">${category.category_name}</option>`)
                }
            })
            getOther = false
        }
        drawTable(data.data);
        pagination(data.count,data.data.length)
        changeURL(`?limit=${limit}&page=${page}&subcategory_name=${key}&id_category=${id_category}`)
    })
}



function drawTable(data)
{
    $("#tbodyTable").empty()

    arrData = []
    for(let i = 0; i <data.length;i++)
    {
        data[i].category_name = ""
        for(let j = 0;j<arrCategory.length;j++)
        {
            if(data[i].id_category == arrCategory[j]._id)
            {
                data[i].category_name = arrCategory[j].category_name
                break
            }
        }
        arrData.push(data[i])
        
        $("#tbodyTable").append(`
            <tr>
                <td class="center">${stt+i}</td>
                <td >${data[i].subcategory_name.length > 50?data[i].subcategory_name.substring(0,50)+"...":data[i].subcategory_name}</td>
                <td >${data[i].category_name}</td>
                <td class="right">${money(data[i].subcategory_import_price)}</td>
                <td class="right">${money(data[i].subcategory_export_price)}</td>
                <td class="right">${money(data[i].subcategory_discount)}</td>
                <td class="right">${money(data[i].subcategory_part)}</td>
                <td class="right">${money(data[i].subcategory_point)}</td>
                <td>
                    <i onclick="detailSubCategory(${i})" class="mdi mdi-information text-primary detail" title="Chi tiết sản phẩm"></i>
                    <a class="mdi mdi-grease-pencil detail text-success" target="_blank" href="/subcategory-contents-management?id_subcategory=${data[i]._id}"></a>
                </td>
            </tr>
        `)
    }
    
    
}

function confirmAdd()
{
    const subcategory_name = $("#addName").val().trim()
    const subcategory_import_price = tryParseInt($("#addImportPrice").val())
    const subcategory_export_price = tryParseInt($("#addExportPrice").val())
    const subcategory_vat = tryParseInt($("#addVAT").val())
    const subcategory_ck = tryParseInt($("#addCK").val())
    const subcategory_discount = tryParseInt($("#addDiscount").val())
    const subcategory_warranty = tryParseInt($("#addWarranty").val())
    const subcategory_part = tryParseInt($("#addPart").val())
    const subcategory_point = tryParseInt($("#addPoint").val())
    const subcategory_unit = $("#addUnit").val().trim().length == 0?"Chiếc":$("#addUnit").val().trim()
    const number_warning = tryParseInt($("#addWarning").val())
    const subcategory_export_price_web = tryParseInt($("#addExportPriceWeb").val())
    const id_category = $("#addCategory option:selected").val()
    
    if(id_category.length != 24 ){
        info("Danh mục không được để trống")
        return
    }
    if(subcategory_name.length == 0 )
    {
        info("Tên sản phẩm không được để trống")
        return
    }

    hidePopup('popupAdd')
    callAPI('post',`${API_SUBCATEGORY}`,{
        subcategory_name:subcategory_name,
        subcategory_import_price:subcategory_import_price,
        subcategory_export_price:subcategory_export_price,
        subcategory_vat:subcategory_vat,
        subcategory_ck:subcategory_ck,
        subcategory_discount:subcategory_discount,
        subcategory_warranty:subcategory_warranty,
        subcategory_part:subcategory_part,
        subcategory_point:subcategory_point,
        subcategory_unit:subcategory_unit,
        number_warning:number_warning,
        id_category:id_category,
        subcategory_export_price_web:subcategory_export_price_web
    },()=>{
        success("Thành công")
        getData()
    })
  
}

function downloadTemplate()
{
    var dataDownload = [{
        "Tên sản phẩm":"",
        "Mã danh mục":"",
        "Giá nhập":"",
        "Giá bán":"",
        "VAT":"",
        "CK":"",
        "Giảm giá":"",
        "Bảo hành":"",
        "Part thưởng":"",
        "Điểm thưởng":"",
        "Số lượng cảnh báo":"",
        "Đơn vị tính":"",
    }];
   

    downloadExcelLocal(dataDownload,"Mẫu thêm sản phẩm")
}

function selectAdddExcel()
{
    arrAddExcel = []
    $("#inputAddExcel").val(null)
    $("#inputAddExcel").click()
}
function changeFileExcel(input) {
var fileUpload = input

    //Validate whether File is valid Excel file.

    if (typeof(FileReader) != "undefined") {
        var reader = new FileReader();

        //For Browsers other than IE.
        if (reader.readAsBinaryString) {
            reader.onload = function(e) {
                drawTableAddExcel(e.target.result);
            };
            reader.readAsBinaryString(fileUpload.files[0]);
        } else {
            //For IE Browser.
            reader.onload = function(e) {
                var data = "";
                var bytes = new Uint8Array(e.target.result);
                for (var i = 0; i < bytes.byteLength; i++) {
                    data += String.fromCharCode(bytes[i]);
                }
                drawTableAddExcel(data);
            };
            reader.readAsArrayBuffer(fileUpload.files[0]);
        }
    } else {
        info("Brower không hỗ trợ đọc excel");
    }

};

function drawTableAddExcel(data) {

    $("#divTableAddExcel").html(`
        <table id="tableAddExcel" class="table table-hover">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá nhập</th>
                    <th>Giá bán</th>
                    <th>VAT</th>
                    <th>CK</th>
                    <th>Giảm giá</th>
                    <th>Đơn vị tính</th>
                    <th>Bảo hành</th>
                    <th>Điểm thưởng</th>
                    <th>Part thưởng</th>

                </tr>
            </thead>
            <tbody id="tbodyAddExcel"></tbody>
        </table>
    `)
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
    var Sheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[Sheet]);
    var x = [];
    arrayExcel = [];

 
    for (var i = 0; i < excelRows.length; i++) {
       
        if( typeof excelRows[i]["Tên sản phẩm"] == 'undefined'  ||  excelRows[i]["Tên sản phẩm"].trim().length == 0)
        {
            info("Tên sản phẩm không được để trống")
            return
        }
        if( typeof excelRows[i]["Mã danh mục"] == 'undefined'  ||  excelRows[i]["Mã danh mục"].trim().length == 0)
        {
            info("Mã danh mục không được để trống")
            return
        }
        var nameCategory = null
        for(let j = 0 ; j<arrCategory.length;j++ )
        {
            if(arrCategory[j]._id == excelRows[i]["Mã danh mục"].trim())
            {
                nameCategory = arrCategory[j].category_name
                break
            }

        }
        if(! nameCategory)
        {
            info(`Không tìm thấy danh mục của sản phẩm ${excelRows[i]["Tên sản phẩm"]}`)
            return
        }
        arrayExcel.push({
            subcategory_name:excelRows[i]["Tên sản phẩm"].trim(),
            id_category: excelRows[i]["Mã danh mục"].trim(),
            subcategory_import_price : tryParseInt(excelRows[i]["Giá nhập"]),
            subcategory_export_price : tryParseInt(excelRows[i]["Giá bán"]),
            subcategory_vat : tryParseInt(excelRows[i]["VAT"]),
            subcategory_ck : tryParseInt(excelRows[i]["CK"]),
            subcategory_discount : tryParseInt(excelRows[i]["Giảm giá"]),
            subcategory_part : tryParseInt(excelRows[i]["Part thưởng"]),
            subcategory_point : tryParseInt(excelRows[i]["Điểm thưởng"]),
            subcategory_unit : excelRows[i]["Đơn vị tính"],
            number_warning : tryParseInt(excelRows[i]["Số lượng cảnh báo"]),
            subcategory_warranty : tryParseInt(excelRows[i]["Bảo hành"]),
            category_name:nameCategory
        })

        $("#tbodyAddExcel").append(`
            <tr>
                <td class="center">${i+1}</td>
                <td>${excelRows[i]["Tên sản phẩm"].trim()}</td>
                <td>${nameCategory}</td>
                <td class="">${money(tryParseInt(excelRows[i]["Giá nhập"]))}</td>
                <td class="right">${money(tryParseInt(excelRows[i]["Giá bán"]))}</td>
                <td class="right">${money(tryParseInt(excelRows[i]["VAT"]))} %</td>
                <td class="right">${money(tryParseInt(excelRows[i]["CK"]))} %</td>
                <td class="right">${money(tryParseInt(excelRows[i]["Giảm giá"]))}</td>
                <td class="center">${excelRows[i]["Đơn vị tính"]}</td>
                <td class="right">${money(tryParseInt(excelRows[i]["Bảo hành"]))}</td>
                <td class="right">${money(tryParseInt(excelRows[i]["Điểm thưởng"]))}</td>
                <td class="right">${money(tryParseInt(excelRows[i]["Part thưởng"]))}</td>
            </tr>
        `)
    }
 
    dataTable('tableAddExcel',false)
    showPopup('popupAddExcel')
};

function confirmAddExcel(){
    if(arrayExcel.length == 0)
    {
        info("Hãy chọn ít nhất một sản phẩm")
        return
    }

    if(arrayExcel.length > 100)
    {
        info("Số lượng sản phẩm quá lớn - số lượng tối đa là 100 sản phẩm")
        return
    }
    hidePopup('popupAddExcel')
    callAPI('post',`${API_SUBCATEGORY}/excel`,{arrayExcel:arrayExcel} , (data)=>{
        success("Thành công")
        getData()
    })

}

function detailSubCategory(index)
{
    $("#editCategory").val(arrData[index].id_category).change()
    $("#editName").val(arrData[index].subcategory_name)
    $("#editImportPrice").val(money(arrData[index].subcategory_import_price))
    $("#editExportPrice").val(money(arrData[index].subcategory_export_price))
    $("#editVAT").val(money(arrData[index].subcategory_vat))
    $("#editCK").val(money(arrData[index].subcategory_ck))
    $("#editDiscount").val(money(arrData[index].subcategory_discount))
    $("#editWarranty").val(money(arrData[index].subcategory_warranty))
    $("#editPart").val(money(arrData[index].subcategory_part))
    $("#editPoint").val(money(arrData[index].subcategory_point))
    $("#editPoint").val(money(arrData[index].subcategory_point))
    $("#editUnit").val(money(arrData[index].subcategory_unit))
    $("#editExportPriceWeb").val(money(arrData[index].subcategory_export_price_web))

    $("#btnConfirmEdit").attr("onclick",`confirmSaveEdit(${index})`)
    showPopup('popupEdit')
}

function confirmSaveEdit(index)
{
    const subcategory_name = $("#editName").val().trim()
    const subcategory_import_price = tryParseInt($("#editImportPrice").val())
    const subcategory_export_price = tryParseInt($("#editExportPrice").val())
    const subcategory_vat = tryParseInt($("#editVAT").val())
    const subcategory_ck = tryParseInt($("#editCK").val())
    const subcategory_discount = tryParseInt($("#editDiscount").val())
    const subcategory_warranty = tryParseInt($("#editWarranty").val())
    const subcategory_part = tryParseInt($("#editPart").val())
    const subcategory_point = tryParseInt($("#editPoint").val())
    const subcategory_export_price_web = tryParseInt($("#editExportPriceWeb").val())
    const subcategory_unit = $("#editUnit").val().trim().length == 0?"Chiếc":$("#editUnit").val().trim()
    const id_category = $("#editCategory option:selected").val()

    if(id_category.length != 24 ){
        info("Danh mục không được để trống")
        return
    }
    if(subcategory_name.length == 0 )
    {
        info("Tên sản phẩm không được để trống")
        return
    }

    hidePopup('popupEdit')
    callAPI('put',`${API_SUBCATEGORY}`,{
        subcategory_name:subcategory_name,
        subcategory_import_price:subcategory_import_price,
        subcategory_export_price:subcategory_export_price,
        subcategory_vat:subcategory_vat,
        subcategory_ck:subcategory_ck,
        subcategory_discount:subcategory_discount,
        subcategory_warranty:subcategory_warranty,
        subcategory_part:subcategory_part,
        subcategory_point:subcategory_point,
        subcategory_unit:subcategory_unit,
        id_category:id_category,
        subcategory_export_price_web:subcategory_export_price_web,
        id_subcategory:arrData[index]._id
    } , (data)=>{
        success("Thành công")
        getData()
    })
  
}