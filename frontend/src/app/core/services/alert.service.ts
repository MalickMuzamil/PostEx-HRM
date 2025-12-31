import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  success(message: string, title: string = 'Success') {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      timer: 1800,
      showConfirmButton: false,
    });
  }

  error(message: string = 'Something went wrong', title: string = 'Error') {
    return Swal.fire({
      icon: 'error',
      title,
      text: message,
      showConfirmButton: true,
    });
  }

  warning(message: string, title: string = 'Warning') {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      showConfirmButton: true,
    });
  }

  info(message: string, title: string = 'Info') {
    return Swal.fire({
      icon: 'info',
      title,
      text: message,
      showConfirmButton: true,
    });
  }

  confirm(message: string = 'Are you sure?', title: string = 'Confirm') {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });
  }

  close() {
    Swal.close();
  }
}
