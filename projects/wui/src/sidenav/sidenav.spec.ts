import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WuiSidenav } from './sidenav';

describe('WuiSidenav', () => {
  let component: WuiSidenav;
  let fixture: ComponentFixture<WuiSidenav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WuiSidenav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WuiSidenav);
    component = fixture.componentInstance;
    // `id` wajib — jadi kunci state di WuiSidenavService.
    fixture.componentRef.setInput('id', 'menu-test');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
