import { EventFormPage } from './event-form';

export class EventEditPage extends EventFormPage {
  constructor() {
    super('/events/series/:seriesId/edit');
  }
}
