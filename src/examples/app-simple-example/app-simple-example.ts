import { Component } from '@angular/core';
import { WuiApp, WuiButton, WuiIcon, WuiTopbar, WuiSidenavContainer, WuiSidenav } from '@wajek/wui';

@Component({
    selector: 'app-simple-example',
    imports: [
    WuiApp,
    WuiTopbar,
    WuiButton,
    WuiIcon,
    WuiSidenavContainer,
    WuiSidenav
],
    templateUrl: './app-simple-example.html'
})
export class AppSimpleExample {

}
