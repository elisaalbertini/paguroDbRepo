import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { WarehouseComponent } from './warehouse/warehouse.component';

export const routes: Routes = [
	{
		path: "",
		component: WarehouseComponent
	},
	{
		path: "menu",
		component: MenuComponent
	}
];
