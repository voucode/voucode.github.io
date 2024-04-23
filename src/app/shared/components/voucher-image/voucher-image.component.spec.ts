import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherImageComponent } from './voucher-image.component';

describe('VoucherImageComponent', () => {
  let component: VoucherImageComponent;
  let fixture: ComponentFixture<VoucherImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherImageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoucherImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
