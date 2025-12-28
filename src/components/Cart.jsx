import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isCartOpen, cartItems, removeCartItem, updateQuantity } from '../stores/cartStore';
import './Cart.css';

export default function Cart() {
    // Hooks de estado y tienda
    const $isCartOpen = useStore(isCartOpen);
    const $cartItems = useStore(cartItems);
    const [isLoading, setIsLoading] = useState(false);
    
    // Convertir el objeto de productos a un array para poder recorrerlo
    const itemsArray = Object.values($cartItems);

    // Calcular totales
    const total = itemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = itemsArray.reduce((acc, item) => acc + item.quantity, 0);

    // --- FUNCIÓN PRINCIPAL DE CHECKOUT ---
    const handleCheckout = async () => {
        setIsLoading(true); // Activar modo "cargando"

        // 1. Preparar el resumen de productos para Airtable
        const productsSummary = itemsArray
            .map(item => `${item.name} (x${item.quantity})`)
            .join(', ');

        // Debug: Ver en la consola del navegador qué estamos enviando
        console.log("🛒 Enviando a Airtable:", { products: productsSummary, total: total });

        try {
            // 2. Enviar a nuestra API (Backend)
            const response = await fetch('/api/createOrder', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                // ¡AQUÍ ESTABA EL ERROR ANTES! AHORA ESTÁ CORREGIDO:
                body: JSON.stringify({
                    products: productsSummary,
                    total: total
                })
            });

            // Leer respuesta del servidor (sin romper si falla)
            const resultText = await response.text();
            
            if (!response.ok) {
                console.error("⚠️ Airtable reportó un problema:", resultText);
            } else {
                console.log("✅ Pedido guardado en Airtable:", resultText);
            }

        } catch (error) {
            console.error("❌ Error de conexión con la API:", error);
            // No detenemos el flujo, seguimos hacia WhatsApp para no perder la venta
        }

        // 3. Configurar Mensaje de WhatsApp
        // ⚠️ IMPORTANTE: REEMPLAZA ESTO CON TU NÚMERO REAL
        const phoneNumber = "5492612461691"; 
        
        let message = "Hola Garrido Beauty! 👋 Quiero realizar el siguiente pedido:\n\n";
        
        itemsArray.forEach(item => {
            const subtotal = item.price * item.quantity;
            message += `- *${item.name}* (x${item.quantity}): $${subtotal.toLocaleString('es-AR')}\n`;
        });

        message += `\n*Total Final: $${total.toLocaleString('es-AR')}*`;
        message += "\n\nQuedo a la espera de los datos para el pago/envío. Gracias!";

        // 4. Abrir WhatsApp
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        setIsLoading(false); // Desactivar modo "cargando"
        window.open(url, '_blank');
    };

    return (
        <>
            {/* BOTÓN FLOTANTE DEL CARRITO */}
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
                    
                    {/* BOTÓN DE ENVIAR */}
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
            
            {/* FONDO OSCURO (Overlay para cerrar al hacer click fuera) */}
            {$isCartOpen && <div className="cart-overlay" onClick={() => isCartOpen.set(false)}></div>}
        </>
    );
}