
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from './../../services/session.service';
import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

export interface VisitData {
  id: string;
  name: string;
  gender: string;
  dob: string;
  location: string;
  status: string;
  lastSeen: string;
  visitId: string;
  patientId: string;
  provider: string;
}

interface ReferralHomepage {
  awaitingCall: Array<{}>;
  awaitingHospital: Array<{}>;
  totalVisistInHospial: number;
}

interface ReferralVisit {
  visitId: string;
  patientId: string;
  urgent: Boolean;
  id: string;
  name: string;
  gender: string;
  dueDate: Date;
  status: string;
  lastCalled: Date;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent implements OnInit {
  vitalUUID: String = '67a71486-1a54-468f-ac3e-7091a9a79584';
  adultinitialUUID: String = '8d5b27bc-c2cc-11de-8d13-0010c6dffd0f';
  visitNoteUUID: String = 'd7151f82-c1f3-4152-a605-2f9ea7414a79';
  healthWorkerUUID: String = '809a1df6-8cc6-4d2c-92e7-00f7468f496e';
  referToBaseUUID: String = '4084bb49-c7ba-46c1-bfd4-0f1e38327748';
  completeVisitUUID: String = 'bd1fbfaa-f5fb-4ebd-b75c-564506fc309e';
  value: any = {};
  referralVisit: ReferralHomepage = { awaitingCall : [], awaitingHospital: [], totalVisistInHospial: 0};
  referralCallValues: ReferralVisit[] = [];
  referralHospitalValues: ReferralVisit[] = [];

  awaitingDoctor: VisitData[] = [];
  awaitingHealthworker: VisitData[] = [];
  baseHospital: VisitData[] = [];
  completedVisit: VisitData[] = [];

  setSpiner = true;
  review1: VisitData[] = [];
  review2: VisitData[] = [];
  coordinator: Boolean = getFromStorage('coordinator') || false;

  constructor(private sessionService: SessionService,
    private authService: AuthService,
    private visitService: VisitService,
    private snackbar: MatSnackBar) { }

  ngOnInit() {
    if (getFromStorage('visitNoteProvider')) { deleteFromStorage('visitNoteProvider'); }
    const userDetails = getFromStorage('user');
    if (userDetails) {
      this.sessionService.provider(userDetails.uuid)
        .subscribe(provider => {
          saveToStorage('provider', provider.results[0]);
        });
    } else { this.authService.logout(); }
    if (this.coordinator) {
      this.getReferralVisits();
    } else {
      this.getVisits();
    }
  }

  onChange(event) {
    if (event) {
      this.coordinator = true;
      this.getReferralVisits();
    } else {
      this.coordinator = false;
      this.getVisits();
    }
    saveToStorage('coordinator', event);
  }

  getVisits() {
    this.visitService.getVisits()
      .subscribe(response => {
        const visits = response.results;
        visits.forEach(async active => {
          if (active.encounters.length > 0) {
            console.log(active)
            let encounterUUID = active.encounters[0].encounterType.uuid;
            if (encounterUUID === this.adultinitialUUID || encounterUUID === this.vitalUUID) {
              const values = this.assignValueToProperty(active, 'ADULTINITIAL');
              this.awaitingDoctor.push(values);
            } else if (encounterUUID === this.healthWorkerUUID) {
              const values = this.assignValueToProperty(active, 'HEALTH WORKER');
              this.awaitingHealthworker.push(values);
            } else if (encounterUUID === this.referToBaseUUID) {
              const values = this.assignValueToProperty(active, 'BASE HOSPITAL');
              this.baseHospital.push(values);
            } else if (encounterUUID === this.completeVisitUUID) {
              const values = this.assignValueToProperty(active, 'VISIT COMPLETE');
              this.completedVisit.push(values);
            }
          }
          this.value = {};
        });
        saveToStorage('allReviewVisit1', this.review1);
        saveToStorage('allReviewVisit2', this.review2);
        console.log('review 1', this.review1)
        console.log('review 2', this.review2)
        this.setSpiner = false;
      }, err => {
        if (err.error instanceof Error) {
          this.snackbar.open('Client-side error', null, { duration: 4000 });
        } else {
          this.snackbar.open('Server-side error', null, { duration: 4000 });
        }
      });
  }

  assignValueToProperty(active, status, sameProvider = false) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.dob = active.patient.person.birthdate;
    this.value.location = active.location.display;
    this.value.status = status;
    // tslint:disable-next-line: max-line-length
    this.value.provider = sameProvider ? active.encounters[0].encounterProviders[0].provider.display.split('- ')[1] :
      active.encounters[active.encounters.length - 1].encounterProviders[0].provider.display.split('- ')[1];
    this.value.lastSeen = sameProvider ? active.encounters[0].encounterDatetime :
      active.encounters[active.encounters.length - 1].encounterDatetime;
    return this.value;
  }

  processReview(encounter) {
    const provider: any = getFromStorage('provider');
    if (encounter.encounterProviders.some(pro => pro.provider.uuid === provider.uuid)) {
      return true;
    } else {
      return false;
    }
  }

  getReferralVisits() {
    this.visitService.getReferralVisits()
      .subscribe(async visits => {
        if (visits) {
          visits.results.forEach(visit => {
            if (visit.encounters.length > 1) {
              const visitNote = visit.encounters.filter(enc => enc.display.match('Visit Note'));
              if (visitNote.length) {
                visitNote.forEach((encounter, index) => {
                  const referral = encounter.obs.filter(ob => ob.display.match('Referral'));
                  if (referral.length) {
                    const data = visit;
                    data.referralDate = referral[0].obsDatetime;
                    const coOrdinatorStatus = visitNote[index].obs.filter(ob => ob.display.match('co-ordinator status'));
                    if (visitNote[index].obs.some(ob => ob.display.match('Urgent Referral'))) {
                      data.urgent = true;
                    }
                    if (coOrdinatorStatus.length) {
                      // tslint:disable-next-line: max-line-length
                      const latestUpdate = coOrdinatorStatus.sort((a: any, b: any) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
                      data.status = JSON.parse(latestUpdate[0].value).status;
                      if (data.status === 'Will come to hospital') {
                        data.referralDate = coOrdinatorStatus[0].obsDatetime;
                        data.lastCalled = coOrdinatorStatus[0].obsDatetime;
                        this.referralVisit.awaitingHospital.push(data);
                      } else if (data.status === 'Patient need a callback') {
                        try {
                          data.dueDate = JSON.parse(coOrdinatorStatus[0].value).date;
                        } catch (e) {}
                        data.referralDate = coOrdinatorStatus[0].obsDatetime;
                        data.lastCalled = coOrdinatorStatus[0].obsDatetime;
                        this.referralVisit.awaitingCall.push(data);
                      } else if (data.status === 'Patient came to Aravind') {
                        this.referralVisit.totalVisistInHospial += 1;
                      }
                    } else {
                      this.referralVisit.awaitingCall.push(data);
                    }
                  }
                });
              }
            }
          });
          await this.assignValueToReferralProperty(this.referralVisit.awaitingCall, 'referralCallValues');
          await this.assignValueToReferralProperty(this.referralVisit.awaitingHospital, 'referralHospitalValues');
          this.setSpiner = false;
        }
      });
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  assignValueToReferralProperty(visits, variable) {
    const data = [];
    return new Promise((resolve, reject) => {
      if (visits.length) {
        visits.forEach((visit, index) => {
          data.push({
            visitId: visit.uuid,
            patientId: visit.patient.uuid,
            urgent: visit.urgent || false,
            id: visit.patient.identifiers[0].identifier,
            name: visit.patient.person.display,
            gender: visit.patient.person.gender,
            dueDate: visit.dueDate ? visit.dueDate : this.addDays(visit.referralDate, variable === 'referralHospitalValues' ? 14 : 3),
            status: visit.status || 'Need Callback',
            lastCalled: visit.lastCalled
          });
          if (visits.length === index + 1) {
            this[variable] = data;
            resolve(data);
          }
        });
      } else {
        resolve(data);
      }
    });
  }

  setType(type) {
    if (type === 'complete') {
      saveToStorage('allAwaitingConsult', this.completedVisit);
    } else if (type === 'baseHospital') {
      saveToStorage('allAwaitingConsult', this.baseHospital);
    } else if (type === 'awaitingHealthworker') {
      saveToStorage('allAwaitingConsult', this.awaitingHealthworker);
    } else {
      saveToStorage('allAwaitingConsult', this.awaitingDoctor);
    }
  }

}
