import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  constructor(
    public ref: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: { title?: string; message?: string }
  ) {}
}
