import { Component } from '@angular/core';
import { WuiButton } from '@wajek/wui';

@Component({
  selector: 'button-simple-example',
  imports: [WuiButton],
  template: `
    <button wuiButton>Filled Button</button>
  `
})
export class ButtonSimpleExample {}
