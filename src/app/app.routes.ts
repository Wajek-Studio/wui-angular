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
    path: 'form', loadComponent: () => import('./pages/form/form.page/form.page').then(m => m.FormPage)
}, {
    path: 'sidenav', loadComponent: () => import('./pages/sidenaav.page/sidenaav.page').then(m => m.SidenaavPage)
}, {
    path: 'table', loadComponent: () => import('./pages/table.page/table.page').then(m => m.TablePage)
}, {
    path: 'layout', loadComponent: () => import('./pages/layout.page/layout.page').then(m => m.LayoutPage)
}, {
    path: 'select', loadComponent: () => import('./pages/select/select.page/select.page').then(m => m.SelectPage)
}, {
    path: 'context-menu', loadComponent: () => import('./pages/context-menu/context-menu.page/context-menu.page').then(m => m.ContextMenuPage)
}, {
    // Halaman spike F0 (`wui-context-menu-plan.md`) — kode sekali pakai, tidak ditautkan di
    // navigasi. Hapus rute ini (beserta folder `pages/context-menu-spike/`) setelah F0 selesai.
    path: 'context-menu-spike', loadComponent: () => import('./pages/context-menu-spike/context-menu-spike.page').then(m => m.ContextMenuSpikePage)
}, {
    // Halaman spike F0 (`wui-select-plan.md`) — kode sekali pakai, tidak ditautkan di navigasi.
    // Hapus rute ini (beserta folder `pages/select-spike/`) setelah F0 selesai.
    path: 'select-spike', loadComponent: () => import('./pages/select-spike/select-spike.page').then(m => m.SelectSpikePage)
},{
    path: '', redirectTo: '/home', pathMatch: 'full'
}];
