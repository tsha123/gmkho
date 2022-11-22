var arrData = [];
function getData()
{
    isLoading();
    $.ajax({
        type: 'GET',
        url: `../api/timekeeping?`,
        headers: {
            token: ACCESS_TOKEN,
        },
        data: {
            fromdate: $("#fromdate").val(),
            todate: $("#fromdate").val()
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
            <th>Vào sáng</th>
            <th>Ra sáng</th>
            <th>Vào chiều</th>
            <th>Ra chiều</th>
            <th>Muộn sáng</th>
            <th>Muộn chiều</th>
            <th>Ngày công</th>
            <th>Chi tiết</th>
            </tr>
        </thead>
        <tbody id="tbodyTable"></tbody>
    </table>`)

    for(let i =0;i<data.length;i++)
    {
        if(data[i].data != null)
        {
            let in_morning = data[i].data.in_morning.hours+":"+data[i].data.in_morning.minutes+":"+data[i].data.in_morning.seconds
            if(!isChecked(data[i].data.in_morning)) in_morning = "";
    
            let out_morning = data[i].data.out_morning.hours+":"+data[i].data.out_morning.minutes+":"+data[i].data.out_morning.seconds
            if(!isChecked(data[i].data.out_morning)) out_morning = "";
    
            let in_afternoon = data[i].data.in_afternoon.hours+":"+data[i].data.in_afternoon.minutes+":"+data[i].data.in_afternoon.seconds
            if(!isChecked(data[i].data.in_afternoon)) in_afternoon = "";
    
            let out_afternoon = data[i].data.out_afternoon.hours+":"+data[i].data.out_afternoon.minutes+":"+data[i].data.out_afternoon.seconds
            if(!isChecked(data[i].data.out_afternoon)) out_afternoon = "";
    
            let late_morning = data[i].data.late_morning.hours+" giờ "+ data[i].data.late_morning.minutes+" phút"
            if(!isChecked(data[i].data.late_morning)) late_morning = "";
    
            let late_afternoon = data[i].data.late_afternoon.hours+" giờ "+ data[i].data.late_afternoon.minutes+" phút"
            if(!isChecked(data[i].data.late_afternoon)) late_afternoon = "";
    
            $("#tbodyTable").append(`<tr>
                <td class="center">${i+1}</td>
                <td >${data[i].employee_fullname}</td>
                <td>${data[i].employee_phone}</td>
                <td class="center">${in_morning}</td>
                <td class="center">${out_morning}</td>
                <td class="center">${in_afternoon}</td>
                <td class="center">${out_afternoon}</td>
                <td class="center">${late_morning}</td>
                <td class="center">${late_afternoon}</td>
                <td class="center">${achievement(data[i].data.in_morning,data[i].data.out_morning,data[i].data.in_afternoon, data[i].data.out_afternoon)}</td>
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
        url: `../api/timekeeping/work/report?`,
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
                    data[i].Achievement += achievement(data[i].data[j].in_morning,data[i].data[j].out_morning,data[i].data[j].in_afternoon,data[i].data[j].out_afternoon)
                    data[i].OverTime += data[i].data[j].overtime.hours*60 + data[i].data[j].overtime.minutes
                    data[i].LateNumber = data[i].data[j].late_morning.hours*60 + data[i].data[j].late_morning.minutes + data[i].data[j].late_afternoon.hours*60 + data[i].data[j].late_afternoon.minutes
                    // console.log(data[i].data[j].late_morning.hours , data[i].data[j].late_morning.minutes,data[i].data[j].late_afternoon.hours,data[i].data[j].late_afternoon.minutes )
                }
            }
            var dataDownload = [];
            for(let i =0;i<data.length;i++)
            {
                dataDownload.push({
                    "Tên nhân viên":data[i].employee_fullname,
                    "Số điện thoại":data[i].employee_phone,
                    "Số ngày đi làm":data[i].DayNumber,
                    "Tăng ca (phút)":data[i].Overtime,
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

