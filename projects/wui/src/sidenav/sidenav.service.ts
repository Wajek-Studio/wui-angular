import { Injectable, signal } from "@angular/core";
import { WuiSidenavState } from "./sidenav.state";
import { Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class WuiSidenavService {

    private _states = signal<Record<string, WuiSidenavState>>({});
    stateChange = new Subject<WuiSidenavState>();

    private state(id: string) {
        return this._states()[id];
    }

    register(state: WuiSidenavState) {
        if(this.state(state.id) != undefined) return;
        this._states.update((states) => {
            states[state.id] = state;
            return states;
        });
    }

    unregister(state: WuiSidenavState) {
        if(this.state(state.id) == undefined) return;
        this._states.update((states) => {
            delete states[state.id];
            return states;
        });
    }

    open(id: string = 'main') {
        if(this.state(id) == undefined) return;
        this._states.update((states) => {
            states[id].show = true;
            this.stateChange.next(states[id]);
            return states;
        });
    }

    close(id: string = 'main') {
        if(this.state(id) == undefined) return;
        this._states.update((states) => {
            states[id].show = false;
            this.stateChange.next(states[id]);
            return states;
        });
    }

    toggle(id: string = 'main') {
        if(this.state(id) == undefined) return;
        this._states.update((states) => {
            states[id].show = states[id].show ? false : true;
            this.stateChange.next(states[id]);
            return states;
        });
    }

    toggleMini(id: string = 'main') {
        if(this.state(id) == undefined) return;
        this._states.update((states) => {
            states[id].mode = states[id].mode == 'full' ? 'mini' : 'full';
            this.stateChange.next(states[id]);
            return states;
        });
    }

}