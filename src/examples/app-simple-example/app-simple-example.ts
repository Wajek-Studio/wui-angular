import { Component, inject } from '@angular/core';
import { WuiApp, WuiButton, WuiIcon, WuiTopbar, WuiSidenavContainer, WuiSidenav, WuiSidenavFull, WuiSidenavBody, WuiSidenavService, WuiSidenavContainerContent } from '@wajek/wui';

@Component({
    selector: 'app-simple-example',
    imports: [
    WuiApp,
    WuiTopbar,
    WuiButton,
    WuiIcon,
    WuiSidenavContainer,
    WuiSidenav,
    WuiSidenavFull,
    WuiSidenavBody,
    WuiSidenavContainerContent
],
    templateUrl: './app-simple-example.html'
})
export class AppSimpleExample {

    private readonly sidenavService = inject(WuiSidenavService);

    toggleSidenav() {
        this.sidenavService.toggle('main-sidenav');
    }

}
