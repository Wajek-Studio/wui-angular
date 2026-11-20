import { Component } from '@angular/core';

@Component({
  selector: 'wui-app',
  template: `
    <ng-content select="wui-topbar"></ng-content>
    <div class="wui-app-content">
      <ng-content></ng-content>
    </div>
  `,
  host: {
    class: 'wui-app'
  }
})
export class WuiApp {}
