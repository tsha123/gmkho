var arrData = [];
function getData()
{
    isLoading();
    $.ajax({
        type: 'GET',
        url: `../api/timekeeping/schedule?`,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: {
            fromdate: $("#fromdate").val(),
        },
        cache: false,
        success: function (data) {

            isLoading(false);
            drawTable(data);
            changeURL(`?fromdate=${$("#fromdate").val()}`)
        },
        error: function (data) {
            errAjax(data) 
        }
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
    isLoading();
    $.ajax({
        type: 'GET',
        url: `../api/timekeeping/schedule/report?`,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: {
            fromdate: $("#fromdateReport").val(),
            todate: $("#todateReport").val()
        },
        cache: false,
        success: function (data) {

            isLoading(false);
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
                    // console.log(data[i].data[j].late_morning.hours , data[i].data[j].late_morning.minutes,data[i].data[j].late_afternoon.hours,data[i].data[j].late_afternoon.minutes )
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
            var res = alasql('SELECT INTO XLSX("Báo cáo chấm công tháng.xlsx",?) FROM ?',
                             [opts,[dataDownload]]);
        
        },
        error: function (data) {
            errAjax(data) 
        }
    })
}

