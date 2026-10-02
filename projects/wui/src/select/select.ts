import { ActiveDescendantKeyManager } from "@angular/cdk/a11y";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { Component, computed, contentChildren, DestroyRef, effect, ElementRef, forwardRef, inject, input, signal, TemplateRef, viewChild, ViewContainerRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { filter } from "rxjs";
import { WuiScrollbar } from "../scrollbar/scrollbar";
import { WuiOption } from "./option";
import { WUI_SELECT_PARENT } from "./select-token";

@Component({
  selector: 'wui-select',
  templateUrl: './select.html',
  host: {
    class: 'wui-select',
    '[attr.role]': '"combobox"',
    '[attr.tabindex]': 'disabled() ? -1 : tabindex()',
    '(click)': 'openPanel()',
    '(keydown)': 'onKeyDown($event)',
    '(blur)': 'onBlur()'
  },
  providers: [{
    provide: WUI_SELECT_PARENT,
    useExisting: forwardRef(() => WuiSelect)
  }, {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WuiSelect),
    multi: true
  }],
  imports: [WuiScrollbar]
})
export class WuiSelect implements ControlValueAccessor{

  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);
  private viewContainerRef = inject(ViewContainerRef);

  private overlay = inject(Overlay);
  private overlayRef?: OverlayRef;
  private portal? : TemplatePortal;

  panel = viewChild.required<TemplateRef<any>>('panel');

  tabindex = input<number>(0);

  disabled = signal(false);

  placeholder = input<string | null>(null);
  options = contentChildren(WuiOption);

  selectedValue = signal<unknown | null>(null);
  selectedOption = computed<WuiOption | null>(() => {
    let item = this.options().find(o => o.value() === this.selectedValue());
    if(item) return item;
    return null;
  });

  hasValue = computed(() => this.selectedValue() !== null);
  isOpen = signal(false);

  private readonly keyManager = computed(() => 
    new ActiveDescendantKeyManager(this.options())
      .withWrap()
      .withTypeAhead()
      .withVerticalOrientation()
  );

  highlightedId = signal<string | null>(null);

  private onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    let timeout: any = null;
    const resizeObserver = new ResizeObserver((entries) => {
      if(timeout != null) clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.updatePanelWidth();
      }, 50);
    });
    resizeObserver.observe(this.elementRef.nativeElement);
    this.destroyRef.onDestroy(() => resizeObserver.disconnect);

    effect((onCleanUp) => {
      const km = this.keyManager();
      this.highlightedId.set(km.activeItem?.id ?? null);
      const sub = km.change.subscribe(() => {
        const active = km.activeItem;
        this.highlightedId.set(active?.id ?? null);
        active?.scrollIntoView();        
      });
      onCleanUp(() => sub.unsubscribe());
    });
  }

  writeValue(obj: any): void {
    this.selectedValue.set(obj);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  openPanel() {
    if(this.disabled()) return;

    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withFlexibleDimensions(true)
        .withGrowAfterOpen(true)
        .withPush(false)
        .withLockedPosition(true)
        .withPositions([{
          originX: 'start', overlayX: 'start',
          originY: 'bottom', overlayY: 'top'
        }, {
          originX: 'start', overlayX: 'start',
          originY: 'top', overlayY: 'bottom'
        }]),
      scrollStrategy: this.overlay.scrollStrategies.block()
    });

    this.overlayRef = this.overlay.create(config);
    this.portal = new TemplatePortal(
      this.panel(),
      this.viewContainerRef
    );

    this.overlayRef
      .keydownEvents()
      .pipe(filter(e => e.key === 'Escape'))
      .subscribe(() => this.close());

    this.overlayRef.attach(this.portal);
    let sub = this.overlayRef.backdropClick().subscribe(() => {
      sub.unsubscribe();
      this.close();
    })
    this.updatePanelWidth();

    this.isOpen.set(true);
    this.selectedOption()?.scrollIntoView();
  }

  updatePanelWidth() {
    const width = this.elementRef.nativeElement.getBoundingClientRect().width;
    this.overlayRef?.updateSize({width});
  }

  close() {
    this.overlayRef?.detach();
    this.overlayRef = undefined;
    this.portal = undefined;
    this.isOpen.set(false);
  }

  onKeyDown(event: KeyboardEvent) {
    if(this.disabled()) return;

    switch(event.key) {
      case ' ':
      case 'Spacebar':
      case 'Enter':
        event.preventDefault();
        if(!this.isOpen()) {
          this.openPanel();
        } else {
          const active = this.keyManager().activeItem;
          if(active) this.select(active);
        }
        return;

      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        event.preventDefault();
        this.keyManager().onKeydown(event);
        if(!this.isOpen()) {
          const active = this.keyManager().activeItem;
          if(active) this.select(active);
        }
        return;
    }
  }

  select(option: WuiOption): void {
    this.selectedValue.set(option.value());
    this.onChange(this.selectedValue());
    this.close();
  }

  onBlur() {
    this.onTouched();
  }

}