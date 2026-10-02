import { booleanAttribute, computed, DestroyRef, Directive, DoCheck, ElementRef, inject, input, signal } from '@angular/core';
import { FormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { WUI_FORM_CONFIG, WuiFormConfig } from './form-config';

@Directive({
  selector: 'input[wuiInput], textarea[wuiInput], wui-select[wuiInput]',
  exportAs: 'wuiInput',
  host: { 
    class: 'wui-input',
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
  hasError = signal(false);
  disabled = signal(false);

  firstError() : string | null {
    const errors = this.ngControl?.control?.errors;
    if(!errors) return null;
    return Object.keys(errors).find(key => errors[key] === true) ?? null;
  }

  update() {
    const control = this.ngControl?.control;
    console.log('update check control : ', control);
    if(control != null) {
      if(this.formConfig?.errorMatcher != null) {
        this.hasError.set(this.formConfig?.errorMatcher.isErrorState(control as FormControl, this.formGroup || this.form));
      } else {
        this.hasError.set(control.errors != null);
      }
      console.log(this.hasError());

      if(typeof control?.value == 'string') {
        this.hasValue.set(control.value != null && control.value.length > 0);
      } else {
        this.hasValue.set(control?.value != null);
      }

      this.disabled.set(control.disabled);
    }
  }

  ngDoCheck(): void {
    console.log('do Check', this.elementRef.nativeElement.tagName);
    this.update();
  }

}
