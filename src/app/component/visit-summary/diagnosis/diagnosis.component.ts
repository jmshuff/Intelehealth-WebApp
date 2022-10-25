import { ImagesService } from 'src/app/services/images.service';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { v4 as uuidv4 } from 'uuid';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any, checkReview: any;

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css'],
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
export class DiagnosisComponent implements OnInit {
  lensLeftDisable: Boolean = false;
  leftLensDiagnosis: any = [];
  rightLensDiagnosis: any = [];
  leftPathologyDiagnosis: any = [];
  rightPathologyDiagnosis: any = [];
  diagnosisList = [];
  lensDiagnosisList = ['Mature cataract', 'Immature cataract', 'Clear Crystalline lens', 'PCIOL', 'Aphakia']
  additionDiagnosisList = ['Refractive Error/Presbyopia', 'Pterygium', 'Inactive Corneal Opacity', 'Active Corneal Infection']
  eyeDiagnosisList = ['Immature Cataract', 'Mature Cataract', 'Refractive Error', 'Pseudophakia', 'Normal Eye Exam'];
  // conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  // Doctor 1
  conceptLeftLensEyeDiagnosis: String = '1796244d-e936-4ab8-ac8a-c9bcfa476570';
  conceptRightLensEyeDiagnosis: String = '58cae684-1509-4fd5-b256-5ca980ec6bb4';
  conceptadditionalPathologyLeft: String = 'bb23ea0b-d87b-41d2-bf7b-95237e1c9e0a';
  conceptadditionalPathologyRight: String = '03f13e27-0bde-4e76-ac64-0c5b1566cce9';

  // Review 1
  conceptLeftLensEyeDiagnosisReview1: String = 'd72f7295-f1e1-436f-bac4-5ad88b6dc6cb';
  conceptRightLensEyeDiagnosisReview1: String = 'f7d5d646-bb4e-4f26-970d-0df61b3b138f';
  conceptadditionalPathologyLeftReview1: String = 'ccb64c74-2ebc-4fe5-b3e1-70f70af67ec8';
  conceptadditionalPathologyRightReview1: String = '42b0e689-0bc9-4574-a381-e8120bd7d48b';

  // Review 2
  conceptLeftLensEyeDiagnosisReview2: String = '7323ebb4-9ac2-4bd7-8ef5-3988d7bf6f7c';
  conceptRightLensEyeDiagnosisReview2: String = '7633430a-fef7-4d6b-ba47-238bafa68024';
  conceptadditionalPathologyLeftReview2 : String = 'adfdb1fc-09fa-42ec-9bfe-5b837427f603'
  conceptadditionalPathologyRightReview2: String = '586d6695-f378-4dc2-bfec-7c1d3ee37fc6';

  // Coordinator
  conceptCoordinatorLeftLensEyeDiagnosis: String = 'e91cda51-caed-4f95-8a94-97135b5a865d';
  conceptCoordinatorRightLensEyeDiagnosis: String = 'b30f2a76-e216-48cf-aa6d-d50e6cca917f';
  conceptCoordinatorAdditionalPathologyLeft: String = 'f299dc9e-c1e0-4a51-be5b-60d3cc118991';
  conceptCoordinatorAdditionalPathologyRight: String = '228ef575-71b9-4d7b-8ee7-cad98d27e3a2'

  
  patientId: string;
  visitUuid: string;
  encounterUuid: string;
  showLeftEyeOtherInput: Boolean = false;
  showRightEyeOtherInput: Boolean = false;
  coordinator: Boolean = getFromStorage('coordinator') || false;
  @Input() showDetails;
  @Input() data;

  diagnosisConcept = [
    {concept: this.conceptLeftLensEyeDiagnosis, name: 'leftLensDiagnosis'},
    {concept: this.conceptRightLensEyeDiagnosis , name: 'rightLensDiagnosis'},
    {concept: this.conceptadditionalPathologyLeft, name: 'leftPathologyDiagnosis'},
    {concept: this.conceptadditionalPathologyRight, name: 'rightPathologyDiagnosis'}
  ];

  diagnosisConceptReview1 = [
    {concept: this.conceptLeftLensEyeDiagnosisReview1, name: 'leftLensDiagnosis'},
    {concept: this.conceptRightLensEyeDiagnosisReview1 , name: 'rightLensDiagnosis'},
    {concept: this.conceptadditionalPathologyLeftReview1, name: 'leftPathologyDiagnosis'},
    {concept: this.conceptadditionalPathologyRightReview1, name: 'rightPathologyDiagnosis'}
  ];

  diagnosisConceptReview2 = [
    {concept: this.conceptLeftLensEyeDiagnosisReview2, name: 'leftLensDiagnosis'},
    {concept: this.conceptRightLensEyeDiagnosisReview2 , name: 'rightLensDiagnosis'},
    {concept: this.conceptadditionalPathologyLeftReview2, name: 'leftPathologyDiagnosis'},
    {concept: this.conceptadditionalPathologyRightReview2, name: 'rightPathologyDiagnosis'}
  ];

  rightConcept: string;

  diagnosisForm = new UntypedFormGroup({
    lensLeftEye: new UntypedFormControl(''),
    lensRightEye: new UntypedFormControl(''),
    pathologyLeftEye: new UntypedFormControl(''),
    pathologyRightEye: new UntypedFormControl(''),
    leftEyeOtherValue: new UntypedFormControl(''),
    rightEyeOtherValue: new UntypedFormControl('')
  });

  constructor(
    private imageService: ImagesService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'] || this.data.patientId;
    const reviewVisit = checkReview(this.visitUuid);
    this.rightConcept = reviewVisit?.reviewType === 1 ? 'diagnosisConceptReview1' : reviewVisit?.reviewType === 2 ? 'diagnosisConceptReview2' : 'diagnosisConcept';
    // console.log(this.rightConcept)
    this[this.rightConcept].forEach(each => {
      this.diagnosisService.getObs(this.patientId, each.concept)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this[each.name].push(obs);
          }
        });
      });
      
    });
  }

  search(event) {
    const searchedTerm = event?.target?.value.toLowerCase();
    const list = ['Inactive Corneal Opacity', 'Pterygium', 'Conjunctivitis',
          'Subconjunctival hemorrhage', 'Presbyopia',
          'Active Corneal Infection', 'Posterior Segment Screening',
          'Cannot be assessed'];
    this.diagnosisList = list.filter(eye => eye.toLowerCase().includes(searchedTerm));
  }

  onChangeHandler = (type, side) => {
    if (type === 'lensStatus') {
      setTimeout(() => this.onSubmit(side), 200);
    } else if (type === 'right') {
      this.showRightEyeOtherInput = true;
    } else if (type === 'hideLeft') {
      this.showLeftEyeOtherInput = false;
      setTimeout(() => this.onSubmit(side, true), 200);
    } else if (type === 'hideRight') {
      this.showRightEyeOtherInput = false;
      setTimeout(() => this.onSubmit(side, true), 200);
    } else {
      this.showLeftEyeOtherInput = true;
    }
  }

  onKeyUpHandler = (event, side) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      const value = this.diagnosisForm.value;
      if (side === 'left') {
        this.diagnosisForm.controls.pathologyLeftEye.setValue(value.leftEyeOtherValue);
      } else {
        this.diagnosisForm.controls.pathologyRightEye.setValue(value.rightEyeOtherValue);
      }
      setTimeout(() => this.onSubmit(side, true), 200);
    }
  }

  onClick = (value, side) => {
    if (side === 'left') {
      this.diagnosisForm.controls.pathologyLeftEye.setValue(value);
    } else if (side === 'right') {
      this.diagnosisForm.controls.pathologyRightEye.setValue(value);
    }
    setTimeout(() => this.onSubmit(side, true), 200);
  }

  onClickHandler = (side, value, type) => {
    if (side === 'left') {
      if (type) {
        this.diagnosisForm.controls.pathologyLeftEye.setValue(value);
      } else {
        this.diagnosisForm.controls.lensLeftEye.setValue(value);
      }
      setTimeout(() => this.onSubmit(side, type), 200);
    }
  }

  onSubmit(side, type = false) {
    const date = new Date();
    const value = this.diagnosisForm.value;
    const providerDetails = getFromStorage('provider');
    if (providerDetails && providerDetails.uuid === getEncounterProviderUUID() || this.showDetails) {
      this.encounterUuid = getEncounterUUID();
      let json;
      if (type) {
        json = {
          concept: side === 'right' ? this.showDetails ? this.conceptCoordinatorRightLensEyeDiagnosis : this[this.rightConcept][3].concept : this.showDetails ? this.conceptCoordinatorLeftLensEyeDiagnosis : this[this.rightConcept][2].concept,
          value: side === 'right' ? value.pathologyRightEye : value.pathologyLeftEye,
          person: this.patientId,
          obsDatetime: date,
          encounter: this.encounterUuid
        }
      } else {
        json = {
          concept: side === 'right' ? this.showDetails ? this.conceptCoordinatorRightLensEyeDiagnosis : this[this.rightConcept][1].concept : this.showDetails ? this.conceptCoordinatorLeftLensEyeDiagnosis : this[this.rightConcept][0].concept,
          person: this.patientId,
          obsDatetime: date,
          value: side === 'right' ? value.lensRightEye : value.lensLeftEye,
          encounter: this.encounterUuid
        };
      }
      this.diagnosisService.postObs(json)
        .subscribe(resp => {
          this.diagnosisForm.reset();
          this.showLeftEyeOtherInput = false;
          this.showRightEyeOtherInput = false;
          // const allImages = getFromStorage('physicalImages');
          // const filteredImage = allImages?.filter(image => image.type === side);
          // if (filteredImage?.length) {
          //   const payload = {
          //     id: uuidv4(),
          //     diagnosis: !type ? json.value : '',
          //     additional_pathology: type ? json.value : '',
          //     created_by: providerDetails.person.display,
          //     images: []
          //   };
          //   filteredImage.forEach(im => {
          //     payload.images.push({
          //       ...im,
          //       diagnosis_id: payload.id
          //     });
          //   });
          //   this.imageService.saveDiagnosis(payload).subscribe(resposne => {console.log(resposne)});
          // }
          this.diagnosisList = [];
          if (type) {
            this[side === 'right' ? 'rightPathologyDiagnosis' : 'leftPathologyDiagnosis'].push({ uuid: resp.uuid, value: json.value });
          } else {
            this[side === 'right' ? 'rightLensDiagnosis' : 'leftLensDiagnosis'].push({ uuid: resp.uuid, value: json.value });
          }
        });
    } else { this.snackbar.open('Another doctor is viewing this case', null, { duration: 4000 }); }
  }

  delete(side, i, type =  false) {
    let uuid: String;
    if (type) {
      uuid = this[side === 'right' ? 'rightPathologyDiagnosis' : 'leftPathologyDiagnosis'][i].uuid;
    } else {
      uuid = this[side === 'right' ? 'rightLensDiagnosis' : 'leftLensDiagnosis'][i].uuid;
    }
    this.diagnosisService.deleteObs(uuid)
      .subscribe(res => {
        if (type) {
          this[side === 'right' ? 'rightPathologyDiagnosis' : 'leftPathologyDiagnosis'].splice(i, 1);
        } else {
          this[side === 'right' ? 'rightLensDiagnosis' : 'leftLensDiagnosis'].splice(i, 1);
        }
      });
  }
}
