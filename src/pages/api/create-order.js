export const prerender = false;

export async function POST({ request }) {
  const data = await request.json();
  
  // Variables de entorno
  const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
  const BASE_ID = import.meta.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = 'Pedidos'; 

  const body = {
    fields: {
      "Cliente": data.cliente,
      "Telefono": data.telefono,
      "Pedido": data.pedido, // Texto largo con los items
      "Total": data.total,
      "Fecha": new Date().toISOString()
    }
  };

  try {
      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      } else {
        const err = await response.json();
        return new Response(JSON.stringify({ error: err }), { status: 500 });
      }
  } catch (error) {
      return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}