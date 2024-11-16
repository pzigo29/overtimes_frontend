import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimePageComponent } from './overtime-page.component';

describe('OvertimePageComponent', () => {
  let component: OvertimePageComponent;
  let fixture: ComponentFixture<OvertimePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
