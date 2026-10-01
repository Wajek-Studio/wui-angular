import { DestroyRef, Directive, DoCheck, ElementRef, inject, signal } from '@angular/core';
import { FormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { WUI_FORM_CONFIG, WuiFormConfig } from './form-config';

@Directive({
  selector: 'input[wuiInput], textarea[wuiInput], wui-select[wuiInput]',
  exportAs: 'wuiInput',
  host: { 
    class: 'wui-input',
    '[class.wui-input--has-value]': 'hasValue()',
    '[class.wui-input--has-error]': 'hasError()'
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
  hasError = signal(false);

  firstError() : string | null {
    const errors = this.ngControl?.control?.errors;
    if(!errors) return null;
    return Object.keys(errors).find(key => errors[key] === true) ?? null;
  }

  update() {
    let hasError: boolean = false;
    if(this.formConfig?.errorMatcher != null) {
      hasError = this.formConfig?.errorMatcher.isErrorState(this.ngControl?.control as FormControl, this.formGroup || this.form);
    } else {
      hasError = this.ngControl?.control?.errors != null;
    }
    this.hasError.set(hasError);

    let hasValue: boolean = false;
    const control = this.ngControl?.control;
    if(typeof control?.value == 'string') {
      hasValue = control.value != null && control.value.length > 0;
    } else {
      hasValue = control?.value != null;
    }
    this.hasValue.set(hasValue);
  }

  ngDoCheck(): void {
    this.update();
  }

}
