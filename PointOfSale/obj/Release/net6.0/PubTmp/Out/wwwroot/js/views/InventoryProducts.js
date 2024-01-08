let tableData;
let rowSelected;

const BASIC_MODEL = {
    idProduct: 0,
    barCode: "",
    brand: "",
    description: "",
    idCategory: 0,
    quantity: 0,
    price: 0,
    wsPrice: 0,
    invoiceRate: 0,
    crtnSize: 0,
    isActive: 1,
    photo: ""
}


$(document).ready(function () {

    fetch("/Inventory/GetCategories")
        .then(response => {
            return response.ok ? response.json() : Promise.reject(response);
        }).then(responseJson => {
            if (responseJson.data.length > 0) {

                responseJson.data.forEach((item) => {
                    $("#cboCategory").append(
                        $("<option>").val(item.idCategory).text(item.description)
                    )
                });

            }
        })
        ///////////////////////////////////////////////////////////////////////////////////

    //$.ajax({
    //    url: '/Inventory/GetProducts',
    //    type: 'GET',
    //    dataType: 'json',
    //    success: function (data) {
    //        $('#datatable-table').dataTable({
    //            "sAjaxDataProp": "",
    //            "bProcessing": true,
    //            "aaData": data,
    //            "aoColumnDefs": [
    //                { "mData": "id" },
    //                { "mData": "bandname" },
    //                { "mData": "members" },
    //                { "mData": "bio" },
    //                { "mData": "songlist" }
    //            ]
    //        });
    //    },
    //    error: function () { console.log('error retrieving customers'); }
    //});
        ///////////////////////////////////////////////////////////////////////////////////

    tableData = $("#tbData").DataTable({
        responsive: true,
        "ajax": {
            "url": "/Inventory/GetProducts",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            {
                "data": "idProduct",
                "visible": false,
                "searchable": false
            },
            {
                "data": "photoBase64", render: function (data) {
                    return `<img style="height:60px;" src="data:image/png;base64,${data}" class="rounded mx-auto d-block" />`;
                }
            },
            { "data": "barCode" },
            { "data": "brand" },
            { "data": "description" },
            { "data": "nameCategory" },
            { "data": "quantity" },
            { "data": "invoiceRate" },
            { "data": "price" },
            { "data": "wsPrice" },            
            { "data": "crtnSize" },
            {
                "data": "isActive", render: function (data) {
                    if (data == 1)
                        return '<span class="badge badge-info">Active</span>';
                    else
                        return '<span class="badge badge-danger">Inactive</span>';
                }
            },
            {
                "defaultContent": '<button class="btn btn-primary btn-edit btn-sm mr-2"><i class="mdi mdi-pencil"></i></button>' +
                    '<button class="btn btn-danger btn-delete btn-sm"><i class="mdi mdi-trash-can"></i></button>',
                "orderable": false,
                "searchable": false,
                "width": "90px"
            }
        ],
        order: [[0, "desc"]],
        dom: "Bfrtip",
        buttons: [
            {
                text: 'Export Excel',
                extend: 'excelHtml5',
                title: '',
                filename: 'Report Products',
                exportOptions: {
                    columns: [2, 3, 4, 5, 6,7,8,9,10,11]
                }
            }, 'pageLength'
        ]
    });
})

const openModal = (model = BASIC_MODEL) => {
    $("#txtId").val(model.idProduct);
    $("#txtBarCode").val(model.barCode);
    $("#txtBrand").val(model.brand);
    $("#txtDescription").val(model.description);
    $("#cboCategory").val(model.idCategory == 0 ? $("#cboCategory option:first").val() : model.idCategory);
    $("#txtQuantity").val(model.quantity);
    $("#txtPrice").val(model.price);
    $("#txtWSPrice").val(model.wsPrice);
    $("#txtinvoiceRate").val(model.invoiceRate);
    $("#txtCrtnSize").val(model.crtnSize);
    $("#cboState").val(model.isActive);
    $("#txtPhoto").val("");
    $("#imgProduct").attr("src", `data:image/png;base64,${model.photoBase64}`);

    $("#modalData").modal("show")

}

$("#btnNewProduct").on("click", function () {
    openModal()
})

$("#btnSave").on("click", function () {
    const inputs = $("input.input-validate").serializeArray();
    const inputs_without_value = inputs.filter((item) => item.value.trim() == "")

    if (inputs_without_value.length > 0) {
        const msg = `You must complete the field : "${inputs_without_value[0].name}"`;
        toastr.warning(msg, "");
        $(`input[name="${inputs_without_value[0].name}"]`).focus();
        return;
    }

    const model = structuredClone(BASIC_MODEL);
    model["idProduct"] = parseInt($("#txtId").val());
    model["barCode"] = $("#txtBarCode").val();
    model["brand"] = $("#txtBrand").val();
    model["description"] = $("#txtDescription").val();
    model["idCategory"] = $("#cboCategory").val();
    model["quantity"] = $("#txtQuantity").val();
    model["price"] = $("#txtPrice").val();
    model["wsprice"] = $("#txtWSPrice").val();
    model["invoiceRate"] = $("#txtinvoiceRate").val();
    model["crtnsize"] = $("#txtCrtnSize").val();
    model["isActive"] = $("#cboState").val();
    const inputPhoto = document.getElementById('txtPhoto');

    const formData = new FormData();
    formData.append('photo', inputPhoto.files[0]);
    formData.append('model', JSON.stringify(model));

    $("#modalData").find("div.modal-content").LoadingOverlay("show")


    if (model.idProduct == 0) {
        fetch("/Inventory/CreateProduct", {
            method: "POST",
            body: formData
        }).then(response => {
            $("#modalData").find("div.modal-content").LoadingOverlay("hide")
            return response.ok ? response.json() : Promise.reject(response);
        }).then(responseJson => {

            if (responseJson.state) {

                tableData.row.add(responseJson.object).draw(false);
                $("#modalData").modal("hide");
                swal("Successful!", "The product was created", "success");

            } else {
                swal("We're sorry", responseJson.message, "error");
            }
        }).catch((error) => {
            $("#modalData").find("div.modal-content").LoadingOverlay("hide")
        })
    } else {

        fetch("/Inventory/EditProduct", {
            method: "PUT",
            body: formData
        }).then(response => {
            $("#modalData").find("div.modal-content").LoadingOverlay("hide")
            return response.ok ? response.json() : Promise.reject(response);
        }).then(responseJson => {
            if (responseJson.state) {

                tableData.row(rowSelected).data(responseJson.object).draw(false);
                rowSelected = null;
                $("#modalData").modal("hide");
                swal("Successful!", "The product was modified", "success");

            } else {
                swal("We're sorry", responseJson.message, "error");
            }
        }).catch((error) => {
            $("#modalData").find("div.modal-content").LoadingOverlay("hide")
        })
    }

})

$("#tbData tbody").on("click", ".btn-edit", function () {

    if ($(this).closest('tr').hasClass('child')) {
        rowSelected = $(this).closest('tr').prev();
    } else {
        rowSelected = $(this).closest('tr');
    }

    const data = tableData.row(rowSelected).data();

    openModal(data);
})



$("#tbData tbody").on("click", ".btn-delete", function () {


    var ProtectedIsfound = false // default value. 
    //JavaScript method:
        //loop through the tr and td, then based on the IsProtected value to change the ProtectedIsFound value.
        var trlist = document.getElementById("tbData").getElementsByTagName("tr");
        for (var i = 1; i < trlist.length; i++) {           
                
                console.log(trlist[i].getElementsByTagName("td")[2].innerText);             
            
        }
        console.log('123');
 

    let row;

    if ($(this).closest('tr').hasClass('child')) {
        row = $(this).closest('tr').prev();
    } else {
        row = $(this).closest('tr');
    }
    const data = tableData.row(row).data();

    swal({
        title: "¿Are you sure?",
        text: `Delete the product "${data.description}"`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "No, cancel",
        closeOnConfirm: false,
        closeOnCancel: true
    },
        function (respuesta) {

            if (respuesta) {

                $(".showSweetAlert").LoadingOverlay("show")

                fetch(`/Inventory/DeleteProduct?IdProduct=${data.idProduct}`, {
                    method: "DELETE"
                }).then(response => {
                    $(".showSweetAlert").LoadingOverlay("hide")
                    return response.ok ? response.json() : Promise.reject(response);
                }).then(responseJson => {
                    if (responseJson.state) {

                        tableData.row(row).remove().draw();
                        swal("Successful!", "Product was deleted", "success");

                    } else {
                        swal("We're sorry", responseJson.message, "error");
                    }
                })
                    .catch((error) => {
                        $(".showSweetAlert").LoadingOverlay("hide")
                    })
            }
        });
})