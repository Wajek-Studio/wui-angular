import { _IdGenerator, Highlightable } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal
} from '@angular/core';
import { WUI_SELECT_PARENT } from './select-token';
import { WuiSelect } from './select';

@Component({
  selector: 'wui-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'wui-option',
    '[class.wui-option--highlighted]': 'highlighted()',
    '[class.wui-option--selected]': 'selected()',
    '(click)': 'select()'
  }
})
export class WuiOption implements Highlightable {

  private parent = inject<WuiSelect>(WUI_SELECT_PARENT);

  private idGenerator = inject(_IdGenerator);
  id = this.idGenerator.getId('wui-option-');
  
  elementRef = inject(ElementRef);

  highlighted = signal(false);
  selected = computed(() => {
    return this.parent.selectedValue() === this.value();
  });

  value = input<unknown>();

  setActiveStyles(): void {
    this.highlighted.set(true);
  }

  setInactiveStyles(): void {
    this.highlighted.set(false);
  }

  disabled?: boolean | undefined;

  getLabel(): string {
    return (this.elementRef.nativeElement.textContent ?? '').trim();
  }

  scrollIntoView(): void {
    this.elementRef.nativeElement.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }

  select() {
    this.parent.select(this);
  }

}