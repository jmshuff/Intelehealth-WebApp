import { DiagnosisService } from './../../../services/diagnosis.service';
import { VisitService } from './../../../services/visit.service';
import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { v4 as uuidv4 } from 'uuid';
import { ImagesService } from 'src/app/services/images.service';
declare var getFromStorage: any;

@Component({
  selector: 'app-eyeform',
  templateUrl: './eyeform.component.html',
  styleUrls: ['./eyeform.component.css']
})
export class EyeformComponent implements OnInit {
  data: Array<any> = [];
  showSubmitButton: Boolean = false;
  accuityandpinhole: Array<any> = [];
  patientDiagnosis: Array<any> = [];
  patientComplaint: Array<any> = [];
  lensStatus: Array<any> = [];
  processVisitData: Array<any> = [];
  filterData: Array<any> = [];
  filterDataPhone: Array<any> = [];
  telConceptId: String = '14d4f066-15f5-102d-96e4-000c29c2a5d7';
  campConceptId: String = '00784346-7f86-43ea-a40b-608d6deacfab';
  selectedPatient: any;
  eyeCampObs: String = '2ca97364-8945-4a64-985b-b3daad7343e3';
  encounterId: String = '57a72d47-2b0a-4cb9-a1cf-87ab75d406d9';

  complaintRightShow: Boolean = false;
  complaintLeftShow: Boolean = false;
  diagnosisRightShow: Boolean = false;
  diagnosisLeftShow: Boolean = false;

  complaintRightOther: String = '';
  complaintLeftOther: String = '';
  diagnosisRightOther: String = '';
  diagnosisLeftOther: String = '';

  patientObject = {
    complaintRight: [],
    complaintLeft: [],
    diagnosisRight: [],
    diagnosisLeft: []
  };

  firstTime: Boolean = false;
  obsValue;

  eyeCampForm = new UntypedFormGroup({
    accuityLeft: new UntypedFormControl(''),
    accuityRight: new UntypedFormControl(''),
    pinholeLeft: new UntypedFormControl(''),
    pinholeRight: new UntypedFormControl(''),
    complaintLeft: new UntypedFormControl([]),
    complaintRight: new UntypedFormControl([]),
    lensStatusLeft: new UntypedFormControl(''),
    lensStatusRight: new UntypedFormControl(''),
    diagnosisLeft: new UntypedFormControl([]),
    diagnosisRight: new UntypedFormControl([]),
    referral: new UntypedFormControl(''),
    referralTime: new UntypedFormControl(''),
    ophthalmologist: new UntypedFormControl('')
  });
  constructor(
    private imageService: ImagesService,
    private visitService: VisitService,
    private encounterService: EncounterService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.constructVisuityAcuityAndPinholeAcuity();
    this.constructPatientComplaint();
    this.constructDiagnosis();
    this.constructLensStatus()
    this.getAllVisits();
    this.eyeCampForm.valueChanges.subscribe((val) => {
      if (this.selectedPatient && !this.firstTime) {
        this.showSubmitButton = true;
      } else if (this.firstTime) {
        this.firstTime = false;
      }
    });
  }

  processForm(value) {
    this.firstTime = true;
    value = JSON.parse(value);
    this.eyeCampForm.setValue({
      accuityLeft: value.acuity.left,
      accuityRight: value.acuity.right,
      pinholeLeft: value.pinhole.left,
      pinholeRight: value.pinhole.right,
      complaintLeft: value.complaint.left,
      complaintRight: value.complaint.right,
      lensStatusLeft: value?.lens?.left || '',
      lensStatusRight: value?.lens?.right || '',
      diagnosisLeft: value.diagnosis.left,
      diagnosisRight: value.diagnosis.right,
      referral: value.referral.value,
      referralTime: value.referral.time,
      ophthalmologist: value.ophthalmologist
    });
  }

  getAllVisits() {
    this.visitService.getVisits(true)
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
        this.filterDataPhone = this.processVisitData;
      });
  }

  constructVisuityAcuityAndPinholeAcuity() {
    this.accuityandpinhole.push(
      { value: '<6/6'},
      { value: '6/6' },
      { value: '6/9' },
      { value: '6/12' },
      { value: '6/18' },
      { value: '6/24' },
      { value: '6/36' },
      { value: '6/60' },
      { value: 'Finger Counts' },
      { value: 'Hand movements' },
      { value: 'Light perception only' },
      { value: 'No light perception' }
    );
  }

  constructPatientComplaint() {
    this.patientComplaint.push(
      { value: 'Blurry Vision Up Close' },
      { value: 'Blurry Vision Far Away' },
      { value: 'Redness' },
      { value: 'Eye Pain or Irritation' },
      { value: 'Headache' },
      { value: 'Eye Trauma' },
      // { value: 'PC IOL' },
      { value: 'Other' },
    );
  }

  constructLensStatus() {
    this.lensStatus.push(
      {value: 'Mature Cataract'},
      {value: 'Immature Cataract'},
      {value: 'Clear Crystalline Lens'},
      {value: 'Pseudophakia (IOL)'},
      {value: 'Aphakia'}
    );
  }

  constructDiagnosis() {
    this.patientDiagnosis.push(
      // { value: 'Normal Eye Exam' },
      { value: 'Refractive Error/Presbyopia' },
      { value: 'Pterygium' },
      // { value: 'Mature Cataract' },
      { value: 'Inactive Corneal Opacity' },
      { value: 'Active Corneal Infection' },
      // { value: 'Pterygium' },
      { value: 'Other' },
    );
  }

  onCheckChange(event, value, other = false, type = '') {
    if (event.checked) {
      if (other) {
        this.selected(value, other, type)
      } else {
        this.patientObject[type].push(value)
      }
    }
    else {
      if (other) {
        this.selected(value, other, type, true);
      } else {
        let index = this.patientObject[type].indexOf(value)
        if (index > -1) {
          this.patientObject[type].splice(index, 1);
        }
      }
    }
    if (this.selectedPatient) {
      this.showSubmitButton = true;
    }
  }

  selected(value, other = false, type = '', unchecked = false) {
    if (this.selectedPatient) {
      this.showSubmitButton = true;
      this.firstTime = false;
    }
    const showInput = ['complaintRight', 'complaintLeft', 'diagnosisRight', 'diagnosisLeft'];
    if (other) {
      if (showInput.includes(type) && !unchecked) {
        this[`${type}Show`] = true;
      } else {
        this[`${type}Show`] = false;
        this[`${type}Other`] = null
      }
    } else {
      if (showInput.includes(type)) {
        return;
      }
      this.complaintRightShow = false;
      this.complaintLeftShow = false;
      this.diagnosisRightShow = false;
      this.diagnosisLeftShow = false;
      const data = this.filterData.filter(uuid => uuid.patient_uuid === value);
      this.selectedPatient = data[0];
      if (this.selectedPatient) {
        this.diagnosisService.getObs(this.selectedPatient.patient_uuid, this.eyeCampObs)
          .subscribe(response => {
            if (response.results.length) {
              response.results.forEach(obs => {
                this.obsValue = {
                  obsUuid: obs.uuid,
                  encounterUuid: obs.encounter.uuid
                }
                if (obs.encounter && obs.encounter.visit.uuid === this.selectedPatient.visit_uuid) {
                  this.showSubmitButton = false;
                  this.processForm(obs.value);
                } else {
                  this.showSubmitButton = true;
                }
              });
            } else {
              this.showSubmitButton = true;
              this.obsValue = undefined;
            }
          });
      }
    }
  }

  onChangeHandler(type: string, value: string) {
    this[type] = value;
  }

  _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filterData = this.processVisitData.filter(campid => campid.eye_camp_id?.value?.toLowerCase().includes(filterValue));
  }

  _filterPhone(value: string) {
    const filterValue = value.toLowerCase();
    this.filterDataPhone = this.processVisitData.filter(phone => phone.phoneno?.value?.toLowerCase().includes(filterValue));
  }

  Save() {
    const value = this.processData(this.eyeCampForm.value);
    const date = new Date();
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (this.selectedPatient?.patient_uuid && providerUuid) {
      if (this.obsValue) {
        const json = {
          concept: this.eyeCampObs,
          person: this.selectedPatient?.patient_uuid,
          obsDatetime: date,
          value: JSON.stringify(value),
          encounter: this.obsValue.encounterUuid
        }
        this.diagnosisService.editObs(this.obsValue.obsUuid, json).subscribe(res => {
          this.showSubmitButton = false;
          this.snackbar.open('Complete', null, {duration: 4000})
          return;
        })
      } else {
        const json = {
          patient: this.selectedPatient.patient_uuid,
          encounterType: this.encounterId,
          encounterProviders: [{
            provider: providerUuid,
            encounterRole: '64538a7f-ca93-47b6-bbdf-06450ca11247'
          }],
          visit: this.selectedPatient.visit_uuid,
          encounterDatetime: date,
          obs: [{
            concept: this.eyeCampObs,
            value: JSON.stringify(value)
          }],
        };
        this.encounterService.postEncounter(json).subscribe(response => {
          this.showSubmitButton = false;
          this.snackbar.open('Complete', null, {duration: 4000});
        });
      }
      this.submitDiagnosis(value);
    } else {
      this.snackbar.open('Patient Not Selected', null, { duration: 4000 });
    }
  }

  processData(data) {
    const formInfo = {
      acuity: {
        left: data.accuityLeft,
        right: data.accuityRight
      },
      pinhole: {
        left: data.pinholeLeft,
        right: data.pinholeRight
      },
      complaint: {
        left: [...this.patientObject.complaintLeft, this.complaintLeftOther].filter(function (el) { return el != null && el != ''}), //data.complaintLeft === 'Other' ? this.patientcomplaintleftOther : data.complaintLeft,
        right: [...this.patientObject.complaintRight, this.complaintRightOther].filter(function (el) { return el != null && el != ''}) //data.complaintRight === 'Other' ? this.patientcomplaintrightOther : data.complaintRight
      },
      lens: {
        left: data.lensStatusLeft,
        right: data.lensStatusRight
      },
      diagnosis: {
        left: [...this.patientObject.diagnosisLeft, this.diagnosisLeftOther].filter(function (el) { return el != null && el != ''}), //data.diagnosisLeft === 'Other' ? this.diagnosisleftOther : data.diagnosisLeft,
        right: [...this.patientObject.diagnosisRight, this.diagnosisRightOther].filter(function (el) { return el != null && el != ''}) //data.diagnosisRight === 'Other' ? this.diagnosisrightOther : data.diagnosisRight
      },
      referral: {
        value: data.referral,
        time: data.referralTime
      },
      ophthalmologist: data.ophthalmologist
    };
    return formInfo;
  }

  submitDiagnosis = (value) => {
    try {
      this.imageService.fetchPhyImages(this.selectedPatient?.patient_uuid, this.selectedPatient.visit_uuid)
      .subscribe(response => {
        let allImages = response.data;
        const leftFilteredImage = allImages?.filter(image => image.type === 'left');
        if (leftFilteredImage) {
          let payload = this.addValueToDiagnosis(leftFilteredImage, value, 'left')
          this.imageService.saveDiagnosis(payload).subscribe(resposne => {console.log(resposne)});
        }
        const rightFilteredImage = allImages?.filter(image => image.type === 'right');
        if (rightFilteredImage) {
          let payload = this.addValueToDiagnosis(rightFilteredImage, value, 'right');
          this.imageService.saveDiagnosis(payload).subscribe(resposne => {console.log(resposne)});
        }
      })
    } catch (err) {
      console.log('dignosis submit exception: ', err);
    }
  }

  addValueToDiagnosis = (imageData, value, side) => {
    const providerDetails = getFromStorage('provider');
    const payload = {
      id: uuidv4(),
      additional_pathology: side === 'left' ? value.diagnosis.left.join(',') : value.diagnosis.right.join(','),
      diagnosis: side === 'left' ? value.lens.left: value.lens.right,
      created_by: providerDetails.person.display,
      images: []
    };
    imageData.forEach(im => {
      payload.images.push({
        ...im,
        diagnosis_id: payload.id
      });
    });
    return payload;
  }
}
