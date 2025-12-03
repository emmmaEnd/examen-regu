
import {
  VALID_RESOURCES,
  fetchExternalResource,
  syncResourceToDb,
  listResourceFromDb,
  getResourceItemFromDb,
} from '../services/swapi.service.js';

function isValidResource(resource) {
  return VALID_RESOURCES.includes(resource);
}


export function getApiRoot(req, res) {
  const baseUrl = `${req.protocol}://${req.get('host')}/examen/api/v1`;

  return res.json({
    films: `${baseUrl}/films/`,
    people: `${baseUrl}/people/`,
    planets: `${baseUrl}/planets/`,
    species: `${baseUrl}/species/`,
    starships: `${baseUrl}/starships/`,
    vehicles: `${baseUrl}/vehicles/`,
  });
}

//=== Consultar SWAPI externa ========
export async function getExternalResourceController(req, res) {
  try {
    const { resource } = req.params;
    const { page = 1 } = req.query;

    if (!isValidResource(resource)) {
      return res.status(400).json({ message: `Recurso no soportado: ${resource}` });
    }

    const data = await fetchExternalResource(resource, page);
    return res.json(data);
  } catch (error) {
    console.error('Error al consultar SWAPI externa:', error);
    return res.status(500).json({ message: 'Error al consultar SWAPI externa' });
  }
}

// --- Sincronizar SWAPI -> BD ---
export async function syncResourceController(req, res) {
  try {
    const { resource } = req.params;

    if (!isValidResource(resource)) {
      return res.status(400).json({ message: `Recurso no soportado: ${resource}` });
    }

    const result = await syncResourceToDb(resource);

    return res.json({
      message: `Sincronización de ${resource} completada`,
      ...result,
    });
  } catch (error) {
    console.error('Error al sincronizar recurso SWAPI:', error);
    return res.status(500).json({ message: 'Error al sincronizar recurso SWAPI' });
  }
}

//===consultar desde BD (lista) =======
export async function listResourceFromDbController(req, res) {
  try {
    const { resource } = req.params;
    const { page = 1, page_size = 10 } = req.query;

    if (!isValidResource(resource)) {
      return res.status(400).json({ message: `Recurso no soportado: ${resource}` });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/examen/api/v1`;
    const data = await listResourceFromDb(resource, page, page_size, baseUrl);

    return res.json(data);
  } catch (error) {
    console.error('Error al consultar recurso desde BD:', error);
    return res.status(500).json({ message: 'Error al consultar recurso desde BD' });
  }
}

// --- Consultar desde BD (detalle) ===
export async function getResourceItemFromDbController(req, res) {
  try {
    const { resource, id } = req.params;

    if (!isValidResource(resource)) {
      return res.status(400).json({ message: `Recurso no soportado: ${resource}` });
    }

    const item = await getResourceItemFromDb(resource, id);

    if (!item) {
      return res.status(404).json({ message: 'Recurso no encontrado en BD' });
    }

    return res.json(item);
  } catch (error) {
    console.error('Error al consultar detalle desde BD:', error);
    return res.status(500).json({ message: 'Error al consultar detalle desde BD' });
  }
}
