import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeRndComponent } from './overtime-rnd.component';

describe('OvertimeRndComponent', () => {
  let component: OvertimeRndComponent;
  let fixture: ComponentFixture<OvertimeRndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeRndComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeRndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
