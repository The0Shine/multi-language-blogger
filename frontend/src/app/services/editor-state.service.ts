import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditorStateService {
  private _isSaving = new BehaviorSubject<boolean>(false);
  private _lastSaved = new BehaviorSubject<Date | null>(null);
  private _isEditMode = new BehaviorSubject<boolean>(false);
  private _triggerPublish = new Subject<void>();

  public isSaving$ = this._isSaving.asObservable();
  public lastSaved$ = this._lastSaved.asObservable();
  public isEditMode$ = this._isEditMode.asObservable();
  public triggerPublish$ = this._triggerPublish.asObservable();

  setIsSaving(value: boolean) {
    this._isSaving.next(value);
  }

  setLastSaved(date: Date | null) {
    this._lastSaved.next(date);
  }

  setIsEditMode(value: boolean) {
    this._isEditMode.next(value);
  }

  publishClicked() {
    this._triggerPublish.next();
  }
}
