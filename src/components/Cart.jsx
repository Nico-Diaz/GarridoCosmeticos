import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem, updateQuantity } from '../stores/cartStore';
import './Cart.css';

export default function Cart() {
    const $isCartOpen = useStore(isCartOpen);
    const $cartItems = useStore(cartItems);
    const [isLoading, setIsLoading] = useState(false);
    
    const itemsArray = Object.values($cartItems);
    const total = itemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = itemsArray.reduce((acc, item) => acc + item.quantity, 0);

    // --- CHECKOUT ---
    const handleCheckout = async () => {
        setIsLoading(true);

        // 1. FORMATO PARA AIRTABLE (Columna "Producto" en Pedidos)
        // Se verá: "[101002] Labial (x1), [101500] Crema (x2)"
        const productsSummary = itemsArray
            .map(item => `[${item.codigo || 'S/C'}] ${item.name} (x${item.quantity})`)
            .join(', ');

        try {
            const response = await fetch('/api/createOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    products: productsSummary,
                    total: total
                })
            });

            if (!response.ok) {
                console.error("⚠️ Error guardando en Airtable");
            } else {
                console.log("✅ Pedido guardado en Airtable");
            }

        } catch (error) {
            console.error("❌ Error de conexión:", error);
        }

        // 2. FORMATO PARA WHATSAPP
        const phoneNumber = "5492604686528";
        
        let message = "Hola Garrido Beauty! Quiero realizar el siguiente pedido:\n\n";
        
        itemsArray.forEach(item => {
            const subtotal = item.price * item.quantity;
            // Agregamos el código [1234] al mensaje
            message += `- [${item.codigo || 'S/C'}] *${item.name}* (x${item.quantity}): $${subtotal.toLocaleString('es-AR')}\n`;
        });

        message += `\n*Total Final: $${total.toLocaleString('es-AR')}*`;
        message += "\n\nQuedo a la espera de los datos para el pago/envío. Gracias!";

        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        setIsLoading(false);
        window.open(url, '_blank');
    };

    return (
        <>
            {/* Botón Flotante */}
            <button 
                className="cart-trigger" 
                onClick={() => isCartOpen.set(!$isCartOpen)}
                aria-label="Abrir carrito"
            >
                🛒 {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </button>

            {/* Panel Lateral */}
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
                                    {/* Mostramos el código chiquito en el carrito */}
                                    <p className="code-hint" style={{fontSize: '0.75rem', color: '#888'}}>
                                        Cód: {item.codigo || 'S/C'}
                                    </p>
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
                        disabled={itemsArray.length === 0 || isLoading}
                        onClick={handleCheckout}
                        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
                    >
                        {isLoading ? "Guardando..." : "ENVIAR PEDIDO POR WHATSAPP 📲"}
                    </button>
                </div>
            </div>
            
            {$isCartOpen && <div className="cart-overlay" onClick={() => isCartOpen.set(false)}></div>}
        </>
    );
}