import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toast$ = this.toastSubject.asObservable();
  private toastId = 0;

  show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) {
    const toast: Toast = {
      id: ++this.toastId,
      type,
      title,
      message
    };
    this.toastSubject.next(toast);
  }

  success(title: string, message: string = '') {
    this.show('success', title, message);
  }

  error(title: string, message: string = '') {
    this.show('error', title, message);
  }

  warning(title: string, message: string = '') {
    this.show('warning', title, message);
  }

  info(title: string, message: string = '') {
    this.show('info', title, message);
  }
}
