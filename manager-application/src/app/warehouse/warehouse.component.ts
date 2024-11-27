import { Component } from '@angular/core';
import { TableComponent } from '../data-table/table.component';
import { RequestMessage, WarehouseServiceMessages } from '../../utils/schema/messages';

/**
 * Component that implements the warehouse page.
 */
@Component({
	selector: 'warehouse',
	standalone: true,
	imports: [TableComponent],
	templateUrl: './warehouse.component.html',
	styleUrl: './warehouse.component.css'
})
export class WarehouseComponent {
	displayedColumns: string[] = ['name', 'quantity', 'button'];
	req: RequestMessage = {
		client_request: WarehouseServiceMessages.GET_ALL_INGREDIENT,
		input: ''
	}
}
