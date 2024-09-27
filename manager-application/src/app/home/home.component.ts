import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MenuComponent } from "../menu/menu.component";
import { WarehouseComponent } from "../warehouse/warehouse.component";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Frontend, Log, MissingIngredientNotification } from '../../utils/schema/messages';
import { equals } from 'typia';
import { Ingredient } from '../../utils/schema/ingredient';

interface Route {
	path: string;
	label: string;
}

/**
 * Component that implements the main page of the website. ciao babababababababababababab
 */
@Component({
	selector: 'home',
	standalone: true,
	imports: [
		MatToolbarModule,
		MatTabsModule,
		RouterOutlet,
		RouterLink,
		MenuComponent,
		WarehouseComponent,
	],
	templateUrl: './home.component.html',
	styleUrl: './home.component.css'
})

export class HomeComponent {
	activePath: string = ""
	ws!: WebSocket

	constructor(router: Router, notification: MatSnackBar) {
		if (localStorage.getItem(this.activePath) == undefined) {
			localStorage.setItem(this.activePath, "")
		} else {
			const path = localStorage.getItem(this.activePath)!
			router.navigate([path])
		}

		this.ws = new WebSocket('ws://localhost:3000')
		this.ws.onopen = function() {
			const msg: Log = {
				message: Frontend.MANAGER
			}
			this.send(JSON.stringify(msg))
		}
		this.ws.onmessage = function(e) {
			const data = JSON.parse(e.data) as MissingIngredientNotification
			if (equals<MissingIngredientNotification>(data)) {
				const missingIngredients = data.data
				notify(createMsg(missingIngredients), "OK")
			}
		}
		function notify(message: string, action: string) {
			notification.open(message, action);
		}

		function createMsg(missingIngredients: Ingredient[]) {
			const msg = "missing from the warehouse!"
			let notificationMsg = ""
			let missingNames = ""
			if (missingIngredients.length == 1) {
				notificationMsg = missingIngredients[0].name + " is " + msg
			} else {
				Array.from(missingIngredients).forEach((i: any) => {
					missingNames = missingNames + i.name + ", "
				});
				notificationMsg = missingNames + "are " + msg
			}
			return notificationMsg
		}
	}
	routes: Route[] = [
		{ path: '', label: 'WAREHOUSE' },
		{ path: 'menu', label: 'MENU' },
	];

	setActiveRoute(path: string) {
		localStorage.setItem(this.activePath, path)
	}

	checkIfActive(path: string) {
		return path == localStorage.getItem(this.activePath)
	}
}
