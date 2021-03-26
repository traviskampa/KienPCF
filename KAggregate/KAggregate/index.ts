/**
 * This PCF control has similar effect to the aggregate/calculated field .
 * 
 * Scenario: Detentions -> (1:N) -> Inspection.
 * You want to display latest inspection date on Detention model-driven form.
 * Every time a new Inspection with Inspection Date is added, as the Detention Form is init, this 
 * field recalculated and display the latest inspection date on Detention form.
 * 
 * We achieve that by using Web API
 * 		context.webAPI.retrieveRecord(tablename, recordid, queryOptions);
 * In query, use $expand to retrieve relationship records of related table via nagivation field
 * 
 */

import { stringify } from "querystring";
import {IInputs, IOutputs} from "./generated/ManifestTypes";

import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;


//status code indicate the record status in Dynamic, 0 means record is active, 1: record is inactive
enum StateCode {ACTIVE=0, INACIVE=1};

class Settings {
	refTable:string;
	refField:string;
	navField:string;
	searchScope:string;
	saveToField:boolean=false;
	notFoundMsg: string;
	refValue:any;
	isValid:boolean=false;
	
}

class TableReference {
	recordId: string;
	tableName: string;
	constructor(typeName: string, id: string) {
		this.recordId = id;
		this.tableName = typeName;
	}
}

class UrlParams {
	etn?:string;
	id?:string;
}

const BUTTON_ID = "refresh-btn";
const BUTTON_TEXT="Refresh";
const TEXT_ID = "aggregate-text";

export class KAggregate implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private context: ComponentFramework.Context<IInputs>;

	private currentTable : TableReference;
	private settings : Settings;

	private displayElement : HTMLDivElement;

	private buttonElement: HTMLButtonElement

	private valueToStore: string = "";
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
		// Add control initialization code
		this.context = context;
		
		//retrieve current record id of this record
		this.retrieveCurrentRecord(context);
		
		this.initUserSettings();
		
		this.getReferenceFieldValue();
		
		/* initialize UI for the control */
		this.renderControlUI(container);
	}


	private retrieveCurrentRecord(context: ComponentFramework.Context<IInputs>) {

		this.currentTable = new TableReference(
			(<any>context).page.entityTypeName,
			( (<any>context).page.entityId? (<any>context).page.entityId : "NULL")  
		);

		console.log("Current table", this.currentTable);
		console.log("Current rec-id:", this.currentTable.recordId);

		//retrieve record ID using URL
		let param: UrlParams = this.getParameterFromURL();
		if (param.id) {
			console.log("id extracted form URL", param.id);
		} else {
			console.log("id extracted form URL: NULL");
		}

		//if retrieve record id using context has failed ,use record id from URL
		if (this.currentTable.recordId==null && param.id!=null){
			this.currentTable.recordId = param.id;
		}
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this.context = context;


	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		if (this.settings.saveToField) {
			console.log("save changes to field with value:", this.valueToStore);
			let result:IOutputs = {
				aggregateValue: this.valueToStore,
			};
			return result;
		} else {
			console.log("not save changes to field (saveToRecord: OFF)");
			return {};
		}
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}


	private renderControlUI(container: HTMLDivElement): void{
		let div = document.createElement("div");
		this.displayElement = document.createElement("div");
		this.displayElement.setAttribute("id", TEXT_ID );
		this.displayElement.innerHTML = this.valueToStore;

		//this.buttonElement = document.createElement("button");
		//this.buttonElement.setAttribute("id", BUTTON_ID);
		//this.buttonElement.value = BUTTON_TEXT;

		div.appendChild(this.displayElement);
		//div.appendChild(this.buttonElement);

		container.appendChild(div);

	}

	private getReferenceFieldValue(){
		if (this.currentTable.recordId=="NULL") {
			console.log("Can't find current record id. The page may be in New mode.");
			return;
		}

		let options = this.buildQuery();
		console.log("query:",options);

		//options ="?$select=pro_teachername&$expand=pro_knteacher_kncourse($select=pro_kncourseid,pro_coursedate)";

		this.context.webAPI.retrieveRecord(this.currentTable.tableName,this.currentTable.recordId, options)
			.then( 
				this.processResponse.bind(this), 
				err => console.log(err)
			);
	}

	//when the form is loaded, the URL look like this
	//	https://proaudit.crm.dynamics.com/main.aspx?appid=eceeaab2-ce43-eb11-a813-000d3a347311
	//		&cmdbar=true
	//		&forceUCI=1&navbar=off
	//		&newWindow=true
	//		&pagetype=entityrecord
	//		&etn=pro_knteacher
	//		&id=4945b1cf-4279-eb11-a812-000d3a375cad
	//
	private getParameterFromURL():{} {
		//get current page url
		const url = window.location.href;
	
		//get the part after question mark with parameters list
		const parametersString = url.split("?")[1]; 
	
		let parametersObj:any = {};
	
		if(parametersString){
			// split string to pair parameter=value
			for(let paramPairStr of parametersString.split("&")){
				let paramPair = paramPairStr.split("=");
				parametersObj[paramPair[0]] = paramPair[1];
			}
		}
	
		//as a result you will have something like this
		// {
		//     appid: f22d7a50-53fa-42c7-93d3-fd2526e23055,
		//     pagetype: entityrecord,
		//     etn: pro_knteacher,
		//     id: 77ffee28-1e8f-453f-8d51-493442bbb327
		// }
	
		return parametersObj;
	}


	/*
	pro_knteacher_kncourse: Array(2)
	0: {@odata.etag: "W/"12729909"", pro_coursedate@OData.Community.Display.V1.FormattedValue: "2/5/2021", pro_coursedate: "2021-02-05T05:00:00Z", pro_kncourseid: "7091eb90-6879-eb11-a812-000d3a375cad"}
	1: {@odata.etag: "W/"12729820"", pro_coursedate@OData.Community.Display.V1.FormattedValue: "2/2/2021", pro_coursedate: "2021-02-02T05:00:00Z", pro_kncourseid: "74169888-6879-eb11-a812-000d3a375cad"}
	length: 2
	*/

	private processResponse(response: ComponentFramework.WebApi.Entity){
		console.log("response",response);
		try {
			let array = response[this.settings.navField];
			if (array!=null && Array.isArray(array)) {

				if (array.length==0 || !(array[0].hasOwnProperty(this.settings.refField)) ){
					throw new Error(`Query response[${this.settings.navField}] is empty,`
						+` or does not contain data for referencing field ${this.settings.refField}`)
				}
				
				this.valueToStore = response[this.settings.navField][0][this.settings.refField];

				let theDate = new Date(this.valueToStore);
				//format the value as date format
				this.valueToStore = this.context.formatting.formatDateShort(theDate, false);  //date without time
			} else {
				throw new Error(`Query response[${this.settings.navField}] has no data `
					+ `of referencing table (${this.settings.refTable}) `);
			}
		}
		catch (er){
			console.log("process response encouter error:", er.message);
			this.valueToStore = this.settings.notFoundMsg;
		}
		
		console.log("extract value:",this.valueToStore);

		this.displayElement.innerHTML = this.valueToStore;
	}


	private initUserSettings(){
		this.settings = new Settings();

		this.settings.refTable = this.context.parameters.refTable.raw?
			this.context.parameters.refTable.raw : "";
		
		this.settings.refField = this.context.parameters.refField.raw?
			this.context.parameters.refField.raw: "";
		
		this.settings.navField = this.context.parameters.navField.raw?
			this.context.parameters.navField.raw: "";
		
		this.settings.notFoundMsg = this.context.parameters.notFoundMsg.raw?
			this.context.parameters.notFoundMsg.raw : "no reference value";

		this.settings.refTable = this.settings.refTable.toLowerCase(); 
		this.settings.refField = this.settings.refField.toLowerCase();
		this.settings.navField = this.settings.navField.toLowerCase();

		this.settings.searchScope = this.context.parameters.searchScope.raw?
			this.context.parameters.searchScope.raw : "all";
	
		if (this.context.parameters.saveToField.raw){
			this.settings.saveToField = (this.context.parameters.saveToField.raw=="0")? false : true;
		}

		if (this.settings.refTable=="" || this.settings.refField=="" || this.settings.navField=="") {
			this.settings.isValid = false;
		} else {
			this.settings.isValid = true;
		}
	}

	/* build query using settings 
		options ="?$select=pro_teachername&$expand=pro_knteacher_kncourse($select=pro_kncourseid,pro_coursedate)";
	*/

	private buildQuery():string {
		let query:string = "?$select={REF-TABLE}id&$expand={NAV-FIELD}($select={REF-FIELD};$orderby={REF-FIELD} desc{FILTER})";

		query = query.replace("{REF-TABLE}",this.settings.refTable);
		query = query.replace("{NAV-FIELD}",this.settings.navField);
		query = query.replace("{REF-FIELD}",this.settings.refField);	//for select
		query = query.replace("{REF-FIELD}",this.settings.refField);	//for order


		if (this.settings.searchScope == "active"){
			let filter = ";$filter=statecode eq 0";		//only active records
			query = query.replace("{FILTER}",filter);
		} else {
			query = query.replace("{FILTER}","");			//all records, no filter
		}

		return query;
	}
}