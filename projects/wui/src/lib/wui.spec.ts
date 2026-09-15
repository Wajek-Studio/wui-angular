import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wui } from './wui';

describe('Wui', () => {
  let component: Wui;
  let fixture: ComponentFixture<Wui>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wui]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wui);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
