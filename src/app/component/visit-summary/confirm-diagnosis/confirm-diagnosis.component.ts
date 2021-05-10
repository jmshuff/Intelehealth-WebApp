import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-confirm-diagnosis',
  templateUrl: './confirm-diagnosis.component.html',
  styleUrls: ['./confirm-diagnosis.component.css']
})

export class ConfirmDiagnosisComponent implements OnInit, OnChanges {
  @Input() isVisitNotePresent: boolean;
  selectedValue: string = null;
  selectedReason: string;
  visitUuid: string;
  conceptIndications = [
    { id: "1f1dbe96-3e27-42c5-bc16-a0301b7dfecf", name: "Data not sufficient" },
    { id: "82379fad-5b3a-4c0f-a957-cbe8bbf4de77", name: "Pictures not clear" },
    { id: "bebf947d-99cd-4b38-97b2-36c28cadda16", name: "Need test reports" },
    { id: "8b041bfb-25cb-460a-8b3b-03cb39d14194", name: "Other" }
  ];

  confirmation = new FormGroup({
    reason: new FormControl('', [Validators.required]),
    otherReason: new FormControl('')
  });

  constructor(private route: ActivatedRoute, private visitService: VisitService, private snackbar: MatSnackBar) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.visitService.fetchVisitDetails(this.visitUuid)
      .subscribe(visitDetails => {
        if (visitDetails.indication) {
          this.selectedValue = visitDetails.indication.display;
          this.selectedReason = visitDetails.indication.uuid;
          if (this.selectedReason === "8b041bfb-25cb-460a-8b3b-03cb39d14194") {
            this.confirmation.get('otherReason').setValue(this.selectedValue);
          }
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isVisitNotePresent = changes.isVisitNotePresent.currentValue;
  }

  selectReason(indication) {
    this.selectedReason = indication.id;
    this.otherReason();
  }

  otherReason() {
    this.confirmation.get('reason').setValue(this.selectedReason);
    if (this.selectedReason == '8b041bfb-25cb-460a-8b3b-03cb39d14194' && !this.isVisitNotePresent && this.confirmation.value.otherReason?.trim() === '') {
      this.confirmation.get('otherReason').setValidators(Validators.required);
    } else {
      this.confirmation.get('otherReason').clearValidators();
    }
    this.confirmation.get('otherReason').updateValueAndValidity();
  }

  submit() {
    if (this.confirmation.value.reason === '8b041bfb-25cb-460a-8b3b-03cb39d14194') {
      const json = {
        "names": [
          {
            "name": this.confirmation.value.otherReason,
            "locale": "en",
            "localePreferred": true,
            "conceptNameType": "FULLY_SPECIFIED"
          }
        ]
      };
      this.visitService.updateConcept(this.confirmation.value.reason, json)
        .subscribe(() => {
          this.updateVisit();
        });
    } else {
      this.updateVisit();
    }
  }

  private updateVisit() {
    const json = {
      indication: this.confirmation.value.reason
    };
    this.visitService.updateVisit(this.visitUuid, json)
      .subscribe(response => {
        if (response) {
          this.selectedValue = response.indication.display;
          this.selectedReason = response.indication.uuid;
        } else {
          this.snackbar.open(`Something went wrong`, null, { duration: 4000 });
        }
      });
  }
}
