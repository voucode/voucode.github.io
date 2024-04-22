import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleDriveCorrectLinkComponent } from './google-drive-correct-link.component';

describe('GoogleDriveCorrectLinkComponent', () => {
  let component: GoogleDriveCorrectLinkComponent;
  let fixture: ComponentFixture<GoogleDriveCorrectLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleDriveCorrectLinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoogleDriveCorrectLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
