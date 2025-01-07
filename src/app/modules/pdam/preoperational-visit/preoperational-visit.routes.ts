import { Routes } from '@angular/router';
import { MonitorPreoperationalVisitComponent } from './preoperational-visit.component';
import { PdamPreoperationalVisitListComponent } from './list/list.component';
import { initialMonitorPreoperationalVisitResolver, editMonitorPreoperationalVisitResolver } from './preoperational-visit.resolvers';
import { EditMonitorPreoperationalVisitComponent } from './edit/edit.component';


export default [
    {
        path     : '',
        component: MonitorPreoperationalVisitComponent,
        children: [
            {
                path: '',
                component: PdamPreoperationalVisitListComponent,
                resolve: {
                    data: initialMonitorPreoperationalVisitResolver
                }
            },
            {
                path: 'edit/:id',
                component: EditMonitorPreoperationalVisitComponent,
                resolve: {
                    data: editMonitorPreoperationalVisitResolver
                }
            }

        ]
    }
] as Routes;
