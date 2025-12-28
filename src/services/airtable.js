const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.AIRTABLE_BASE_ID;

// TU TABLA NUEVA
const TABLE_ID = 'tblMWX7lSYtd3swTB'; 

export const getProducts = async () => {
    console.log("🔍 --- INICIANDO CONEXIÓN A AIRTABLE ---");
    
    const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
    const BASE_ID = import.meta.env.AIRTABLE_BASE_ID;
    const TABLE_ID = import.meta.env.AIRTABLE_PRODUCTS_TABLE_ID;

    // 1. VERIFICACIÓN DE VARIABLES
    if (!AIRTABLE_API_KEY) console.error("❌ Faltan la API KEY");
    if (!BASE_ID) console.error("❌ Falta el BASE ID");
    if (!TABLE_ID) console.error("❌ Falta el TABLE ID (Productos)");

    // 2. URL SIMPLE (Sin ?view=Grilla... para probar primero)
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`; 
    console.log("🌐 Consultando URL:", url);

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });

        // 3. VERIFICAR SI AIRTABLE NOS RECHAZA
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ ERROR CRÍTICO DE AIRTABLE:", response.status, errorText);
            return [];
        }

        const data = await response.json();
        const records = data.records || [];

        console.log(`📦 Airtable respondió con ${records.length} productos.`);

        if (records.length === 0) {
            console.warn("⚠️ La conexión funcionó, pero la tabla parece vacía.");
        } else {
            console.log("✅ Primer producto encontrado (Raw):", JSON.stringify(records[0].fields));
        }

        // 4. MAPEO DE DATOS
        return records.map(record => {
            const f = record.fields;
            return {
                id: record.id,
                codigo: f.id || 'S/C',
                name: f.Nombre || 'Sin Nombre',
                price: f.Precio || 0,
                category: f.Categoria || 'General',
                image: f.Imagen ? f.Imagen[0].url : null,
                description: f.Descripcion || '',
                oldPrice: f['Precio Anterior'],
                isOffer: f.Oferta
            };
        });

    } catch (error) {
        console.error("❌ ERROR DE RED/CÓDIGO:", error);
        return [];
    }
};

// Función para actualizar precios (se mantiene igual)
export async function updateProduct(airtableId, newPrice, isOffer) {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${airtableId}`;
    
    const body = {
        fields: {
            "Precio": parseInt(newPrice),
            "Oferta": isOffer
        }
    };

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    return response.json();
}