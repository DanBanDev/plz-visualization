import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDeleteDialogData {
  name: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: false,
  template: `
    <h2 mat-dialog-title>Delete Visualization</h2>

    <mat-dialog-content>
      Are you sure you want to delete <strong>{{ data.name }}</strong>?
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDeleteDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmDeleteDialogData
  ) {
  }
}
