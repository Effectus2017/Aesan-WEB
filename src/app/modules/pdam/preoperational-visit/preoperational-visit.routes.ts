import { Routes } from '@angular/router';
import { MonitorPreoperationalVisitComponent } from './preoperational-visit.component';
import { MonitorPreoperationalVisitListComponent } from './list/list.component';
import { initialMonitorPreoperationalVisitResolver, editMonitorPreoperationalVisitResolver } from './preoperational-visit.resolvers';
import { EditMonitorPreoperationalVisitComponent } from './edit/edit.component';


export default [
    {
        path     : '',
        component: MonitorPreoperationalVisitComponent,
        children: [
            {
                path: '',
                component: MonitorPreoperationalVisitListComponent,
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
