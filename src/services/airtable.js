const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.AIRTABLE_BASE_ID;

// USAMOS EL ID DE LA TABLA (Más seguro que usar el nombre)
const TABLE_ID = 'tblCEBGw9wsrS3Yn0'; 

export async function getProducts() {
    // URL limpia sin filtros raros
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?maxRecords=300`;
    
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });
        
        if (!response.ok) return [];

        const data = await response.json();

        return data.records.map(record => {
            // --- LIMPIEZA DE DATOS ---
            // 1. Obtenemos el dato crudo de Airtable (puede ser "Solar" o ["Solar"])
            const rawCat = record.fields.Categoria || record.fields.Category;
            
            // 2. Si es una lista (Array), sacamos el primer elemento. Si es texto, lo dejamos igual.
            const cleanCategory = Array.isArray(rawCat) ? rawCat[0] : rawCat;

            return {
                airtableId: record.id,
                id: record.fields.id || '000',
                name: record.fields.Nombre || 'Sin Nombre',
                
                // 3. Guardamos la categoría limpia. Si está vacía, ponemos 'General'
                category: cleanCategory || 'General',
                
                price: record.fields.Precio || 0,
                oldPrice: record.fields.PrecioAnterior || null,
                isOffer: record.fields.Oferta || false,
                image: record.fields.Imagen || ''
            };
        });
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

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