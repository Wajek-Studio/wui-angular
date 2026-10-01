import { InjectionToken, Provider } from "@angular/core";
import { WuiDefaultErrorMatcher, WuiErrorMatcher } from "./error-matcher";

export interface WuiFormConfig {
    errorMatcher: WuiErrorMatcher
}

const defaultWuiMenuConfig: WuiFormConfig = {
    errorMatcher: new WuiDefaultErrorMatcher()
}

export const WUI_FORM_CONFIG = new InjectionToken('WUI_FORM_CONFIG', {
    factory: () => ({...defaultWuiMenuConfig})
});

export function provideWuiFormConfig(config: WuiFormConfig) : Provider[] {
    return [
        {
            provide: WUI_FORM_CONFIG,
            useValue: config
        }
    ];
}
