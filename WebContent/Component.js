sap.ui.define([
	"sap/ui/core/UIComponent", "sap/ui/Device", "de/arvato/GRModul07/model/models"
], function(UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("de.arvato.GRModul07.Component", {

	metadata : {
	    manifest : "json"
	},

	/**
	 * The component is initialized by UI5 automatically during the startup of the app and calls the init method
	 * once.
	 * 
	 * @public
	 * @override
	 */
	init : function() {
	    // call the base component's init function
	    UIComponent.prototype.init.apply(this, arguments);

	    // enable routing
	    this.getRouter().initialize();

	    // set the device model
	    this.setModel(models.createDeviceModel(), "device");
	},
	
	_readRoughGR: function(fnSuccess){
		
		var oModel = this.getModel("app");
	    var oERPModel = this.getModel("erp");    		   
	    var sReadUrl = "/RoughGRSet";

	    var aFilters = [    		    	
	    	new sap.ui.model.Filter({ path : "Zupdate", operator : "EQ", value1 : "3" }),    		    	
	    ];
	   
	    oERPModel.read(sReadUrl, {
	    	urlParameters: {
				   "$expand": "Check" },
	    	filters : aFilters,
	    	success : function(oData, oResponse) {
	    		fnSuccess(oData.results);
	    	},
	    	error : function(oError) {    			    
	    	}
	    });
	},
	
	_readEmployee : function(sIdent, fnSuccess) {

	    var oModel = this.getModel("app");
	    var oERPModel = this.getModel("erp");
	    var oBundle = this.getModel("i18n").getResourceBundle();

	    oModel.setProperty("/Employee/ID", sIdent);	    

	    // var sReadUrl = "/CheckSet('" + sInput + "')";
	    var sReadUrl = "/UserSet";

	    var oCmrRefFilter = new sap.ui.model.Filter({
		path : "Ident",
		operator : sap.ui.model.FilterOperator.EQ,
		value1 : sIdent
	    });

	    oERPModel.read(sReadUrl, {
		filters : [
		    oCmrRefFilter
		],
		success : function(oData, oResponse) {
		    var sName, sUser, sLgnum;

		    if (oData.results.length = 1) {
			var oResult = oData.results[0];
			if (oResult) {
			    sName = oResult.Address.Lastname + ", " + oResult.Address.Firstname;
			    sUser = oResult.Username;
			    sLgnum = oResult.Lgnum;
			}
			else {
			    sap.m.MessageToast.show(oBundle.getText("General.EmployeeNotFound"), {
				at : "center center"
			    });
			}
		    }
		    else {
			sap.m.MessageToast.show(oBundle.getText("General.EmployeeNotFound"), {
			    at : "center center"
			});
		    }

		    // Falls Ident nicht erkannt wurde, Wert auf undefined setzen!
		    oModel.setProperty("/Employee/Name", sName);
		    oModel.setProperty("/Employee/User", sUser);
		    oModel.setProperty("/Employee/Lgnum", sLgnum);
		    oERPModel.setHeaders({ "lgnum" : sLgnum });
		    if (sName) {			
			fnSuccess();
		    }
		},
		error : function(oError) {
		    sap.m.MessageToast.show(Helper.getErrorValue(oError), {
			at : "center center"
		    });
		}
	    });
	},
    });
});
