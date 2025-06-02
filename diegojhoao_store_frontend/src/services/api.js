// services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'; 

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Categorías
  async getCategorias() {
    return this.request('/categorias/');
  }

  async getCategoria(id) {
    return this.request(`/categorias/${id}/`);
  }

  // Artículos
  async getArticulos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/articulos/${queryString ? `?${queryString}` : ''}`);
  }

  async getArticulo(id) {
    return this.request(`/articulos/${id}/`);
  }

  // Carousels
  async getCarousels(nombre = null) {
    const params = nombre ? `?nombre=${nombre}` : '';
    return this.request(`/carousels/${params}`);
  }

  // Navigation Links
  async getNavigationLinks(ubicacion = null) {
    const params = ubicacion ? `?ubicacion=${ubicacion}` : '';
    return this.request(`/navigation-links/${params}`);
  }

  // Content Blocks
  async getContentBlocks(identificador = null) {
    const params = identificador ? `?identificador=${identificador}` : '';
    return this.request(`/content-blocks/${params}`);
  }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;