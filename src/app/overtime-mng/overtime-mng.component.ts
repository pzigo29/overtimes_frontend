import { Component } from '@angular/core';
import { TitleBarComponent } from "../title-bar/title-bar.component";

@Component({
  selector: 'app-overtime-mng',
  standalone: true,
  imports: [TitleBarComponent],
  templateUrl: './overtime-mng.component.html',
  styleUrl: './overtime-mng.component.scss'
})
export class OvertimeMngComponent {
  title: string = 'Segment D';
  segment: number = 3;
}
