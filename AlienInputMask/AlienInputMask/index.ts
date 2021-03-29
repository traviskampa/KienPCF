import {IInputs, IOutputs} from "./generated/ManifestTypes";

/** Note: in case need to use jQuery, first need to install it as dependency:
		npm install @types/jquery --save-dev
		or
		npm install jquery
	
	jQuery is only need if using onBlur() function

	@author: knguyen@procentrix.com
	@last modification: 3/29/2021
	@limitation: 
		a valid number of digits following character 'A' is 7 to 9 digits are currently hardcoded.
		May need to modification RegExp and display pattern in createAlienMask() if you want to make above condition
		can can be entered via configuration.
	
	Implementation brief:
	This control maintains two variables: 
	 - one variable with masks is for display only, 
	 - and the other to keeps alien value without mask, which is used for updating to the record.
*/

//import * as $ from 'jquery';		

export class AlienInputMask implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private errorMessage : string = "Must begin with 'A' followed by 7 to 9 digits"; 
	private valueToStore: string;

	private entityField: ComponentFramework.PropertyTypes.StringProperty;
	private _context: ComponentFramework.Context<IInputs>;

	private _container: HTMLDivElement;			//container where this control stays inside
	private inputElem: HTMLInputElement;		//hold ref to the input element
	private errorDiv : HTMLDivElement;			//hold ref to the div for display error, 
	private _notifyOutputChanged: () => void;	//hold ref to callback, called when you update the table field.

	private keyupAndChangeEvent : any;		//store the reference to the listener keyupAndChange, for later clean up.

	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		
		// this hold value that will be used to store to the table field
		this.valueToStore="";
		//this is alias point to the table's field
		this.entityField = context.parameters.entityField;
		if (this.isNotNullNotEmptyAndDefined(context.parameters.errorMessage)) {
			this.errorMessage= String(context.parameters.errorMessage?.raw);

		} else {
			//use default value
		}
		 

		this._notifyOutputChanged = notifyOutputChanged;
		this._context = context;
		this._container = container;

		//create div for the input
		let inputDiv = document.createElement("div");
		inputDiv.setAttribute("name","for-input-mask");
		
		this.inputElem = document.createElement("input");
		this.inputElem.setAttribute("id","alien-input");
		this.inputElem.setAttribute("name","alien-input");
		
		//this._input.setAttribute("class", "");

		//!Knote: bind the event listerner with (this) object so in the listerner we can refer to this object.
		this.keyupAndChangeEvent = this.onKeyUpAndChange.bind(this);
		this.inputElem.addEventListener("keyup", this.keyupAndChangeEvent);
		this.inputElem.addEventListener("change", this.keyupAndChangeEvent);

		//this.inputElem.addEventListener("blur", this.onBlur.bind(this));	//prevent lost alien to lost focus
		
		inputDiv.appendChild(this.inputElem);

		//create another div for display error
		this.errorDiv = document.createElement("div");
		this.errorDiv.setAttribute("name", "for-input-mask-error");
		this.errorDiv.innerHTML = this.errorMessage;
		
		this._container.appendChild(inputDiv);
		this._container.appendChild(this.errorDiv);	

		//update the control value by the field value first time 
		console.log('update control value by field value')
		this.valueToStore = context.parameters.entityField.raw?
			context.parameters.entityField.raw	:  "";
		
		this.inputElem.value = this.createAlienMask(this.valueToStore);
	}

	/**
	 * Called when any value in the property bag has changed. 
	 * This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 * 
	 * Kt: This method is call whenever the field that bound to the control is updated or changed.
	 * So you need to grab the field value, and update the look of control associated with it.
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		console.log('update view:');

		// storing the latest context from the control
		this._context = context;

		//!Important: dont update valueToStore to CRM field value, or you will create loop.
		//When user edit input -> valueToStore change -> we call notifyOutputChange() to update the CRM field.
		//when CRM field update, it calls updateView. If we update valueToStore to CRM field value,
		//that will remove value that we have from the input.

	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		console.log('get outputs called');
		
		let result:IOutputs = {
			entityField: this.valueToStore,
		};
		return result;
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this.inputElem.removeEventListener("keyup", this.keyupAndChangeEvent);
		this.inputElem.removeEventListener("change", this.keyupAndChangeEvent);
	}


	private onKeyUpAndChange(event: Event){
		console.log("keyup-change event");

		this.valueToStore = this.destroyAlienMask(this.inputElem.value);
		this.inputElem.value = this.createAlienMask(this.valueToStore);

		let valid = this.regexTest(this.valueToStore);
		
		//should call this whenever the value of the underlined field is changed
		console.log('call notify');
		this._notifyOutputChanged();

		this.displayErrorNotification(!valid);

		// you can access field error by doing this, but only after your value is stored in the field
		// this._context.parameters.entityField.error) {

	}

	/** 
	 * event handler that prevent the control to lost focus. This handler is only needed 
	 * if platform notification utilities function (used for prevent form being saved) 
	 * are not available for use. For now, this function is not used. 
	 * */

	/*
	private onBlur(event:Event){
		console.log("onblur event");
		
		//prevent lossing focus if regular expression test failed
		if (!this.regexTest(this.valueToStore)){
			
			//there is no method .focus() on the _input HTMLInputElement, so we use jQuery
			//setTimeout( function(this:KAlienInputMask){ this._input.focus();  }, 0);

			setTimeout( function(){ 
				console.log('prevent lost focus is set');
				$("input[name='alien-input']").focus();  
				//$("[name='alien-input']")
			},0);

			 
			//If you want to display an popup:
			//this._context.navigation.openErrorDialog({
			//	details:"",
			//	errorCode: "",
			//	message:"Alien number must be a 'A' follow by 7 or 9 digits"});
			
		}
	}
	*/
	
	/** --------------some helper methods ----------------- */

	/** 
	 * Return a provided parameter with injected mask characters for display purpose
	 * Here, the alien number is displayed in one to three group separated by (-)
	 * depending its current length.
	 */
	private createAlienMask(s:string):string{
		let re1 =/^([Aa]{1})(\d{1,3})/;
		let re2 =/^([Aa]{1})(\d{3})(\d{1,3})/;
		let re3 =/^([Aa]{1})(\d{3})(\d{3})(\d{1,3})/;

		let len = (s==null)? 0: s.trim().length;
		if (len==0) return "";

		if (len<=4){
			s = s.replace(re1, "$1-$2");
		} else if (len>4 && len<=7){
			s = s.replace(re2, "$1-$2-$3");
		} else {
			s = s.replace(re3, "$1-$2-$3-$4");
		}
		console.log("value with mask:",s);
		return s;
	}

	/** Remove all masks character in the provided parameter */
	private destroyAlienMask(s: string):string {
		if (s!=null && s.trim().length>0){
			s=s.trim();
		} else {
			return "";
		}

		let len = s.length;
		let tail = "";

		//if s has prefix with A or a
		if (s[0]!='A' && s[0]!= 'a'){
			tail = s;
		} else {
			tail = s.substring(1);
		}

		//Original: remove anything that are not number, then use only first 9 digits
		//tail = tail.replace(/\D/g,'').substring(0,9);

		//Changed to: Mr.Blackburn suggestion, not removing tail number, leave there but show the field is invalid
		tail = tail.replace(/\D/g,'');   

		s = 'A'+tail;
		console.log("value w/o mask (to store):", s);
		return s;
	}

	/** Check if the @value satisfied the regular expression required for alien number */
	private regexTest(value:string): boolean {
		if (value==null || value ===""){
			return true;
		} 

		//The valid A number is one that has 7 to 9 digits which is hardcode here (bad!)
		let re = /^[A]\d{7,9}$/;
		let r = new RegExp(re);

		let valid = r.test(value) && (value.length<=10);
		console.log("regex test:", valid);

		return valid;
	}

	/** 
	 * This method configure the notification utility, then display error message using function provided by Microsoft.
	 * Once the error notification is set, the form will prevent the record to be saved.
	 * To clear the notification, pass showError=false.
	 */
	private displayErrorNotification(showError:boolean){
		let objClearNotification = null;
		let objSetNotification = null;
		let notificationUid = "alieninputmask-invalid-entry-notification";

		//retrieve the utility from context that needed for setting notification.
		objClearNotification = this.getFuncFromContextUtils(this._context,"clearNotification");
		objSetNotification = this.getFuncFromContextUtils(this._context,"setNotification");	

		//Make sure two utility functions for display & clear notification available to use. 
		//If not, use div to display error, but be advised that 
		//using <div> to display error will not able to prevent the form to save current record.

		if( this.isNotNullNotEmptyAndDefined(objClearNotification) 
				&& this.isNotNullNotEmptyAndDefined(objSetNotification) ) {

				//Here Utility is available	
				objClearNotification = objClearNotification as Function;
				objSetNotification = objSetNotification as Function;

				if (showError) {
					//setNotification(message,notificationUid)
					console.log('set Notifiation- alien number is invalid');
					objSetNotification(this.errorMessage, notificationUid);
				}
				else  {
					//clearNotification(notificationUid)
					console.log('clear Notifiation- alient number is valid');	
					objClearNotification(notificationUid);
				}
		} else {
			//here, in case the utilities is not available to use, we use <div> to display error
			if (showError) {
				this.inputElem.classList.add("alien-invalid");
				this.errorDiv.classList.add("alien-invalid");
			} else {
				this.inputElem.classList.remove("alien-invalid");
				this.errorDiv.classList.remove("alien-invalid");
			}
		} 
	}

	/**
	 * This method retrieve the notification utilities from form context object.
	 * One application for this function is retrieving the notification utility that is used
	 * to prevent forms to save a record if an alien # is invalid.
	 * @param context : execution context
	 * @param funcName : name of the utility function for retrieving.
	 * @returns 
	 */
	public getFuncFromContextUtils(context:ComponentFramework.Context<IInputs>, funcName: string): Function | null
	{
		var funcRef = null;
		
		if(this.isNotNullNotEmptyAndDefined(context.utils) 
			&&  this.isNotNullNotEmptyAndDefined((context.utils as any)[funcName]))
		{
			funcRef = (context.utils as any)[funcName] as Function;
		}
		
		return funcRef;
	}


	/**
	 * Utility function to ensure the obj is not null, not undefined, and is not empty
	 * @param obj 
	 * @returns 
	 */
	public isNotNullNotEmptyAndDefined(obj: any): boolean
	{
		var isObjectValid: boolean = false;

		if(obj != null && obj !== "" 
			&& obj != undefined && obj !== "undefined") {
			
			isObjectValid = true;
		}
		return isObjectValid;
	}
}