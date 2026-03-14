import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PinCheckinService } from './pin-checkin.service';

@Component({
  selector: 'app-pin-checkin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pin-checkin.component.html',
  styleUrl: './pin-checkin.component.css'
})
export class PinCheckinComponent {
  enteredPin: string = '';
  errorMessage: string = '';
  isVerifying: boolean = false;
  showSuccess: boolean = false;
  welcomeMessage: string = '';
  
  // For demo/prototype purposes, we use a default eventId
  // In a real app, this would come from route params or a selection screen
  eventId: string = 'demo-event-id';

  constructor(private pinService: PinCheckinService) {}

  addDigit(digit: string) {
    if (this.enteredPin.length < 4) {
      this.enteredPin += digit;
      this.errorMessage = '';
      
      if (this.enteredPin.length === 4) {
        this.verifyPin();
      }
    }
  }

  backspace() {
    this.enteredPin = this.enteredPin.slice(0, -1);
    this.errorMessage = '';
  }

  clear() {
    this.enteredPin = '';
    this.errorMessage = '';
  }

  verifyPin() {
    this.isVerifying = true;
    this.pinService.checkInByPin(this.eventId, this.enteredPin).subscribe({
      next: (res) => {
        this.isVerifying = false;
        this.welcomeMessage = res.message;
        this.showSuccess = true;
        this.playSuccessSound();
        
        // Reset after 3 seconds for next person
        setTimeout(() => {
          this.resetKiosk();
        }, 3000);
      },
      error: (err) => {
        this.isVerifying = false;
        this.errorMessage = err.error?.message || 'Invalid PIN. Please try again.';
        this.enteredPin = ''; // Reset PIN on error
        this.playErrorSound();
      }
    });
  }

  resetKiosk() {
    this.showSuccess = false;
    this.enteredPin = '';
    this.welcomeMessage = '';
  }

  playSuccessSound() {
    // Optional: Add a subtle 'ding' sound for feedback
  }

  playErrorSound() {
    // Optional: Add a subtle 'error' sound or vibration
  }
}
