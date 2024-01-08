
let TaxValue = 18;
let ProductsForSale = [];

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

    tableData = $("#tbData").DataTable({
        paging: false,
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
            { "data": "crtnSize" },
            {
                "defaultContent": '<input type="text" Style="width:60px;" class="form-control text-right" aria-label="Small" aria-describedby="inputGroupIGV" id="txtBox">',
                "orderable": false,
                "searchable": false,
            },
            {
                "defaultContent": '<input type="text" Style="width:60px;" class="form-control text-right" aria-label="Small" aria-describedby="inputGroupIGV" id="txtCrtn">',
                "orderable": false,
                "searchable": false,
            },
            { "data": "invoiceRate" },
            { "data": "price" },
            { "data": "wsPrice" },
            {
                "data": "isActive", render: function (data) {
                    if (data == 1)
                        return '<span class="badge badge-info">Active</span>';
                    else
                        return '<span class="badge badge-danger">Inactive</span>';
                }
            },
            
            { "data": "nameCategory" },

            { "data": "quantity" },
        ],
        order: [[0, "desc"]],
        buttons: [
            {
                //text: 'Export Excel',
                //extend: 'excelHtml5',
                //className: "buttonsToHide",
                //title: '',
                //filename: 'Received Report',
                //exportOptions: {
                //    columns: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                //}
            }
        ]
    });
})


$(window).scroll(function () {
    console.log(window);
    $("#detailfloat").stop().animate({ "marginTop": ($(window).scrollTop()) + "px", "marginLeft": ($(window).scrollLeft()) + "px" }, "slow");
});
function formatResults(data) {

    if (data.loading)
        return data.text;

    var container = $(
        `<table width="100%">
            <tr>
                <td style="width:60px">
                    <img style="height:60px;width:60px;margin-right:10px" src="data:image/png;base64,${data.photoBase64}"/>
                </td>
                <td>
                    <p style="font-weight: bolder;margin:2px">${data.brand}</p>
                    <p style="margin:2px">${data.text}</p>
                </td>
            </tr>
         </table>`
    );

    return container;
}


$(document).on('select2:open', () => {
    document.querySelector('.select2-search__field').focus();
});

$('#cboSearchProduct').on('select2:select', function (e) {
    var data = e.params.data;

    let product_found = ProductsForSale.filter(prod => prod.idProduct == data.id)
    if (product_found.length > 0) {
        $("#cboSearchProduct").val("").trigger('change');
        toastr.warning("", "The product has already been added");
        return false
    }

    swal({
        title: data.brand,
        text: data.text,
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: "Enter quantity"
    }, function (value) {

        if (value === false) return false;

        if (value === "") {
            toastr.warning("", "You need to enter the amount");
            return false
        }

        if (isNaN(parseInt(value))) {
            toastr.warning("", "You must enter a numeric value");
            return false
        }


        let product = {
            idProduct: data.id,
            brandProduct: data.brand,
            descriptionProduct: data.text,
            categoryProducty: data.category,
            quantity: parseInt(value),
            price: data.price.toString(),
            total: (parseFloat(value) * data.price).toString()
        }

        ProductsForSale.push(product)
        showProducts_Prices();

        $("#cboSearchProduct").val("").trigger('change');
        swal.close();

    });

});

function showProducts_Prices() {

    let total = 0;
    let tax = 0;
    let subtotal = 0;
    let percentage = TaxValue / 100;

    $("#tbProduct tbody").html("")

    ProductsForSale.forEach((item) => {

        total = total + parseFloat(item.total);

        $("#tbProduct tbody").append(
            $("<tr>").append(
                $("<td>").append(
                    $("<button>").addClass("btn btn-danger btn-delete btn-sm").append(
                        $("<i>").addClass("mdi mdi-trash-can")
                    ).data("idProduct", item.idProduct)
                ),
                $("<td>").text(item.descriptionProduct),
                $("<td>").text(item.quantity),
                $("<td>").text(item.price),
                $("<td>").text(item.total)
            )
        )

    })

    subtotal = total / (1 + percentage);
    tax = total - subtotal;

    $("#txtSubTotal").val(subtotal.toFixed(2))
    $("#txtTotalTaxes").val(tax.toFixed(2))
    $("#txtTotal").val(total.toFixed(2))

}

$(document).on("click", "button.btn-delete", function () {
    const _idproduct = $(this).data("idProduct")

    ProductsForSale = ProductsForSale.filter(p => p.idProduct != _idproduct)

    showProducts_Prices()
})

$("#btnFinalizeSale").click(function () {

    if (ProductsForSale.length < 1) {
        toastr.warning("", "You must enter products");
        return;
    }

    const vmDetailSale = ProductsForSale;

    const sale = {
        idTypeDocumentSale: $("#cboTypeDocumentSale").val(),
        customerDocument: $("#txtDocumentClient").val(),
        clientName: $("#txtNameClient").val(),
        subtotal: $("#txtSubTotal").val(),
        totalTaxes: $("#txtTotalTaxes").val(),
        total: $("#txtTotal").val(),
        detailSales: vmDetailSale
    }

    $("#btnFinalizeSale").closest("div.card-body").LoadingOverlay("show")

    fetch("/Sales/RegisterSale", {
        method: "POST",
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(sale)
    }).then(response => {
   
        $("#btnFinalizeSale").closest("div.card-body").LoadingOverlay("hide")
        return response.ok ? response.json() : Promise.reject(response);
    }).then(responseJson => {

        if (responseJson.state) {

            ProductsForSale = [];
            showProducts_Prices();
            $("#txtDocumentClient").val("");
            $("#txtNameClient").val("");
            $("#cboTypeDocumentSale").val($("#cboTypeDocumentSale option:first").val());

            swal("Registered!", `Sale Number : ${responseJson.object.saleNumber}`, "success");

        } else {
            swal("We're sorry", "The sale could not be registered", "error");
        }
    }).catch((error) => {
        $("#btnFinalizeSale").closest("div.card-body").LoadingOverlay("hide")
    })


})