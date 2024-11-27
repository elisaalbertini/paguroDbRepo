import { checkWsConnectionAndSend } from '../../utils/send';
import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogContent,
	MatDialogTitle,
} from '@angular/material/dialog';
import { RequestMessage, ResponseMessage } from '../../utils/schema/messages';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageCode } from '../../utils/codes';

/**
 * Button component that sends a request and, in case of an error,
 * shows an error dialog.
 */
@Component({
	selector: 'send-button',
	standalone: true,
	imports: [MatButtonModule],
	templateUrl: './send-button.component.html',
	styleUrl: './send-button.component.css'
})
export class SendButtonComponent {

	@Input()
	ws!: WebSocket
	@Input()
	request!: RequestMessage
	@Input()
	buttonName!: string
	@Input()
	dialog!: MatDialog
	@Input()
	isDisabled!: boolean

	constructor(private readonly errorDialog: MatDialog) { }

	onClick() {
		const openDialog = (msg: ResponseMessage) => {
			this.errorDialog.open(ErrorDialog, {
				data:
					msg
			});
		}

		const closeDialog = () => { this.dialog.closeAll() }

		const closeAndReloadDialog = () => {
			closeDialog()
			window.location.reload()
		}

		if (!checkWsConnectionAndSend(this.request, this.ws)) {
			closeDialog()
		}

		this.ws.onmessage = function(e) {
			const res = JSON.parse(e.data) as ResponseMessage
			if (res.code == MessageCode.OK) {
				closeAndReloadDialog()
			} else {
				closeDialog()
				openDialog(res)
			}
		}
	}
}

/**
* Component that implements a dialog that shows the occurred error
*/
@Component({
	selector: 'send-button-error-dialog',
	templateUrl: './error-dialog.html',
	standalone: true,
	styleUrl: './send-button.component.css',
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

