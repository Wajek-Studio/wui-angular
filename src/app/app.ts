import { Component, signal } from '@angular/core';
import { WuiApp, WuiSidenav } from '@wajek/wui';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [WuiApp, RouterOutlet, WuiSidenav],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
