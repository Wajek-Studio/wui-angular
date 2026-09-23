import { Component, computed, forwardRef, input, signal } from "@angular/core";
import { WuiRadioButton } from "./radio-button";
import { WUI_RADIO_GROUP } from "./radio-group.token";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

let nextId = 0;

@Component({
    selector: 'wui-radio-group',
    template: `<ng-content />`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => WuiRadioGroup),
        multi: true
    }, {
        provide: WUI_RADIO_GROUP,
        useExisting: forwardRef(() => WuiRadioGroup)
    }],
    host: {
        role: 'radiogroup',
        '[class.wui-radio-group--disabled]': 'disabled()'
    }
})
export class WuiRadioGroup implements ControlValueAccessor {

    readonly value = signal<any>(null);
    readonly disabled = computed(() => this.disabledInput() || this.disabledForm());
    readonly name = signal(`wui-radio-group-${nextId++}`);

    readonly disabledInput = input(false, {alias: 'disabled'});
    readonly disabledForm = signal(false);

    private readonly buttons = new Set<WuiRadioButton>();

    private onChange: (v: any) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: any): void {
        this.value.set(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    
    setDisabledState?(isDisabled: boolean): void {
        this.disabledForm.set(isDisabled);
    }

    select(button: WuiRadioButton) : void {
        if(this.disabled()) return;
        this.value.set(button.value());
        this.onChange(this.value());
    }

    add(button: WuiRadioButton) : void {
        this.buttons.add(button);
    }

    remove(button: WuiRadioButton) : void {
        this.buttons.delete(button);
    }

}