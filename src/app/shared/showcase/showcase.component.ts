import { Component, computed, effect, input, signal } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';
import { Code } from '../code/code';

export interface ShowcaseTab {
  /** Label teks tab, mis. 'HTML', 'TypeScript', 'SCSS', 'JSON' */
  label: string;
  /** Isi kode sumber teks */
  code?: string;
  /** Bahasa syntax highlighting untuk ngx-highlightjs (mis. 'html', 'typescript', 'scss') */
  language?: string;
}

@Component({
  selector: 'app-showcase',
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
  imports: [Code],
})
export class ShowcaseComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly tabs = input<ShowcaseTab[]>([]);
  readonly defaultShowCode = input<boolean>(false);
  readonly collapsible = input<boolean>(true);

  private readonly userSelectedLabel = signal<string | null>(null);
  readonly showCode = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.showCode.set(this.defaultShowCode());
    });
  }

  readonly hasTabs = computed(() => this.tabs().length > 0);

  readonly selectedLabel = computed<string>(() => {
    const list = this.tabs();
    if (list.length === 0) {
      return '';
    }
    const userChoice = this.userSelectedLabel();
    if (userChoice && list.some((t) => t.label === userChoice)) {
      return userChoice;
    }
    return list[0].label;
  });

  readonly currentTab = computed<ShowcaseTab | undefined>(() => {
    const targetLabel = this.selectedLabel();
    return this.tabs().find((t) => t.label === targetLabel);
  });

  selectTab(label: string): void {
    this.userSelectedLabel.set(label);
    if (!this.showCode()) {
      this.showCode.set(true);
    }
  }

  toggleCode(): void {
    this.showCode.update((val) => !val);
  }
}
