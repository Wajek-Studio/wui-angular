import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'wui-checkbox',
  standalone: true,
  templateUrl: './checkbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WuiCheckbox),
      multi: true,
    },
  ],
  host: {
    '[class.wui-checkbox--disabled]': 'disabled()',
    '[class.wui-checkbox--checked]': 'checked()',
  },
})
export class WuiCheckbox implements ControlValueAccessor {

  readonly disabledInput = input(false, {alias: 'disabled'});
  private readonly disabledForm = signal(false);
  readonly disabled = computed(() => this.disabledInput() || this.disabledForm());

  readonly checkedInput = input<boolean | undefined>(undefined, {alias: 'checked'});
  private readonly checkedForm = signal(false);
  readonly checked = computed(() => this.checkedInput() ?? this.checkedForm());

  readonly change = output<boolean>();

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    this.checkedForm.set(value === true);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledForm.set(isDisabled);
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.checked;

    this.checkedForm.set(value);
    this.onChange(value);
    this.change.emit(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}