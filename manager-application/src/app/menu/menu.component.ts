import { Component } from '@angular/core';
import { TableComponent } from "../data-table/table.component";
import { MenuServiceMessages, RequestMessage } from '../../utils/schema/messages';
import { Service } from '../../utils/service';

/**
 * Component that implements the menu page.
 */
@Component({
	selector: 'menu',
	standalone: true,
	imports: [TableComponent],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.css'
})
export class MenuComponent {
	displayedColumns: string[] = ['name', 'recipe', 'price', 'button'];
	initialRequest: RequestMessage = {
		client_name: Service.MENU,
		client_request: MenuServiceMessages.GET_ITEMS,
		input: ''
	}
}