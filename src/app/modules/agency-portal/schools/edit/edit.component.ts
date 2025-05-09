import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SchoolService } from 'app/shared/services/school.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';

@Component({
  selector: 'app-schools-edit',
  templateUrl: './edit.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    GenericHeaderComponent,
  ],
})
export class EditSchoolComponent implements OnInit {
  schoolForm: FormGroup;
  headerConfig = { title: 'Editar Escuela' };
  // catálogos
  cities = [];
  regions = [];
  organizationTypes = [];
  educationLevels = [];
  operatingPeriods = [];
  kitchenTypes = [];
  groupTypes = [];
  deliveryTypes = [];
  sponsorTypes = [];
  applicantTypes = [];
  operatingPolicies = [];
  facilities = [];
  schools = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private schoolService: SchoolService,
    private router: CustomRouterService,
    // Inyectar servicios de catálogos aquí
  ) {
    this.schoolForm = this.fb.group({
      name: ['', Validators.required],
      startDate: [null],
      address: ['', Validators.required],
      postalAddress: [''],
      zipCode: ['', Validators.required],
      cityId: [null, Validators.required],
      regionId: [null, Validators.required],
      areaCode: [''],
      adminFullName: [''],
      phone: [''],
      phoneExtension: [''],
      mobile: [''],
      baseYear: [null],
      nextRenewalYear: [null],
      organizationTypeId: [null, Validators.required],
      educationLevelId: [null, Validators.required],
      operatingPeriodId: [null, Validators.required],
      kitchenTypeId: [null],
      groupTypeId: [null],
      deliveryTypeId: [null],
      sponsorTypeId: [null],
      applicantTypeId: [null],
      operatingPolicyId: [null],
      facilityIds: [[]],
      satelliteSchoolIds: [[]],
    });
  }

  ngOnInit(): void {
    // TODO: cargar catálogos y escuelas para selects
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.schoolService.getSchoolById({ id: +id }).subscribe({
        next: (school: any) => {
          this.schoolForm.patchValue({
            ...school.schoolData,
            facilityIds: school.Facilities?.map((f: any) => f.id) || [],
            satelliteSchoolIds: school.Satellites?.map((s: any) => s.id) || [],
          });
        },
        error: (err) => alert('Error al cargar la escuela: ' + err)
      });
    }
  }

  onSubmit() {
    if (this.schoolForm.invalid) return;
    this.schoolService.updateSchool(this.schoolForm.value, {}).subscribe({
      next: () => this.router.navigate(['schools/list']),
      error: (err) => alert('Error al actualizar la escuela: ' + err)
    });
  }
}
