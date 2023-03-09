sap.ui.define(
    [
        "sap/ui/core/mvc/ControllerExtension",
        "sap/ui/core/Fragment",
        "sap/m/MessageToast",
        "sap/ui/model/json/JSONModel",
    ],
    function (
        ControllerExtension,
        Fragment,
        MessageToast,
        JSONModel

    ) {
        "use strict";
        return ControllerExtension.extend(
            "fiorielements.bookstockcontrol.ext.controller.ListReportExt",
            {
                onUploadCSV: function () {
                    // If the fragment is not loaded it generates it
                    Fragment.load({
                        name: "fiorielements.bookstockcontrol.ext.view.PersonalizationDialog", // Path of the fragment
                        controller: this, // Select this controller for the Dialog
                    }).then(
                        function (oDialog) {
                            this.pDialog = oDialog;
                            this.getView().addDependent(this.pDialog);
                            this.pDialog.open();
                        }.bind(this)
                    );
                },
                // Function to close the Dialog
                onCloseDialog: function () {
                    // Close dialog en clear and reset the compent inside it
                    this.pDialog.close();
                    this.pDialog.destroy(true);
                    this.pDialog = null;
                    this.oFileData = undefined;
                },

                // Function to read CSV file and prepare data for upload once done show a success msg
                handleFiles: function (oEvent) {
                    var oModelContentCsv = new JSONModel();
                    var oFileToRead = oEvent.getParameters().files["0"];
                    var reader = new FileReader();
                    // Save the register of the CSV inside an object
                    var loadHandler = function (oEvent) {
                        var csv = oEvent.target.result,
                            allTextLines = csv.split(/\r\n|\n/),
                            lines = [];
                        for (var i = 0; i < allTextLines.length; i++) {
                            var data = allTextLines[i].split(";"),
                                tarr = [];
                            for (var j = 0; j < data.length; j++) {
                                tarr.push(data[j]);
                            }
                            lines.push(tarr);
                        }
                        lines.splice(-1);
                        oModelContentCsv.setData(lines);
                        this.oFileData = oModelContentCsv.oData;
                        sap.ui.getCore().byId("messageStripId").setVisible(true);
                    }.bind(this);

                    // Error during the reading csv
                    var errorHandler = function (evt) {
                        if (evt.target.error.name == "NotReadableError") {
                            // Show message error read
                            var msgErrorRead = this.getView()
                                .getModel("i18n")
                                .getResourceBundle()
                                .getText("msgErrorRead");
                            MessageToast.show(msgErrorRead);
                        }
                    }.bind(this);

                    // Read file into memory as UTF-8
                    reader.readAsText(oFileToRead);

                    // Handle errors load
                    reader.onload = loadHandler;
                    reader.onerror = errorHandler;
                },

                // This function uploads a CSV file with book data to a table in a Fiori Elements application.
                onUploadData: function () {
                    // If the object with the load records is not undefined, the object is read and the entries are created
                    if (this.oFileData != undefined) {
                        // Get binding of the inner table
                        var oBinding = this.getView()
                            .byId("fiorielements.bookstockcontrol::BooksList--fe::table::Books::LineItem-innerTable")
                            .getBinding();
                        var aEntries = [];
                        // Format and sort the CSV data for each entry
                        for (var i in this.oFileData) {
                            var oEntry = {};
                            for (var z in this.oFileData[i]) {
                                oEntry[this.oFileData[0][z]] = this.oFileData[i][z];
                            }
                            oEntry.IsActiveEntity = true;
                            aEntries.push(oEntry);
                        }

                        // Remove header row
                        aEntries.shift();

                        // Convert stock value to integer
                        for (let i = 0; i < aEntries.length; i++) {
                            aEntries[i].stock = parseInt(aEntries[i].stock);
                        }

                        // Create every entry
                        for (var x in aEntries) {
                            var oContext = oBinding.create(aEntries[x]);
                        }

                        // Activate each draft entry
                        oContext.created()
                            .then(function () {
                                var oBinding = this.getView()
                                    .byId("fiorielements.bookstockcontrol::BooksList--fe::table::Books::LineItem-innerTable")
                                    .getBinding();

                                this.iCompleted = 0;
                                this.iItems = 0;

                                // Loop through the table's contexts to find draft entries and activate them
                                oBinding.aContexts.forEach(function (oRecord) {
                                    if (oRecord.sPath.indexOf("IsActiveEntity=false") !== -1) {
                                        var draftActivateUrl = this.getView().getModel().sServiceUrl +
                                            oRecord.sPath +
                                            "/CatalogService.draftActivate?$select=HasActiveEntity,HasDraftEntity,ID,IsActiveEntity,stock,title&$expand=DraftAdministrativeData($select=DraftIsCreatedByMe,DraftUUID,InProcessByUser)";

                                        // Make an AJAX request to activate the draft entry
                                        $.ajax({
                                            headers: {
                                                Accept: "application/json;odata.metadata=minimal;IEEE754Compatible=true",
                                                "Accept-Language": "en-US",
                                                Prefer: "handling=strict",
                                                "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true",
                                            },
                                            url: draftActivateUrl,
                                            type: "POST",
                                            success: function () {
                                                this.iCompleted++;
                                            }.bind(this),
                                            error: function (error) {
                                                console.log(`Error ${error}`);
                                            }.bind(this),
                                        });
                                        this.iItems++;
                                    }
                                }.bind(this));
                                this.checkCompleted();
                            }.bind(this))
                            .catch(function () {
                                // Handle rejection of entity creation
                                var msgLoadError = this.getView()
                                    .getModel("i18n")
                                    .getResourceBundle()
                                    .getText("msgLoadError");

                                // Show message Load with error
                                MessageToast.show(msgLoadError);
                                this.onCloseDialog();
                            }.bind(this));
                    } else {
                        // If the object is undefined show msg
                        var msgNonFileSelect = this.getView()
                            .getModel("i18n")
                            .getResourceBundle()
                            .getText("msgNonFileSelect");

                        // Show message non file selected
                        MessageToast.show(msgNonFileSelect);
                    }
                },

                checkCompleted: function () {
                    if (this.iCompleted === this.iItems) {
                        this.iCompleted = 0;
                        // Entry successfully created and Show message Load success
                        var msgLoadSuccess = this.getView()
                            .getModel("i18n")
                            .getResourceBundle()
                            .getText("msgLoadSuccess");
                        MessageToast.show(msgLoadSuccess);
                        this.onCloseDialog();
                        setTimeout(
                            function () {
                                var goBtn = this.getView().byId(
                                    "fiorielements.bookstockcontrol::BooksList--fe::FilterBar::Books-btnSearch"
                                );
                                goBtn.firePress(true);
                            }.bind(this),
                            500
                        );
                    } else {
                        setTimeout(
                            function () {
                                this.checkCompleted();
                            }.bind(this),
                            500
                        );
                    }
                },

                // Function to download template
                onDownloadTemplate: function () {
                    // define the heading for each row of the data
                    var csv = "title;stock";
                    var hiddenElement = document.createElement("a");
                    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
                    // provide the name for the CSV file to be downloaded
                    hiddenElement.download = "TemplateCsv.csv";
                    hiddenElement.click();
                },
            }
        );
    }
);