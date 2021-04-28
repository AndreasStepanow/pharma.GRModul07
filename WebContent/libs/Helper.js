sap.ui.define([
	"sap/m/Dialog", 'sap/m/Label', 'sap/m/Button', 'sap/m/TextArea', 'de/arvato/GRModul07/libs/Constants'	
], function(Dialog, Label, Button, TextArea, Constants) {
    "use strict";

    return {

	isInputValid : function(aInputs, sItems) {

	    var that = this;
	    var bValidationError = false;

	    if (aInputs) {
		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by changes
		jQuery.each(aInputs, function(i, oInput) {
		    bValidationError = that._validateInput(oInput) || bValidationError;
		});
	    }

	    if (sItems) {
		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by changes
		jQuery.each(sItems, function(i, oInput) {
		    bValidationError = that._validateItems(oInput) || bValidationError;
		});
	    }

	    return bValidationError == false;
	},

	_validateInput : function(oInput) {

	    var oBinding = oInput.getBinding("value");

	    var sValueState = "None";
	    var bValidationError = false;

	    if (oBinding && oBinding.getType()) {

		try {
		    oBinding.getType().validateValue(oInput.getValue());
		}
		catch (oException) {
		    sValueState = "Error";
		    bValidationError = true;
		}

		oInput.setValueState(sValueState);
	    }

	    return bValidationError;
	},

	_validateItems : function(oInput) {

	    var sValueState = "None";
	    var bValidationError = false;

	    var oBinding = oInput.getBinding("items");
	    if (oBinding) {

		if (oInput.getSelectedItem()) {
		    oBinding = oInput.getSelectedItem().getBinding("key");

		    if (oBinding.getType()) {

			try {
			    oBinding.getType().validateValue(oInput.getValue());
			}
			catch (oException) {
			    sValueState = "Error";
			    bValidationError = true;
			}

			oInput.setValueState(sValueState);
		    }

		}
		else {
		    sValueState = "Error";
		    bValidationError = true;
		}

	    }

	    oInput.setValueState(sValueState);

	    return bValidationError;
	},

	getErrorValue : function(oError) {
	    var oJSONError = JSON.parse(oError.responseText);
	    return oJSONError.error.message.value;
	},

	getReasonDialog : function(oContext) {

	    var oReasonDialog = new Dialog({
		title : oContext.title,
		type : 'Message',
		content : [
			new Label({ /* text: oContext.text, */
			    labelFor : 'submitDialogTextarea'
			}), new TextArea('submitDialogTextarea', {
				maxLength: Constants.LENGTH_OF_COMMENTS,
			    liveChange : function(oEvent) {
				var sText = oEvent.getParameter('value');
				var parent = oEvent.getSource().getParent();
				parent.getBeginButton().setEnabled(sText.length > 0);
			    },
			    width : '100%',
			    placeholder : 'Add note (required)'
			})
		],
		beginButton : new Button({
		    text : 'Übernehmen',
		    enabled : false,
		    press : function() {
			var oTextArea = sap.ui.getCore().byId('submitDialogTextarea');
			oContext.success(oContext.source, oTextArea.getValue());
			oTextArea.setValue("");
			oReasonDialog.close();
		    }
		}),
		endButton : new Button({
		    text : 'Abbrechen',
		    press : function() {
			oContext.abort(oContext.source);
			oReasonDialog.close();
		    }
		}),
		afterClose : function() {
		    oReasonDialog.destroy();
		}
	    });

	    return oReasonDialog;
	}

    };
});
