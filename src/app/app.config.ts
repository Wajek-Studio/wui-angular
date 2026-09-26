import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIcons } from '@wajek/wui';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { provideHttpClient } from '@angular/common/http';
import { appIcons } from './app.icons';

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
        scss: () => import('highlight.js/lib/languages/scss')
      },
      themePath: 'highlight.js/styles/github-dark.min.css'
    }),
    provideHttpClient()
  ],
};
