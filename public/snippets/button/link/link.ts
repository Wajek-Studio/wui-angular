import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiButton } from '@wajek/wui';

@Component({
  selector: 'app-button-link-demo',
  imports: [RouterLink, WuiButton],
  templateUrl: './link.html',
})
export class ButtonLinkDemoComponent {}
