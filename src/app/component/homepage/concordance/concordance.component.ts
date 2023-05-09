import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { ImagesService } from 'src/app/services/images.service';
import { VisitService } from 'src/app/services/visit.service';
declare var getFromStorage: any, saveToStorage: any, getEncounterProviderUUID: any, checkReview: any;

@Component({
  selector: 'app-concordance',
  templateUrl: './concordance.component.html',
  styleUrls: ['./concordance.component.css']
})
export class ConcordanceComponent implements OnInit {
  processVisitData: Array<any> = [];
  filterData: Array<any> = [];
  telConceptId: String = '14d4f066-15f5-102d-96e4-000c29c2a5d7';
  campConceptId: String = '00784346-7f86-43ea-a40b-608d6deacfab';
  encounter: string = '8ebcef65-81db-4d41-81f3-9e8e9b36aee7';

  constructor(private imageService: ImagesService,
    private visitService: VisitService,
    private encounterService: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private router: Router) { }

  ngOnInit(): void {
    this.getAllVisits();
  }

  onChangeHandler(type, value) {
    console.log(type, value)
  }

  _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filterData = this.processVisitData.filter(campid => campid.patient_uuid?.toLowerCase().includes(filterValue));
  }

  getAllVisits() {
    this.visitService.getVisits()
      .subscribe(visits => {
        visits.results.forEach(visit => {
          this.processVisitData.push({
            visit_uuid: visit.uuid,
            patient_uuid: visit.patient.uuid,
            patient: visit.patient,
            phoneno: visit.patient.person.attributes.filter(attri => attri.attributeType.uuid === this.telConceptId)[0] || {},
            eye_camp_id: visit.patient.person.attributes.filter(attri => attri.attributeType.uuid === this.campConceptId)[0] || {}
          });
        });
        this.filterData = this.processVisitData;
        console.log(this.filterData)
      });
  }

  selected(patientId) {
    let data: any = this.processVisitData.filter(campid => campid.patient_uuid?.toLowerCase().includes(patientId));
    if (data.length) {
      saveToStorage('concordance', true);
      this.router.navigateByUrl(`/visitSummary/${data[0].patient_uuid}/${data[0].visit_uuid}`);
    }
  }

}
