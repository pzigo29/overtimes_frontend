import { Component } from '@angular/core';
import { TitleBarComponent } from "../title-bar/title-bar.component";

@Component({
  selector: 'app-overtime-assistant',
  standalone: true,
  imports: [TitleBarComponent],
  templateUrl: './overtime-assistant.component.html',
  styleUrl: './overtime-assistant.component.scss'
})
export class OvertimeAssistantComponent {
  title: string = 'Nadčasy R&D';
}
