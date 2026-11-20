import { Directive } from '@angular/core';

@Directive({
  selector: '[wuiLabel]',
  host: { 
    class: 'wui-label'
  },
})
export class WuiLabel {
  
}