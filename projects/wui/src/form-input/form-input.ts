import { Component } from "@angular/core";

@Component({
    selector: 'wui-form-input',
    template: `
        <ng-content select="[wuiLabel]"></ng-content>
        <ng-content select="[wuiInput]"></ng-content>
    `
})
export class WuiFormInput { }