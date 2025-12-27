import { useState, useEffect } from 'preact/hooks';
import '../styles/cart.css'; 

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [clientData, setClientData] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleAdd = (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (!btn) return;

            const quantity = parseInt(btn.dataset.quantity) || 1;
            const item = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: Number(btn.dataset.price),
                quantity: quantity
            };

            setCart(prevCart => {
                const existingItemIndex = prevCart.findIndex(i => i.id === item.id);
                if (existingItemIndex >= 0) {
                    const newCart = [...prevCart];
                    newCart[existingItemIndex].quantity += quantity;
                    return newCart;
                } else {
                    return [...prevCart, item];
                }
            });
            setIsOpen(true);
        };

        document.addEventListener('click', handleAdd);
        return () => document.removeEventListener('click', handleAdd);
    }, []);

    const removeFromCart = (indexToRemove) => {
        setCart(prevCart => prevCart.filter((_, index) => index !== indexToRemove));
        if (cart.length === 1) setIsOpen(false);
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setLoading(true);

        const orderText = cart.map(i => `${i.name} (x${i.quantity})`).join(', ');

        try {
            const res = await fetch('/api/create-order', {
                method: 'POST',
                body: JSON.stringify({
                    cliente: clientData.name,
                    telefono: clientData.phone,
                    pedido: orderText,
                    total: total
                })
            });

            if (res.ok) {
                alert('¡Pedido enviado! Gracias por elegir Garrido Beauty.');
                setCart([]);
                setIsOpen(false);
            } else {
                alert('Hubo un error al enviar el pedido.');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen && cart.length === 0) return null;

    return (
        <>
            <button class="cart-trigger" onClick={() => setIsOpen(true)}>
                🛒 <span class="cart-count">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
            </button>

            {isOpen && (
                <div class="cart-overlay">
                    <div class="cart-sidebar">
                        <div class="cart-header">
                            <h2>Tu Pedido</h2>
                            <button class="btn-close" onClick={() => setIsOpen(false)}>✕</button>
                        </div>

                        <ul class="cart-list">
                            {cart.length === 0 ? <p>Carrito vacío.</p> : 
                                cart.map((item, index) => (
                                    <li key={index} class="cart-item">
                                        <div class="item-info">
                                            <span class="item-name">
                                                {item.name} <span class="qty-badge">x{item.quantity}</span>
                                            </span>
                                            <div class="price-row">
                                                <small class="unit-price">${item.price.toLocaleString('es-AR')} c/u</small>
                                                <strong class="item-total-price">${(item.price * item.quantity).toLocaleString('es-AR')}</strong>
                                            </div>
                                        </div>
                                        <button class="btn-remove" onClick={() => removeFromCart(index)}>✕</button>
                                    </li>
                                ))
                            }
                        </ul>

                        <div class="cart-total">
                            <span>Total:</span>
                            <span>${total.toLocaleString('es-AR')}</span>
                        </div>

                        <form class="cart-form" onSubmit={handleSubmit}>
                            <input type="text" placeholder="Nombre completo" class="cart-input" required
                                value={clientData.name} onInput={(e) => setClientData({...clientData, name: e.target.value})} />
                            <input type="tel" placeholder="WhatsApp / Teléfono" class="cart-input" required
                                value={clientData.phone} onInput={(e) => setClientData({...clientData, phone: e.target.value})} />
                            <button type="submit" class="btn-confirm" disabled={loading}>
                                {loading ? 'Enviando...' : 'Confirmar Pedido'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}