import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeThpComponent } from './overtime-thp.component';

describe('OvertimeThpComponent', () => {
  let component: OvertimeThpComponent;
  let fixture: ComponentFixture<OvertimeThpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeThpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeThpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
