import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthsTableComponent } from './months-table.component';

describe('MonthsTableComponent', () => {
  let component: MonthsTableComponent;
  let fixture: ComponentFixture<MonthsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
