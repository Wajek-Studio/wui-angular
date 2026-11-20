import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WuiButton, WuiFormField, WuiInput, WuiSelect, WuiOption, WuiLabel, WuiIcon, WuiCheckbox } from '@wajek/wui';

@Component({
    selector: 'button-simple-example',
    imports: [WuiButton, WuiFormField, WuiInput, WuiSelect, FormsModule, WuiOption, WuiLabel, WuiIcon, WuiCheckbox],
    template: `
        <div class="wui-row">
            <div class="wui-col-6 wui-flex wui-align-items-center wui-justify-content-center">
                <div class="wui-flex-inline wui-gap-col-3">
                    <button wuiButton iconOnly [variant]="variant()" [color]="color()" [size]="size()" [disabled]="disabled()">
                        <wui-icon icon="home"/>
                    </button>
                    <button wuiButton [variant]="variant()" [color]="color()" [size]="size()" [disabled]="disabled()">Button</button>
                    <button wuiButton [variant]="variant()" [color]="color()" [size]="size()" [disabled]="disabled()">
                        <wui-icon icon="home"/>Button
                    </button>
                </div>
            </div>
            <div class="wui-col-6">
                <wui-form-field class="wui-mb-4">
                    <label for="button-variant" wuiLabel>Variant</label>
                    <wui-select id="button-variant" wuiInput [(ngModel)]="variant">
                        <wui-option value="filled">Filled</wui-option>
                        <wui-option value="outlined">Outlined</wui-option>
                        <wui-option value="text">Text</wui-option>
                    </wui-select>
                </wui-form-field>
                <wui-form-field class="wui-mb-4">
                    <label for="button-color" wuiLabel>Color</label>
                    <wui-select id="button-color" wuiInput [(ngModel)]="color">
                        <wui-option value="default">Default</wui-option>
                        <wui-option value="primary">Primary</wui-option>
                        <wui-option value="error">Error</wui-option>
                    </wui-select>
                </wui-form-field>
                <wui-form-field class="wui-mb-4">
                    <label for="button-size" wuiLabel>Color</label>
                    <wui-select id="button-size" wuiInput [(ngModel)]="size">
                        <wui-option value="sm">Small</wui-option>
                        <wui-option value="md">Medium</wui-option>
                        <wui-option value="lg">Large</wui-option>
                        <wui-option value="xl">Extra Large</wui-option>
                    </wui-select>
                </wui-form-field>
                <wui-checkbox [(ngModel)]="disabled">Disabled</wui-checkbox>
            </div>
        </div>
    `
})
export class ButtonSimpleExample {
    
    variant = signal<'filled' | 'outlined' | 'text'>('filled');
    color = signal<'default' | 'primary' | 'danger'>('default');
    size = signal<'sm' | 'md' | 'lg' | 'xl'>('md');
    disabled = signal<boolean>(false);
    
}
