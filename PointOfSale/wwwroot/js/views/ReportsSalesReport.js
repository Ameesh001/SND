let tableData;

$(document).ready(function () {

    $("#txtStartDate").datepicker({ dateFormat: 'dd/mm/yy' });
    $("#txtEndDate").datepicker({ dateFormat: 'dd/mm/yy' });

   

    tableData = $('#tbdata').DataTable({
        "processing": true,
        "ajax": {
            "url": "/Reports/ReportSale?startDate=01/01/1991&endDate=01/01/1991",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "registrationDate" },
            { "data": "saleNumber" },
            { "data": "documentType" },
            { "data": "documentClient" },
            { "data": "clientName" },
            { "data": "subTotalSale" },
            { "data": "taxTotalSale" },
            { "data": "totalSale" },
            { "data": "product" },
            { "data": "quantity" },
            { "data": "price" },
            { "data": "total" }
        ],
        order: [[1, "desc"]],
        "scrollX": true,
        dom: "Bfrtip",
        buttons: [
            {
                text: 'Export Excel',
                extend: 'excelHtml5',
                title: '',
                filename: 'Sales Report',
            }, 'pageLength'
        ]
    });

    /*-------------Start Ameesh Work---------------*/
    //////////////// Default Date Setting ////////////////
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (`${month}`.length == 1) {
        month = '0' + `${month}`

    }
    if (`${day}`.length == 1) {
        day = '0' + `${day}`

    }
    let currentDate = `${day}/${month}/${year}`;

    document.getElementById("txtStartDate").value = currentDate;
    document.getElementById("txtEndDate").value = currentDate;


    var new_url = `/Reports/ReportSale?startDate=${$("#txtStartDate").val().trim()}&endDate=${$("#txtEndDate").val().trim()}`

    tableData.ajax.url(new_url).load();

    //////////////// Default Date Setting ////////////////

    /*-----------End Ameesh Work-----------*/

})



$("#btnSearch").click(function () {

    if ($("#txtStartDate").val().trim() == "" || $("#txtEndDate").val().trim() == "") {
        toastr.warning("", "You must enter start and end date");
        return;
    }

    var new_url = `/Reports/ReportSale?startDate=${$("#txtStartDate").val().trim()}&endDate=${$("#txtEndDate").val().trim()}`

    tableData.ajax.url(new_url).load();
})
