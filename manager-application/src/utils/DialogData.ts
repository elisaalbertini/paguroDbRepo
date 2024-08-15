import { MatDialog } from "@angular/material/dialog";

/**
 * This interface represents the data passed to a dialog
 */
export interface DialogData {
	ws: WebSocket,
	dialog: MatDialog
}
