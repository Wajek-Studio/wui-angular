import { ActiveDescendantKeyManager } from "@angular/cdk/a11y";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { AfterContentInit, AfterViewInit, Component, computed, contentChildren, DestroyRef, effect, ElementRef, forwardRef, inject, input, signal, TemplateRef, viewChild, ViewContainerRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { filter, takeUntil } from "rxjs";
import { WuiScrollbar } from "../scrollbar/scrollbar";
import { WuiOption } from "./option";
import { WUI_SELECT_PARENT } from "./select-token";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
export class WuiSelect implements ControlValueAccessor, AfterContentInit{

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

  private keyManager? : ActiveDescendantKeyManager<WuiOption>; 

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
  }

  syncKeyManager() {
    if(this.keyManager == null) return;
    const index = this.options().findIndex(o => o.value() == this.selectedValue());
    this.keyManager?.setActiveItem(index >= 0 ? index : 0);
  }

  ngAfterContentInit(): void {
    this.keyManager = new ActiveDescendantKeyManager(this.options())
      .withWrap()
      .withTypeAhead()
      .withVerticalOrientation();
    this.syncKeyManager();
  }

  writeValue(obj: any): void {
    this.selectedValue.set(obj);
    this.syncKeyManager();
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

        // if opened, directly change value
        if(this.isOpen()) {
          const active = this.keyManager?.activeItem;
          if(active) this.select(active);
          return;
        }
        
        // if closed, open the option panel
        this.openPanel();
        return;

      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        event.preventDefault();
        this.keyManager?.onKeydown(event);

        // if closed, pass to keymanager
        if(!this.isOpen()) {
          const active = this.keyManager?.activeItem;
          if(active) this.select(active);
          return;
        }
    }
  }

  /**
   * Called when control focused and :
   * 1. Opened then Option clicked
   * 2. Opened then Enter key pressed
   * 3. Closed with Keymanager navigation
   */
  select(option: WuiOption): void {
    this.selectedValue.set(option.value());
    this.syncKeyManager();

    // Notify model about value and set touched
    this.onChange(this.selectedValue());
    this.onTouched();

    // close if opened
    if(this.isOpen()) this.close();
  }

  /**
   * Called when control lost its focus
   */
  onBlur() {
    setTimeout(() => {
      this.onTouched(); // set control touched
      if(this.isOpen()) this.close(); // close if opened
    }, 500);
  }

}