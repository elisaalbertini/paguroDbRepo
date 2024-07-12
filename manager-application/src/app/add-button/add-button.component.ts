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
 * the creation of a new ingredient
 */
@Component({
	selector: 'add-button',
	standalone: true,
	imports: [MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule],
	templateUrl: './add-button.component.html',
	styleUrl: './add-button.component.css'
})
export class AddButtonComponent {
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
 * about the new ingredient and a button that send
 * a message to the server
 */
@Component({
	selector: 'add-button-dialog',
	templateUrl: './dialog.html',
	standalone: true,
	styleUrl: './add-button.component.css',
	imports: [MatDialogTitle,
		MatDialogContent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		CommonModule, MatIconModule],
})
export class Dialog {
	constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog) { }
	name: string = ''
	quantity: number = 1

	public add() {
		console.log(this.name)
		console.log(this.quantity)
		const data = this.data

		const openDialog = (msg: ResponseMessage) => {
			this.dialog.open(ErrorDialog, {
				data:
					msg
			});
		}

		const input: Ingredient = {
			name: this.name,
			quantity: this.quantity
		}
		const request: RequestMessage = {
			client_name: Service.WAREHOUSE,
			client_request: WarehouseServiceMessages.CREATE_INGREDIENT.toString(),
			input: JSON.stringify(input)
		}
		const closeDialog = () => {
			data.dialog.closeAll()
			window.location.reload()
		}

		data.ws.send(JSON.stringify(request))

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

/**
 * Component that implements a dialog that shows the occurred error
 */
@Component({
	selector: 'add-button-error-dialog',
	templateUrl: './error-dialog.html',
	standalone: true,
	styleUrl: './add-button.component.css',
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

export interface DialogData {
	ws: WebSocket,
	dialog: MatDialog
}
