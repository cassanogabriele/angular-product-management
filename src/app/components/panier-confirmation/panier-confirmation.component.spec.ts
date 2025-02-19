import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanierConfirmationComponent } from './panier-confirmation.component';

describe('PanierConfirmationComponent', () => {
  let component: PanierConfirmationComponent;
  let fixture: ComponentFixture<PanierConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanierConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanierConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
