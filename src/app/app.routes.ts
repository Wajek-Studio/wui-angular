import { Routes } from '@angular/router';
import { NestedPage } from './pages/nested/nested.page';
import { HomePage } from './pages/home/home.page';
import { SettingPage } from './pages/setting/setting.page/setting.page';
import { SettingNestedPage } from './pages/setting/setting-nested.page/setting-nested.page';

export const routes: Routes = [{
    path: 'home', component: HomePage, children: [{
        path: 'nested', component: NestedPage
    }]
}, {
    path: 'setting', component: SettingPage, children: [{
        path: 'nested', component: SettingNestedPage
    }]
}, {
    path: '', redirectTo: '/home', pathMatch: 'full'
}];
