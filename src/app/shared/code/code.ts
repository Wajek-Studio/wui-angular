import { HttpClient } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Highlight } from 'ngx-highlightjs';
import { firstValueFrom, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-code',
  imports: [
    Highlight
  ],
  templateUrl: './code.html',
  styleUrl: './code.scss',
})
export class Code {
  
  http = inject(HttpClient);
  sourceUrl = input<string | null>('');
  sourceCode = toSignal<string | null>(
    toObservable(this.sourceUrl).pipe(
      switchMap(async url => {
        if (!url) return null;
        return await firstValueFrom(this.http.get(url, { responseType: 'text' }));
      })
    )
  );

  lang = input<string>('html');

}
