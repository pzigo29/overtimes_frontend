import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { OvertimeThpComponent } from './components/overtime-thp/overtime-thp.component';
import { OvertimeTLComponent } from './components/tl/overtime-tl/overtime-tl.component';
import { OvertimeMngComponent } from './components/mng/overtime-mng/overtime-mng.component';
import { OvertimeMngTeamsComponent } from './components/mng/overtime-mng-teams/overtime-mng-teams.component';
import { OvertimeRndComponent } from './components/rnd/overtime-rnd/overtime-rnd.component';
import { OvertimeAssistantComponent } from './components/overtime-assistant/overtime-assistant.component';
import { OvertimeTLTeamComponent } from './components/tl/overtime-tl-team/overtime-tl-team.component';
import { OvertimeTLTeamDetailComponent } from './components/tl/overtime-tl-team-detail/overtime-tl-team-detail.component';
import { OvertimeRndSegmentsComponent } from './components/rnd/overtime-rnd-segments/overtime-rnd-segments.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { StatsPanelComponent } from './components/stats-panel/stats-panel.component';

export const routes: Routes = [
  { path: '', redirectTo: '/thp', pathMatch: 'full' },
  { path: 'thp', component: OvertimeThpComponent },
  { path: 'tl', component: OvertimeTLTeamComponent },
  { path: 'tl/team', component: OvertimeTLTeamComponent },
  { path: 'tl/team/detail', component: OvertimeTLTeamDetailComponent },
  { path: 'mng', component: OvertimeMngTeamsComponent },
  { path: 'mng/teams', component: OvertimeMngTeamsComponent },
  { path: 'rnd', component: OvertimeRndComponent },
  { path: 'rnd/segments', component: OvertimeRndSegmentsComponent},
  { path: 'assistant', component: OvertimeAssistantComponent },
  { path: 'admin', component: AdminPanelComponent},
  { path: 'stats', component: StatsPanelComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
