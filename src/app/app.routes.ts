import { Routes } from '@angular/router';
import { SettingPage } from './pages/setting/setting.page/setting.page';
import { SettingNestedPage } from './pages/setting/setting-nested.page/setting-nested.page';
import { HomePage } from './pages/home/home.page/home.page';
import { HomeNestedPage } from './pages/home/home-nested.page/home-nested.page';
import { TipografiPage } from './pages/tipografi.page/tipografi.page';

export const routes: Routes = [{
    path: 'home', component: HomePage, children: [{
        path: 'nested', component: HomeNestedPage
    }]
}, {
    path: 'setting', component: SettingPage, children: [{
        path: 'nested', component: SettingNestedPage
    }]
}, {
    path: 'tipografi', loadComponent: () => import('./pages/tipografi.page/tipografi.page').then(m => m.TipografiPage)
}, {
    path: 'button', loadComponent: () => import('./pages/button/button.page/button.page').then(m => m.ButtonPage)
}, {
    path: 'dialog', loadComponent: () => import('./pages/dialog/dialog.page/dialog.page').then(m => m.DialogPage)
}, {
    path: '', redirectTo: '/home', pathMatch: 'full'
}];
