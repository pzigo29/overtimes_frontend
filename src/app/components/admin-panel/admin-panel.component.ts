import { Component, ElementRef, OnInit, ViewChild, viewChild } from '@angular/core';
import { TitleBarComponent } from "../shared-components/title-bar/title-bar.component";
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Email, Employee, OvertimeType, ScheduledJobs, WorkflowActionSchedule } from '../../models/data.model';
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
  @ViewChild('newWfActionName') newWfActionName!: ElementRef;
  @ViewChild('newWfActionWorkDay') newWfActionWorkDay!: ElementRef;
  @ViewChild('newWfActionEmailId') newWfActionEmailId!: ElementRef;

  @ViewChild('newEmailSubject') newEmailSubject!: ElementRef;
  @ViewChild('newEmailMessage') newEmailMessage!: ElementRef;

  @ViewChild('newScheduledJobName') newScheduledJobName!: ElementRef;
  @ViewChild('newScheduledJobLastExecutionDate') newScheduledJobLastExecutionDate!: ElementRef;

  @ViewChild('newOvertimeTypeName') newOvertimeTypeName!: ElementRef;

  title: string = 'ADMIN';
  wfActions: WorkflowActionSchedule[] = [];
  emails: Email[] = [];
  jobs: ScheduledJobs[] = [];
  overtimeTypes: OvertimeType[] = [];

  deletedWfActionsIds: number[] = [];
  deletedEmailsIds: number[] = [];
  deletedScheduledJobsIds: number[] = [];
  deletedOvertimeTypesIds: number[] = [];

  shownOvertimeTypes: boolean = false;
  shownEmails: boolean = false;
  shownScheduledJobs: boolean = false;
  shownWfActions: boolean = false;

  addNewWfAction: boolean = false;
  addNewEmail: boolean = false;
  addNewScheduledJob: boolean = false;
  addNewOvertimeType: boolean = false;

  selectedWfAction: WorkflowActionSchedule | null = null;
  selectedEmail: Email | null = null;
  selectedScheduledJob: ScheduledJobs | null = null;
  selectedOvertimeType: OvertimeType | null = null;
  loading: boolean = true;

  admin: Employee | undefined = undefined;

  constructor(private dataService: DataService) { }

  async ngOnInit() 
  {
      this.dataService.username$.subscribe((username) => {
        if (username) {
          console.log('admin: ' + username);
          this.dataService.getEmployee(username).subscribe(
            (data: Employee | undefined) => {
              this.admin = data;
              console.log('userEmployee: ' + this.admin?.username);
              
              if (this.admin?.levelRole !== 6)
                {
                  console.error('User is not an admin. Redirecting to home page.');
                  alert('You are not an admin. Redirecting to home page.');
                  window.location.href = '/';
                }
        
                this.loadAdminData();
            },
            (error: any) => {
              console.error('Error fetching userEmployee', error);
            }
          );
          
        } else {
          console.log('No username found!');
        }
      });
    }
  
    private async loadAdminData(): Promise<void> {
      try {
        this.wfActions = await this.dataService.getWorkflowActionsSchedules();
        this.emails = await this.dataService.getEmails();
        this.jobs = await this.dataService.getScheduledJobs();
        this.overtimeTypes = await this.dataService.getOvertimeTypes();
        this.loading = false;
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
  }

  saveNewWfAction(): WorkflowActionSchedule | null
  {
    try
    {
      if (!this.newWfActionName.nativeElement.value)
      {
        this.addNewWfAction = false;
        return null;
      }
      const newAction: WorkflowActionSchedule = {
        actionId: 0,
        action: this.newWfActionName.nativeElement.value,
        plannedWorkDay: this.newWfActionWorkDay.nativeElement.value,
        emailId: this.newWfActionEmailId.nativeElement.value
      };
  
      this.wfActions.push(newAction);
      this.addNewWfAction = false;
      return newAction;
    } catch (e)
    {
      console.error('Error saving new action:', e);
      return null;
    }
  }

  saveNewEmail(): Email | null
  {
    try
    {
      if (!this.newEmailSubject.nativeElement.value)
      {
        this.addNewEmail = false;
        return null;
      }
      const newEmail: Email = {
        emailId: 0,
        subject: this.newEmailSubject.nativeElement.value,
        message: this.newEmailMessage.nativeElement.value
      };
  
      this.emails.push(newEmail);
      this.addNewEmail = false;
      return newEmail;
    } catch (e)
    {
      console.error('Error saving new email:', e);
      return null;
    }
  }

  saveNewScheduledJob(): ScheduledJobs | null
  {
    try 
    {
      if (!this.newScheduledJobName.nativeElement.value)
      {
        this.addNewScheduledJob = false;
        return null;
      }
      const newJob: ScheduledJobs = {
        jobId: 0,
        jobName: this.newScheduledJobName.nativeElement.value,
        lastExecutionDate: this.newScheduledJobLastExecutionDate.nativeElement.value
      };
  
      this.jobs.push(newJob);
      this.addNewScheduledJob = false;
      return newJob;
    } catch (e)
    {
      console.error('Error saving new scheduled job:', e);
      return null;
    }
  }

  saveNewOvertimeType(): OvertimeType | null
  {
    try
    {
      if (!this.newOvertimeTypeName.nativeElement.value)
      {
        this.addNewOvertimeType = false;
        return null;
      }
      const newOvertimeType: OvertimeType = {
        overtimeTypeId: 0,
        typeName: this.newOvertimeTypeName.nativeElement.value
      };
  
      this.overtimeTypes.push(newOvertimeType);
      this.addNewOvertimeType = false;
      return newOvertimeType;
    } catch (e)
    {
      console.error('Error saving new overtime type:', e);
      return null;
    }
  }

  async saveChanges(): Promise<void>
  {
    const newAction: WorkflowActionSchedule | null = this.saveNewWfAction();
    let newActionPromise: Promise<any> | null = null;
    if (newAction)
    {
      newActionPromise = this.dataService.postWfActionSchedule(newAction);
    }

    const newEmail: Email | null = this.saveNewEmail();
    let newEmailPromise: Promise<any> | null = null;
    if (newEmail)
    {
      newEmailPromise = this.dataService.postEmail(newEmail);
    }

    const newJob: ScheduledJobs | null = this.saveNewScheduledJob();
    let newJobPromise: Promise<any> | null = null;
    if (newJob)
    {
      newJobPromise = this.dataService.postScheduledJob(newJob);
    }

    const newOvertimeType: OvertimeType | null = this.saveNewOvertimeType();
    let newOvertimeTypePromise: Promise<any> | null = null;
    if (newOvertimeType)
    {
      newOvertimeTypePromise = this.dataService.postOvertimeType(newOvertimeType);
    }

    const saveActionPromises = this.wfActions.map(action => {
      return this.dataService.setWfActionSchedule(action);
    });

    const deleteActionPromises = this.deletedWfActionsIds.map(id => {
      return this.dataService.deleteWfActionSchedule(id);
    });

    const saveEmailPromises = this.emails.map(email => {
      return this.dataService.setEmail(email);
    });

    const deleteEmailPromises = this.deletedEmailsIds.map(id => {
      return this.dataService.deleteEmail(id);
    });

    const saveJobPromises = this.jobs.map(job => {
      return this.dataService.setScheduledJob(job);
    });

    const deleteJobPromises = this.deletedScheduledJobsIds.map(id => {
      return this.dataService.deleteScheduledJob(id);
    });

    const saveOvertimeTypePromises = this.overtimeTypes.map(ot => {
      return this.dataService.setOvertimeType(ot);
    });

    const deleteOvertimeTypePromises = this.deletedOvertimeTypesIds.map(id => {
      return this.dataService.deleteOvertimeType(id);
    });

    const allPromises = [...saveActionPromises, ...deleteActionPromises, ...saveEmailPromises, ...deleteEmailPromises, 
                          ...saveJobPromises, ...deleteJobPromises, ...saveOvertimeTypePromises, ...deleteOvertimeTypePromises];
    if (newActionPromise) 
    {
      allPromises.push(newActionPromise);
    }

    if (newEmailPromise)
    {
      allPromises.push(newEmailPromise);
    }

    if (newJobPromise)
    {
      allPromises.push(newJobPromise);
    }

    if (newOvertimeTypePromise)
    {
      allPromises.push(newOvertimeTypePromise);
    }

    await Promise.all(allPromises);
  }

  toggleWfActions(): void
  {
    this.shownWfActions = !this.shownWfActions;
  }

  toggleEmails(): void
  {
    this.shownEmails = !this.shownEmails;
  }

  toggleScheduledJobs(): void
  {
    this.shownScheduledJobs = !this.shownScheduledJobs;
  }

  toggleOvertimeTypes(): void
  {
    this.shownOvertimeTypes = !this.shownOvertimeTypes;
  }

  addWfAction(): void
  {
    this.addNewWfAction = true;
    this.selectedWfAction = null;
  }

  addEmail(): void
  {
    this.addNewEmail = true;
    this.selectedEmail = null;
  }

  addScheduledJob(): void
  {
    this.addNewScheduledJob = true;
    this.selectedScheduledJob = null;
  }

  addOvertimeType(): void
  {
    this.addNewOvertimeType = true;
    this.selectedOvertimeType = null;
  }

  selectWfAction(action: WorkflowActionSchedule | null): void
  {
    console.log('Selected action:', action);
    this.selectedWfAction = action;
  }

  selectEmail(email: Email | null): void
  {
    this.selectedEmail = email;
  }

  selectScheduledJob(job: ScheduledJobs | null): void
  {
    this.selectedScheduledJob = job;
  }

  selectOvertimeType(ot: OvertimeType | null): void
  {
    this.selectedOvertimeType = ot;
  }

  deleteWfAction(action: WorkflowActionSchedule | null): void
  {
    if (action === null) 
    {
      if (this.addNewWfAction)
        this.addNewWfAction = false;
      return;
    }
    this.wfActions = this.wfActions.filter(a => a !== action);
    this.deletedWfActionsIds.push(action?.actionId);
    this.selectedWfAction = null;
    console.log('Deleted actions:', this.deletedWfActionsIds);
  }

  deleteEmail(email: Email | null): void
  {
    if (email === null)
    {
      if (this.addNewEmail)
        this.addNewEmail = false;
      return;
    }
    this.emails = this.emails.filter(e => e !== email);
    this.deletedEmailsIds.push(email?.emailId);
    this.selectedEmail = null;
    console.log('Deleted emails:', this.deletedEmailsIds);
  }

  deleteScheduledJob(job: ScheduledJobs | null): void
  {
    if (job === null)
    {
      if (this.addNewScheduledJob)
        this.addNewScheduledJob = false;
      return;
    }
    this.jobs = this.jobs.filter(j => j !== job);
    this.deletedScheduledJobsIds.push(job?.jobId);
    this.selectedScheduledJob = null;
    console.log('Deleted jobs:', this.deletedScheduledJobsIds);
  }

  deleteOvertimeType(ot: OvertimeType | null): void
  {
    if (ot === null)
    {
      if (this.addNewOvertimeType)
        this.addNewOvertimeType = false;
      return;
    }
    this.overtimeTypes = this.overtimeTypes.filter(o => o !== ot);
    this.deletedOvertimeTypesIds.push(ot?.overtimeTypeId);
    this.selectedOvertimeType = null;
    console.log('Deleted overtime types:', this.deletedOvertimeTypesIds);
  }

}
