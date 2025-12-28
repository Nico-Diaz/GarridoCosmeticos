import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem, updateQuantity } from '../stores/cartStore';
import './Cart.css';

export default function Cart() {
    // Hooks de estado
    const $isCartOpen = useStore(isCartOpen);
    const $cartItems = useStore(cartItems);
    const [isLoading, setIsLoading] = useState(false);
    
    // Convertir mapa de productos a array para poder recorrerlo
    const itemsArray = Object.values($cartItems);

    // Calcular totales
    const total = itemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = itemsArray.reduce((acc, item) => acc + item.quantity, 0);

    // Función principal: Guardar en Airtable + WhatsApp
    const handleCheckout = async () => {
        setIsLoading(true); // Bloquear botón

        // 1. Preparar resumen para Airtable
        const productsSummary = itemsArray
            .map(item => `${item.name} (x${item.quantity})`)
            .join(', ');

        try {
            // Intentar guardar en Airtable vía nuestra API
            await fetch('/api/createOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    products: productsSummary,
                    total: total
                })
            });
        } catch (error) {
            console.error("Error guardando pedido en base de datos:", error);
            // No detenemos el flujo si falla Airtable, priorizamos la venta por WhatsApp
        }

        // 2. Configurar mensaje de WhatsApp
        // ¡IMPORTANTE! CAMBIA ESTE NÚMERO POR EL TUYO REAL
        const phoneNumber = "5492612461691"; 
        
        let message = "Hola Garrido Beauty! Quiero realizar el siguiente pedido:\n\n";
        
        itemsArray.forEach(item => {
            const subtotal = item.price * item.quantity;
            message += `- *${item.name}* (x${item.quantity}): $${subtotal.toLocaleString('es-AR')}\n`;
        });

        message += `\n*Total Final: $${total.toLocaleString('es-AR')}*`;
        message += "\n\nQuedo a la espera de los datos para el pago/envío. Gracias!";

        // 3. Abrir WhatsApp
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        setIsLoading(false); // Desbloquear botón
        window.open(url, '_blank');
    };

    return (
        <>
            {/* BOTÓN FLOTANTE */}
            <button 
                className="cart-trigger" 
                onClick={() => isCartOpen.set(!$isCartOpen)}
                aria-label="Abrir carrito"
            >
                🛒
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </button>

            {/* PANEL LATERAL (DRAWER) */}
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
                        disabled={itemsArray.length === 0 || isLoading}
                        onClick={handleCheckout}
                        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
                    >
                        {isLoading ? "Procesando..." : "ENVIAR PEDIDO POR WHATSAPP"}
                    </button>
                </div>
            </div>
            
            {/* FONDO OSCURO (OVERLAY) */}
            {$isCartOpen && <div className="cart-overlay" onClick={() => isCartOpen.set(false)}></div>}
        </>
    );
}