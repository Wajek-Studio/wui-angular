import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIcons, provideWuiFormConfig, provideWuiMenuConfig, WuiErrorMatcher } from '@wajek/wui';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appIcons } from './app.icons';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideIcons(...appIcons),
    provideHighlightOptions({
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
        typescript: () => import('highlight.js/lib/languages/typescript'),
        html: () => import('highlight.js/lib/languages/xml'),
        scss: () => import('highlight.js/lib/languages/scss'),
        bash: () => import('highlight.js/lib/languages/bash')
      }
    }),
    provideHttpClient(withFetch()), 
    ...(isDevMode() ? [] : [provideClientHydration(withEventReplay())]),
    provideWuiMenuConfig({
      defaultPosition: 'over-top-right',
      positions: {
        'over-top-right' : [{
            originX: 'end', originY: 'top',
            overlayX: 'end', overlayY: 'top'
        }, {
            originX: 'end', originY: 'bottom',
            overlayX: 'end', overlayY: 'bottom'
        }, {
            originX: 'end', originY: 'bottom',
            overlayX: 'end', overlayY: 'bottom'
        }]
      }
    })
  ],
};
