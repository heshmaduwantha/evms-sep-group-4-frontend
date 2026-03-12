import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { VolunteerRegistrationComponent } from './volunteer-registration/volunteer-registration.component';

@NgModule({
  declarations: [
    AppComponent,
    VolunteerRegistrationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }