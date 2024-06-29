import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HomeComponent } from './app/home/home.component';
import { appConfig } from './app/app.config';

@Component({
	selector: 'app-root',
	standalone: true,
	template: `
  <home>
  `,
	imports: [HomeComponent],
})
export class DemoComponent {
	name = '';
}

bootstrapApplication(DemoComponent, appConfig);
