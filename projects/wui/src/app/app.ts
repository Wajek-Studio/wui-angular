import { Component } from '@angular/core';

@Component({
  selector: 'wui-app',
  template: `
    <ng-content select="wui-topbar"></ng-content>
    <ng-content></ng-content>
  `,
})
export class WuiApp {}
