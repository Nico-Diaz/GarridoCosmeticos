import { updateProduct } from '../../services/airtable';
export const prerender = false;
export async function POST({ request }) {
    try {
        const data = await request.json();
        await updateProduct(data.id, data.price, data.isOffer);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Error actualizando" }), { status: 500 });
    }
}