import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeMngTeamsComponent } from './overtime-mng-teams.component';

describe('OvertimeMngTeamsComponent', () => {
  let component: OvertimeMngTeamsComponent;
  let fixture: ComponentFixture<OvertimeMngTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeMngTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeMngTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
