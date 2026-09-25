import { HttpClient } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-code',
  imports: [
    Highlight
  ],
  templateUrl: './code.html',
  styleUrl: './code.scss',
})
export class Code implements OnInit {

  http = inject(HttpClient);
  sourceUrl = input<string | null>('');

  source = signal<string | null>('');
  lang = input<string>('html');

  async ngOnInit() {
    console.log(this.sourceUrl());

    const url = this.sourceUrl();
    if (!url) return;

    

    const res = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
    this.source.set(res);
  }

}
