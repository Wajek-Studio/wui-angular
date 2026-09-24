import { afterNextRender, Component, DestroyRef, Directive, ElementRef, inject, Renderer2, RendererStyleFlags2, signal } from "@angular/core";

@Directive({
    selector: '[wuiScrollbar]',
    host: {
        '[class.wui-scrollbar-host]': 'true'
    }
})
export class WuiScrollbar {

    private host = inject(ElementRef<HTMLElement>);
    private renderer = inject(Renderer2);
    private destroyRef = inject(DestroyRef);

    private gutter!: HTMLElement;
    private vTrack!: HTMLElement; //vertical scroll track
    private vThumb!: HTMLElement; //vertical scroll thumb
    private hTrack!: HTMLElement; //horizontal scroll track
    private hThumb!: HTMLElement; //horizontal scroll thumb

    private readonly thumbHeight = signal(0);
    private readonly thumbWidth = signal(0);

    constructor() {
        afterNextRender(() => this.setup());
    }

    setup() {
        const el = this.host.nativeElement;

        this.renderer.setStyle(el, 'position', 'relative');
        this.renderer.setStyle(el, 'overflow', 'auto');

        this.gutter = this.createGutter();

        this.vTrack = this.createTrack(this.gutter, 'vertical');
        this.vThumb = this.createThumb(this.vTrack, 'vertical');

        this.hTrack = this.createTrack(this.gutter, 'horizontal');
        this.hThumb = this.createThumb(this.hTrack, 'horizontal');

        const resizeObserver = new ResizeObserver(() => this.measure());
        resizeObserver.observe(el);

        // observe anak pertama, buat apa?
        if(el.firstChildElement) resizeObserver.observe(el.firstChildElement);

        el.addEventListener('scroll', this.onScroll, {passive: true});

        this.vThumb.addEventListener('pointerdown', (e) => {
            this.startDrag(e, 'vertical');
        });

        this.hThumb.addEventListener('pointerdown', (e) => {
            this.startDrag(e, 'horizontal');
        });

        this.destroyRef.onDestroy(() => {
            resizeObserver.disconnect();
            el.removeEventListener('scroll', this.onScroll);
        });

        this.measure();
    }

    private onScroll = () => this.updateThumbPosition();

    private measure() {
        console.log('measuring...');
        const el = this.host.nativeElement;
        const { scrollHeight, clientHeight, scrollWidth, clientWidth } = el;
        this.renderer.setStyle(this.gutter, '--wui-scrollbar-container-height', `${clientHeight}px`, RendererStyleFlags2.DashCase);
        this.renderer.setStyle(this.gutter, '--wui-scrollbar-container-width', `${clientWidth}px`, RendererStyleFlags2.DashCase);

        if(scrollHeight > clientHeight) {
            const ratio = clientHeight / scrollHeight;
            const thumbHeight = Math.max(clientHeight * ratio, 30);
            this.renderer.setStyle(this.vThumb, 'height', `${thumbHeight}px`);
            this.thumbHeight.set(thumbHeight);
            this.renderer.setStyle(this.vTrack, 'display', 'block');
        } else {
            this.renderer.setStyle(this.vTrack, 'display', 'none');
        }

        if(scrollWidth > clientWidth) {
            const ratio = clientWidth / scrollWidth;
            const thumbWidth = Math.max(clientWidth * ratio, 30);
            this.renderer.setStyle(this.hThumb, 'width', `${thumbWidth}px`);
            this.thumbWidth.set(thumbWidth);
            this.renderer.setStyle(this.hTrack, 'display', 'block');
        } else {
            this.renderer.setStyle(this.hTrack, 'display', 'none');
        }

        this.updateThumbPosition();
    }

    private updateThumbPosition() {
        const el = this.host.nativeElement;

        const scrollableV = el.scrollHeight - el.clientHeight;
        if(scrollableV > 0) {
            const maxThumbTop = el.clientHeight - this.thumbHeight();
            const top = (el.scrollTop / scrollableV) * maxThumbTop;
            this.renderer.setStyle(this.vThumb, 'transform', `translateY(${top}px)`);
        }

        const scrollableH = el.scrollWidth - el.clientWidth;
        if(scrollableH > 0) {
            const maxThumbLeft = el.clientWidth - this.thumbWidth();
            const left = (el.scrollLeft / scrollableH) * maxThumbLeft;
            this.renderer.setStyle(this.hThumb, 'transform', `translateX(${left}px)`);
        }
    }

    private createGutter() : HTMLElement {
        const el = this.host.nativeElement;
        const elHeight = el.clientHeight;
        const gutter = this.renderer.createElement('div');
        this.renderer.addClass(gutter, 'wui-scrollbar-gutter');
        this.renderer.setStyle(gutter, '--wui-scrollbar-container-height', `${elHeight}px`, RendererStyleFlags2.DashCase);
        this.renderer.insertBefore(this.host.nativeElement, gutter, this.host.nativeElement.firstChild);
        return gutter;
    }

    private createTrack(gutter: HTMLElement, axis: 'vertical' | 'horizontal') : HTMLElement {
        const track = this.renderer.createElement('div');
        this.renderer.addClass(track, 'wui-scrollbar-track');
        this.renderer.addClass(track, `wui-scrollbar-track--${axis}`);
        this.renderer.appendChild(gutter, track);
        return track;
    }

    private createThumb(track: HTMLElement, axis: 'vertical' | 'horizontal') : HTMLElement {
        const thumb = this.renderer.createElement('div');
        this.renderer.addClass(thumb, 'wui-scrollbar-thumb');
        this.renderer.addClass(thumb, `wui-scrollbar-thumb--${axis}`);
        this.renderer.appendChild(track, thumb);
        return thumb;
    }

    private startDrag(event: PointerEvent, axis: 'vertical' | 'horizontal') {
        event.preventDefault();
        event.stopPropagation();

        const el = this.host.nativeElement;
        const startPos = axis === 'vertical' ? event.clientY : event.clientX;
        const startScroll = axis === 'vertical' ? el.scrollTop : el.scrollLeft;

        // this.vThumb.setPointerCapture?.(event.pointerId);

        const onMove = (e: PointerEvent) => {
            const delta = (axis === 'vertical' ? e.clientY : e.clientX) - startPos;
            const scrollable = axis === 'vertical' ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
            const trackSize = axis === 'vertical' ? el.clientHeight : el.clientWidth;
            const thumbSize = axis === 'vertical' ? this.thumbHeight() : this.thumbWidth();
            const maxThumb = trackSize - thumbSize;
            const scroll = startScroll + (delta / maxThumb) * scrollable;
            if(axis === 'vertical') el.scrollTop = scroll; else el.scrollLeft = scroll;
        }

        const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        }

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }

}