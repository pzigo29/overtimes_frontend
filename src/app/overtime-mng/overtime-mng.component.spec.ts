import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeMngComponent } from './overtime-mng.component';

describe('OvertimeMngComponent', () => {
  let component: OvertimeMngComponent;
  let fixture: ComponentFixture<OvertimeMngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeMngComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeMngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
