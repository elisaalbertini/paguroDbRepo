import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { beautifyDbName } from '../../utils/utils';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Component that implements the card of a cart item.
 */
@Component({
  selector: 'cart-card',
  standalone: true,
  imports: [MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './cart-card.component.html',
  styleUrl: './cart-card.component.css'
})
export class CartCardComponent implements OnInit {

  @Input()
  orderItem!: any
  error = false
  quantity: number = 1

  ngOnInit(): void {
    this.quantity = this.orderItem.quantity
  }

  beautifyDbName(name: string) {
    return beautifyDbName(name)
  }

  update() {
    if (this.quantity > 0) {
      this.error = false
      let cart = JSON.parse(localStorage.getItem("cart")!)
      cart.forEach((item: any) => {
        if (item.name == this.orderItem.name) {
          this.orderItem.quantity = this.quantity
          item.quantity = this.quantity
        }
      })
      localStorage.setItem("cart", JSON.stringify(cart))
    } else {
      this.error = true
    }
  }

  delete() {
    let cart: any[] = JSON.parse(localStorage.getItem("cart")!)
    cart = cart.filter((item: any) => item.name != this.orderItem.name)
    localStorage.setItem("cart", JSON.stringify(cart))
    window.location.reload()
  }
}
