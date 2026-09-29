import { Injectable, TemplateRef } from '@angular/core';

import { WuiPageHost } from './page.host';
import type { WuiPageRef } from './page.ref';

@Injectable({providedIn: 'root'})
export class WuiPageService {

  private hosts: Record<string, WuiPageHost> = {};

  register(host: WuiPageHost): void {
    const name = host.name();
    if (this.hosts[name] && this.hosts[name] !== host) {
      throw new Error(`[wui] Page host dengan name '${name}' sudah terdaftar.`);
    }
    this.hosts[name] = host;
  }

  unregister(host: WuiPageHost): void {
    const name = host.name();
    if (this.hosts[name] === host) {
      delete this.hosts[name];
    }
  }

  open(template: TemplateRef<unknown>, hostName = 'main'): WuiPageRef {
    return this.host(hostName).attach(template);
  }

  replace(template: TemplateRef<unknown>, hostName = 'main'): WuiPageRef {
    const host = this.host(hostName);
    host.detachAll();
    return host.attach(template);
  }

  closeAll(hostName = 'main') {
    const host = this.host(hostName);
    host.detachAll();
  }

  private host(name: string): WuiPageHost {
    const host = this.hosts[name];
    if (!host) {
      throw new Error(`[wui] Page host dengan name '${name}' belum terdaftar.`);
    }
    return host;
  }
}