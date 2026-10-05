import { booleanAttribute, computed, DestroyRef, Directive, DoCheck, ElementRef, inject, input, model, signal } from '@angular/core';
import { FormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { WUI_FORM_CONFIG, WuiFormConfig } from './form-config';

@Directive({
  selector: 'input[wuiInput], textarea[wuiInput], wui-select[wuiInput]',
  exportAs: 'wuiInput',
  host: { 
    class: 'wui-input',
    '(keyup)': 'onBlur($event)',
    '[class.wui-input--has-value]': 'hasValue()',
    '[class.wui-input--has-error]': 'hasError()',
    '[class.wui-input--disabled]': 'disabled()'
  }
})
export class WuiInput implements DoCheck {

  ngControl = inject<NgControl>(NgControl, {
    optional: true,
    self: true
  });

  elementRef = inject(ElementRef);
  destroyRef = inject(DestroyRef);

  form = inject(NgForm, {optional: true});
  formGroup = inject(FormGroupDirective, {optional: true});

  formConfig = inject<WuiFormConfig>(WUI_FORM_CONFIG, {optional: true});
  
  hasValue = signal(false);
  hasError = model(false, { alias: 'error' });
  disabled = signal(false);

  firstError() : string | null {
    const errors = this.ngControl?.control?.errors;
    if(!errors) return null;
    return Object.keys(errors).find(key => errors[key] === true) ?? null;
  }

  update() {
    const control = this.ngControl?.control;
    if(control != null) {
      if(this.formConfig?.errorMatcher != null) {
        this.hasError.set(this.formConfig?.errorMatcher.isErrorState(control as FormControl, this.formGroup || this.form));
      } else {
        this.hasError.set(control.errors != null);
      }

      this.checkValue(control?.value);

      this.disabled.set(control.disabled);
    } else {
      const target = this.elementRef?.nativeElement as HTMLInputElement;
      this.checkValue(target.value);
    }
  }

  checkValue(value: string | null) {
    if(typeof value == 'string') {
      this.hasValue.set(value != null && value.length > 0);
    } else {
      this.hasValue.set(value != null);
    }
  }

  onBlur(e: Event) {
    const control = this.ngControl?.control;
    if(control) return;

    const target = e.target as HTMLInputElement;
    this.checkValue(target.value);
  }

  ngDoCheck(): void {
    this.update();
  }

}
