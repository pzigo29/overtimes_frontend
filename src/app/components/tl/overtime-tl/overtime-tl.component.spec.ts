import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OvertimeTLComponent } from './overtime-tl.component';

describe('OvertimeTLComponent', () => {
  let component: OvertimeTLComponent;
  let fixture: ComponentFixture<OvertimeTLComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OvertimeTLComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OvertimeTLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
