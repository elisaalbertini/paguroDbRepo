import { Component } from '@angular/core';
import { ItemCardComponent } from "../item-card/item-card.component";
import { Item } from '../../utils/schema/item';
import { MenuServiceMessages, RequestMessage, ResponseMessage } from '../../utils/schema/message';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessageCode } from '../../utils/codes';
import * as errors from '../../utils/error'

/**
 * Component that implements the menu page.
 */
@Component({
	selector: 'app-menu',
	standalone: true,
	imports: [ItemCardComponent,
		CommonModule,
		MatProgressSpinnerModule],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.css'
})
export class MenuComponent {

	ws!: WebSocket
	items: Item[] = []
	error = errors.createError()
	display = false

	constructor() {
		this.ws = new WebSocket('ws://localhost:3000')

		const request: RequestMessage = {
			client_request: MenuServiceMessages.GET_AVAILABLE_ITEMS,
			input: ""
		}

		this.ws.onerror = () => {
			this.display = true
			this.error = errors.getServerError()
			this.ws.close()
		}

		this.ws.onopen = () => {
			this.ws.send(JSON.stringify(request))
		}

		this.ws.onmessage = (e) => {
			let data = JSON.parse(e.data) as ResponseMessage
			this.display = true
			switch (data.code) {
				case MessageCode.OK:
					this.items = data.data
					break
				case MessageCode.NOT_FOUND:
					this.error = errors.getWarehouseError()
					break
				case MessageCode.SERVICE_NOT_AVAILABLE:
					this.error = errors.getMicroserviceError()
			}
		}
	}

}
