import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIcons } from '@wajek/wui';
import {
  mdiAccount,
  mdiAccountCircle,
  mdiButtonCursor,
  mdiCog,
  mdiDockLeft,
  mdiDotsVertical,
  mdiFormatFont,
  mdiFormTextbox,
  mdiFormSelect,
  mdiGestureTapButton,
  mdiHome,
  mdiMenu,
  mdiPlayCircle,
  mdiTable,
  mdiViewDashboardOutline,
  mdiWindowMaximize,
  mdiSquareRoundedBadge,
} from '@mdi/js';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { provideHttpClient } from '@angular/common/http';

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
      { name: 'account-circle', path: mdiAccountCircle },
      { name: 'format-font', path: mdiFormatFont },
      { name: 'button', path: mdiButtonCursor },
      { name: 'dock-left', path: mdiDockLeft },
      { name: 'table', path: mdiTable },
      { name: 'layout', path: mdiViewDashboardOutline },
      { name: 'dots-vertical', path: mdiDotsVertical },
      { name: 'dialog', path: mdiWindowMaximize },
      { name: 'form', path: mdiFormTextbox },
      { name: 'form-select', path: mdiFormSelect },
      { name: 'play', path: mdiPlayCircle },
      { name: 'snackbar', path: mdiSquareRoundedBadge}
    ),
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
