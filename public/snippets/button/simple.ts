import { Component } from '@angular/core';
import { WuiButton } from '@wajek/wui';

@Component({
  selector: 'app-mypage',
  imports: [WuiButton],
  template: `
    <button wuiButton>Filled Button</button>
  `
})
export class MyPage {}
