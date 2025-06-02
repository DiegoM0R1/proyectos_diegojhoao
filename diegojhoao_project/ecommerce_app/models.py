# ecommerce_app/models.py

from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User # Para futuras referencias a usuarios

# Modelo para las Categorías de los artículos
class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la categoría")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    slug = models.SlugField(max_length=120, unique=True, blank=True, help_text="Dejar en blanco para autogenerar")
    activo = models.BooleanField(default=True, verbose_name="¿Está activa?")
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden de aparición")
    imagen_categoria = models.ImageField(upload_to='categorias/', blank=True, null=True, verbose_name="Imagen de la Categoría")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['orden', 'nombre']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre

# Modelo para las Imágenes (banco de imágenes)
class Imagen(models.Model):
    nombre_archivo = models.CharField(max_length=255, blank=True, verbose_name="Nombre del archivo (opcional)")
    imagen = models.ImageField(upload_to='banco_imagenes/', verbose_name="Archivo de imagen")
    alt_text = models.CharField(max_length=255, blank=True, null=True, verbose_name="Texto alternativo (SEO)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de subida")

    class Meta:
        verbose_name = "Imagen"
        verbose_name_plural = "Banco de Imágenes"
        ordering = ['-created_at']

    def __str__(self):
        return self.nombre_archivo or self.imagen.name

# Modelo para los Artículos (ropa)
class Articulo(models.Model):
    categoria = models.ForeignKey(Categoria, related_name='articulos', on_delete=models.SET_NULL, null=True, verbose_name="Categoría")
    nombre = models.CharField(max_length=200, verbose_name="Nombre del artículo")
    descripcion = models.TextField(verbose_name="Descripción detallada")
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.PositiveIntegerField(default=0, verbose_name="Cantidad en stock")
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True, verbose_name="SKU (Código único)")
    activo = models.BooleanField(default=True, verbose_name="¿Visible para clientes?")
    destacado = models.BooleanField(default=False, verbose_name="¿Artículo destacado?")
    # Imagen principal directamente en el artículo para simplificar, o se puede usar ArticuloImagen
    imagen_principal = models.ImageField(upload_to='articulos_principales/', blank=True, null=True, verbose_name="Imagen Principal del Artículo")
    # Relación a través de ArticuloImagen para múltiples imágenes
    imagenes_galeria = models.ManyToManyField(Imagen, through='ArticuloImagen', related_name='articulos_galeria', blank=True, verbose_name="Imágenes de Galería")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        verbose_name = "Artículo"
        verbose_name_plural = "Artículos"
        ordering = ['-created_at', 'nombre']

    def __str__(self):
        return self.nombre

# Modelo intermedio para la relación muchos-a-muchos entre Artículo e Imagen (para la galería)
class ArticuloImagen(models.Model):
    articulo = models.ForeignKey(Articulo, on_delete=models.CASCADE, verbose_name="Artículo")
    imagen = models.ForeignKey(Imagen, on_delete=models.CASCADE, verbose_name="Imagen del Banco")
    es_principal = models.BooleanField(default=False, verbose_name="¿Es imagen principal?") # Podría usarse en lugar de imagen_principal en Articulo
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden en la galería")

    class Meta:
        verbose_name = "Imagen de Artículo"
        verbose_name_plural = "Imágenes de Artículos"
        ordering = ['articulo', 'orden']
        unique_together = ('articulo', 'imagen') # Evita duplicados

    def __str__(self):
        return f"Imagen de {self.articulo.nombre} - {self.imagen.nombre_archivo or self.imagen.name}"

# Modelo para los Tipos de Filtro (ej: Color, Talla)
class Filtro(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre del filtro")
    # El campo 'tipo' del ERD puede ser útil para la lógica de UI, pero no es estrictamente necesario para la estructura básica
    # tipo = models.CharField(max_length=50, choices=[('color', 'Color'), ('talla', 'Talla'), ('marca', 'Marca')], verbose_name="Tipo de Filtro")
    activo = models.BooleanField(default=True, verbose_name="¿Filtro activo?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        verbose_name = "Tipo de Filtro"
        verbose_name_plural = "Tipos de Filtros"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

# Modelo para los Valores de los Filtros (ej: Rojo, XL, Nike)
class FiltroValor(models.Model):
    filtro = models.ForeignKey(Filtro, related_name='valores', on_delete=models.CASCADE, verbose_name="Tipo de Filtro")
    valor = models.CharField(max_length=100, verbose_name="Valor del filtro")
    color_hex = models.CharField(max_length=7, blank=True, null=True, verbose_name="Código Hexadecimal del Color (ej: #FF0000)")
    activo = models.BooleanField(default=True, verbose_name="¿Valor activo?")
    # Relación ManyToMany con Articulo para aplicar este valor de filtro a artículos
    articulos = models.ManyToManyField(Articulo, related_name='filtros_aplicados', blank=True, through='ArticuloFiltroValor', verbose_name="Artículos con este filtro")


    class Meta:
        verbose_name = "Valor de Filtro"
        verbose_name_plural = "Valores de Filtros"
        ordering = ['filtro', 'valor']
        unique_together = ('filtro', 'valor') # Un valor debe ser único dentro de su tipo de filtro

    def __str__(self):
        return f"{self.filtro.nombre}: {self.valor}"

# Modelo intermedio para la relación muchos-a-muchos entre Artículo y FiltroValor
class ArticuloFiltroValor(models.Model):
    articulo = models.ForeignKey(Articulo, on_delete=models.CASCADE, verbose_name="Artículo")
    filtro_valor = models.ForeignKey(FiltroValor, on_delete=models.CASCADE, verbose_name="Valor de Filtro")
    
    class Meta:
        verbose_name = "Filtro Aplicado a Artículo"
        verbose_name_plural = "Filtros Aplicados a Artículos"
        unique_together = ('articulo', 'filtro_valor') # Un artículo no puede tener el mismo valor de filtro dos veces

    def __str__(self):
        return f"{self.articulo.nombre} - {self.filtro_valor}"

# Modelo de Configuración General (opcional para el inicio, pero útil)
class Configuracion(models.Model):
    clave = models.CharField(max_length=100, unique=True, verbose_name="Clave de configuración")
    valor = models.TextField(verbose_name="Valor")
    descripcion = models.CharField(max_length=255, blank=True, null=True, verbose_name="Descripción")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última actualización")

    class Meta:
        verbose_name = "Configuración"
        verbose_name_plural = "Configuraciones"

    def __str__(self):
        return self.clave

# --- Modelos para Carrusel de Imágenes ---
class Carousel(models.Model):
    nombre = models.CharField(max_length=100, unique=True, help_text="Identificador del carrusel (ej: 'principal', 'ofertas')")
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Carrusel"
        verbose_name_plural = "Carruseles"

class CarouselSlide(models.Model):
    carousel = models.ForeignKey(Carousel, related_name='slides', on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='carousels/', verbose_name="Imagen del slide")
    # Usaremos el modelo Imagen existente si quieres reutilizar imágenes del banco de imágenes
    # imagen_banco = models.ForeignKey(Imagen, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Imagen del Banco")
    titulo = models.CharField(max_length=200, blank=True, null=True, help_text="Título opcional que se superpone a la imagen")
    subtitulo = models.TextField(blank=True, null=True, help_text="Subtítulo o descripción opcional")
    enlace_url = models.URLField(max_length=300, blank=True, null=True, help_text="URL a la que enlaza el slide (opcional)")
    orden = models.PositiveIntegerField(default=0, help_text="Orden de aparición del slide")
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Slide para {self.carousel.nombre} (Orden: {self.orden})"

    class Meta:
        verbose_name = "Slide de Carrusel"
        verbose_name_plural = "Slides de Carrusel"
        ordering = ['carousel', 'orden']

# --- Modelo para Enlaces de Navegación ---
class NavigationLink(models.Model):
    LOCATION_CHOICES = [
        ('header', 'Cabecera'),
        ('footer_col1', 'Pie de Página - Columna 1'),
        ('footer_col2', 'Pie de Página - Columna 2'),
        # Añade más ubicaciones según necesites
    ]
    texto_del_enlace = models.CharField(max_length=100)
    url_o_ruta = models.CharField(max_length=300, help_text="URL completa (ej: https://ejemplo.com) o ruta interna (ej: /tienda)")
    ubicacion = models.CharField(max_length=20, choices=LOCATION_CHOICES, default='header')
    orden = models.PositiveIntegerField(default=0)
    abrir_en_nueva_pestana = models.BooleanField(default=False, help_text="Marcar si el enlace debe abrirse en una nueva pestaña")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.texto_del_enlace} ({self.get_ubicacion_display()})"

    class Meta:
        verbose_name = "Enlace de Navegación"
        verbose_name_plural = "Enlaces de Navegación"
        ordering = ['ubicacion', 'orden']

# --- Modelo para Bloques de Contenido Genéricos ---
class ContentBlock(models.Model):
    identificador = models.SlugField(max_length=100, unique=True, help_text="Identificador único para este bloque (ej: 'banner-bienvenida-home', 'aviso-envios')")
    titulo = models.CharField(max_length=200, blank=True, null=True)
    contenido_html = models.TextField(blank=True, null=True, help_text="Contenido principal del bloque. Puede ser HTML.")
    # Podrías usar un RichTextField si instalas django-ckeditor o similar
    imagen_asociada = models.ImageField(upload_to='content_blocks/', blank=True, null=True)
    enlace_url = models.URLField(max_length=300, blank=True, null=True, help_text="URL a la que podría enlazar este bloque (opcional)")
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.identificador

    class Meta:
        verbose_name = "Bloque de Contenido"
        verbose_name_plural = "Bloques de Contenido"

# Create your models here.
