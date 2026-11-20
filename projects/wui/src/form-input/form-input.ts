import { AfterContentChecked, booleanAttribute, Component, contentChild, ElementRef, inject, input, Renderer2, RendererStyleFlags2 } from "@angular/core";
import { WuiPrefix, WuiSuffix } from "../public-api";

@Component({
    selector: 'wui-form-input',
    template: `
        <ng-content select="[wuiLabel]"></ng-content>

        <div class="wui-form-input--stage">
            <ng-content select="[wuiPrefix]"></ng-content>
            <ng-content select="[wuiInput]"></ng-content>
            <ng-content select="[wuiSuffix]"></ng-content>
        </div>

        <ng-content select="[wuiHint]"></ng-content>
        <ng-content select="[wuiError]"></ng-content>
    `, 
    host: {
        class: 'wui-form-input',
        '[class.wui-form-input--rounded]': 'rounded()'
    }
})
export class WuiFormInput implements AfterContentChecked {

    rounded = input(false, {
        transform: booleanAttribute
    });

    renderer = inject(Renderer2);
    elementRef = inject(ElementRef);
    prefix = contentChild(WuiPrefix, {read: ElementRef});
    suffix = contentChild(WuiSuffix, {read: ElementRef});

    ngAfterContentChecked(): void {
        let prefixWidth = '0px';
        if(this.prefix()) prefixWidth = `${this.prefix()?.nativeElement.clientWidth}px`;
        this.renderer.setStyle(
            this.elementRef.nativeElement,
            '--wui-prefix-width',
            prefixWidth,
            RendererStyleFlags2.DashCase
        );

        let suffixWidth = '0px';
        if(this.suffix()) suffixWidth = `${this.suffix()?.nativeElement.clientWidth}px`;
        this.renderer.setStyle(
            this.elementRef.nativeElement,
            '--wui-suffix-width',
            suffixWidth,
            RendererStyleFlags2.DashCase
        );
    }

}