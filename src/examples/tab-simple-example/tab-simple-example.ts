import { Component, signal } from "@angular/core";

@Component({
    selector: 'tab-simple-example',
    template: `
        <div class="wui-tab wui-gap-col-4">
            <button class="wui-tab-item" [class.active]="active() == 'stats'" (click)="setActive('stats')">
                Statistics
            </button>
            <button class="wui-tab-item" [class.active]="active() == 'profile'" (click)="setActive('profile')">
                Profile
            </button>
            <button class="wui-tab-item" [class.active]="active() == 'settings'" (click)="setActive('settings')">
                Settings
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