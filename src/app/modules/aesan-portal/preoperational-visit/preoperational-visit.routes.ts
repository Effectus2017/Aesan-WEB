import { Routes } from '@angular/router';
import { AesanPreoperationalVisitComponent } from './preoperational-visit.component';
import { AesanPreoperationalVisitListComponent } from './list/list.component';
import { initialAesanPreoperationalVisitResolver, editAesanPreoperationalVisitResolver } from './preoperational-visit.resolvers';
import { EditAesanPreoperationalVisitComponent } from './edit/edit.component';


export default [
    {
        path     : '',
        component: AesanPreoperationalVisitComponent,
        children: [
            {
                path: '',
                component: AesanPreoperationalVisitListComponent,
                resolve: {
                    data: initialAesanPreoperationalVisitResolver
                }
            },
            {
                path: 'edit/:id',
                component: EditAesanPreoperationalVisitComponent,
                resolve: {
                    data: editAesanPreoperationalVisitResolver
                }
            }

        ]
    }
] as Routes;
