import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-postal-code-snackbar',
  standalone: false,
  template: `postal code: <b>{{ postalCode }}</b>`
})
export class PostalCodeSnackbarComponent {
  readonly postalCode: string;

  constructor(@Inject(MAT_SNACK_BAR_DATA) data: { postalCode: string }) {
    this.postalCode = data.postalCode;
  }
}
