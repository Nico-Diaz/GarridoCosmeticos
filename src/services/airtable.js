const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.AIRTABLE_BASE_ID;

// TU TABLA NUEVA
const TABLE_ID = 'tblMWX7lSYtd3swTB'; 

export async function getProducts() {
    // URL con la vista específica (usando el ID de la vista que es más seguro)
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?maxRecords=300&view=viwR49bfBz41np9j6`;
    
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });
        
        if (!response.ok) {
            console.error(" Error Airtable:", response.status);
            return [];
        }

        const data = await response.json();

        return data.records.map(record => {
            // --- LIMPIEZA DE DATOS (El arreglo para los caracteres raros) ---
            
            // 1. Obtenemos la categoría (probamos con tilde, sin tilde o en inglés)
            const rawCat = record.fields.Categoria || record.fields['Categoría'] || record.fields.Category;
            
            // 2. MAGIA: Si es una lista ['Solar'], sacamos el texto. Si es texto, lo dejamos igual.
            const cleanCategory = Array.isArray(rawCat) ? rawCat[0] : rawCat;

            return {
                airtableId: record.id,
                id: record.fields.id || '000',
                name: record.fields.Nombre || 'Sin Nombre',
                
                // 3. Usamos la categoría limpia
                category: cleanCategory || 'General',
                
                description: record.fields.Descripcion || '', 
                price: record.fields.Precio || 0,
                oldPrice: record.fields.PrecioAnterior || null,
                isOffer: record.fields.Oferta || false,
                image: record.fields.Imagen || ''
            };
        });
    } catch (error) {
        console.error(" Error de conexión:", error);
        return [];
    }
}

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