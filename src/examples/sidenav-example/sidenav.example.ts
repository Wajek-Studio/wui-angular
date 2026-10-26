import { Component } from "@angular/core";
import { WuiSidenavContainer, WuiSidenav, WuiSidenavItem } from "@wajek/wui";

@Component({
    selector: 'sidenav-example',
    templateUrl: './sidenav.example.html',
    styleUrl: './sidenav.example.scss',
    imports: [WuiSidenavContainer, WuiSidenav, WuiSidenavItem]
})
export class SidenavExample {
    
}