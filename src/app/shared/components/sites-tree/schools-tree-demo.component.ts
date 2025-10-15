import { Component } from '@angular/core';
import { SchoolsTreeComponent } from './schools-tree.component';

@Component({
  selector: 'app-schools-tree-demo',
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            Demo: Diagrama de Árbol de Escuelas y Satélites
          </h1>
          <p class="text-gray-600">
            Visualización interactiva de la estructura jerárquica de escuelas, agencias y satélites del sistema AESAN.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <app-schools-tree></app-schools-tree>
        </div>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Características</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                Visualización jerárquica con D3.js
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-600 rounded-full"></div>
                Interactividad (zoom, pan, expandir)
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                Filtros múltiples
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                Tooltips informativos
              </li>
            </ul>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Datos de Ejemplo</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li>• 3 Agencias</li>
              <li>• 6 Escuelas</li>
              <li>• 5 Satélites</li>
              <li>• 3 Escuelas Independientes</li>
              <li>• Total: 17 nodos</li>
            </ul>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Controles</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li>• Click en nodos para expandir/colapsar</li>
              <li>• Hover para ver información detallada</li>
              <li>• Zoom con rueda del mouse</li>
              <li>• Pan arrastrando el árbol</li>
              <li>• Filtros en la parte superior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [SchoolsTreeComponent]
})
export class SchoolsTreeDemoComponent {
}
