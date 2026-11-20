import { Component, signal } from '@angular/core';
import { WuiApp, WuiSidenavContainer, WuiPage, WuiTopbar, WuiSidenavContainerContent, WuiButton, WuiIcon, WuiSidenav } from '@wajek/wui';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [
    WuiApp,
    WuiSidenavContainer,
    WuiPage,
    WuiTopbar,
    WuiSidenavContainerContent,
    WuiButton,
    WuiIcon
],
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('showcase');
}
