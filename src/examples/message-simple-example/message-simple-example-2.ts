import { Component, inject, OnInit, signal } from "@angular/core";
import { WuiMessageService, WuiButton } from "@wajek/wui";

@Component({
    selector: 'message-simple-example-2',
    template: `<div class="wui-flex wui-flex-col wui-border wui-radius-3">
        <div class="wui-p-3 wui-border-bottom wui-title-medium">Component 1</div>
        <div class="wui-p-3 wui-border-bottom">Data From Compnent 2 : <br/>{{data() ?? 'No Data'}}</div>
        <div class="wui-p-3 d-flex">
            <button wuiButton (click)="sendMessage()">Send Message</button>
        </div>
    </div>`,
    imports: [WuiButton]
})
export class MessageSimpleExample2 implements OnInit {
    messageService = inject(WuiMessageService);
    data = signal<string | null>(null);

    sendMessage() {
        this.messageService.set<string>('message:component-2', 'Halo from Component 2');
    }

    ngOnInit(): void {
        this.messageService.get<string>('message:component-1').subscribe(data => {
            this.data.set(data);
        });
    }
}
