export const POST = async ({ request }) => {
  const data = await request.json();
  
  const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
  const BASE_ID = import.meta.env.AIRTABLE_BASE_ID;
  const TABLE_ID = import.meta.env.AIRTABLE_ORDERS_TABLE_ID;

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

  // Preparamos el cuerpo del mensaje para Airtable
  const body = {
    records: [
      {
        fields: {
          "Nombre": "Pedido Web", // O podrías pedir el nombre al usuario si quisieras
          "Productos": data.products,
          "Total": data.total
        }
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Error en Airtable" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};