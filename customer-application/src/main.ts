import { Component } from '@angular/core';
import { HomeComponent } from './app/home/home.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
@Component({
	selector: 'app-root',
	standalone: true,
	template: `
  <home>
  `,
	imports: [HomeComponent],
})

export class AppComponent {
	name = '';
}

bootstrapApplication(AppComponent, appConfig);
