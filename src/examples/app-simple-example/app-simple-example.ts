import { Component, inject } from '@angular/core';
import { WuiApp, WuiButton, WuiIcon, WuiTopbar, WuiSidenavContainer, WuiSidenavContainerContent, WuiSidenav, WuiSidenavService } from '@wajek/wui';

@Component({
    selector: 'app-simple-example',
    imports: [
    WuiApp,
    WuiTopbar,
    WuiButton,
    WuiIcon,
    WuiSidenavContainer,
    WuiSidenavContainerContent,
    WuiSidenav
],
    templateUrl: './app-simple-example.html'
})
export class AppSimpleExample {

    private readonly sidenavService = inject(WuiSidenavService);

    toggleSidenav() {
        this.sidenavService.toggle('app-simple-sidenav');
    }

}
