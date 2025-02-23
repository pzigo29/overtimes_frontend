import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeRndSegmentsComponent } from './overtime-rnd-segments.component';

describe('OvertimeRndSegmentsComponent', () => {
  let component: OvertimeRndSegmentsComponent;
  let fixture: ComponentFixture<OvertimeRndSegmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeRndSegmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeRndSegmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
