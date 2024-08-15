import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IngredientInRecipe, Item } from '../../utils/Item';
import { Service } from '../../utils/service';
import { MenuServiceMessages, RequestMessage, ResponseMessage } from '../../utils/messages';
import { MatTableModule } from '@angular/material/table'
import { CommonModule } from '@angular/common';
import { AddMenuItemButtonComponent } from "../add-menu-item-button/add-menu-item-button.component";
import { UpdateMenuItemButtonComponent } from "../update-menu-item-button/update-menu-item-button.component";

/**
 * Component that implements a table displaying the items 
 * present in the menu. If the menu db is empty or an 
 * error occurs it shows it.
 */
@Component({
	selector: 'dataTableMenu',
	standalone: true,
	imports: [MatProgressSpinnerModule,
		MatTableModule,
		CommonModule,
		AddMenuItemButtonComponent,
		UpdateMenuItemButtonComponent],
	templateUrl: './data-table-menu.component.html',
	styleUrl: './data-table-menu.component.css'
})
export class DataTableMenuComponent {
	displayedColumns: string[] = ['name', 'recipe', 'price', 'update'];
	display = false
	error = false
	errorMessage = ''
	dataSource = Array()
	ws!: WebSocket;

	constructor() {
		this.ws = new WebSocket('ws://localhost:3000')

		this.ws.onerror = () => {
			this.errorMessage = "Server not available!"
			this.error = true
			this.display = true
			this.ws.close()
		}

		let items: Item[]
		const initialRequest: RequestMessage = {
			client_name: Service.MENU,
			client_request: MenuServiceMessages.GET_ITEMS,
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
				items = JSON.parse(data.data) as Item[]
				setData(items)
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
				this.errorMessage = "Menu empty!"
			}
		}
		const setData = (items: Item[]) => {
			let data = Array()
			items.forEach(e => {
				data.push({
					name: e.name,
					recipe: formatRecipe(e.recipe),
					price: e.price
				})
			})
			this.dataSource = data
		}
		const formatRecipe = (recipe: IngredientInRecipe[]) => {
			let formattedRecipe = ""
			recipe.forEach(i => {
				const newElem = i.ingredient_name + " x" + i.quantity + ", "
				formattedRecipe = formattedRecipe + newElem
			})
			return formattedRecipe
		}
	}
}
