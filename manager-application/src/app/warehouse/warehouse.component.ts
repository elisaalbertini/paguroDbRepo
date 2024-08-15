import { Component } from '@angular/core';
import { TableComponent } from '../data-table/table.component';

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

}
