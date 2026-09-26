import { Routes } from '@angular/router';
import { SettingPage } from './pages/setting/setting.page/setting.page';
import { SettingNestedPage } from './pages/setting/setting-nested.page/setting-nested.page';
import { HomePage } from './pages/home/home.page/home.page';
import { HomeNestedPage } from './pages/home/home-nested.page/home-nested.page';

export const routes: Routes = [{
    path: 'home', component: HomePage, children: [{
        path: 'nested', component: HomeNestedPage
    }]
}, {
    path: 'setting', component: SettingPage, children: [{
        path: 'nested', component: SettingNestedPage
    }]
}, {
    path: 'page', loadComponent: () => import('./pages/page/page.page').then(m => m.PagePage)
}, {
    path: 'tipografi', loadComponent: () => import('./pages/tipografi.page/tipografi.page').then(m => m.TipografiPage)
}, {
    path: 'radio', loadComponent: () => import('./pages/radio/radio.page').then(m => m.RadioPage)
}, 
{
    path: 'button', loadComponent: () => import('./pages/button/button.page/button.page').then(m => m.ButtonPage)
}, 
{
    path: 'dialog', loadComponent: () => import('./pages/dialog/dialog.page/dialog.page').then(m => m.DialogPage)
}, {
    path: 'form', loadComponent: () => import('./pages/form/form.page/form.page').then(m => m.FormPage)
}, {
    path: 'table', loadComponent: () => import('./pages/table.page/table.page').then(m => m.TablePage)
}, {
    path: 'grid', loadComponent: () => import('./pages/grid/grid.page/grid.page').then(m => m.GridPage)
}, {
    path: 'flex', loadComponent: () => import('./pages/flex.page/flex.page').then(m => m.FlexPage)
}, {
    path: 'spacing', loadComponent: () => import('./pages/spacing.page/spacing.page').then(m => m.SpacingPage)
}, {
    path: 'layout', redirectTo: '/grid', pathMatch: 'full'
}, {
    path: 'select', loadComponent: () => import('./pages/select/select.page/select.page').then(m => m.SelectPage)
}, 
// {
//     path: 'context-menu', loadComponent: () => import('./pages/context-menu/context-menu.page/context-menu.page').then(m => m.ContextMenuPage)
// }, 
{
    path: 'snackbar', loadComponent: () => import('./pages/snackbar/snackbar.page').then(m => m.SnackbarPage)
}, {
    path: 'context-menu-spike', loadComponent: () => import('./pages/context-menu-spike/context-menu-spike.page').then(m => m.ContextMenuSpikePage)
}, {
    path: 'select-spike', loadComponent: () => import('./pages/select-spike/select-spike.page').then(m => m.SelectSpikePage)
},{
    path: '', redirectTo: '/home', pathMatch: 'full'
}];
