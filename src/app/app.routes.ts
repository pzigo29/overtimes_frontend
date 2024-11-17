import { Routes } from '@angular/router';
import { OvertimeThpComponent } from './overtime-thp/overtime-thp.component';
import { OvertimeTLComponent } from './overtime-tl/overtime-tl.component';
import { OvertimeMngComponent } from './overtime-mng/overtime-mng.component';
import { OvertimeRndComponent } from './overtime-rnd/overtime-rnd.component';
import { OvertimeAssistantComponent } from './overtime-assistant/overtime-assistant.component';

export const routes: Routes = [
  { path: '', redirectTo: '/thp', pathMatch: 'full' },
  { path: 'thp', component: OvertimeThpComponent },
  { path: 'tl', component: OvertimeTLComponent },
  { path: 'mng', component: OvertimeMngComponent },
  { path: 'rnd', component: OvertimeRndComponent },
  { path: 'assistant', component: OvertimeAssistantComponent }
];
