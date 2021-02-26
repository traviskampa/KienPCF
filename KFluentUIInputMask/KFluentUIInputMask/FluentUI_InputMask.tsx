import * as React from 'react';
import * as ReactDom from "react-dom";

import { TextField, MaskedTextField, IMaskedTextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { Stack, IStackProps, IStackStyles } from 'office-ui-fabric-react/lib/Stack';
import { IMaskedTextFieldState } from '@fluentui/react';


const InputMaskProps : IMaskedTextFieldProps = {
  mask : "A-999-999-999",
  maskChar: "_",
  maskFormat : { '9': /[0-9]/, 'a': /A/, '-': /-/ }
}


//declare a class and export it at the same time
export class MyFluentUI_InputMask extends MaskedTextField {
  
  constructor(props: IMaskedTextFieldProps){
    super(props)

  }

  public render(){
    return(
      <>
        <MaskedTextField/>
      </>
    );
  }
}






const stackTokens = { childrenGap: 50 };
const iconProps = { iconName: 'Calendar' };
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 },
  styles: { root: { width: 300 } },
};



const maskFormat: { [key: string]: RegExp } = { '9': /[0-9]/, 'a': /[a-zA-Z]/, '*': /[a-zA-Z0-9]/ };
const stackTokens2 = { maxWidth: 300 };



// const inputMaskOnChangeListener = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string):void => {
//   console.log("input mask value:",  newValue);
//   let val = newValue? newValue: "";
//   newValue = destroyAlienMask(val);
//   console.log("remove mask:",newValue);

//   setInputValue(newValue);
  
// };

/*
  maskChar:  character to show in place of unfilled characters of the mask.

  mask: masking string that defines the mask's behavior. 
    A backslash will escape any character. In general mask is: '9': [0-9] 'a': [a-zA-Z] '*': [a-zA-Z0-9]

  maskFormat:  An object defining the format characters and corresponding regexp values. 
    Default format characters: { '9': /[0-9]/, 'a': /[a-zA-Z]/, '*': /[a-zA-Z0-9]/ }
*/
export const FluentUI_InputMask: React.FunctionComponent = () => {
  const inputValue = "A345535454";

  function onChangeEvent(event: React.FormEvent<HTMLInputElement|HTMLTextAreaElement>, newValue?:string):void {
    console.log("input mask value:",  newValue);
    let val = newValue? newValue: "";
    newValue = destroyAlienMask(val);
    console.log("remove mask:",newValue);

  }

  return (
    <Stack tokens={stackTokens}>
      <p>The mask has been modified here to allow "_"</p>
      <MaskedTextField 
        label="With input mask" 
        mask="A-999-999-999" 
        maskFormat={maskFormat} 
        maskChar="_" 
        onChange= { onChangeEvent }
        value = {inputValue}
        />
    </Stack>
  );
};


function destroyAlienMask(s: string):string {
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
