import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RequestMessage, ResponseMessage, WarehouseServiceMessages } from '../../utils/messages';
import { Service } from '../../utils/service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RestockButtonComponent } from '../restock-button/restock-button.component';
import { Ingredient } from '../../utils/Ingredient';
import { AddButtonComponent } from '../add-button/add-button.component';

/**
 * Component that implements a table displaying the ingredients 
 * present in the warehouse. If the warehouse is empty or an 
 * error occurs it shows it.
 */
@Component({
	selector: 'dataTable',
	styleUrl: 'table.component.css',
	templateUrl: 'table.component.html',
	standalone: true,
	imports: [MatTableModule,
		CommonModule,
		MatProgressSpinnerModule,
		RestockButtonComponent,
		AddButtonComponent],
})
export class TableComponent {
	displayedColumns: string[] = ['name', 'quantity', 'restock'];
	display = false
	error = false
	errorMessage = ''
	dataSource: Ingredient[] = []
	ws!: WebSocket;

	constructor() {
		this.ws = new WebSocket('ws://localhost:3000')

		this.ws.onerror = () => {
			this.errorMessage = "Server not available!"
			this.error = true
			this.display = true
			this.ws.close()
		}

		let ingredients: Ingredient[]
		const initialRequest: RequestMessage = {
			client_name: Service.WAREHOUSE,
			client_request: WarehouseServiceMessages.GET_ALL_INGREDIENT,
			input: ''
		}
		this.ws.onopen = function() {
			console.log("Websocket opend!")
			this.send(JSON.stringify(initialRequest))
		}

		this.ws.onmessage = function(e) {
			const data = JSON.parse(e.data) as ResponseMessage
			console.log("message: " + data.message)
			console.log("code: " + data.code)
			if (data.code == 200) {
				ingredients = JSON.parse(data.data) as Ingredient[]
				setData(ingredients)
			} else {
				setEmptyWarehouse(data.code)
			}
			setDisplayTrue()
		}
		const setDisplayTrue = () => { this.display = true }
		const setEmptyWarehouse = (code: number) => {
			this.error = true
			if (code == 500) {
				this.errorMessage = "Microservice not available!"
			} else {
				this.errorMessage = "Warehouse empty!"
			}
		}
		const setData = (ingredients: Ingredient[]) => {
			this.dataSource = ingredients
		}
	}
}
