import { inject, Injectable } from '@angular/core';
import { IconDefinition } from './icon.model';
import { ICON_SET } from './icon.provider';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private registry = new Map<string, string>();
  
  // Inject semua ikon yang disediakan lewat provideIcons()
  private providedIconSets = inject(ICON_SET, { optional: true });

  constructor() {
    if (this.providedIconSets) {
      // Flatten array karena multi: true pada injection token
      this.providedIconSets.flat().forEach(icon => this.registerIcon(icon));
    }
  }

  registerIcon(icon: IconDefinition): void {
    this.registry.set(icon.name, icon.path);
  }

  registerIcons(icons: IconDefinition[]): void {
    icons.forEach(icon => this.registerIcon(icon));
  }

  getIcon(name: string): string | undefined {
    return this.registry.get(name);
  }
}