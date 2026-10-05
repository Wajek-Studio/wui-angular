import { Component, signal } from "@angular/core";

@Component({
    selector: 'tab-simple-example',
    template: `
        <div class="wui-tab">
            <button class="wui-tab-item" [class.active]="active() == 'stats'" (click)="setActive('stats')">
                STATISTICS
            </button>
            <button class="wui-tab-item" [class.active]="active() == 'profile'" (click)="setActive('profile')">
                PROFILE
            </button>
            <button class="wui-tab-item" [class.active]="active() == 'settings'" (click)="setActive('settings')">
                SETTINGS
            </button>
        </div>
    `
})
export class TabSimpleExample {

    active = signal<'stats' | 'profile' | 'settings'>('stats');

    setActive(tab : 'stats' | 'profile' | 'settings') {
        this.active.set(tab);
    }

}