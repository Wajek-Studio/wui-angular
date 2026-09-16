import { Component, input } from '@angular/core';

@Component({
  selector: 'wui-sidenav',
  imports: [],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class WuiSidenav {

  state = input<"open" | "close" | "mini">("open");
  id = input('id');

}
