import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlowsInteractionComponent } from './flows-interaction.component';
import { FormsModule } from '@angular/forms';

import { FlowsInteractionViewComponent } from './flows-interaction-view/flows-interaction-view.component';

const routes: Routes = [
  { path: ':flowId', pathMatch: 'full', component: FlowsInteractionComponent },
  { path: ':flowId/:interactionId', component: FlowsInteractionViewComponent }
];

@NgModule({
  declarations: [
    FlowsInteractionComponent,
    FlowsInteractionViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule
  ]
})
export class FlowsInteractionModule { }
