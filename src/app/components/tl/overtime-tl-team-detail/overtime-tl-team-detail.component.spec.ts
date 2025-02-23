import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeTLTeamDetailComponent } from './overtime-tl-team-detail.component';

describe('OvertimeTlTeamDetailComponent', () => {
  let component: OvertimeTLTeamDetailComponent;
  let fixture: ComponentFixture<OvertimeTLTeamDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeTLTeamDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeTLTeamDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
