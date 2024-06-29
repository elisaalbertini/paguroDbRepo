import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TableComponent } from '../data-table/table.component';

/**
 * /**
 * Component that implements the main page of the website.
 */
@Component({
	selector: 'home',
	standalone: true,
	imports: [
		MatToolbarModule,
		TableComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.css'
})
export class HomeComponent { }
