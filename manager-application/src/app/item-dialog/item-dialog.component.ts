import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent } from '@angular/material/dialog';
import { Ingredient } from '../../utils/schema/ingredient';
import { IArray } from '../../utils/array';
import { MenuServiceMessages, RequestMessage, ResponseMessage, WarehouseServiceMessages } from '../../utils/schema/messages';
import { Service } from '../../utils/service';
import { checkWsConnectionAndSend } from '../../utils/send';
import { buildRecipe } from '../../utils/recipe';
import { SendButtonComponent } from '../send-button/send-button.component';
import { DialogData } from '../../utils/dialog-data';
import { MessageCode } from '../../utils/codes';

/**
 * Component thaqwertytrewq
 * form to insert all the necessary information aqtytrewqwertyasdxfcgvhbnjklstdxfygvhbjkml
 * about the new item or to update one
 */
@Component({
	selector: 'item-dialog',
	standalone: true,
	imports: [FormsModule,
		CommonModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		MatDialogContent,
		SendButtonComponent],
	templateUrl: './item-dialog.component.html',
	styleUrl: './item-dialog.component.css'
})
export class ItemDialogComponent {
	isUpdate = (this.data.data != undefined)
	ingredients: Ingredient[] = Array()
	name: string = ''
	price: number = 1
	errorEmpty = false
	selectedIngredients: string[] = Array()
	selectedQuantities = {} as IArray
	orderItem!: any

	constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog) {
		const initialRequest: RequestMessage = {
			client_name: Service.WAREHOUSE,
			client_request: WarehouseServiceMessages.GET_ALL_INGREDIENT,
			input: ''
		}
		this.checkConnSendAndCloseDialog(initialRequest, this.data.ws)
		let ingredient: Ingredient[]
		this.data.ws.onmessage = function(e) {
			const data = JSON.parse(e.data) as ResponseMessage
			if (data.code == MessageCode.OK) {
				ingredient = data.data as Ingredient[]
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

	checkConnSendAndCloseDialog = (req: RequestMessage, ws: WebSocket) => {
		if (!checkWsConnectionAndSend(req, ws)) {
			this.data.dialog.closeAll()
			window.location.reload()
		}
	}

	createRequest() {
		const data = this.data
		const recipe = buildRecipe(this.selectedQuantities, this.selectedIngredients)
		let request: RequestMessage

		if (this.isUpdate) {
			request = {
				client_name: Service.MENU,
				client_request: MenuServiceMessages.UPDATE_ITEM,
				input: {
					name: data.data!.name,
					recipe: recipe,
					price: this.price
				}
			}
		} else {
			request = {
				client_name: Service.MENU,
				client_request: MenuServiceMessages.CREATE_ITEM,
				input: {
					name: this.name,
					recipe: recipe,
					price: this.price
				}
			}
		}
		return request
	}
}

