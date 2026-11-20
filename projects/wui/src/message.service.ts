import { Injectable } from "@angular/core";
import { filter, map, Observable, Subject } from "rxjs";

interface Message<T> {
    name: string,
    data: T
};

@Injectable({providedIn: 'root'})
export class WuiMessageService {

    private message = new Subject<Message<any>>();

    set<T>(name: string, data: T) {
        this.message.next(<Message<T>>{name: name, data: data});
    }

    get<T>(name: string): Observable<T> {
        return this.message.pipe(filter(e => e.name == name), map(e => e.data));
    }

}