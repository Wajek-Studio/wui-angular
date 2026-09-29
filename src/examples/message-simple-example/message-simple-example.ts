import { Component } from "@angular/core";
import { MessageSimpleExample1 } from "./message-simple-example-1";
import { MessageSimpleExample2 } from "./message-simple-example-2";

@Component({
    selector: 'message-simple-example',
    template: `<div class="wui-grid wui-grid-col-2 wui-gap-col-3">
        <message-simple-example-1/>
        <message-simple-example-2/>
    </div>`,
    imports: [MessageSimpleExample1, MessageSimpleExample2]
})
export class MessageSimpleExample {
}
