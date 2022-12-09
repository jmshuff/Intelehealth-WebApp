import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';

@Component({
  selector: 'app-on-examination',
  templateUrl: './on-examination.component.html',
  styleUrls: ['./on-examination.component.css']
})
export class OnExaminationComponent implements OnInit {
  onExam: any = [];
  onExamPresent = false;
  conceptOnExam: String = 'e1761e85-9b50-48ae-8c4d-e6b7eeeba084';
  eyeCampObs: String = '2ca97364-8945-4a64-985b-b3daad7343e3';

  constructor(private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.diagnosisService.getObs(patientUuid, this.conceptOnExam)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === visitUuid) {
            this.onExam = obs;
            this.onExamPresent = true;
          }
          this.diagnosisService.getObs(patientUuid, this.eyeCampObs)
            .subscribe(response => {
              response.results.forEach(obs => {
                if (obs.encounter.visit.uuid === visitUuid) {
                  if (obs.value) {
                    let eyecampValue = JSON.parse(obs.value);
                    let tbody: any = document.querySelector('#table tbody');
                    if (tbody && tbody.children.length) {
                      //acuity
                      tbody.children[2].children[1].textContent = eyecampValue.acuity.right;
                      tbody.children[2].children[2].textContent = eyecampValue.acuity.left;
                      //pinhole
                      tbody.children[3].children[1].textContent = eyecampValue.pinhole.right;
                      tbody.children[3].children[2].textContent = eyecampValue.pinhole.left;
                    }
                  }
                }
              });
            });
        });
      });
  }
}
