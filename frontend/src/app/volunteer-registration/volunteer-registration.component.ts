import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-volunteer-registration',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './volunteer-registration.component.html',
  styleUrl: './volunteer-registration.component.css'
})
export class VolunteerRegistrationComponent {

  volunteer = {
    name: '',
    email: '',
    phone: '',
    skills: '',
    availability: ''
  };

  registerVolunteer() {
    console.log(this.volunteer);
    alert("Volunteer Registered Successfully!");
  }

}