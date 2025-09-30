import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

interface SchoolTreeNode {
  name: string;
  type: 'agency' | 'main-school' | 'satellite' | 'independent-school';
  id: number;
  parentId?: number;
  children?: SchoolTreeNode[];
  data?: {
    agencyId?: number;
    agencyCode?: string;
    agencyName?: string;
    totalSchools?: number;
    totalSatellites?: number;
    schoolId?: number;
    siteNumber?: number;
    isMainSchool?: boolean;
    generalEnrollment?: number;
    address?: string;
    city?: string;
    region?: string;
    phone?: string;
    administratorName?: string;
    satelliteId?: number;
    mainSchoolId?: number;
    mainSchoolName?: string;
    isIndependent?: boolean;
    isActive?: boolean;
  };
}

@Component({
  selector: 'app-schools-tree',
  templateUrl: './schools-tree.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SchoolsTreeComponent implements AfterViewInit {
  @ViewChild('treeContainer', { static: true }) treeContainer!: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltip!: ElementRef;

  // Estado del componente
  currentView: 'all' | 'main-only' | 'with-satellites' = 'all';
  searchTerm: string = '';
  selectedAgency: string = '';
  selectedStatus: string = '';
  loading: boolean = false;
  error: string | null = null;

  // Datos
  agencies: any[] = [];
  schoolsData: SchoolTreeNode[] = [];
  filteredData: SchoolTreeNode[] = [];

  // Estadísticas
  stats = {
    totalAgencies: 0,
    totalSchools: 0,
    totalSatellites: 0,
    totalIndependent: 0,
    totalNodes: 0,
    maxDepth: 0
  };

  // Tooltip
  tooltipData: any = null;
  tooltipPosition = { x: 0, y: 0 };

  // D3.js variables
  private svg: any;
  private g: any;
  private tree: any;
  private root: any;
  private width = 800;
  private height = 500;

  ngAfterViewInit() {
    this.loadAgencies();
    this.loadSchoolsTree();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.tooltipData) {
      this.tooltipPosition = {
        x: event.clientX + 10,
        y: event.clientY - 10
      };
    }
  }

  getButtonClasses(view: string): string {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200';
    const activeClasses = 'bg-blue-600 text-white shadow-sm';
    const inactiveClasses = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';

    return this.currentView === view
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  }

  toggleView(view: 'all' | 'main-only' | 'with-satellites') {
    this.currentView = view;
    this.filterTree();
  }

  filterTree() {
    let filtered = [...this.schoolsData];

    // Filtrar por vista
    if (this.currentView === 'main-only') {
      filtered = this.filterMainSchoolsOnly(filtered);
    } else if (this.currentView === 'with-satellites') {
      filtered = this.filterWithSatellites(filtered);
    }

    // Filtrar por búsqueda
    if (this.searchTerm) {
      filtered = this.filterBySearch(filtered, this.searchTerm);
    }

    // Filtrar por agencia
    if (this.selectedAgency) {
      filtered = this.filterByAgencyId(filtered, parseInt(this.selectedAgency));
    }

    // Filtrar por estado
    if (this.selectedStatus) {
      filtered = this.filterByStatus(filtered, this.selectedStatus);
    }

    this.filteredData = filtered;
    this.renderTree();
  }

  filterByAgency() {
    this.filterTree();
  }

  onFilterByStatus() {
    this.filterTree();
  }

  expandAll() {
    if (this.root) {
      this.root.descendants().forEach((d: any) => {
        d._children = d.children;
        d.children = d._children;
      });
      this.update(this.root);
    }
  }

  collapseAll() {
    if (this.root) {
      this.root.descendants().forEach((d: any) => {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        }
      });
      this.update(this.root);
    }
  }

  resetZoom() {
    if (this.svg) {
      this.svg.transition().duration(750).call(
        d3.zoom().transform,
        d3.zoomIdentity
      );
    }
  }

  private loadAgencies() {
    // Datos dummy de agencias
    this.agencies = [
      { id: 1, name: 'Agencia Educativa del Norte' },
      { id: 2, name: 'Fundación Escolar del Sur' },
      { id: 3, name: 'Centro de Desarrollo Infantil' },
      { id: 4, name: 'Asociación de Escuelas Rurales' }
    ];
  }

  private loadSchoolsTree() {
    this.loading = true;
    this.error = null;

    // Simular carga de datos
    setTimeout(() => {
      try {
        this.schoolsData = this.generateDummyData();
        this.calculateStats();
        this.filterTree();
        this.loading = false;
      } catch (error) {
        this.error = 'Error al cargar los datos de escuelas';
        this.loading = false;
      }
    }, 1000);
  }

  private generateDummyData(): SchoolTreeNode[] {
    return [
      {
        name: 'Agencia Educativa del Norte',
        type: 'agency',
        id: 1,
        data: {
          agencyId: 1,
          agencyCode: 'AEN001',
          agencyName: 'Agencia Educativa del Norte',
          totalSchools: 3,
          totalSatellites: 4
        },
        children: [
          {
            name: 'Escuela Primaria Central',
            type: 'main-school',
            id: 101,
            parentId: 1,
            data: {
              schoolId: 101,
              siteNumber: 1,
              isMainSchool: true,
              generalEnrollment: 450,
              address: 'Calle Principal 123, San Juan',
              city: 'San Juan',
              region: 'Metro',
              phone: '(787) 555-0101',
              administratorName: 'María González'
            },
            children: [
              {
                name: 'Satélite Norte',
                type: 'satellite',
                id: 201,
                parentId: 101,
                data: {
                  satelliteId: 201,
                  mainSchoolId: 101,
                  mainSchoolName: 'Escuela Primaria Central',
                  address: 'Avenida Norte 456, San Juan',
                  city: 'San Juan',
                  region: 'Metro',
                  isActive: true
                }
              },
              {
                name: 'Satélite Este',
                type: 'satellite',
                id: 202,
                parentId: 101,
                data: {
                  satelliteId: 202,
                  mainSchoolId: 101,
                  mainSchoolName: 'Escuela Primaria Central',
                  address: 'Calle Este 789, San Juan',
                  city: 'San Juan',
                  region: 'Metro',
                  isActive: true
                }
              }
            ]
          },
          {
            name: 'Escuela Secundaria del Valle',
            type: 'main-school',
            id: 102,
            parentId: 1,
            data: {
              schoolId: 102,
              siteNumber: 2,
              isMainSchool: true,
              generalEnrollment: 320,
              address: 'Carretera 1 Km 5, Bayamón',
              city: 'Bayamón',
              region: 'Metro',
              phone: '(787) 555-0102',
              administratorName: 'Carlos Rodríguez'
            },
            children: [
              {
                name: 'Satélite Oeste',
                type: 'satellite',
                id: 203,
                parentId: 102,
                data: {
                  satelliteId: 203,
                  mainSchoolId: 102,
                  mainSchoolName: 'Escuela Secundaria del Valle',
                  address: 'Calle Oeste 321, Bayamón',
                  city: 'Bayamón',
                  region: 'Metro',
                  isActive: true
                }
              }
            ]
          },
          {
            name: 'Centro de Educación Especial',
            type: 'independent-school',
            id: 103,
            parentId: 1,
            data: {
              schoolId: 103,
              siteNumber: 3,
              isMainSchool: false,
              isIndependent: true,
              generalEnrollment: 85,
              address: 'Avenida Central 654, Carolina',
              city: 'Carolina',
              region: 'Metro',
              phone: '(787) 555-0103',
              administratorName: 'Ana Martínez'
            }
          }
        ]
      },
      {
        name: 'Fundación Escolar del Sur',
        type: 'agency',
        id: 2,
        data: {
          agencyId: 2,
          agencyCode: 'FES002',
          agencyName: 'Fundación Escolar del Sur',
          totalSchools: 2,
          totalSatellites: 3
        },
        children: [
          {
            name: 'Escuela Rural de Ponce',
            type: 'main-school',
            id: 104,
            parentId: 2,
            data: {
              schoolId: 104,
              siteNumber: 4,
              isMainSchool: true,
              generalEnrollment: 280,
              address: 'Carretera 14 Km 8, Ponce',
              city: 'Ponce',
              region: 'Sur',
              phone: '(787) 555-0104',
              administratorName: 'José López'
            },
            children: [
              {
                name: 'Satélite Rural 1',
                type: 'satellite',
                id: 204,
                parentId: 104,
                data: {
                  satelliteId: 204,
                  mainSchoolId: 104,
                  mainSchoolName: 'Escuela Rural de Ponce',
                  address: 'Carretera 14 Km 12, Ponce',
                  city: 'Ponce',
                  region: 'Sur',
                  isActive: true
                }
              },
              {
                name: 'Satélite Rural 2',
                type: 'satellite',
                id: 205,
                parentId: 104,
                data: {
                  satelliteId: 205,
                  mainSchoolId: 104,
                  mainSchoolName: 'Escuela Rural de Ponce',
                  address: 'Carretera 14 Km 15, Ponce',
                  city: 'Ponce',
                  region: 'Sur',
                  isActive: true
                }
              }
            ]
          },
          {
            name: 'Escuela Elemental Costera',
            type: 'independent-school',
            id: 105,
            parentId: 2,
            data: {
              schoolId: 105,
              siteNumber: 5,
              isMainSchool: false,
              isIndependent: true,
              generalEnrollment: 195,
              address: 'Avenida del Mar 987, Guánica',
              city: 'Guánica',
              region: 'Sur',
              phone: '(787) 555-0105',
              administratorName: 'Rosa Fernández'
            }
          }
        ]
      },
      {
        name: 'Centro de Desarrollo Infantil',
        type: 'agency',
        id: 3,
        data: {
          agencyId: 3,
          agencyCode: 'CDI003',
          agencyName: 'Centro de Desarrollo Infantil',
          totalSchools: 1,
          totalSatellites: 0
        },
        children: [
          {
            name: 'Guardería Central',
            type: 'independent-school',
            id: 106,
            parentId: 3,
            data: {
              schoolId: 106,
              siteNumber: 6,
              isMainSchool: false,
              isIndependent: true,
              generalEnrollment: 120,
              address: 'Calle Infantil 147, Caguas',
              city: 'Caguas',
              region: 'Este',
              phone: '(787) 555-0106',
              administratorName: 'Luis Torres'
            }
          }
        ]
      }
    ];
  }

  private calculateStats() {
    let totalAgencies = 0;
    let totalSchools = 0;
    let totalSatellites = 0;
    let totalIndependent = 0;
    let totalNodes = 0;
    let maxDepth = 0;

    const countNodes = (nodes: SchoolTreeNode[], depth = 0) => {
      maxDepth = Math.max(maxDepth, depth);
      nodes.forEach(node => {
        totalNodes++;
        if (node.type === 'agency') totalAgencies++;
        if (node.type === 'main-school') totalSchools++;
        if (node.type === 'satellite') totalSatellites++;
        if (node.type === 'independent-school') totalIndependent++;

        if (node.children) {
          countNodes(node.children, depth + 1);
        }
      });
    };

    countNodes(this.schoolsData);

    this.stats = {
      totalAgencies,
      totalSchools,
      totalSatellites,
      totalIndependent,
      totalNodes,
      maxDepth
    };
  }

  private filterMainSchoolsOnly(data: SchoolTreeNode[]): SchoolTreeNode[] {
    return data.map(agency => ({
      ...agency,
      children: agency.children?.filter(school => school.type === 'main-school')
    })).filter(agency => agency.children && agency.children.length > 0);
  }

  private filterWithSatellites(data: SchoolTreeNode[]): SchoolTreeNode[] {
    return data.map(agency => ({
      ...agency,
      children: agency.children?.filter(school =>
        school.type === 'main-school' && school.children && school.children.length > 0
      )
    })).filter(agency => agency.children && agency.children.length > 0);
  }

  private filterBySearch(data: SchoolTreeNode[], searchTerm: string): SchoolTreeNode[] {
    const term = searchTerm.toLowerCase();
    return data.map(agency => ({
      ...agency,
      children: agency.children?.filter(school =>
        school.name.toLowerCase().includes(term) ||
        school.children?.some(satellite =>
          satellite.name.toLowerCase().includes(term)
        )
      )
    })).filter(agency => agency.children && agency.children.length > 0);
  }

  private filterByAgencyId(data: SchoolTreeNode[], agencyId: number): SchoolTreeNode[] {
    return data.filter(agency => agency.id === agencyId);
  }

  private filterByStatus(data: SchoolTreeNode[], status: string): SchoolTreeNode[] {
    // Implementar filtrado por estado activo/inactivo
    return data;
  }

  private renderTree() {
    // Limpiar contenedor
    d3.select(this.treeContainer.nativeElement).selectAll('*').remove();

    // Configurar SVG
    this.svg = d3.select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Configurar zoom
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(zoom);

    // Crear grupo principal
    this.g = this.svg.append('g');

    // Configurar layout del árbol
    this.tree = d3.tree<SchoolTreeNode>()
      .size([this.height - 40, this.width - 40]);

    // Crear jerarquía
    this.root = d3.hierarchy(this.filteredData[0]);
    this.tree(this.root);

    // Generador de enlaces
    const linkGenerator = d3.linkHorizontal<any, any>()
      .x(d => d.y)
      .y(d => d.x);

    // Crear enlaces
    this.g.selectAll('.link')
      .data(this.root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator)
      .style('fill', 'none')
      .style('stroke', '#cbd5e0')
      .style('stroke-width', 2);

    // Crear nodos
    const node = this.g.selectAll('.node')
      .data(this.root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer');

    // Agregar rectángulos
    node.append('rect')
      .attr('width', 120)
      .attr('height', 40)
      .attr('x', -60)
      .attr('y', -20)
      .style('fill', d => this.getNodeColor(d.data.type))
      .style('stroke', '#374151')
      .style('stroke-width', 2)
      .style('rx', 5)
      .style('ry', 5);

    // Agregar texto
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#ffffff')
      .text(d => d.data.name);

    // Agregar interactividad
    node.on('click', (event, d) => {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      this.update(d);
    });

    node.on('mouseover', (event, d) => {
      this.showTooltip(d.data);
    });

    node.on('mouseout', () => {
      this.hideTooltip();
    });
  }

  private update(source: any) {
    const treeData = this.tree(this.root);

    // Actualizar enlaces
    const link = this.g.selectAll('.link')
      .data(treeData.links(), (d: any) => d.target.id);

    link.exit().remove();

    link.enter().append('path')
      .attr('class', 'link')
      .style('fill', 'none')
      .style('stroke', '#cbd5e0')
      .style('stroke-width', 2)
      .merge(link)
      .transition()
      .duration(750)
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x));

    // Actualizar nodos
    const node = this.g.selectAll('.node')
      .data(treeData.descendants(), (d: any) => d.id);

    node.exit().remove();

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${source.y0},${source.x0})`)
      .style('cursor', 'pointer');

    nodeEnter.append('rect')
      .attr('width', 120)
      .attr('height', 40)
      .attr('x', -60)
      .attr('y', -20)
      .style('fill', d => this.getNodeColor(d.data.type))
      .style('stroke', '#374151')
      .style('stroke-width', 2)
      .style('rx', 5)
      .style('ry', 5);

    nodeEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#ffffff')
      .text(d => d.data.name);

    nodeEnter.on('click', (event, d) => {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      this.update(d);
    });

    nodeEnter.on('mouseover', (event, d) => {
      this.showTooltip(d.data);
    });

    nodeEnter.on('mouseout', () => {
      this.hideTooltip();
    });

    node.merge(nodeEnter)
      .transition()
      .duration(750)
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Guardar posiciones anteriores
    treeData.descendants().forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  private getNodeColor(type: string): string {
    switch (type) {
      case 'agency': return '#1f4e79';
      case 'main-school': return '#2e7d32';
      case 'satellite': return '#4caf50';
      case 'independent-school': return '#f57c00';
      default: return '#6b7280';
    }
  }

  showTooltip(data: any) {
    this.tooltipData = data;
    // Mostrar tooltip
    if (this.tooltip) {
      this.tooltip.nativeElement.style.opacity = '1';
    }
  }

  hideTooltip() {
    this.tooltipData = null;
    // Ocultar tooltip
    if (this.tooltip) {
      this.tooltip.nativeElement.style.opacity = '0';
    }
  }
}
