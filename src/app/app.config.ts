import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIcons } from '@wajek/wui';
import { mdiAccount, mdiAccountCircle, mdiCog, mdiHome, mdiMenu } from '@mdi/js';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideIcons(
      { name: 'home', path: mdiHome },
      { name: 'account', path: mdiAccount },
      { name: 'settings', path: mdiCog },
      { name: 'menu', path: mdiMenu },
      { name: 'account-circle', path: mdiAccountCircle }
    )
  ]
};
