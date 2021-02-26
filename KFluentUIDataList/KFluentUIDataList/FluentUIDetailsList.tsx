/* 
Kien Note:
This code is build from a instruction of a blog :
    https://nebulaaitsolutions.com/pcf-control-with-fluent-ui-and-react-typescript/

    This tutorial show a way to create PCF using Fluent UI.
    FluentUI provides many types of controls that we can used in PCF.
    FluentUI controls has consistent look and feel and behavior.
    Read more about FluentUI here
        https://developer.microsoft.com/en-us/fluentui#/controls/web

 */

//import React so we can use React.Component, we can import as : import {Component} from 'react', 
//then we dont have to use React.Component but use Component.
import * as React from 'react';

import {Fabric, DetailsList} from '@fluentui/react';

/* Create a React component. A component is the:
    - a function that return a XML of a DOM element
    - or a class that has render() method that return a DOM element.
*/
export class MyFluentUI_DetailsList extends React.Component<{}, any> {
    _allItems: any;
    _columns: any;

    constructor(props: {}){
        super(props);

        //creating row data. React requires any list to have a unique key so we use index as a key
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

    //this method return a Fluent UI : DetailList element. This element needs two arguments,
    //  - items argument provides the data for the list
    //  - columns argument provides the columns for the list.
    public render(){
        return (
            <Fabric>
                <DetailsList items={this.state.items} columns={this.state.columns} />
            </Fabric>
        )
    }

}