// icon.provider.ts
import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { IconDefinition } from './icon.model';

// Token internal untuk menampung koleksi ikon dari provider
export const ICON_SET = new InjectionToken<IconDefinition[][]>('ICON_SET');

/**
 * Provider untuk mendaftarkan ikon di tingkat root (app.config.ts)
 */
export function provideIcons(...icons: IconDefinition[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ICON_SET,
      useValue: icons,
      multi: true, // Memungkinkan provideIcons dipanggil beberapa kali (misal di lazy library)
    },
  ]);
}