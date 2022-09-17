import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any;

@Component({
  selector: 'app-advice',
  templateUrl: './advice.component.html',
  styleUrls: ['./advice.component.css'],
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
export class AdviceComponent implements OnInit {
  advice: any = [];
  advices: any = [];
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  encounterUuid: string;
  visitUuid: string;
  patientId: string;
  errorText: string;

  adviceForm = new FormGroup({
    advice: new FormControl('', [Validators.required])
  });

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute) { }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.advices.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  ngOnInit() {
    const adviceUuid = '0308000d-77a2-46e0-a6fa-a8c1dcbc3141';
    this.diagnosisService.concept(adviceUuid)
      .subscribe(res => {
        const result = res.answers;
        result.forEach(ans => {
          this.advices.push(ans.display);
        });
      });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptAdvice)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visitUuid) {
            if (!obs.value.includes('</a>')) {
              this.advice.push(obs);
            }
          }
        });
      });
  }

  submit() {
    const date = new Date();
    const form = this.adviceForm.value;
    const value = form.advice;
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptAdvice,
        person: this.patientId,
        obsDatetime: date,
        value: value,
        encounter: this.encounterUuid
      };
      this.service.postObs(json)
        .subscribe(response => {
          this.advice.push({ uuid: response.uuid, value: value });
        });
    } else { this.snackbar.open('Another doctor is viewing this case', null, { duration: 4000 }); }
  }

  delete(i) {
    const uuid = this.advice[i].uuid;
    this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        this.advice.splice(i, 1);
      });
  }
}

