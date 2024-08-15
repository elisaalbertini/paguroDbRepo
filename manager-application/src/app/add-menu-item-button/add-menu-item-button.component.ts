import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { MenuServiceMessages, RequestMessage, ResponseMessage, WarehouseServiceMessages } from '../../utils/messages';
import { Item } from '../../utils/Item';
import { Service } from '../../utils/service';
import { DialogData } from '../../utils/DialogData';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Ingredient } from '../../utils/Ingredient';
import { IArray } from '../../utils/IArray';
import { buildRecipe } from '../../utils/recipe';
import { checkWsConnectionAndSend } from '../../utils/send';

/**
 * Component that implements a button that manages 
 * the creation of a new item
 */
@Component({
	selector: 'add-menu-item-button',
	standalone: true,
	imports: [MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		CommonModule,
		MatInputModule],
	templateUrl: './add-menu-item-button.component.html',
	styleUrl: './add-menu-item-button.component.css'
})
export class AddMenuItemButtonComponent {

	constructor(public dialog: MatDialog) { }

	@Input()
	ws!: WebSocket;

	openDialog() {
		this.dialog.open(Dialog, {
			data: {
				ws: this.ws,
				dialog: this.dialog
			},
		});
	}
}

/**
 * Component that implements a dialog containing a 
 * form to insert all the necessary information 
 * about the new item and a button that send
 * a message to the server
 */
@Component({
	selector: 'add-menu-item-button-dialog',
	templateUrl: './dialog.html',
	standalone: true,
	styleUrl: './add-menu-item-button.component.css',
	imports: [MatDialogTitle,
		MatDialogContent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		CommonModule,
		MatIconModule,
		MatCheckboxModule],
})
export class Dialog {
	ingredients: Ingredient[] = Array()
	name: string = ''
	price: number = 1
	errorEmpty = false
	errorPrice = false
	error = false
	selectedIngredients: string[] = Array()
	selectedQuantities = {} as IArray

	constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog) {
		const initialRequest: RequestMessage = {
			client_name: Service.WAREHOUSE,
			client_request: WarehouseServiceMessages.GET_ALL_INGREDIENT,
			input: ''
		}
		if (!checkWsConnectionAndSend(initialRequest, this.data.ws)) {
			this.closeDialog()
		}
		let ingredient: Ingredient[]
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

	closeDialog = () => {
		this.data.dialog.closeAll()
		window.location.reload()
	}

	onCheckChange(name: string) {
		if (this.selectedIngredients.includes(name)) {
			this.selectedIngredients = this.selectedIngredients.filter(i => i !== name)
		} else {
			this.selectedIngredients.push(name)
		}
	}

	public add() {
		if (this.selectedIngredients.length <= 0) {
			this.error = true
		} else if (this.price <= 0) {
			this.errorPrice = true
		} else {
			const data = this.data

			const openDialog = (msg: ResponseMessage) => {
				this.dialog.open(ErrorDialog, {
					data:
						msg
				});
			}

			const input: Item = {
				name: this.name,
				recipe: buildRecipe(this.selectedQuantities, this.selectedIngredients),
				price: this.price
			}

			const request: RequestMessage = {
				client_name: Service.MENU,
				client_request: MenuServiceMessages.CREATE_ITEM,
				input: input
			}

			const closeDialog = () => this.closeDialog()

			if (!checkWsConnectionAndSend(request, data.ws)) {
				closeDialog()
			}

			data.ws.onmessage = function(e) {
				const res = JSON.parse(e.data) as ResponseMessage
				if (res.code == 200) {
					console.log(res.message)
					closeDialog()
				} else {
					console.error(res.code)
					console.error(res.message)
					data.dialog.closeAll()
					openDialog(res)
				}
			}
		}
	}
}

/**
 * Component that implements a dialog that shows the occurred error
 */
@Component({
	selector: 'add-menu-item-button-error-dialog',
	templateUrl: './error-dialog.html',
	standalone: true,
	styleUrl: './add-menu-item-button.component.css',
	imports: [MatDialogTitle,
		MatDialogContent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		CommonModule],
})
export class ErrorDialog implements OnDestroy {
	constructor(@Inject(MAT_DIALOG_DATA) public data: ResponseMessage) {
		console.log(data.code)
	}
	ngOnDestroy(): void {
		window.location.reload()
	}
	errorMessage: string = this.data.message
}
