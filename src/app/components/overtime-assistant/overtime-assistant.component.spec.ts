import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeAssistantComponent } from './overtime-assistant.component';

describe('OvertimeAssistantComponent', () => {
  let component: OvertimeAssistantComponent;
  let fixture: ComponentFixture<OvertimeAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeAssistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
