/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: { // Extiende el tema existente
      colors: {
        // Tus colores personalizados de la paleta
        'brand-muted-mauve': '#765D67',
        'brand-deep-plum': '#6D3C52',
        'brand-dark-wine': '#4B2138',
        'brand-almost-black': '#1B0C1A', // Nombre más genérico si es casi negro
        'brand-charcoal-purple': '#2D222F',
        'brand-pale-pink': '#FADCD5',

        // Opcional: Asignar roles semánticos a algunos de estos colores
        // Esto te ayuda a ser consistente. Puedes elegir cuál es cuál.
        'primary': '#4B2138',       // ej. Dark Wine como primario
        'secondary': '#6D3C52',    // ej. Deep Plum como secundario
        'accent': '#765D67',       // ej. Muted Mauve como acento
        'background-light': '#FADCD5', // ej. Pale Pink para fondos claros
        'text-dark': '#1B0C1A',       // ej. Almost Black para texto principal oscuro
        'text-light': '#FADCD5',      // ej. Pale Pink para texto sobre fondos oscuros
        'surface-dark': '#2D222F',    // ej. Charcoal Purple para superficies oscuras
      }
    },
  },
  plugins: [],
}