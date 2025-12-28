// 👇 ¡ESTA LÍNEA ES LA SOLUCIÓN! 👇
export const prerender = false; 

export const POST = async ({ request }) => {
  console.log("📨 --- INICIO PROCESO DE PEDIDO ---");

  // --- FASE 1: LEER DATOS ---
  let data;
  try {
    const rawBody = await request.text();
    if (!rawBody) throw new Error("Cuerpo vacío");
    data = JSON.parse(rawBody);
    console.log("📦 Datos recibidos:", data);
  } catch (e) {
    console.error("❌ Error leyendo datos:", e.message);
    return new Response(JSON.stringify({ error: "No llegaron datos válidos" }), { status: 400 });
  }

  // --- FASE 2: VARIABLES ---
  const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
  const BASE_ID = import.meta.env.AIRTABLE_BASE_ID;
  const TABLE_ID = import.meta.env.AIRTABLE_ORDERS_TABLE_ID;

  if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_ID) {
    console.error("❌ Faltan variables .env");
    return new Response(JSON.stringify({ error: "Server Config Error" }), { status: 500 });
  }

  // --- FASE 3: ENVIAR A AIRTABLE ---
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
  
  const body = {
    records: [
      {
        fields: {
          "Productos": data.products,
          "Total": Number(data.total)
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

    const responseText = await response.text();

    if (!response.ok) {
        console.error("❌ Error de Airtable:", responseText);
        return new Response(responseText, { status: response.status });
    }

    console.log("✅ ¡PEDIDO GUARDADO EN AIRTABLE!");
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};