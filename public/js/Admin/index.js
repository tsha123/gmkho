// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(',', '').replace(' ', '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}





//=====================================char bar-------------------
// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(',', '').replace(' ', '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}


function revenueMonthly(data) {
    var ctx = document.getElementById("myAreaChart");
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["Th 1", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "Th 8", "Th 9", "Th 10", "Th 11", "Th 12"],
            datasets: [{
                label: "Doanh thu",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223, 0.05)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: [data["Month1"], data["Month2"], data["Month3"], data["Month4"], data["Month5"], data["Month6"], data["Month7"], data["Month8"], data["Month9"], data["Month10"], data["Month11"], data["Month12"]],
            }],
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        // Include a dollar sign in the ticks
                        callback: function (value, index, values) {
                            return 'VNĐ ' + number_format(value);
                        }
                    },
                    gridLines: {
                        color: "rgb(234, 236, 244)",
                        zeroLineColor: "rgb(234, 236, 244)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }],
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + ForMoneySimple(tooltipItem.yLabel) + " VND";
                    }
                }
            }
        }
    });

}


function scourceCustomer(data) {
    let arrData = [];
    for (let i = 0; i < data.Cart.length; i++) {
        let flag = 0;
        for (let j = 0; j < data.Schedule.length; j++) {
            if (data.Cart[i]["_id"] == data.Schedule[j]["_id"]) {
                arrData.push({ Name: data.Cart[i]["_id"], TotalMoney: (data.Cart[i]["TotalMoney"] + data.Schedule[j]["TotalMoney"]), Count: (data.Cart[i]["Count"] + data.Schedule[j]["Count"]) });
                flag = 1;
                break;
            }
        }
        if (flag == 0) {
            arrData.push({ Name: data.Cart[i]["_id"], TotalMoney: data.Cart[i]["TotalMoney"], Count: data.Cart[i]["Count"] });
        }
    }

    for (let i = 0; i < data.Schedule.length; i++) {
        let flag = 0;
        for (let j = 0; j < arrData.length; j++) {
            if (data.Schedule[i]["_id"] == arrData[j]["_id"]) {
                flag = 1;
                break;
            }
        }
        if (flag == 0) {
            arrData.push({ Name: data.Schedule[i]["_id"], TotalMoney: data.Schedule[i]["TotalMoney"], Count: data.Schedule[i]["Count"] });
        }
    }

    let arrFinal =
    {
        "Website": 0,
        "Google": 0,
        "Facebook": 0,
        "Giới thiệu": 0,
        "Lần đầu": 0,
        "Đã sử dụng dịch vụ": 0,
        "App": 0,
        "Quảng cáo ngoài trời": 0,
    }

    for (let i = 0; i < arrData.length; i++) {
        if (arrData[i]["Name"] == "Website") {
            arrFinal["Website"] = arrData[i]["TotalMoney"];
        }
        if (arrData[i]["Name"] == "Google") {
            arrFinal["Google"] = arrData[i]["TotalMoney"];
        }
        if (arrData[i]["Name"] == "Facebook") {
            arrFinal["Facebook"] = arrData[i]["TotalMoney"];
        }
        if (arrData[i]["Name"] == "Bạn bè giới thiệu") {
            arrFinal["Giới thiệu"] = arrData[i]["TotalMoney"];
        }
        if (arrData[i]["Name"] == "Lần đầu") {
            arrFinal["Lần đầu"] = arrData[i]["TotalMoney"];
        }
        if (arrData[i]["Name"] == "Đã sử dụng dịch vụ") {
            arrFinal["Đã sử dụng dịch vụ"] = arrData[i]["TotalMoney"];
        }
        if (arrData[i]["Name"] == "App") {
            arrFinal["App"] = arrData[i]["TotalMoney"];
        }
        if (arrData[i]["Name"] == "Quảng cáo ngoài trời") {
            arrFinal["Quảng cáo ngoài trời"] = arrData[i]["TotalMoney"];
        }
    }


    //------------------------------CHART PIE
    // Set new default font family and font color to mimic Bootstrap's default styling
    Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#858796';

    // Pie Chart Example
    var ctx = document.getElementById("myPieChart");
    var myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Website", "Google", "Facebook", "Youtube", "Giới thiệu", "Lần đầu", "Đã sử dụng dịch vụ", "App mobile", "Quảng cáo ngoài trời"],
            datasets: [{
                data: [arrFinal["Website"], arrFinal["Google"], arrFinal["Facebook"], arrFinal["Youtube"], arrFinal["Giới thiệu"], arrFinal["Lần đầu"], arrFinal["Đã sử dụng dịch vụ"], arrFinal["App"], arrFinal["Quảng cáo ngoài trời"]],
                backgroundColor: ['#6c757d', '#28a745', '#007bff', "#dc3545", '#17a2b8', '#f8f9fa', '#343a40', '#ffc107', '#ff8854'],
                hoverBackgroundColor: ['#6c757d', '#28a745', '#007bff', "#dc3545", '#17a2b8', '#f8f9fa', '#343a40', '#ffc107', '#ff8854'],
                hoverBorderColor: "rgba(234, 236, 244, 100)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: "rgb(255,255,100)",
                bodyFontColor: "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
            },
            legend: {
                display: false
            },
            cutoutPercentage: 80,
        },
    });

}



function ForMoney(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2 + ' VNĐ';
}
//dùng nhiều
function FormatDate(date_needformat) {
    let datez = new Date(date_needformat);
    let day = datez.getDate();
    let month = datez.getMonth() + 1;
    let year = datez.getFullYear();
    if (day < 10) day = "0" + day;
    if (month < 10) month = "0" + month;
    let x = day + "-" + month + "-" + year;
    return x;
}

function ForMoneySimple(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

getData()
function getData() {
    callAPI('GET', `/api/admin`, null, data => {
        $("#divTotalReceipt").html(money(data.receipts));
        $("#divPayment").html(money(data.payment));
        $("#numberBirtDay").html(data.birthday);
        // $("#divSchedule").html(data.schedule);
        revenueMonthly(data.revenue);
        // scourceCustomer(data.source);
        // draw_count(data.count)
    }, undefined, undefined, false)

}

function draw_count(data) {
    if (data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i]._id == "Sử dụng voucher khi đăng nhập vào app") {
                $("#count_voucher").html(data[i].count)
            }
            if (data[i]._id == "Đăng nhập app lần đầu") {
                $("#count_app").html(data[i].count)
            }
        }

    }
}