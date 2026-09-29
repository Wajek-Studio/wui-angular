import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WuiRadioButton, WuiRadioGroup } from '@wajek/wui';

@Component({
  selector: 'radio-basic-example',
  standalone: true,
  imports: [FormsModule, WuiRadioGroup, WuiRadioButton],
  templateUrl: './radio-basic-example.html',
  styleUrls: ['./radio-basic-example.scss']
})
export class RadioBasicExample {
  readonly selectedColor = signal('merah');
}
