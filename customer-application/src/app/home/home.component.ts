import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Component that implements the home page.
 */
@Component({
	selector: 'home',
	standalone: true,
	imports: [MatToolbarModule,
		RouterOutlet,
		MatIconModule,
		MatButtonModule],
	templateUrl: './home.component.html',
	styleUrl: './home.component.css'
})
export class HomeComponent {

	constructor(private readonly router: Router) { }

	onCartClick() {
		this.router.navigate(["cart"])
	}

}
