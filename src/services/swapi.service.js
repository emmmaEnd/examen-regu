// src/services/swapi.service.js
import axios from 'axios';
import { supabase } from '../config/supabaseClient.js';

const SWAPI_BASE_URL = 'https://swapi.dev/api';

const TABLES = {
  films: 'swapi_films',
  people: 'swapi_people',
  planets: 'swapi_planets',
  species: 'swapi_species',
  starships: 'swapi_starships',
  vehicles: 'swapi_vehicles',
};

export const VALID_RESOURCES = Object.keys(TABLES);

function ensureValidResource(resource) {
  if (!VALID_RESOURCES.includes(resource)) {
    throw new Error(`Recurso no soportado: ${resource}`);
  }
}

function getTableForResource(resource) {
  ensureValidResource(resource);
  return TABLES[resource];
}

function getIdFromUrl(url) {
  if (!url) return null;
  const parts = url.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  return parseInt(last, 10);
}

//====consulta API SWAPI externa ========
export async function fetchExternalResource(resource, page = 1) {
  ensureValidResource(resource);

  const url = `${SWAPI_BASE_URL}/${resource}/?page=${page}`;
  const response = await axios.get(url);
  return response.data; 
}

// trae todo los recursos de SWAPI 
export async function fetchAllExternal(resource) {
  ensureValidResource(resource);

  let url = `${SWAPI_BASE_URL}/${resource}/`;
  const allResults = [];

  while (url) {
    const response = await axios.get(url);
    const data = response.data;
    if (Array.isArray(data.results)) {
      allResults.push(...data.results);
    }
    url = data.next; // null o siguiente página
  }

  return allResults;
}

function buildRowForResource(resource, item) {
  const swapi_id = getIdFromUrl(item.url);

  if (resource === 'films') {
    return {
      swapi_id,
      title: item.title,
      raw: item,
    };
  }

  // regresa contenido genérico
  return {
    swapi_id,
    name: item.name,
    raw: item,
  };
}

//=====sincronizar el recurso externo a la bd===========
export async function syncResourceToDb(resource) {
  const items = await fetchAllExternal(resource);
  const table = getTableForResource(resource);

  const rows = items.map((item) => buildRowForResource(resource, item));

  const { data, error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: 'swapi_id' })
    .select('swapi_id');

  if (error) {
    throw error;
  }

  return {
    totalFromApi: items.length,
    upserted: data ? data.length : 0,
  };
}


// ======Consulta bd======================
export async function listResourceFromDb(resource, page = 1, pageSize = 10, baseUrl) {
  ensureValidResource(resource);
  const table = getTableForResource(resource);

  const pageNumber = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);
  const size = Number.isNaN(parseInt(pageSize, 10)) ? 10 : parseInt(pageSize, 10);

  const from = (pageNumber - 1) * size;
  const to = from + size - 1;

  const { data, error, count } = await supabase
    .from(table)
    .select('raw', { count: 'exact' })
    .range(from, to);

  if (error) {
    throw error;
  }

  const total = count || 0;
  const results = (data || []).map((row) => row.raw);

  const totalPages = size > 0 ? Math.ceil(total / size) : 1;
  const base = `${baseUrl}/${resource}/`;

  const next =
    pageNumber < totalPages
      ? `${base}?page=${pageNumber + 1}&page_size=${size}`
      : null;

  const previous =
    pageNumber > 1
      ? `${base}?page=${pageNumber - 1}&page_size=${size}`
      : null;

  return {
    count: total,
    next,
    previous,
    results,
  };
}

export async function getResourceItemFromDb(resource, id) {
  ensureValidResource(resource);
  const table = getTableForResource(resource);
  const numericId = parseInt(id, 10);

  const { data, error } = await supabase
    .from(table)
    .select('raw')
    .eq('swapi_id', numericId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? data.raw : null;
}
