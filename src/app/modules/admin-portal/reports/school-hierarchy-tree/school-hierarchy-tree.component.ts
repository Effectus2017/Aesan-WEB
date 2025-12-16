import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import * as d3 from 'd3';
import { ReportsService } from 'app/shared/services/reports.service';
import { HierarchyStructureResponse, SponsorNode, SchoolNode, SiteNode } from 'app/shared/models/HierarchyStructure';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

interface HierarchyNode {
  id: string;
  name: string;
  level: number;
  type: 'sponsor' | 'year' | 'school' | 'site';
  data?: any;
  children?: HierarchyNode[];
}

@Component({
  selector: 'app-school-hierarchy-tree',
  templateUrl: './school-hierarchy-tree.component.html',
  styleUrls: ['./school-hierarchy-tree.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule]
})
export class SchoolHierarchyTreeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('treeContainer', { static: false }) treeContainer!: ElementRef;

  private _reportsService = inject(ReportsService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _translocoService = inject(TranslocoService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Datos
  hierarchyData: HierarchyStructureResponse | null = null;
  agencies: any[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedSponsorId?: number;

  // Años disponibles (últimos 10 años)
  availableYears: number[] = [];

  // Estado
  loading: boolean = false;
  error: string | null = null;

  // D3.js variables
  private svg: any;
  private g: any;
  private width = 1200;
  private height = 800;
  private nodeWidth = 200;
  private nodeHeight = 100;
  private levelSpacing = 250;
  private nodeSpacing = 120;

  ngOnInit(): void {
    // Generar años disponibles (año actual y 9 años anteriores)
    const currentYear = new Date().getFullYear();
    this.availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

    // Cargar datos del resolver
    this._route.data.pipe(takeUntil(this._unsubscribeAll)).subscribe((data: any) => {
      if (data.data) {
        this.agencies = data.data.agencies || [];
        this.selectedYear = data.data.selectedYear || this.selectedYear;
        this.selectedSponsorId = data.data.selectedSponsorId;

        // Solo cargar jerarquía si hay un auspiciador seleccionado
        if (this.selectedSponsorId) {
          this.hierarchyData = data.data.hierarchy;
          // Si hay datos de jerarquía del resolver, renderizar
          if (this.hierarchyData) {
            setTimeout(() => {
              if (this.treeContainer?.nativeElement) {
                this.renderHierarchy();
              }
            }, 200);
          }
        } else {
          // Limpiar datos si no hay auspiciador seleccionado
          this.hierarchyData = null;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Renderizar después de que la vista esté completamente inicializada
    if (this.hierarchyData) {
      // Usar setTimeout más largo y verificar que el contenedor esté disponible
      setTimeout(() => {
        if (this.treeContainer?.nativeElement) {
          this.renderHierarchy();
        }
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onYearChange(): void {
    // Solo cargar si hay un auspiciador seleccionado
    if (this.selectedSponsorId) {
      this.loadHierarchy();
    }
  }

  onSponsorChange(): void {
    // Solo cargar si hay un auspiciador seleccionado
    if (this.selectedSponsorId) {
      this.loadHierarchy();
    } else {
      // Limpiar datos si se deselecciona el auspiciador
      this.hierarchyData = null;
      this.error = null;
      if (this.treeContainer?.nativeElement) {
        d3.select(this.treeContainer.nativeElement).selectAll('*').remove();
      }
    }
  }

  loadHierarchy(): void {
    // Validar que haya un auspiciador seleccionado
    if (!this.selectedSponsorId) {
      this.error = 'Por favor seleccione un auspiciador';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this._reportsService.getSchoolHierarchyTree(this.selectedYear, this.selectedSponsorId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.hierarchyData = data;
          this.loading = false;
          // Esperar a que el loading se oculte y el contenedor esté disponible
          setTimeout(() => {
            if (this.treeContainer?.nativeElement) {
              this.renderHierarchy();
            }
          }, 200);
        },
        error: (err) => {
          this.error = 'Error al cargar la estructura jerárquica';
          this.loading = false;
          console.error('Error loading hierarchy:', err);
        }
      });
  }

  private renderHierarchy(): void {
    if (!this.hierarchyData) {
      console.warn('No hierarchy data available');
      return;
    }

    if (!this.treeContainer?.nativeElement) {
      console.warn('Tree container not available');
      return;
    }

    // Limpiar contenedor
    d3.select(this.treeContainer.nativeElement).selectAll('*').remove();

    // Verificar que el contenedor tenga dimensiones
    const containerRect = this.treeContainer.nativeElement.getBoundingClientRect();
    if (containerRect.width === 0) {
      console.warn('Container has no width', containerRect);
      // Reintentar después de un breve delay
      setTimeout(() => this.renderHierarchy(), 100);
      return;
    }

    // Usar el ancho del contenedor
    const containerWidth = containerRect.width || this.width;
    this.width = containerWidth;

    // Construir estructura de nodos primero para calcular altura necesaria
    const nodes = this.buildNodeStructure();

    // Calcular posiciones para determinar la altura real necesaria
    const positions = this.calculatePositions(nodes);

    // Calcular la altura máxima necesaria basada en las posiciones
    let maxY = 0;
    positions.forEach((pos) => {
      maxY = Math.max(maxY, pos.y + this.nodeHeight / 2 + 50); // +50 para padding inferior
    });

    // Establecer altura del SVG basada en el contenido real, no en el contenedor
    this.height = Math.max(maxY, 600); // Mínimo 600px

    // Configurar SVG con dimensiones calculadas
    this.svg = d3.select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('background', '#ffffff')
      .style('display', 'block'); // Asegurar que el SVG sea un bloque para el scroll

    // Crear grupo principal
    this.g = this.svg.append('g');

    // Crear gradientes para cada nivel
    this.createGradients();

    // Dibujar conexiones
    this.drawConnections(positions);

    // Dibujar nodos
    this.drawNodes(positions);
  }

  private createGradients(): void {
    const defs = this.svg.append('defs');

    // Gradiente Nivel 1 (Azul)
    const gradient1 = defs.append('linearGradient')
      .attr('id', 'gradient-level1')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    gradient1.append('stop').attr('offset', '0%').attr('stop-color', '#1e3a8a');
    gradient1.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6');

    // Gradiente Nivel 2 (Rojo)
    const gradient2 = defs.append('linearGradient')
      .attr('id', 'gradient-level2')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    gradient2.append('stop').attr('offset', '0%').attr('stop-color', '#991b1b');
    gradient2.append('stop').attr('offset', '100%').attr('stop-color', '#ef4444');

    // Gradiente Nivel 3 (Verde)
    const gradient3 = defs.append('linearGradient')
      .attr('id', 'gradient-level3')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    gradient3.append('stop').attr('offset', '0%').attr('stop-color', '#166534');
    gradient3.append('stop').attr('offset', '100%').attr('stop-color', '#22c55e');

    // Gradiente Nivel 4 (Morado)
    const gradient4 = defs.append('linearGradient')
      .attr('id', 'gradient-level4')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    gradient4.append('stop').attr('offset', '0%').attr('stop-color', '#6b21a8');
    gradient4.append('stop').attr('offset', '100%').attr('stop-color', '#a855f7');
  }

  private buildNodeStructure(): HierarchyNode[] {
    const nodes: HierarchyNode[] = [];

    if (!this.hierarchyData || !this.hierarchyData.sponsor) return nodes;

    // Nivel 1: Auspiciador
    const sponsorNode: HierarchyNode = {
      id: 'sponsor-1',
      name: this.hierarchyData.sponsor.name || 'Auspiciador',
      level: 1,
      type: 'sponsor',
      data: this.hierarchyData.sponsor,
      children: []
    };

    // Nivel 2: Año
    const yearNode: HierarchyNode = {
      id: 'year-1',
      name: `${this.hierarchyData.year?.year || this.selectedYear} Año`,
      level: 2,
      type: 'year',
      data: this.hierarchyData.year,
      children: []
    };
    sponsorNode.children!.push(yearNode);

    // Nivel 3: Escuelas
    if (this.hierarchyData.schools && this.hierarchyData.schools.length > 0) {
      this.hierarchyData.schools.forEach((school) => {
        const schoolNode: HierarchyNode = {
          id: `school-${school.id}`,
          name: school.name,
          level: 3,
          type: 'school',
          data: school,
          children: []
        };

        // Nivel 4: Sitios
        if (school.sites && school.sites.length > 0) {
          school.sites.forEach((site) => {
            const siteNode: HierarchyNode = {
              id: `site-${site.id}`,
              name: site.name,
              level: 4,
              type: 'site',
              data: site
            };
            schoolNode.children!.push(siteNode);
          });
        }

        yearNode.children!.push(schoolNode);
      });
    }

    nodes.push(sponsorNode);
    return nodes;
  }

  private calculatePositions(nodes: HierarchyNode[]): Map<string, { x: number; y: number; node: HierarchyNode }> {
    const positions = new Map<string, { x: number; y: number; node: HierarchyNode }>();
    const startX = this.width / 2;
    let currentY = 100;

    // Nivel 1: Auspiciador (centrado)
    if (nodes.length > 0) {
      positions.set(nodes[0].id, { x: startX, y: currentY, node: nodes[0] });
      currentY += this.levelSpacing;

      // Nivel 2: Año (centrado)
      if (nodes[0].children && nodes[0].children.length > 0) {
        const yearNode = nodes[0].children[0];
        positions.set(yearNode.id, { x: startX, y: currentY, node: yearNode });
        currentY += this.levelSpacing;

        // Nivel 3: Escuelas (distribuidas horizontalmente)
        if (yearNode.children && yearNode.children.length > 0) {
          const schools = yearNode.children;
          const schoolSpacing = schools.length > 1
            ? Math.min(300, (this.width - 200) / Math.max(1, schools.length))
            : 0;
          const startSchoolX = schools.length > 1
            ? startX - ((schools.length - 1) * schoolSpacing) / 2
            : startX;

          schools.forEach((school, index) => {
            const schoolX = schools.length > 1
              ? startSchoolX + (index * schoolSpacing)
              : startX;
            positions.set(school.id, { x: schoolX, y: currentY, node: school });
          });

          // Calcular altura máxima de sitios para el siguiente nivel
          let maxSitesCount = 0;
          schools.forEach((school) => {
            if (school.children && school.children.length > 0) {
              maxSitesCount = Math.max(maxSitesCount, school.children.length);
            }
          });

          if (maxSitesCount > 0) {
            currentY += this.levelSpacing;

            // Nivel 4: Sitios (distribuidos bajo cada escuela)
            schools.forEach((school) => {
              if (school.children && school.children.length > 0) {
                const sites = school.children;
                const schoolPos = positions.get(school.id);
                if (schoolPos) {
                  const siteSpacing = sites.length > 1 ? 150 : 0;
                  const startSiteX = sites.length > 1
                    ? schoolPos.x - ((sites.length - 1) * siteSpacing) / 2
                    : schoolPos.x;

                  sites.forEach((site, siteIndex) => {
                    const siteX = sites.length > 1
                      ? startSiteX + (siteIndex * siteSpacing)
                      : schoolPos.x;
                    positions.set(site.id, { x: siteX, y: currentY, node: site });
                  });
                }
              }
            });
          }
        }
      }
    }

    return positions;
  }

  private drawConnections(positions: Map<string, { x: number; y: number; node: HierarchyNode }>): void {
    // Crear marcadores de flecha para cada nivel
    const defs = this.svg.select('defs');

    // Crear flechas para cada nivel
    for (let level = 1; level <= 4; level++) {
      const markerId = `arrowhead-level${level}`;
      if (!this.svg.select(`#${markerId}`).node()) {
        const marker = defs.append('marker')
          .attr('id', markerId)
          .attr('viewBox', '0 0 10 10')
          .attr('refX', 9)
          .attr('refY', 5)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto');
        marker.append('path')
          .attr('d', 'M 0 0 L 10 5 L 0 10 z')
          .attr('fill', this.getLevelColor(level));
      }
    }

    // Dibujar conexiones
    positions.forEach((pos, nodeId) => {
      const node = pos.node;

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          const childPos = positions.get(child.id);
          if (childPos) {
            this.g.append('line')
              .attr('x1', pos.x)
              .attr('y1', pos.y + this.nodeHeight / 2)
              .attr('x2', childPos.x)
              .attr('y2', childPos.y - this.nodeHeight / 2)
              .attr('stroke', this.getLevelColor(node.level))
              .attr('stroke-width', 3)
              .attr('marker-end', `url(#arrowhead-level${node.level})`);
          }
        });
      }
    });
  }

  private drawNodes(positions: Map<string, { x: number; y: number; node: HierarchyNode }>): void {
    positions.forEach((pos, nodeId) => {
      const node = pos.node;
      const level = node.level;

      // Crear grupo para el nodo
      const nodeGroup = this.g.append('g')
        .attr('transform', `translate(${pos.x}, ${pos.y})`);

      // Caja con gradiente
      const box = nodeGroup.append('rect')
        .attr('width', this.nodeWidth)
        .attr('height', this.nodeHeight)
        .attr('x', -this.nodeWidth / 2)
        .attr('y', -this.nodeHeight / 2)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', `url(#gradient-level${level})`)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');

      // Contenido dentro del rectángulo - mostrar el nombre del dato
      let displayText = '';
      if (level === 1) {
        displayText = this.hierarchyData?.sponsor?.name || 'Auspiciador';
      } else if (level === 2) {
        displayText = this.hierarchyData?.year ? `${this.hierarchyData.year.year}` : 'Año';
      } else {
        displayText = node.name || '';
      }

      // Función para dividir texto en múltiples líneas si es muy largo
      const wrapText = (text: string, maxWidth: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          // Aproximación: cada carácter ocupa ~8px con font-size 14px
          const testWidth = testLine.length * 8;
          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines.length > 0 ? lines : [text];
      };

      const textLines = wrapText(displayText, this.nodeWidth - 20);
      const lineHeight = 18;
      const startY = -(textLines.length - 1) * lineHeight / 2;

      // Dibujar cada línea de texto
      textLines.forEach((line, index) => {
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', startY + (index * lineHeight))
          .style('font-size', '14px')
          .style('font-weight', '600')
          .style('fill', '#ffffff')
          .style('pointer-events', 'none')
          .text(line);
      });

      // Etiqueta de nivel fuera de la caja (arriba)
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -this.nodeHeight / 2 - 10)
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#374151')
        .text(`Nivel ${level}`);

      // Texto descriptivo fuera de la caja (abajo) - solo para nivel 1
      if (level === 1) {
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', this.nodeHeight / 2 + 20)
          .style('font-size', '12px')
          .style('font-weight', '500')
          .style('fill', '#374151')
          .text('Auspiciador Administrador');
      }
    });
  }

  private getLevelColor(level: number): string {
    switch (level) {
      case 1: return '#3b82f6'; // Azul
      case 2: return '#ef4444'; // Rojo
      case 3: return '#22c55e'; // Verde
      case 4: return '#a855f7'; // Morado
      default: return '#6b7280';
    }
  }
}

