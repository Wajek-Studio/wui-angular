import { Component, signal } from '@angular/core';
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
    styles: `
        wui-app {
            overflow: hidden;
        }
    `,
    templateUrl: './app-simple-example.html'
})
export class AppSimpleExample {

    sidenavShow = signal<boolean>(true);
    
    sidenavToggle() {
        this.sidenavShow.update(show => !show);
    }

}
