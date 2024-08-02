import { Component } from '@angular/core';
import { DataTableMenuComponent } from "../data-table-menu/data-table-menu.component";

/**
 * Component that implements the menu page.
 */
@Component({
	selector: 'menu',
	standalone: true,
	imports: [DataTableMenuComponent],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.css'
})
export class MenuComponent { }
