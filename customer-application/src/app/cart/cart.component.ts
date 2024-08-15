import { Component } from '@angular/core';
import { CartCardComponent } from "../cart-card/cart-card.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import validator from 'email-validator'
import { NewOrder, OrderType } from '../../utils/order';
import { OrdersServiceMessages, RequestMessage } from '../../utils/message';
import { Service } from '../../utils/service';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Component that implements the cart page.
 */
@Component({
  selector: 'cart',
  standalone: true,
  imports: [CartCardComponent,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    CommonModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  order: any[] = Array()
  email: string = ""
  type!: OrderType;
  errorEmail = false
  errorType = false
  errorEmptyCart = false
  errorNewOrder = false
  error = false
  errorMsg = ""
  apiError = ""
  ws!: WebSocket

  totalAmount(cart: any[]) {
    let total = 0
    cart.forEach((item: any) => {
      total = total + (Number(item.price) * Number(item.quantity))
    })
    return total
  }

  navigateMenu() {
    this.router.navigate([""])
  }

  validateEmail() {
    return validator.validate(this.email)
  }

  orderTypes = [OrderType.AT_THE_TABLE, OrderType.HOME_DELIVERY, OrderType.TAKE_AWAY]

  cleanCart() {
    localStorage.clear()
    window.location.reload()
  }

  constructor(private router: Router, notification: MatSnackBar) {
    this.ws = new WebSocket('ws://localhost:3000')

    this.ws.onerror = () => {
      this.error = true
      this.errorMsg = "Server not available!"
      this.ws.close()
    }

    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.code == 200) {
        this.errorNewOrder = false
        notification.open("Order successfully created", "OK").afterDismissed().subscribe(() => {
          this.cleanCart()
        })
      } else if (data.code == 500) {
        this.error = true
        this.errorMsg = "Microservice not available!"
      }
      else {
        this.apiError = data.message
        this.errorNewOrder = true
      }
    }

    let cart = localStorage.getItem("cart")
    if (cart != null) {
      this.order = JSON.parse(cart)
    }
  }

  formatOrder() {
    let newOrder = Array()
    this.order.forEach((item: any) => {
      newOrder.push({
        item: {
          name: item.name
        },
        quantity: item.quantity
      })
    })
    return newOrder
  }

  sendOrder() {
    if (this.validateEmail()) {
      this.errorEmail = false
      if (this.type != undefined) {
        this.errorType = false
        if (this.order.length > 0) {
          this.errorEmptyCart = false
          const order: NewOrder = {
            customerEmail: this.email,
            price: this.totalAmount(this.order),
            type: this.type,
            items: this.formatOrder()
          }
          const req: RequestMessage = {
            client_name: Service.ORDERS,
            client_request: OrdersServiceMessages.CREATE_ORDER,
            input: order
          }
          this.ws.send(JSON.stringify(req))
        } else {
          this.errorEmptyCart = true
        }
      } else {
        this.errorType = true
      }
    } else {
      this.errorEmail = true
    }
  }
}
