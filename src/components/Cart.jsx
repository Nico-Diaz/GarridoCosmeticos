import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem, updateQuantity } from '../stores/cartStore';
import './Cart.css'; // Crearemos los estilos en el paso 4

export default function Cart() {
    const $isCartOpen = useStore(isCartOpen);
    const $cartItems = useStore(cartItems);
    
    // Convertimos el objeto de items a un array para poder recorrerlo
    const itemsArray = Object.values($cartItems);

    // Calcular total
    const total = itemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = itemsArray.reduce((acc, item) => acc + item.quantity, 0);

    // Generar mensaje de WhatsApp
    const handleCheckout = () => {
        let message = "Hola! Quiero realizar el siguiente pedido:\n\n";
        itemsArray.forEach(item => {
            message += `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toLocaleString('es-AR')}\n`;
        });
        message += `\n*Total: $${total.toLocaleString('es-AR')}*`;
        
        const phoneNumber = "549xxxxxxxxxx"; // PON TU NÚMERO AQUÍ
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <>
            {/* BOTÓN FLOTANTE (Siempre visible) */}
            <button 
                className="cart-trigger" 
                onClick={() => isCartOpen.set(!$isCartOpen)}
            >
                🛒
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </button>

            {/* PANEL LATERAL DEL CARRITO */}
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
                        ENVIAR PEDIDO POR WHATSAPP
                    </button>
                </div>
            </div>
            
            {/* Fondo oscuro al abrir */}
            {$isCartOpen && <div className="cart-overlay" onClick={() => isCartOpen.set(false)}></div>}
        </>
    );
}
