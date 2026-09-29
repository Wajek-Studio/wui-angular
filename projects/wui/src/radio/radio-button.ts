import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, OnInit } from "@angular/core";
import { WUI_RADIO_GROUP } from "./radio-group.token";

@Component({
    selector: 'wui-radio-button',
    template: `<label class="wui-radio-button">
        <input type="radio" 
            class="wui-radio-button__input" 
            [name]="group.name()"
            [checked]="checked()" 
            [disabled]="disabled()"
            (change)="select()"/>
        <span class="wui-radio-button__circle"></span>
        <span class="wui-radio-button__label"><ng-content/></span>
    </label>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WuiRadioButton implements OnInit, OnDestroy {

    readonly value = input.required<any>();
    public readonly group = inject(WUI_RADIO_GROUP);

    readonly checked = computed(() => {
        const v = this.value();
        if(v === undefined || v === null) return false;
        return this.group.value() === v;
    });

    readonly disabled = computed(() => this.group.disabled());

    ngOnInit() {
        this.group.add(this);
    }

    ngOnDestroy() {
        this.group.remove(this);
    }

    select() {
        this.group.select(this);
    }

}