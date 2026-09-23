import { Component } from '@angular/core';
import { WuiFormField, WuiInput, WuiLabel } from '@wajek/wui';

@Component({
  imports: [
    // WuiFormField, WuiInput, dan WuiLabel harus di-import bersamaan
    WuiFormField,
    WuiInput,
    WuiLabel,
  ],
  templateUrl: './filled.html',
})
export class FilledComponent {}