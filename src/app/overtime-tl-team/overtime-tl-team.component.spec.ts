import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeTLTeamComponent } from './overtime-tl-team.component';

describe('OvertimeTlTeamComponent', () => {
  let component: OvertimeTLTeamComponent;
  let fixture: ComponentFixture<OvertimeTLTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeTLTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeTLTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
