import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogContent,
	MatDialogTitle,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Item } from '../../utils/Item';
import { MenuServiceMessages, RequestMessage, ResponseMessage, WarehouseServiceMessages } from '../../utils/messages';
import { Service } from '../../utils/service';
import { Ingredient } from '../../utils/Ingredient';
import { IArray } from '../../utils/IArray';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { buildRecipe } from '../../utils/recipe';
import { checkWsConnectionAndSend } from '../../utils/send';

/**
 * Component that implements a button that manages 
 * the update of an item
 */
@Component({
	selector: 'update-menu-item-button',
	standalone: true,
	imports: [MatButtonModule,
		MatIconModule,
		MatInputModule
	],
	templateUrl: './update-menu-item-button.component.html',
	styleUrl: './update-menu-item-button.component.css'
})
export class UpdateMenuItemButtonComponent {
	@Input()
	ws!: WebSocket
	@Input()
	item!: Item

	constructor(public dialog: MatDialog) { }
	openDialog() {
		this.dialog.open(Dialog, {
			data: {
				item: this.item,
				ws: this.ws,
				dialog: this.dialog
			},
		});
	}

}

/**
 * Component that implements a dialog containing a 
 * form to insert the new recipe and price of the 
 * item and a button that send a message to the server
 */
@Component({
	selector: 'update-menu-item-button-dialog',
	templateUrl: './dialog.html',
	standalone: true,
	styleUrl: './update-menu-item-button.component.css',
	imports: [MatDialogTitle,
		MatDialogContent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		CommonModule,
		MatCheckboxModule],
})
export class Dialog {
	ingredients: Ingredient[] = Array()
	selectedQuantities = {} as IArray
	selectedIngredients: string[] = Array()
	errorEmpty = false
	price = this.data.item.price

	closeDialog() {
		this.data.dialog.closeAll()
		window.location.reload()
	}

	constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog) {
		const initialRequest: RequestMessage = {
			client_name: Service.WAREHOUSE,
			client_request: WarehouseServiceMessages.GET_ALL_INGREDIENT,
			input: ''
		}
		let ingredient: Ingredient[]

		if (!checkWsConnectionAndSend(initialRequest, this.data.ws)) {
			this.closeDialog()
		}

		this.data.ws.onmessage = function(e) {
			const data = JSON.parse(e.data) as ResponseMessage
			if (data.code == 200) {
				ingredient = JSON.parse(data.data) as Ingredient[]
				setData(ingredient)
			} else {
				setError(true)
			}
		}
		const setData = (i: Ingredient[]) => {
			this.ingredients = i
			this.ingredients.forEach(i => {
				this.selectedQuantities[i.name] = 1
			})
		}
		const setError = (value: boolean) => {
			this.errorEmpty = value
		}
	}

	onCheckChange(name: string) {
		if (this.selectedIngredients.includes(name)) {
			this.selectedIngredients = this.selectedIngredients.filter(i => i !== name)
		} else {
			this.selectedIngredients.push(name)
		}
	}

	public updateItem() {
		const data = this.data
		const closeDialog = () => this.closeDialog()
		const openDialog = (msg: any) => {
			this.dialog.open(ErrorDialog, {
				data:
					msg
			});
		}
		const input = {
			name: data.item.name,
			recipe: buildRecipe(this.selectedQuantities, this.selectedIngredients),
			price: this.price
		}
		const request: RequestMessage = {
			client_name: Service.MENU,
			client_request: MenuServiceMessages.UPDATE_ITEM,
			input: input
		}
		if (!checkWsConnectionAndSend(request, data.ws)) {
			closeDialog()
		}
		data.ws.onmessage = function(e) {
			const response = JSON.parse(e.data) as ResponseMessage
			if (response.code == 200) {
				console.log(response.message)
				closeDialog()
			} else {
				console.error(response.code)
				console.error(response.message)
				data.dialog.closeAll()
				openDialog(response)
			}
		}
	}
}

/**
 * Component that implements a dialog that shows the occurred error
 */
@Component({
	selector: 'update-menu-item-button-error-dialog',
	templateUrl: './error-dialog.html',
	standalone: true,
	styleUrl: './update-menu-item-button.component.css',
	imports: [MatDialogTitle,
		MatDialogContent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		CommonModule],
})
export class ErrorDialog implements OnDestroy {
	constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
		console.log(data)
	}
	ngOnDestroy(): void {
		window.location.reload()
	}
	errorMessage: string = this.data.message
}

export interface DialogData {
	item: Item,
	ws: WebSocket,
	dialog: MatDialog
}
