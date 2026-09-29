import { ConnectedPosition, GlobalPositionStrategy } from "@angular/cdk/overlay";
import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders, Provider } from "@angular/core";
import { WuiMenuStack } from "./menu-stack";

export interface WuiConnectedPosition extends ConnectedPosition {}

export interface WuiMenuConfig {
    defaultPosition?: string,
    positions?: Record<string, WuiConnectedPosition[]>
}

const DEFAULT_WUI_MENU_CONFIG: Required<WuiMenuConfig> = {
    defaultPosition: 'default',
    positions: {
        'default': [{
            originX: 'start', originY: 'bottom',
            overlayX: 'start', overlayY: 'top'
        },
        {
            originX: 'start', originY: 'top',
            overlayX: 'start', overlayY: 'bottom'
        }]
    }
}

export const WUI_MENU_CONFIG = new InjectionToken<WuiMenuConfig>('WUI_MENU_CONFIG', {
    providedIn: 'root',
    factory: () => ({...DEFAULT_WUI_MENU_CONFIG})
});

export function provideWuiMenuConfig(config: WuiMenuConfig = {}): Provider[] {
    return [
        WuiMenuStack,
        {
            provide: WUI_MENU_CONFIG,
            useValue: <WuiMenuConfig>{
                defaultPosition: config.defaultPosition ?? DEFAULT_WUI_MENU_CONFIG.defaultPosition,
                positions: {
                    ...DEFAULT_WUI_MENU_CONFIG.positions,
                    ...config.positions
                }
            }
        }
    ];
}