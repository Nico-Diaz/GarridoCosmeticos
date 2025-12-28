import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem, updateQuantity } from '../stores/cartStore';
import './Cart.css';

export default function Cart() {
    const $isCartOpen = useStore(isCartOpen);
    const $cartItems = useStore(cartItems);
    
    const itemsArray = Object.values($cartItems);

    // Calcular totales
    const total = itemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = itemsArray.reduce((acc, item) => acc + item.quantity, 0);

    // --- FUNCIÓN PARA ENVIAR A WHATSAPP ---
    const handleCheckout = () => {
        // 1. TU NÚMERO DE TELÉFONO
        // Formato: Código país (54) + 9 + código área (sin 0) + número (sin 15)
        // Ejemplo para Mendoza: 5492611234567
        const phoneNumber = "5492610000000"; // <--- ¡CAMBIA ESTO POR TU NÚMERO REAL!

        // 2. CONSTRUIR EL MENSAJE
        let message = "Hola Garrido Beauty! 👋 Quiero realizar el siguiente pedido:\n\n";

        itemsArray.forEach(item => {
            const subtotal = item.price * item.quantity;
            // Formato: - Nombre Producto (x2): $Precio
            message += `- *${item.name}* (x${item.quantity}): $${subtotal.toLocaleString('es-AR')}\n`;
        });

        message += `\n*Total Final: $${total.toLocaleString('es-AR')}*`;
        message += "\n\nQuedo a la espera de los datos para el pago/envío. Gracias!";

        // 3. CODIFICAR URL Y ABRIR WHATSAPP
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <>
            <button 
                className="cart-trigger" 
                onClick={() => isCartOpen.set(!$isCartOpen)}
                aria-label="Abrir carrito"
            >
                🛒
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </button>

            <div className={`cart-drawer ${$isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Tu Pedido</h2>
                    <button onClick={() => isCartOpen.set(false)} className="close-btn">×</button>
                </div>

                <div className="cart-body">
                    {itemsArray.length === 0 ? (
                        <p className="empty-msg">Tu carrito está vacío.</p>
                    ) : (
                        itemsArray.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <p>${item.price.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="item-controls">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                </div>
                                <button onClick={() => removeCartItem(item.id)} className="delete-btn">🗑️</button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="total-row">
                        <span>Total:</span>
                        <span>${total.toLocaleString('es-AR')}</span>
                    </div>
                    <button 
                        className="checkout-btn" 
                        disabled={itemsArray.length === 0}
                        onClick={handleCheckout}
                    >
                        ENVIAR PEDIDO POR WHATSAPP 📲
                    </button>
                </div>
            </div>
            
            {$isCartOpen && <div className="cart-overlay" onClick={() => isCartOpen.set(false)}></div>}
        </>
    );
}