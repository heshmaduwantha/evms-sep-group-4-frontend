import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerEditComponent } from './volunteer-edit.component';

describe('VolunteerEditComponent', () => {
  let component: VolunteerEditComponent;
  let fixture: ComponentFixture<VolunteerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VolunteerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
