import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any, checkReview: any;

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css'],
  animations: [
    trigger('moveInLeft', [
      transition('void=> *', [style({ transform: 'translateX(300px)' }),
      animate(200, keyframes([
        style({ transform: 'translateX(300px)' }),
        style({ transform: 'translateX(0)' })
      ]))]),
      transition('*=>void', [style({ transform: 'translateX(0px)' }),
      animate(100, keyframes([
        style({ transform: 'translateX(0px)' }),
        style({ transform: 'translateX(300px)' })
      ]))])
    ])
  ]
})
export class ReferralComponent implements OnInit {
  referralConcept: String = '3269f1ca-29ae-4b23-b5b9-9db6c1848eb9';
  referralConceptReview1: String = '80c7718e-6022-4d06-b7fb-bea36c061e39';
  referralConceptReview2: String = 'd5d22ecb-3cae-4d45-a49f-16848844bf01';
  referralTimeConcept: String = 'eb9ffedc-beab-4a3a-b4d4-32344a94214b';
  referralTimeConceptConceptReview1: String = '5c53e6a1-f9ef-48b3-9ebf-e3b9657c0c38';
  referralTimeConceptConceptReview2: String = '1655c4eb-e0aa-4e4c-bea9-dbe72619489d';

  encounterUuid: string;
  patientUuid: string;
  visitUuid: string;
  referral: String;
  referralTime: Number;
  referralObs: object = {};
  referralTimeObs: object = {};

  referralConcepts = [
    { concept: this.referralConcept, name: 'referral' },
    { concept: this.referralTimeConcept, name: 'referralTime' }
  ];

  referralConceptsReview1 = [
    { concept: this.referralConceptReview1, name: 'referral' },
    { concept: this.referralTimeConceptConceptReview1, name: 'referralTime' }
  ];

  referralConceptsReview2 = [
    { concept: this.referralConceptReview2, name: 'referral' },
    { concept: this.referralTimeConceptConceptReview2, name: 'referralTime' }
  ];
  rightConcept: string;
  coordinator: Boolean = getFromStorage('coordinator') || false;

  constructor(
    private encounterService: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientUuid = this.route.snapshot.params['patient_id'];
    const reviewVisit = checkReview(this.visitUuid);
    this.rightConcept = reviewVisit?.reviewType === 1 ? 'referralConceptsReview1' : reviewVisit?.reviewType === 2 ? 'referralConceptsReview2' : 'referralConcepts';
    this[this.rightConcept].forEach(each => {
      this.diagnosisService.getObs(this.patientUuid, each.concept)
        .subscribe(response => {
          response.results.forEach(obs => {
            if (obs.encounter.visit.uuid === this.visitUuid) {
              if (obs.value === 'true') {
                this[each.name] = true;
                this[`${each.name}Obs`] = obs;
              } else {
                this[`${each.name}Obs`] = obs;
              }
            }
          });
        });
    });
  }

  onChangeHandler = (type, value) => {
    if (type === 'vistComplete') {
      this.referral = value;
      this.save('referral', true, 'vistComplete');
    } else if (type === 'baseHospital') {
      this.referral = value;
      this.save('referral', true, 'baseHospital');
    } else if (type === 'healthworker') {
      this.referral = value;
      this.save('referral', true, 'healthworker');
    } else {
      this[type] = value;
      this.save(type);
    }
  }

  calculateDays = (value) => {
    let todayDate = new Date();
    var result = todayDate.setDate(todayDate.getDate() + value);
    return new Date(result)
  }

  save = (type, createEncounter = false, typeEncounter = '') => {
    const date = new Date();
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      this.encounterUuid = getEncounterUUID();
      const concept = type === 'referral' ? this[this.rightConcept][0].concept : this[this.rightConcept][1].concept;
      const value = type === 'referral' ? this.referral : this.calculateDays(this.referralTime);
      const json = {
        concept,
        person: this.patientUuid,
        obsDatetime: date,
        value,
        encounter: this.encounterUuid
      };
      this.diagnosisService.postObs(json).subscribe(response => {
        const data = {
          uuid: response.uuid,
          value: response.value
        };
        this[`${type}Obs`] = data;
      });
      if (createEncounter) {
        this.createEncounter(typeEncounter);
      }
    } else { this.snackbar.open('Another doctor is viewing this case', null, { duration: 4000 }); }
  }

  delete(type, uuid) {
    this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        if (type === 'referral' || type === 'referralTime') {
          this[type] = false;
          this[`${type}Obs`] = {};
        }
      });
  }

  createEncounter = (type) => {
    const myDate = new Date(Date.now() - 30000);
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    const json = {
      patient: this.patientUuid,
      encounterType: type === 'visitComplete' ? 'bd1fbfaa-f5fb-4ebd-b75c-564506fc309e' :  type === 'baseHospital' ? '4084bb49-c7ba-46c1-bfd4-0f1e38327748' : '809a1df6-8cc6-4d2c-92e7-00f7468f496e',
      encounterProviders: [{
        provider: providerUuid,
        encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03'
      }],
      visit: this.visitUuid,
      encounterDatetime: myDate
    };
    this.encounterService.postEncounter(json)
    .subscribe(response => {
      if (response) {}
    });
  }
}
