const cartStorage = "cart"

/**
 * This function get the local storage used for the cart. If null it returs an empty array.
 */
export function getCartStorage() {
	let cart = localStorage.getItem(cartStorage)
	return cart != null ? JSON.parse(cart) : Array()

}

/**
 * This function replace the local storage used for the cart with the provided cart
 * @param cart data to save in the local storage
 */
export function setCartStorage(cart: any) {
	localStorage.setItem(cartStorage, JSON.stringify(cart))
}
