import {IInputs, IOutputs} from "./generated/ManifestTypes";

/* to use jQuery here, first need to install it as dependency:
		npm install @types/jquery --save-dev
		or
		npm install jquery
*/
import * as $ from 'jquery';


export class KAlienInputMask implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private errorMessage : string = "must have 'A' followed by 7 to 9 digits"; 
	private valueToStore: string;

	private entityField: ComponentFramework.PropertyTypes.StringProperty;
	private _context: ComponentFramework.Context<IInputs>;

	private _container: HTMLDivElement;		//container where this control stays inside
	private inputElem: HTMLInputElement;	//hold ref to the input element
	private errorDiv : HTMLDivElement;		//hold ref to the div for display error, 
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

		//this.inputElem.addEventListener("blur", this.onBlur.bind(this));
		
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
			context.parameters.entityField.raw
			:"";
		
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
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		
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

		this.displayErrorNotification(!valid, false);

		// you can access field error by doing this, but only after your value is stored in the field
		// this._context.parameters.entityField.error) {
		
	}


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

			/* 
			If you want to popup:
			this._context.navigation.openErrorDialog({
				details:"",
				errorCode: "",
				message:"Alien number must be a 'A' follow by 7 or 9 digits"});
			*/

		}
	}

	
	/* some helper methods */
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

		//remove anything that are not number, then use only first 9 digits
		//tail = tail.replace(/\D/g,'').substring(0,9);
		tail = tail.replace(/\D/g,'');   //changed to not removing tail number, leave there but show the field is invalid

		s = 'A'+tail;
		console.log("value w/o mask (to store):", s);
		return s;
	}

	private regexTest(value:string): boolean {
		if (value==null || value ===""){
			return true;
		} 

		let re = /^[A]\d{7,9}$/;
		let r = new RegExp(re);

		let valid = r.test(value) && (value.length<=10);
		console.log("regex test:", valid);

		return valid;
	}


	private displayErrorNotification(showError:boolean, useDiv:boolean){
		let objClearNotification = null;
		let objSetNotification = null;
		let uniqueId = "unique-notification-id";

		objClearNotification = this.getFuncFromContextUtils(this._context,"clearNotification");
		objSetNotification = this.getFuncFromContextUtils(this._context,"setNotification");	

		if (useDiv || !this.isNotNullNotEmptyAndDefined(objClearNotification) || !this.isNotNullNotEmptyAndDefined(objSetNotification) ){  //use div to display error
			if (showError) {
				this.inputElem.classList.add("alien-invalid");
				this.errorDiv.classList.add("alien-invalid");
			} else {
				this.inputElem.classList.remove("alien-invalid");
				this.errorDiv.classList.remove("alien-invalid");
			}
		} 
		else {	//use setNotification() to display error

			if(this.isNotNullNotEmptyAndDefined(objClearNotification) && this.isNotNullNotEmptyAndDefined(objSetNotification))
			{
				objClearNotification = objClearNotification as Function;
				objSetNotification = objSetNotification as Function;

				if (showError) {
					//setNotification(message,uniqueId)
					console.log('set Notifiation');
					objSetNotification(this.errorMessage, uniqueId);
				}
				else  {
					//clearNotification(uniqueId)
					console.log('clear Notifiation');	
					objClearNotification(uniqueId);
				}
			}
		}
	}






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