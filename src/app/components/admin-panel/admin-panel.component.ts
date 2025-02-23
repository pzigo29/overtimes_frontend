import { Component, OnInit } from '@angular/core';
import { TitleBarComponent } from "../shared-components/title-bar/title-bar.component";
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { WorkflowActionSchedule } from '../../models/data.model';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [TitleBarComponent, TranslateModule, CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  title: string = 'ADMIN';
  wfActions: WorkflowActionSchedule[] = [];

  constructor(private dataService: DataService) { }

  async ngOnInit() 
  {
    this.wfActions = await this.dataService.getWorkflowActionsSchedules();
    console.log('Workflow actions:', this.wfActions);
  }

  async saveChanges(): Promise<void>
  {
    const savePromises = this.wfActions.map(action => {
      this.dataService.setWfActionSchedule(action);
    });

    await Promise.all(savePromises);
  }

}
