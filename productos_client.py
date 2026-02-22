# productos_client.py
import os
import json
import requests

APP_DIR = os.path.dirname(os.path.abspath(__file__))

def _load_api_url_from_config() -> str | None:
    config_path = os.path.join(APP_DIR, "config_brand.json")
    if not os.path.exists(config_path):
        return None
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("api_url") or data.get("API_URL")
    except Exception:
        return None

_API_URL = _load_api_url_from_config()
if not _API_URL:
    # Sustituye por tu URL de Apps Script si no usas config_brand.json
    _API_URL = "https://script.google.com/macros/s/AKfycbyPeVRgMAPDe-UM0d08cVBQOdnUU31N603NzjgacT5ij6B5hbhW8p3yDf1wsUhPv8qC/exec"
API_URL = _API_URL

def _get_str(fields: dict, name: str) -> str:
    if not fields or name not in fields:
        return ""
    v = fields[name]
    if isinstance(v, dict) and "stringValue" in v:
        return v["stringValue"]
    return str(v)

def _get_int(fields: dict, name: str) -> int:
    if not fields or name not in fields:
        return 0
    v = fields[name]
    if isinstance(v, dict) and "integerValue" in v:
        try:
            return int(v["integerValue"])
        except Exception:
            return 0
    try:
        return int(v)
    except Exception:
        return 0

def map_firestore_doc(doc: dict) -> dict:
    fields = doc.get("fields", {}) or {}
    slug = ""
    name_path = doc.get("name") or ""
    if name_path:
        slug = name_path.split("/")[-1]
    nombre = _get_str(fields, "Nombre") or _get_str(fields, "nombre")
    categoria = (_get_str(fields, "Categoria")
                 or _get_str(fields, "categorias") or "")
    stock = _get_int(fields, "Stock") or _get_int(fields, "stock")
    precio = _get_int(fields, "Precio") or _get_int(fields, "precio")
    promo = _get_int(fields, "PrecioPromo") or _get_int(fields, "promo")
    costo = _get_int(fields, "CostoBase") or _get_int(fields, "costo")
    imagen = _get_str(fields, "ImagenPrincipal") or _get_str(fields, "imagen")
    return {
        "slug": slug,
        "nombre": nombre,
        "categoria": categoria,
        "stock": stock,
        "precio": precio,
        "promo": promo,
        "costo": costo,
        "imagen": imagen,
    }

def load_all_products() -> list[dict]:
    """
    Llama a la API de Apps Script y devuelve una lista de productos.
    La API retorna una lista de objetos JSON planos.
    """
    if not API_URL or "PEGAR_AQUI" in API_URL:
        print("[productos_client] ERROR: API_URL no está configurada.")
        return []

    try:
        resp = requests.get(
            API_URL,
            headers={"Accept": "application/json"},
            timeout=15,
        )
        resp.raise_for_status()
        
        # La API retorna directamente una lista de dicts o un dict con 'items'
        data = resp.json()
        
        items = []
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
             items = data.get("items") or data.get("documents") or []
        
        # Mapeo directo de campos (ya vienen planos)
        productos = []
        for p in items:
            # Aseguramos que los campos existan o tengan valores por defecto
            item = {
                "slug": p.get("slug", ""),
                "nombre": p.get("nombre", ""),
                "categoria": p.get("categoria", ""),
                "stock": int(p.get("stock") or 0),
                "precio": int(p.get("precio") or 0),
                "promo": int(p.get("promo") or 0),
                "costo": int(p.get("costo") or 0),
                "imagen": p.get("imagen", "") or p.get("url_imagen", ""),
            }
            productos.append(item)
            
        return productos

    except Exception as e:
        print("[productos_client] Error llamando a la API:", e)
        return []

def search_products_by_name(fragment: str, limit: int = 5) -> list[dict]:
    """
    Devuelve hasta 'limit' productos cuyo nombre contenga las palabras del
    fragmento. Se realiza una búsqueda flexible: todas las palabras del
    fragmento deben aparecer en algún orden dentro del nombre.
    Si no hay coincidencias, devuelve [].
    """
    if not fragment:
        return []
    frag = fragment.strip().lower()
    palabras = [p for p in frag.split() if p]
    if not palabras:
        return []
    productos = load_all_products()
    resultados = []
    for p in productos:
        nombre = (p.get("nombre") or "").lower()
        if all(token in nombre for token in palabras):
            resultados.append(p)
            if len(resultados) >= limit:
                break
    return resultados

def find_product_by_name_fragment(fragment: str):
    resultados = search_products_by_name(fragment, limit=1)
    return resultados[0] if resultados else None

def extract_slug_from_text(text: str) -> str | None:
    if not text:
        return None
    t = text.strip()
    if "/" in t:
        t = t.rsplit("/", 1)[-1]
    slug = t.strip().lower().replace(" ", "-")
    return slug or None

def find_product_by_slug(slug: str):
    if not slug:
        return None
    s = slug.strip().lower()
    productos = load_all_products()
    for p in productos:
        if (p.get("slug") or "").lower() == s:
            return p
    return None

