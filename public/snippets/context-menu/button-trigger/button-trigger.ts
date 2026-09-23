import { Component, signal } from '@angular/core';
import {
  WuiButton,
  WuiContextMenuTrigger,
  WuiIcon,
  WuiMenu,
  WuiMenuDivider,
  WuiMenuItem,
} from '@wajek/wui';

@Component({
  selector: 'app-context-menu-button-demo',
  imports: [
    WuiButton,
    WuiContextMenuTrigger,
    WuiIcon,
    WuiMenu,
    WuiMenuDivider,
    WuiMenuItem,
  ],
  templateUrl: './button-trigger.html',
})
export class ContextMenuButtonDemoComponent {
  readonly aksiTerakhir = signal('(belum ada aksi)');

  aksi(nama: string): void {
    this.aksiTerakhir.set(nama);
  }

  bukaTerprogram(event: MouseEvent, pemicu: WuiContextMenuTrigger): void {
    pemicu.buka(event.clientX, event.clientY);
  }
}
