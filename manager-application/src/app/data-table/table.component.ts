import { Component, Input, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RequestMessage, ResponseMessage } from '../../utils/schema/messages';
import { Service } from '../../utils/service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IngredientDialogComponent } from '../ingredient-dialog/ingredient-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ItemDialogComponent } from '../item-dialog/item-dialog.component';
import { formatRecipe } from '../../utils/recipe';
import { MessageCode } from '../../utils/codes';

/**
 * Component that implements a table displaying the ingredients or items 
 * present in the warehouse. If the db is empty or an 
 * error occurs it shows it.
 */
@Component({
	selector: 'data-table',
	styleUrl: 'table.component.css',
	templateUrl: 'table.component.html',
	standalone: true,
	imports: [MatTableModule,
		CommonModule,
		MatProgressSpinnerModule,
		MatIconModule,
		MatButtonModule,
		MatButtonModule,
		MatIconModule],
})
export class TableComponent implements OnInit {
	@Input()
	displayedColumns!: string[]
	@Input()
	initialRequest!: RequestMessage

	display = false
	error = false
	errorMessage = ''
	dataSource = Array()
	ws!: WebSocket;

	createDialogData(title: string, buttonMsg: string, data?: any) {
		return {
			data: {
				title: title,
				buttonMsg: buttonMsg,
				data: data,
				ws: this.ws,
				dialog: this.dialog
			},
		}
	}

	openDialog(data?: any) {
		if (this.initialRequest.client_name == Service.WAREHOUSE) {
			let title = data == undefined ? "Add a new ingredient" : "Ingredient: " + data.name
			let buttonMsg = data == undefined ? "Add" : "Restock"

			this.dialog.open(IngredientDialogComponent, this.createDialogData(title, buttonMsg, data))
		} else {
			let title = data == undefined ? "Add a new item" : "Update " + data.name
			let buttonMsg = data == undefined ? "Add" : "Update"
			this.dialog.open(ItemDialogComponent, this.createDialogData(title, buttonMsg, data));
		}
	}

	constructor(private dialog: MatDialog) { }

	ngOnInit(): void {
		this.ws = new WebSocket('ws://localhost:3000')
		let request = this.initialRequest
		this.ws.onerror = () => {
			this.errorMessage = "Server not available!"
			this.error = true
			this.display = true
			this.ws.close()
		}

		this.ws.onopen = function() {
			console.log("Websocket opend!")
			this.send(JSON.stringify(request))
		}

		this.ws.onmessage = function(e) {
			const data = JSON.parse(e.data) as ResponseMessage
			if (data.code == MessageCode.OK) {
				setData(data.data)
			} else {
				setEmpty("Database empty!", data.code)
			}
			setDisplayTrue()
		}
		const setDisplayTrue = () => { this.display = true }
		const setEmpty = (msg: string, code: number) => {
			this.error = true
			if (code == MessageCode.SERVICE_NOT_AVAILABLE) {
				this.errorMessage = "Microservice not available!"
			} else {
				this.errorMessage = msg
			}
		}

		const setData = (data: any[]) => {
			if (this.initialRequest.client_name == Service.WAREHOUSE) {
				this.dataSource = data
			} else {
				let items = Array()
				data.forEach(e => {
					items.push({
						name: e.name,
						recipe: formatRecipe(e.recipe),
						price: e.price
					})
				})
				this.dataSource = items
			}
		}
	}
}
