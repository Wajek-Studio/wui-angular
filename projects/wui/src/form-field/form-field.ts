import { AfterContentInit, Component, computed, contentChild, ElementRef, inject, input, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { WuiLabel } from './label';
import { WuiPrefix } from './prefix';
import { WuiHint } from './hint';

@Component({
  selector: 'wui-form-field',
  templateUrl: './form-field.html',
  host: {
    class: 'wui-form-field',
    '[class.wui-form-field-outlined]': 'isOutlined()',
    '[class.wui-form-field-filled]': 'isFilled()'
  }
})
export class WuiFormField implements AfterContentInit {
  
  readonly variant = input<'outlined' | 'filled'>('outlined');

  isOutlined = computed(() => this.variant() == 'outlined');
  isFilled = computed(() => this.variant() == 'filled');

  renderer = inject(Renderer2);
  elementRef = inject(ElementRef);
  label = contentChild(WuiLabel, {read: ElementRef});
  prefix = contentChild(WuiPrefix, {read: ElementRef});

  ngAfterContentInit(): void {
    const labelWidth = this.label()?.nativeElement.clientWidth;
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      '--wui-label-width',
      `${labelWidth}px`,
      RendererStyleFlags2.DashCase
    );

    let prefixWidth = '1rem';
    if(this.prefix()) prefixWidth = `${this.prefix()?.nativeElement.clientWidth}px`;
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      '--wui-prefix-width',
      prefixWidth,
      RendererStyleFlags2.DashCase
    );
  }

}
