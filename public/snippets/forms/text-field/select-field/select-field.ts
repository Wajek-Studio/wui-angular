import { Component } from '@angular/core';
import { WuiFormField, WuiLabel, WuiOption, WuiSelect } from '@wajek/wui';

@Component({
  imports: [
    WuiFormField,
    WuiLabel,
    WuiSelect,
    WuiOption,
  ],
  templateUrl: './select-field.html',
})
export class SelectFieldComponent {
  selectedRole = '';
  roleTouched = false;

  get pesanError(): string {
    if (!this.roleTouched) {
      return '';
    }
    if (!this.selectedRole) {
      return 'Peran akun wajib dipilih.';
    }
    return '';
  }

  onRoleChange(val: unknown): void {
    this.selectedRole = String(val ?? '');
    this.roleTouched = true;
  }
}
