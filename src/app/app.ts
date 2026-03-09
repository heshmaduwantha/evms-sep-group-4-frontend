import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventService } from './events/services/event.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App {

  title = 'EVMS';

  constructor(private eventService: EventService) {
    this.eventService.getEvents().subscribe(data => {
      console.log('Events from backend:', data);
    });
  }

}