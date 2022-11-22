var arrData = [];
var isEmployee = true
function getData()
{
    callAPI('GET',`${API_TIMEKEEPING_SCHEDULE}?`,{fromdate: $("#fromdate").val()},(data)=>{
        isLoading(false);
        drawTable(data);
        if(isEmployee)
        {
            for(let i =0;i<data.length;i++)
            {
                $("#selectEmployee").append(`<option value="${data[i]._id}">${data[i].employee_fullname}</option>`)
            }
            isEmployee = false
        }
        changeURL(`?fromdate=${$("#fromdate").val()}`)
    })
}

function drawTable(data)
{
    $("#divTable").empty();
    $("#divTable").html(`
    <table id="dataTable" class="table data">
        <thead>
            <tr>
            <th>Stt</th>
            <th>Tên nhân viên</th>
            <th>Số điện thoại</th>
            <th>Vào trưa</th>
            <th>Ra trưa</th>
            <th>Vào tối</th>
            <th>Ra tối</th>
            <th>Muộn trưa</th>
            <th>Muộn tối</th>
            <th>Chi tiết</th>
            </tr>
        </thead>
        <tbody id="tbodyTable"></tbody>
    </table>`)

    for(let i =0;i<data.length;i++)
    {
        if(data[i].data != null)
        {
            let in_noon = addZero(data[i].data.in_noon.hours)+":"+addZero(data[i].data.in_noon.minutes)+":"+addZero(data[i].data.in_noon.seconds)
            if(!isChecked(data[i].data.in_noon)) in_noon = "";
    
            let out_noon = addZero(data[i].data.out_noon.hours)+":"+addZero(data[i].data.out_noon.minutes)+":"+addZero(data[i].data.out_noon.seconds)
            if(!isChecked(data[i].data.out_noon)) out_noon = "";
    
            let in_night = addZero(data[i].data.in_night.hours)+":"+addZero(data[i].data.in_night.minutes)+":"+addZero(data[i].data.in_night.seconds)
            if(!isChecked(data[i].data.in_night)) in_night = "";
    
            let out_night = addZero(data[i].data.out_night.hours)+":"+addZero(data[i].data.out_night.minutes)+":"+addZero(data[i].data.out_night.seconds)
            if(!isChecked(data[i].data.out_night)) out_night = "";
    
            let late_noon = (data[i].data.late_noon.hours)+" giờ "+ addZero(data[i].data.late_noon.minutes)+" phút"
            if(!isChecked(data[i].data.late_noon)) late_noon = "";
    
            let late_night = (data[i].data.late_night.hours)+" giờ "+ addZero(data[i].data.late_night.minutes)+" phút"
            if(!isChecked(data[i].data.late_night)) late_night = "";
    
            $("#tbodyTable").append(`<tr>
                <td class="center">${i+1}</td>
                <td >${data[i].employee_fullname}</td>
                <td>${data[i].employee_phone}</td>
                <td class="center">${in_noon}</td>
                <td class="center">${out_noon}</td>
                <td class="center">${in_night}</td>
                <td class="center">${out_night}</td>
                <td class="center">${late_noon}</td>
                <td class="center">${late_night}</td>
                <td></td>
            </tr>`)
        }
        else
        {
            $("#tbodyTable").append(`<tr>
                <td class="center">${i+1}</td>
                <td >${data[i].employee_fullname}</td>
                <td>${data[i].employee_phone}</td>
                <td class="center"></td>
                <td class="center"></td>
                <td class="center"></td>
                <td class="center"></td>
                <td class="center"></td>
                <td></td>
                <td></td>
            </tr>`)
        }
        
    }
    dataTable()
}


function showPopupDonwload()
{
    $("#fromdateReport").val(getTime().startMonth)
    $("#todateReport").val(getTime().current)
    showPopup('popupDownload')
}

function downloadReport()
{
    callAPI('GET',`${API_TIMEKEEPING_SCHEDULE}/report?`,{
        fromdate: $("#fromdateReport").val(),
        todate: $("#todateReport").val()
    },(data)=>{
        for(let i =0;i<data.length;i++)
        {
            data[i].DayNumber = 0;
            data[i].LateNumber = 0
            data[i].OverTime = 0;
            data[i].Achievement = 0
            for(let j =0;j<data[i].data.length;j++)
            {
                data[i].DayNumber ++;
                data[i].OverTime += data[i].data[j].overtime.hours*60 + data[i].data[j].overtime.minutes
                data[i].LateNumber = data[i].data[j].late_night.hours*60 + data[i].data[j].late_night.minutes + data[i].data[j].late_noon.hours*60 + data[i].data[j].late_noon.minutes
                if(isChecked(data[i].data[j].in_noon) && isChecked(data[i].data[j].in_noon).out_noon)
                {
                    data[i].Achievement += 1
                }
                if(isChecked(data[i].data[j].in_night) && isChecked(data[i].data[j].in_noon).out_night)
                {
                    data[i].Achievement +=1
                }
                // console.log(data[i].data[j].late_noon.hours , data[i].data[j].late_noon.minutes,data[i].data[j].late_afternoon.hours,data[i].data[j].late_afternoon.minutes )
            }
        }
        var dataDownload = [];
        for(let i =0;i<data.length;i++)
        {
            dataDownload.push({
                "Tên nhân viên":data[i].employee_fullname,
                "Số điện thoại":data[i].employee_phone,
                "Số ngày có lịch":data[i].DayNumber,
                "Số công":data[i].Achievement,
                "Tổng thời gian đi muộn (phút)":data[i].LateNumber,
            })
        }
        var opts = [{sheetid:'One',header:true},{sheetid:'Two',header:false}];
        alasql('SELECT INTO XLSX("Báo cáo chấm công tháng.xlsx",?) FROM ?',
                         [opts,[dataDownload]]);
    })
  
}



function showPopupAdd()
{
    $("#add_in_noon").val(null)
    $("#add_out_noon").val(null)
    $("#add_in_night").val(null)
    $("#add_out_night").val(null)
    showPopup('popupAdd')
}

function confirmAdd()
{

    
    const date_in_noon = $("#add_in_noon").val().length == 0?new Date($("#add_in_noon").val()):new Date(getTime().current+" "+ $("#add_in_noon").val())
    const in_noon = date_in_noon == 'Invalid Date'?{hours:0,minutes:0,seconds:0}:{hours:date_in_noon.getHours(), minutes:date_in_noon.getMinutes(), seconds:date_in_noon.getSeconds()}

    const date_out_noon =$("#add_out_noon").val().length == 0?new Date($("#add_out_noon").val()):new Date(getTime().current+" "+ $("#add_out_noon").val()) 
    const out_noon = date_out_noon == 'Invalid Date'?{hours:0,minutes:0,seconds:0}:{hours:date_out_noon.getHours(), minutes:date_out_noon.getMinutes(), seconds:date_out_noon.getSeconds()}
    
    const date_in_night = $("#add_in_night").val().length == 0?new Date($("#add_in_night").val()):new Date(getTime().current+" "+ $("#add_in_night").val()) 
    const in_night = date_in_night == 'Invalid Date'?{hours:0,minutes:0,seconds:0}:{hours:date_in_night.getHours(), minutes:date_in_night.getMinutes(), seconds:date_in_night.getSeconds()}

    const date_out_night = $("#add_out_night").val().length == 0?new Date($("#add_out_night").val()):new Date(getTime().current+" "+ $("#add_out_night").val())
    const out_night = date_out_night == 'Invalid Date'?{hours:0,minutes:0,seconds:0}:{hours:date_out_night.getHours(), minutes:date_out_night.getMinutes(), seconds:date_out_night.getSeconds()}

    if(date_in_noon == 'Invalid Date' && date_in_night == 'Invalid Date')
    {
        info("Bắt buộc phải có giờ vào")
        return;
    }
    hidePopup('popupAdd')

    callAPI('POST', `${API_TIMEKEEPING_SCHEDULE}/admin`, {
        in_noon:in_noon,
        out_noon:out_noon,
        in_night:in_night,
        out_night:out_night,
        id_employee: $("#selectEmployee option:selected").val(),
    },()=>{
        success("Thành công")
        getData()
    })
    

}
