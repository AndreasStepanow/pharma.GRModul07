sap.ui.define([
	'sap/m/MessageToast', 'sap/m/Button', 'sap/m/Dialog', 'sap/m/Label', 'sap/m/Text', 'sap/m/TextArea',
	"sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller", "sap/m/MessageBox",
	"de/arvato/GRModul07/libs/Helper"
], function(MessageToast, Button, Dialog, Label, Text, TextArea, JSONModel, Controller, MessageBox, Helper) {
    "use strict";

    return Controller.extend("de.arvato.GRModul07.controller.Main", {

	/**
	 * @memberOf Main.onInit
	 * @author step019
	 */
	onInit : function() {

	    this._oAppModel = this.getOwnerComponent().getModel("app");
	    this._oERPModel = this.getOwnerComponent().getModel("erp");
	    this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

	    //
	    // sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
	    var oMessageManager, oModel, oView;

	    oView = this.getView();

	    // set message model
	    oMessageManager = sap.ui.getCore().getMessageManager();
	    oView.setModel(oMessageManager.getMessageModel(), "message");

	    // or just do it for the whole view
	    oMessageManager.registerObject(oView, true);

	    //
	    var oDate = new Date();
	    this._oAppModel.setProperty("/currentDate", oDate);

	    var that = this;
	    this.getView().onAfterRendering = function() {
	    	that._oAppModel.setProperty("/ControlEnabled", false);

		// sap.ndc.BarcodeScanner.scan(function(sResult) {
		// that.getOwnerComponent()._readEmployee(sResult.text, function() {
		// that._oAppModel.setProperty("/ControlEnabled", true);
		// });
		// });

		var oScanButton = this.getView().byId("idScanButton");
		if (oScanButton) {
		    oScanButton._onPress();
		}

	    }.bind(this);

	    // this._oERPModel.attachRequestCompleted(function(oEvent) {
	    // var oScanButton = this.getView().byId("idScanButton");
	    // if (oScanButton) {
	    // oScanButton._onPress();
	    // }
	    // }.bind(this));

	    var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    this.oTrigger = new sap.ui.core.IntervalTrigger(50000);
	    this.oTrigger.addListener(function() {
		if (oRoughGRComboBox) {
		    var oBinding = oRoughGRComboBox.getBinding("items");
		    if (oBinding) {
			oBinding.refresh();
		    }
		}

	    }.bind(this));

	},

	onEmployeeInputSuccess : function(oEvent) {
	    var sEmployeeIdent = oEvent.getParameter("value");
	    this.getOwnerComponent()._readEmployee(sEmployeeIdent, function() {
	    	this._oAppModel.setProperty("/ControlEnabled", true);
	    	
	    	this.getOwnerComponent()._readRoughGR(function(aRoughGR){				
				this._oAppModel.setProperty("/RoughGRSet", aRoughGR);
			}.bind(this));		
	    	
	    }.bind(this));
	},

	onGoToSemanticObject : function(oEvent) {

	    var that = this;
	    if (sap.ushell) {

		// var sAction = oEvent.getSource().data("action") ? oEvent.getSource().data("action") : undefined;

		this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
		this.oCrossAppNav.toExternal({
		    target : {
			semanticObject : oEvent.getSource().data("SemanticObject"),
			action : oEvent.getSource().data("action")
		    },
		    params : {
			"EmployeeID" : that._oAppModel.getProperty("/Employee/ID")
		    }
		});
	    }

	},
	
	onTotPalletsLiveChange: function(oEvent) {		
		this._checkPalletCount(oEvent.getSource());		 
	},
	
	onMixPalletsLiveChange: function(oEvent) {
		this._checkPalletCount(oEvent.getSource());
	},
	
	_checkPalletCount: function(oSource) {
		
		var iTotPaletts = parseInt(this.getView().byId("idTotPalettsInput").getValue());
		var iMixPaletts = parseInt(this.getView().byId("idMixPalettsInput").getValue());
		
		if ( iTotPaletts < iMixPaletts){
			
			if(oSource) {			
				oSource.setValueState("Error");
				oSource.setValueStateText(this._oBundle.getText("General.MixMoreTotalPallets"));
			} else {
				sap.m.MessageToast.show(this._oBundle.getText("General.MixMoreTotalPallets"), {
				    at : "center center"
				});
			}
			
			this._oAppModel.setProperty("/CaptureEnabled", false);
			
			return false;
			
		} else {	
			
			if (oSource){
				oSource.setValueState("None");
			}
			this._oAppModel.setProperty("/CaptureEnabled", true);
			return true;
		}
	},
	

	/**
	 * 
	 */
	pressSaveButton : function(oEvent) {

	    if (this._oAppModel) {

		if (this._oAppModel.getProperty("/Employee/Name")) {

		    var aInputs = [
			    this.getView().byId("idTotPalettsInput"), this.getView().byId("idMixPalettsInput")
		    ];

		    var aItems = [
			this.getView().byId("idRoughGRComboBox")
		    ];

		    if (!Helper.isInputValid(aInputs, aItems)) {
			sap.m.MessageToast.show(this._oBundle.getText("General.InputNotComplete"), {
			    at : "center center"
			});
			this._oAppModel.setProperty("/CaptureEnabled", false);
			return;
		    }
		    
		    
		    if (!this._checkPalletCount()){
				return;
		    }
		    
//		    var iMixPaletts = parseInt(this._oAppModel.getProperty("/MixPaletts"), 10);
//		    var iTotPaletts = parseInt(this._oAppModel.getProperty("/TotPaletts"), 10);
//		    if (iMixPaletts > iTotPaletts){
//			sap.m.MessageToast.show(this._oBundle.getText("General.MixMoreTotalPallets"), {
//			    at : "center center"
//			});
//			return;
//		    }

		    this._updateRoughGR();
		}
		else {
		    MessageToast.show(this._oBundle.getText("Main.EmployeeBarcodeMustBeScaned"), {
			at : "center center"
		    });
		}
	    }

	},
	
	onRoughGRInputSuccess : function(oEvent) {
	    var sRoughGR = oEvent.getParameter("value");
	    if (!sRoughGR) {
	    	return;
	    }

	    var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    if (oRoughGRComboBox.getItemByKey(sRoughGR)) {
			var oSel = oRoughGRComboBox.setSelectedKey(sRoughGR);
			oRoughGRComboBox.fireEvent("selectionChange", {
			    selectedItem : oSel.getSelectedItem()
			});

	    }
	    else {
	    	sap.m.MessageToast.show(this._oI18nBundle.getText("Message.RoughGRNotFound", sRoughGR));
	    }
	},

	pressAbortButton : function(oEvent) {
	    this._clearFormularData(true);
	},

	onPressObjectAttributeBenutzer : function(oEvent) {
	    this._showUserInputDialog();
	},

	_clearFormularData : function(bFull) {

	    var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    if (oRoughGRComboBox) {
		oRoughGRComboBox.setSelectedItem(null);
		oRoughGRComboBox.setValueState(sap.ui.core.ValueState.None);
	    }

	    this._oAppModel.setProperty("/MixPaletts", null);
	    this._oAppModel.setProperty("/TotPaletts", null);
	},

	onRoughGRComboBoxSelectionChange : function(oEvent) {

	    var oSelectedItem = oEvent.getSource().getSelectedItem();
	    this._oAppModel.setProperty("/Zgweno", oSelectedItem.getKey());

	    var oObject = oSelectedItem.getBindingContext("app").getObject();
	    if (oObject.MixPaletts > 0) {
		this._oAppModel.setProperty("/MixPaletts", oObject.MixPaletts);
	    }
	    else {
		this._oAppModel.setProperty("/MixPaletts", null);
	    }
	    if (oObject.TotPaletts > 0) {
		this._oAppModel.setProperty("/TotPaletts", oObject.TotPaletts);
	    }
	    else {
		this._oAppModel.setProperty("/TotPaletts", null);
	    }
	},

	_updateRoughGR : function(oEvent) {

	    var sLocation, sNotification, sSapClient;

	    var sRoughtGR = this._oAppModel.getProperty("/Zgweno");
	    var oCombo = this.getView().byId("idRoughGRComboBox");
	    var oItem = oCombo.getItemByKey(sRoughtGR);
	    var oRoughGR = {};
	    var oObject = oItem.getBindingContext("app").getObject();

	    oRoughGR.Zgweno = oObject.Zgweno;
	    oRoughGR.MixPaletts = parseInt(this._oAppModel.getProperty("/MixPaletts"), 10);
	    oRoughGR.TotPaletts = parseInt(this._oAppModel.getProperty("/TotPaletts"), 10);

	    var sPath = this._oERPModel.createKey("/RoughGRSet", {
		Zgweno : sRoughtGR
	    });

	    var that = this;
	    this._oERPModel.update(sPath, oRoughGR, {
		success : function(oData, oResponse) {
		    MessageToast.show(that._oBundle.getText("Message.RoughGRUpdateSuccessfull"), {
			at : "center center"
		    });
		    that._clearFormularData(false);
		},
		error : function(oError) {
		    MessageToast.show(Helper.getErrorValue(oError));
		}
	    });

	},

	onMessagePopoverPress : function(oEvent) {
	    this._getMessagePopover().openBy(oEvent.getSource());
	},

	_getMessagePopover : function() {
	    // create popover lazily (singleton)
	    if (!this._oMessagePopover) {
		this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(),
			"de.arvato.GRModul07.fragment.MessagePopover", this);
		this.getView().addDependent(this._oMessagePopover);
	    }
	    return this._oMessagePopover;
	}
    });
});
