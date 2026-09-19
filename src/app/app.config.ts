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
  mdiGestureTapButton,
  mdiHome,
  mdiMenu,
  mdiPlayCircle,
  mdiTable,
  mdiViewDashboardOutline,
  mdiWindowMaximize,
} from '@mdi/js';

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
      { name: 'play', path: mdiPlayCircle }
    ),
  ],
};
