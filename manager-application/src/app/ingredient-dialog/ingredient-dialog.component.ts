import { Component, Inject } from '@angular/core';
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
import { RequestMessage, WarehouseServiceMessages } from '../../utils/schema/messages';
import { Service } from '../../utils/service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SendButtonComponent } from '../send-button/send-button.component';
import { DialogData } from '../../utils/dialog-data';

/**
 * Component that implements a dialog containing a 
 * form to insert all the necessary information 
 * about the new ingredient or to update one
 */
@Component({
	selector: 'ingredient-dialog',
	standalone: true,
	imports: [
		MatDialogTitle,
		MatDialogContent,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		CommonModule,
		MatIconModule,
		SendButtonComponent
	],
	templateUrl: './ingredient-dialog.component.html',
	styleUrl: './ingredient-dialog.component.css'
})
export class IngredientDialogComponent {
	isUpdate = (this.data.data != undefined)
	quantity = 1
	name = ""

	constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog) { }

	createRequest() {
		let request: RequestMessage
		if (!this.isUpdate) {
			request = {
				client_name: Service.WAREHOUSE,
				client_request: WarehouseServiceMessages.CREATE_INGREDIENT,
				input: {
					name: this.name,
					quantity: this.quantity
				}
			}
		} else {
			request = {
				client_name: Service.WAREHOUSE,
				client_request: WarehouseServiceMessages.RESTOCK_INGREDIENT,
				input: {
					name: this.data.data!.name,
					quantity: this.quantity
				}
			}
		}
		return request
	}

}
