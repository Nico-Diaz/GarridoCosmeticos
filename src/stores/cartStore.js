import { atom, map } from 'nanostores';

// 1. ESTADO: ¿El carrito está abierto o cerrado?
export const isCartOpen = atom(false);

// 2. ESTADO: Los productos dentro del carrito (Diccionario)
// Usamos un mapa donde la clave es el ID del producto para encontrarlo rápido
export const cartItems = map({});

// --- ACCIONES ---

// Agregar producto (sin abrir el carrito)
export function addCartItem(product) {
    const existingEntry = cartItems.get()[product.id];
    
    if (existingEntry) {
        // Si ya existe, sumamos la cantidad
        cartItems.setKey(product.id, {
            ...existingEntry,
            quantity: existingEntry.quantity + product.quantity
        });
    } else {
        // Si es nuevo, lo agregamos
        cartItems.setKey(product.id, product);
    }
    
    // NOTA: No llamamos a isCartOpen.set(true), así que el carrito NO se abre solo.
}

// Quitar producto
export function removeCartItem(id) {
    const currentItems = cartItems.get();
    const { [id]: deleted, ...rest } = currentItems;
    cartItems.set(rest);
}

// Actualizar cantidad desde dentro del carrito
export function updateQuantity(id, newQuantity) {
    const item = cartItems.get()[id];
    if (item && newQuantity > 0) {
        cartItems.setKey(id, { ...item, quantity: newQuantity });
    }
}