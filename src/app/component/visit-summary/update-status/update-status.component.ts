import { ModalComponent } from './modal/modal.component';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
declare var getEncounterUUID: any;

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.css']
})

export class UpdateStatusComponent implements OnInit {
  coOrdinatorConcept = 'cd4a9afb-3168-439e-88b4-99278548748c';
  minDate = new Date();
  encounterUuid: string;
  patientUuid: string;
  visitUuid: string;

  coordinatorStatus = new UntypedFormGroup({
    date: new UntypedFormControl(new Date(), [Validators.required]),
    status: new UntypedFormControl('', [Validators.required]),
    comment: new UntypedFormControl('')
  });

  constructor(private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientUuid = this.route.snapshot.params['patient_id'];
    this.encounterUuid = getEncounterUUID();
  }

  Submit() {
    const date = new Date();
    const form = this.coordinatorStatus.value;
    const status = form.status;
    const comment = form.comment || '';
    const json = {
      concept: this.coOrdinatorConcept,
      person: this.patientUuid,
      obsDatetime: date,
      value: JSON.stringify({status, comment}),
      encounter: this.encounterUuid
    };
    if (status === 'Patient came to Aravind') {
      this.addDiagnosis(json);
    } if (status === 'Patient need a callback') {
      this.addDateTime(json);
    } else {
      this.saveStatus(json);
    }
  }

  saveStatus(payload) {
    this.diagnosisService.postObs(payload)
    .subscribe(resp => {});
  }

  addDateTime(payload) {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '30%'
    });

    dialogRef.afterClosed().subscribe(result => {
      const newValues = {
        ...payload,
        value: JSON.stringify({...JSON.parse(payload.value), date: result})
      };
      this.saveStatus(newValues);
    });
  }

  addDiagnosis(payload) {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: { patientId: this.patientUuid },
      width: '60%',
      height: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.saveStatus(payload);
    });
  }

}
