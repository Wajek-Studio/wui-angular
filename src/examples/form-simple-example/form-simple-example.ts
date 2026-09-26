import { Component } from '@angular/core';
import { WuiFormField, WuiInput, WuiLabel } from '@wajek/wui';

@Component({
  selector: 'form-simple-example',
  imports: [WuiFormField, WuiInput, WuiLabel],
  templateUrl: './form-simple-example.html'
})
export class FormSimpleExample {}
