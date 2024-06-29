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
import { Ingredient } from '../../utils/Ingredient';
import { RequestMessage, ResponseMessage, WarehouseServiceMessages } from '../../utils/messages';
import { Service } from '../../utils/service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * Component that implements a button that manages 
 * the restock of an ingredient
 */
@Component({
	selector: 'restock-button',
	standalone: true,
	imports: [
		MatButtonModule,
		MatIconModule,
		CommonModule],
	templateUrl: './restock-button.component.html',
	styleUrl: './restock-button.component.css'
})
export class RestockButtonComponent {
	@Input()
	ws!: WebSocket;
	@Input()
	ingredient!: Ingredient;

	constructor(public dialog: MatDialog) { }
	openDialog() {
		this.dialog.open(Dialog, {
			data: {
				ingredient: this.ingredient,
				ws: this.ws,
				dialog: this.dialog
			},
		});
	}
}

/**
 * Component that implements a dialog containing a 
 * form to insert the quantity to add (greater than 0) 
 * to the ingredient and a button that send
 * a message to the server
 */
@Component({
	selector: 'restock-button-dialog',
	templateUrl: './dialog.html',
	standalone: true,
	styleUrl: './restock-button.component.css',
	imports: [MatDialogTitle,
		MatDialogContent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		CommonModule],
})
export class Dialog {
	constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog) { }
	addQuantity: number = 1
	showError = false

	public restockIngredient() {
		const data = this.data
		const closeDialog = () => {
			data.dialog.closeAll()
			window.location.reload()
		}
		const openDialog = (msg: ResponseMessage) => {
			this.dialog.open(ErrorDialog, msg);
		}
		if (this.addQuantity > 0) {
			const input = {
				"name": data.ingredient.name,
				"quantity": this.addQuantity
			}
			const request: RequestMessage = {
				client_name: Service.WAREHOUSE,
				client_request: WarehouseServiceMessages.RESTOCK_INGREDIENT,
				input: JSON.stringify(input)
			}
			data.ws.send(JSON.stringify(request))
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
		} else {
			this.showError = true
		}
	}
}

/**
 * Component that implements a dialog that shows the occurred error
 */
@Component({
	selector: 'restock-button-error-dialog',
	templateUrl: './error-dialog.html',
	standalone: true,
	styleUrl: './restock-button.component.css',
	imports: [MatDialogTitle,
		MatDialogContent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		CommonModule],
})
export class ErrorDialog implements OnDestroy {
	constructor(@Inject(MAT_DIALOG_DATA) public data: ResponseMessage) { }
	ngOnDestroy(): void {
		window.location.reload()
	}
	errorMessage: string = this.data.message
}

export interface DialogData {
	ingredient: Ingredient,
	ws: WebSocket,
	dialog: MatDialog
}
