# Step by step create PCF with Fluent UI and React

## Step 1: init the PCF, Nodes, React
```
pac pcf init --namespace KntControl --name KFLuentUIDataList --template dataset

npm install
npm install react
npm install @types/react
npm install react-dom
npm install @fluentui/react
```

## Step 2: Create React Component File:

After that, inside you app folder, create a file with extension *.tsx, you can name it any way you want.
Here we name it as KFluentUIDataList.tsx

Copy following content to the *KFluentUIDataList.tsx* file

```js
import * as React from 'react';
import {Fabric, DetailsList} from '@fluentui/react';


export class FluentUIDataListControl extends React.Component<{}, any> {
    _allItems: any;
    _columns: any;

    constructor(props: {}){
        super(props);

        //creating row data
        this._allItems = [];
        for (let i=0; i<10; i++ ) {
            this._allItems.push({
                key:i,
                name: 'Record number' + i,
                value: i,
            });
        }

        //define columns
        this._columns = [
            {key:'column1', name:'Name', fieldName:'name', minWidth:100},
            {key:'column2', name:'Value', fieldName:'value', minWidth:110}
        ];

        //Adding value to state
        this.state = {
            items: this._allItems,
            columns:this._columns,
        };
    }

    public render(){
        return (
            <Fabric>
                <DetailsList items={this.state.items} columns={this.state.columns} />
            </Fabric>
        )
    }

}
```

## Step 3: Put React Render Your Component in index.ts

In you index.ts

put some imports
```js
import * as React from 'react';
import * as ReactDom from "react-dom";
```

declare a private property for the class
```
private container: HTMLDivElement;
```

and create a method
```js
	private renderControl(context: ComponentFramework.Context<IInputs>){
		let data: any = context;
		ReactDom.render(React.createElement(FluentUIDataListControl, data, {}), this.container)
	}
```

then put the call to renderControl() on the updateView method
```js
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this.renderControl(context);
	}
```

## Step 4: Build and Run your control

Build the control

    npm run build

Run the control

    npm start