import { Component } from '@angular/core';
import { VolunteerRegistrationComponent } from './volunteer-registration/volunteer-registration.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VolunteerRegistrationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

}