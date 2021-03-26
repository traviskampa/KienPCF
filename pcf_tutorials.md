# PCF TUTORIAL

# 1. Installation
	Node, 
	PowerApp CLI,
	Visual Studio Code
	
# 2. Create PCF name MyInputControl
```
	//create a folder
	mkdir MyInputControl
	
	//initialize control
	pac pcf init --publisher-name KienPCF --name MyInputControl --template field
	
	//install Node library
	npm install

	//open Visual Studio Code
	code .				
```

# 3. Understand Manifest File

```xml
<manifest>
  <control namespace="KntControls" 
    constructor="KAlienInputMask" 
    version="0.0.3" 
    display-name-key="KntControls.KAlienInputMask" 
    description-key="Allows applying input mask on the input for immigration alien number" 
    control-type="standard">
```


# 4. Understand the PCF Component Class

You component is implement PCF standard control.
```js
export class KInputMask implements ComponentFramework.StandardControl<IInputs, IOutputs> {
```

## IInputs, IOutputs

*IInputs:* 
	This is generic interface represents what you will pass to your control.
	Use this to read PCF settings, and CRM field, CRM dataset

*IOuputs:* 
	This is generac interface represents whaat you will return to CRM environment. 
	Use this for return value to field that is bound to the component.


Four method your control need to implement
	init()
	updateView()
	getOutput()
	destroy()



```js

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
		context: 
	
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
```


# 5. Understand Creating DOM Element for the Control
	



# 6. Understand Handling Events and Manipulate Control's Properties



# 7.  