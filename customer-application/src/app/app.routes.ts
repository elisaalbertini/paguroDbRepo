import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { CartComponent } from './cart/cart.component';

export const routes: Routes = [
	{
		path: "",
		component: MenuComponent
	},
	{
		path: "cart",
		component: CartComponent
	},
];
