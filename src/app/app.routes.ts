import { Routes, RouterModule } from '@angular/router';
import { OvertimeThpComponent } from './overtime-thp/overtime-thp.component';
import { OvertimeTLComponent } from './overtime-tl/overtime-tl.component';
import { OvertimeMngComponent } from './overtime-mng/overtime-mng.component';
import { OvertimeRndComponent } from './overtime-rnd/overtime-rnd.component';
import { OvertimeAssistantComponent } from './overtime-assistant/overtime-assistant.component';
import { OvertimeTLTeamComponent } from './overtime-tl-team/overtime-tl-team.component';
import { OvertimeTLTeamDetailComponent } from './overtime-tl-team-detail/overtime-tl-team-detail.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: '/thp', pathMatch: 'full' },
  { path: 'thp', component: OvertimeThpComponent },
  { path: 'tl', component: OvertimeTLComponent },
  { path: 'tl/team', component: OvertimeTLTeamComponent },
  { path: 'tl/team/detail/:username', component: OvertimeTLTeamDetailComponent },
  { path: 'mng', component: OvertimeMngComponent },
  { path: 'rnd', component: OvertimeRndComponent },
  { path: 'assistant', component: OvertimeAssistantComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
