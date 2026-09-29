import { Component, Directive } from '@angular/core';

@Component({
  selector: 'wui-topbar',
  template: `
    <ng-content select=".wui-topbar-leading"></ng-content>
    <ng-content select=".wui-topbar-content"></ng-content>
    <ng-content select=".wui-topbar-trailing"></ng-content>
  `
})
export class WuiTopbar { }
