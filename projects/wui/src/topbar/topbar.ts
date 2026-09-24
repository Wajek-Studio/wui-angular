import { Component, Directive } from '@angular/core';

@Directive({
  selector: '[wuiTopbarLeading]',
  host: { 'class': 'wui-topbar-leading' }
})
export class WuiTopbarLeading { }

@Directive({
  selector: '[wuiTopbarContent]',
  host: { 'class': 'wui-topbar-content' }
})
export class WuiTopbarContent { }

@Directive({
  selector: '[wuiTopbarTrailing]',
  host: { 'class': 'wui-topbar-trailing' }
})
export class WuiTopbarTrailing { }

@Component({
  selector: 'wui-topbar',
  template: `
    <ng-content select="[wuiTopbarLeading]"></ng-content>
    <ng-content select="[wuiTopbarContent]"></ng-content>
    <ng-content select="[wuiTopbarTrailing]"></ng-content>
  `
})
export class WuiTopbar { }
