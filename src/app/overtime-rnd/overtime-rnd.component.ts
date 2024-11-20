import { Component } from '@angular/core';
import { TitleBarComponent } from "../title-bar/title-bar.component";

@Component({
  selector: 'app-overtime-rnd',
  standalone: true,
  imports: [TitleBarComponent],
  templateUrl: './overtime-rnd.component.html',
  styleUrl: './overtime-rnd.component.scss'
})
export class OvertimeRndComponent {
  title: string = 'Nadčasy R&D';
}
