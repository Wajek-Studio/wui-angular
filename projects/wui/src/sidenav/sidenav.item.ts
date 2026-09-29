import { Component, Directive, ElementRef, inject, input, OnInit, Renderer2 } from "@angular/core";

@Directive({
    selector: 'a[wuiSidenavItem]',
    host: {
        '[class.wui-sidenav-item]': 'true'
    }
})
export class WuiSidenavItem implements OnInit {

    private readonly renderer = inject(Renderer2);
    private readonly element = inject(ElementRef);
    label = input.required<string>();
    
    ngOnInit(): void {
        const existing = this.element.nativeElement.querySelector('span.wui-sidenav-item--label');
        if(existing) return;
        const label = this.renderer.createElement('span');
        this.renderer.addClass(label, 'wui-sidenav-item--label');
        const labelText = this.renderer.createText(this.label());
        this.renderer.appendChild(label, labelText);
        this.renderer.appendChild(this.element.nativeElement, label);
    }
}

@Directive({
    selector: '[wuiSidenavSubheader]',
    host: {
        '[class.wui-sidenav-subheader]': 'true'
    }
})
export class WuiSidenavSubheader implements OnInit {

    private readonly renderer = inject(Renderer2);
    private readonly element = inject(ElementRef);
    label = input.required<string>();

    ngOnInit(): void {
        const existing = this.element.nativeElement.querySelector('span.wui-sidenav-subheader--label');
        if(existing) return;
        const label = this.renderer.createElement('span');
        this.renderer.addClass(label, 'wui-sidenav-subheader--label');
        const labelText = this.renderer.createText(this.label());
        this.renderer.appendChild(label, labelText);
        this.renderer.appendChild(this.element.nativeElement, label);
    }
}