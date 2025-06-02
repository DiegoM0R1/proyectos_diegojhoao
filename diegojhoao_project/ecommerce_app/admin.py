# ecommerce_app/admin.py - Versión mejorada con estilos personalizados

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import SimpleListFilter
from django.db.models import Count, Q
from .models import (
    Categoria, Imagen, Articulo, ArticuloImagen, Filtro, FiltroValor, 
    ArticuloFiltroValor, Configuracion, Carousel, CarouselSlide, 
    NavigationLink, ContentBlock
)

# ==============================================
# CONFIGURACIÓN GLOBAL DEL ADMIN
# ==============================================

# Personalizar títulos del admin
admin.site.site_header = "🛍️ Mi E-commerce Admin"
admin.site.site_title = "E-commerce Admin"
admin.site.index_title = "Panel de Administración"

# ==============================================
# FILTROS PERSONALIZADOS
# ==============================================

class StockFilter(SimpleListFilter):
    title = 'Estado del Stock'
    parameter_name = 'stock_status'

    def lookups(self, request, model_admin):
        return (
            ('low', '⚠️ Stock Bajo (< 10)'),
            ('medium', '📦 Stock Medio (10-50)'),
            ('high', '✅ Stock Alto (> 50)'),
            ('empty', '❌ Sin Stock'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'low':
            return queryset.filter(stock__lt=10, stock__gt=0)
        if self.value() == 'medium':
            return queryset.filter(stock__gte=10, stock__lte=50)
        if self.value() == 'high':
            return queryset.filter(stock__gt=50)
        if self.value() == 'empty':
            return queryset.filter(stock=0)

class PrecioFilter(SimpleListFilter):
    title = 'Rango de Precios'
    parameter_name = 'precio_range'

    def lookups(self, request, model_admin):
        return (
            ('low', '💰 Económico (< S/50)'),
            ('medium', '💳 Medio (S/50-200)'),
            ('high', '💎 Premium (> S/200)'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'low':
            return queryset.filter(precio__lt=50)
        if self.value() == 'medium':
            return queryset.filter(precio__gte=50, precio__lte=200)
        if self.value() == 'high':
            return queryset.filter(precio__gt=200)

# ==============================================
# INLINES MEJORADOS
# ==============================================

class ArticuloImagenInline(admin.TabularInline):
    model = ArticuloImagen
    extra = 1
    readonly_fields = ('imagen_preview',)
    autocomplete_fields = ['imagen']
    
    def imagen_preview(self, obj):
        if obj.imagen and obj.imagen.imagen:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />',
                obj.imagen.imagen.url
            )
        return "Sin imagen"
    imagen_preview.short_description = '🖼️ Preview'

class ArticuloFiltroValorInline(admin.TabularInline):
    model = ArticuloFiltroValor
    extra = 1
    autocomplete_fields = ['filtro_valor']

class CarouselSlideInline(admin.TabularInline):
    model = CarouselSlide
    extra = 1
    ordering = ('orden',)
    readonly_fields = ('imagen_preview',)
    fields = ('imagen', 'imagen_preview', 'titulo', 'subtitulo', 'enlace_url', 'orden', 'activo')
    
    def imagen_preview(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 4px;" />',
                obj.imagen.url
            )
        return "Sin imagen"
    imagen_preview.short_description = '🖼️ Preview'

class FiltroValorInline(admin.TabularInline):
    model = FiltroValor
    extra = 1
    readonly_fields = ('color_preview',)
    
    def color_preview(self, obj):
        if obj.color_hex:
            return format_html(
                '<div style="width: 30px; height: 30px; background-color: {}; border-radius: 50%; border: 2px solid #ddd; display: inline-block;"></div>',
                obj.color_hex
            )
        return "Sin color"
    color_preview.short_description = '🎨 Color'

# ==============================================
# ADMIN CLASSES MEJORADAS
# ==============================================

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre_con_icono', 'slug', 'estado_visual', 'orden', 'imagen_preview', 'articulos_count', 'fecha_creacion')
    list_filter = ('activo', 'created_at')
    search_fields = ('nombre', 'descripcion')
    prepopulated_fields = {'slug': ('nombre',)}
    list_editable = ('orden',)
    readonly_fields = ('imagen_preview', 'articulos_count')
    
    fieldsets = (
        ('📝 Información Básica', {
            'fields': ('nombre', 'slug', 'descripcion')
        }),
        ('🖼️ Imagen', {
            'fields': ('imagen_categoria', 'imagen_preview'),
            'classes': ('collapse',)
        }),
        ('⚙️ Configuración', {
            'fields': ('activo', 'orden'),
        }),
        ('📊 Estadísticas', {
            'fields': ('articulos_count',),
            'classes': ('collapse',)
        }),
    )
    
    def nombre_con_icono(self, obj):
        return format_html(
            '<span style="font-weight: bold;">📁 {}</span>',
            obj.nombre
        )
    nombre_con_icono.short_description = 'Categoría'
    
    def estado_visual(self, obj):
        if obj.activo:
            return format_html(
                '<span style="color: #27ae60; font-weight: bold;">✅ Activo</span>'
            )
        return format_html(
            '<span style="color: #e74c3c; font-weight: bold;">❌ Inactivo</span>'
        )
    estado_visual.short_description = 'Estado'
    
    def imagen_preview(self, obj):
        if obj.imagen_categoria:
            return format_html(
                '<img src="{}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />',
                obj.imagen_categoria.url
            )
        return format_html('<div style="color: #999;">Sin imagen</div>')
    imagen_preview.short_description = '🖼️ Imagen'
    
    def articulos_count(self, obj):
        count = obj.articulos.count()
        return format_html(
            '<span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">{} artículos</span>',
            count
        )
    articulos_count.short_description = '📦 Artículos'
    
    def fecha_creacion(self, obj):
        return obj.created_at.strftime("%d/%m/%Y")
    fecha_creacion.short_description = '📅 Creado'

@admin.register(Imagen)
class ImagenAdmin(admin.ModelAdmin):
    list_display = ('imagen_preview', 'nombre_archivo', 'alt_text', 'tamaño_archivo', 'fecha_subida')
    search_fields = ('nombre_archivo', 'alt_text')
    readonly_fields = ('imagen_preview_grande', 'info_archivo')
    list_per_page = 20
    
    fieldsets = (
        ('🖼️ Imagen', {
            'fields': ('imagen', 'imagen_preview_grande')
        }),
        ('📝 Información', {
            'fields': ('alt_text', 'info_archivo')
        }),
    )
    
    def imagen_preview(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer;" onclick="window.open(\'{}\', \'_blank\')" title="Click para ver en tamaño completo" />',
                obj.imagen.url, obj.imagen.url
            )
        return "Sin imagen"
    imagen_preview.short_description = '🖼️ Preview'
    
    def imagen_preview_grande(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />',
                obj.imagen.url
            )
        return "Sin imagen"
    imagen_preview_grande.short_description = '🖼️ Vista Previa'
    
    def tamaño_archivo(self, obj):
        if obj.imagen:
            size = obj.imagen.size
            if size < 1024:
                return f"{size} B"
            elif size < 1024*1024:
                return f"{size/1024:.1f} KB"
            else:
                return f"{size/(1024*1024):.1f} MB"
        return "N/A"
    tamaño_archivo.short_description = '📊 Tamaño'
    
    def fecha_subida(self, obj):
        return obj.created_at.strftime("%d/%m/%Y %H:%M")
    fecha_subida.short_description = '📅 Subido'
    
    def info_archivo(self, obj):
        if obj.imagen:
            return format_html(
                '<div style="background: #f8f9fa; padding: 10px; border-radius: 8px; border-left: 4px solid #3498db;">'
                '<strong>📄 Archivo:</strong> {}<br>'
                '<strong>📊 Tamaño:</strong> {}<br>'
                '<strong>📐 Dimensiones:</strong> Información no disponible<br>'
                '<strong>🔗 URL:</strong> <a href="{}" target="_blank">{}</a>'
                '</div>',
                obj.nombre_archivo,
                self.tamaño_archivo(obj),
                obj.imagen.url,
                obj.imagen.url
            )
        return "Sin información"
    info_archivo.short_description = 'ℹ️ Información del Archivo'

@admin.register(Articulo)
class ArticuloAdmin(admin.ModelAdmin):
    list_display = (
        'nombre_con_imagen', 'categoria_con_color','precio', 'precio_formateado', 
        'stock_visual', 'estado_completo', 'fecha_actualizacion'
    )
    list_filter = (StockFilter, PrecioFilter, 'activo', 'destacado', 'categoria')
    search_fields = ('nombre', 'descripcion', 'sku', 'categoria__nombre')
    list_editable = ('precio',)
    autocomplete_fields = ['categoria']
    inlines = [ArticuloImagenInline, ArticuloFiltroValorInline]
    readonly_fields = ('imagen_principal_preview', 'estadisticas_articulo')
    list_per_page = 20
    
    fieldsets = (
        ('📝 Información Básica', {
            'fields': ('nombre', 'sku', 'categoria', 'descripcion'),
            'classes': ('wide',)
        }),
        ('💰 Precio y Stock', {
            'fields': ('precio', 'stock'),
            'classes': ('wide',)
        }),
        ('👁️ Visibilidad', {
            'fields': ('activo', 'destacado'),
            'classes': ('wide',)
        }),
        ('🖼️ Imagen Principal', {
            'fields': ('imagen_principal', 'imagen_principal_preview'),
            'classes': ('collapse',)
        }),
        ('📊 Estadísticas', {
            'fields': ('estadisticas_articulo',),
            'classes': ('collapse',)
        }),
    )
    
    def nombre_con_imagen(self, obj):
        if obj.imagen_principal:
            return format_html(
                '<div style="display: flex; align-items: center; gap: 10px;">'
                '<img src="{}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;" />'
                '<strong>{}</strong>'
                '</div>',
                obj.imagen_principal.url,
                obj.nombre
            )
        return format_html('<strong>📦 {}</strong>', obj.nombre)
    nombre_con_imagen.short_description = 'Artículo'
    
    def categoria_con_color(self, obj):
        return format_html(
            '<span style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">📁 {}</span>',
            obj.categoria.nombre
        )
    categoria_con_color.short_description = 'Categoría'
    
    def precio_formateado(self, obj):
        return format_html(
            '<span style="font-weight: bold; color: #27ae60; font-size: 14px;">S/ {}</span>',
            f"{obj.precio:.2f}"
        )
    precio_formateado.short_description = '💰 Precio'
    
    def stock_visual(self, obj):
        if obj.stock == 0:
            color = '#e74c3c'
            icon = '❌'
            text = 'Sin Stock'
        elif obj.stock < 10:
            color = '#f39c12'
            icon = '⚠️'
            text = f'{obj.stock} unid.'
        elif obj.stock <= 50:
            color = '#3498db'
            icon = '📦'
            text = f'{obj.stock} unid.'
        else:
            color = '#27ae60'
            icon = '✅'
            text = f'{obj.stock} unid.'
            
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, icon, text
        )
    stock_visual.short_description = '📊 Stock'
    
    def estado_completo(self, obj):
        estados = []
        if obj.activo:
            estados.append('<span style="background: #27ae60; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">✅ ACTIVO</span>')
        else:
            estados.append('<span style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">❌ INACTIVO</span>')
            
        if obj.destacado:
            estados.append('<span style="background: #f39c12; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">⭐ DESTACADO</span>')
            
        return format_html('<br>'.join(estados))
    estado_completo.short_description = 'Estado'
    
    def fecha_actualizacion(self, obj):
        return obj.updated_at.strftime("%d/%m/%Y")
    fecha_actualizacion.short_description = '📅 Actualizado'
    
    def imagen_principal_preview(self, obj):
        if obj.imagen_principal:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />',
                obj.imagen_principal.url
            )
        return "Sin imagen principal"
    imagen_principal_preview.short_description = '🖼️ Vista Previa'
    
    def estadisticas_articulo(self, obj):
        total_imagenes = obj.imagenes_galeria.count()
        total_filtros = obj.filtros_aplicados.count()
        
        return format_html(
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">'
            '<h4 style="margin-top: 0; color: #2c3e50;">📊 Estadísticas del Artículo</h4>'
            '<p><strong>🖼️ Imágenes en galería:</strong> {}</p>'
            '<p><strong>🏷️ Filtros aplicados:</strong> {}</p>'
            '<p><strong>📅 Creado:</strong> {}</p>'
            '<p><strong>🔄 Última actualización:</strong> {}</p>'
            '</div>',
            total_imagenes,
            total_filtros,
            obj.created_at.strftime("%d/%m/%Y %H:%M"),
            obj.updated_at.strftime("%d/%m/%Y %H:%M")
        )
    estadisticas_articulo.short_description = 'ℹ️ Estadísticas'

@admin.register(Filtro)
class FiltroAdmin(admin.ModelAdmin):
    list_display = ('nombre_con_icono', 'activo', 'estado_visual', 'valores_count', 'fecha_creacion') # Añadido 'activo'
    list_filter = ('activo', 'created_at')
    search_fields = ('nombre',)
    list_editable = ('activo',)
    inlines = [FiltroValorInline]
    readonly_fields = ('valores_count', 'estadisticas_filtro')
    
    fieldsets = (
        ('📝 Información del Filtro', {
            'fields': ('nombre', 'activo')
        }),
        ('📊 Estadísticas', {
            'fields': ('valores_count', 'estadisticas_filtro'),
            'classes': ('collapse',)
        }),
    )
    
    def nombre_con_icono(self, obj):
        return format_html('<span style="font-weight: bold;">🏷️ {}</span>', obj.nombre)
    nombre_con_icono.short_description = 'Filtro'
    
    def estado_visual(self, obj):
        if obj.activo:
            return format_html('<span style="color: #27ae60; font-weight: bold;">✅ Activo</span>')
        return format_html('<span style="color: #e74c3c; font-weight: bold;">❌ Inactivo</span>')
    estado_visual.short_description = 'Estado'
    
    def valores_count(self, obj):
        count = obj.valores.count()
        return format_html(
            '<span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">{} valores</span>',
            count
        )
    valores_count.short_description = '📊 Valores'
    
    def fecha_creacion(self, obj):
        return obj.created_at.strftime("%d/%m/%Y")
    fecha_creacion.short_description = '📅 Creado'
    
    def estadisticas_filtro(self, obj):
        valores_activos = obj.valores.filter(activo=True).count()
        valores_inactivos = obj.valores.filter(activo=False).count()
        
        return format_html(
            '<div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">'
            '<strong>✅ Valores activos:</strong> {}<br>'
            '<strong>❌ Valores inactivos:</strong> {}<br>'
            '<strong>📊 Total valores:</strong> {}'
            '</div>',
            valores_activos, valores_inactivos, valores_activos + valores_inactivos
        )
    estadisticas_filtro.short_description = 'ℹ️ Estadísticas'

@admin.register(FiltroValor)
class FiltroValorAdmin(admin.ModelAdmin):
    list_display = ('valor_con_color', 'filtro_nombre', 'activo', 'estado_visual', 'articulos_count') # Añadido 'activo'
    list_filter = ('activo', 'filtro')
    search_fields = ('valor', 'filtro__nombre')
    list_editable = ('activo',) 
    autocomplete_fields = ['filtro']
    readonly_fields = ('articulos_count',)
    
    def valor_con_color(self, obj):
        if obj.color_hex:
            return format_html(
                '<div style="display: flex; align-items: center; gap: 8px;">'
                '<div style="width: 20px; height: 20px; background-color: {}; border-radius: 50%; border: 2px solid #ddd;"></div>'
                '<strong>{}</strong>'
                '</div>',
                obj.color_hex, obj.valor
            )
        return format_html('<strong>🏷️ {}</strong>', obj.valor)
    valor_con_color.short_description = 'Valor'
    
    def filtro_nombre(self, obj):
        return format_html(
            '<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">🏷️ {}</span>',
            obj.filtro.nombre
        )
    filtro_nombre.short_description = 'Filtro'
    
    def estado_visual(self, obj):
        if obj.activo:
            return format_html('<span style="color: #27ae60; font-weight: bold;">✅ Activo</span>')
        return format_html('<span style="color: #e74c3c; font-weight: bold;">❌ Inactivo</span>')
    estado_visual.short_description = 'Estado'
    
    def articulos_count(self, obj):
        count = obj.articulos_con_filtro.count()
        return format_html(
            '<span style="background: #9b59b6; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">{} artículos</span>',
            count
        )
    articulos_count.short_description = '📦 Artículos'

@admin.register(Configuracion)
class ConfiguracionAdmin(admin.ModelAdmin):
    list_display = ('clave_formateada', 'valor_corto_display', 'descripcion_corta', 'fecha_actualizacion_display')
    search_fields = ('clave', 'descripcion', 'valor')
    # readonly_fields = ('valor_completo',) # Si definiste el método

    def clave_formateada(self, obj):
        return f"🔑 {obj.clave}"
    clave_formateada.short_description = "Clave"

    def valor_corto_display(self, obj): # Renombrado para evitar colisión si 'valor_corto' es un campo
        return (obj.valor[:75] + '...') if len(obj.valor) > 75 else obj.valor
    valor_corto_display.short_description = 'Valor (Corto)'

    def descripcion_corta(self, obj):
        return (obj.descripcion[:50] + '...') if obj.descripcion and len(obj.descripcion) > 50 else obj.descripcion
    descripcion_corta.short_description = 'Descripción (Corta)'

    def fecha_actualizacion_display(self, obj):
        return obj.updated_at.strftime("%d/%m/%Y %H:%M")
    fecha_actualizacion_display.short_description = 'Última Actualización'

    # def valor_completo(self, obj): # Si lo necesitas para readonly_fields
    #     return obj.valor
    # valor_completo.short_description = "Valor Completo (Preview)"
    
# ... (tus ModelAdmin existentes para Categoria, Articulo, Imagen, etc. como los tenías) ...
# Por ejemplo, si tenías la configuración de admin.site.site_header, mantenla:
# admin.site.site_header = "🛍️ Mi E-commerce Admin"
# admin.site.site_title = "E-commerce Admin"
# admin.site.index_title = "Panel de Administración"


# --- Configuración para los Nuevos Modelos ---

class CarouselSlideInline(admin.TabularInline): # O StackedInline para más espacio
    model = CarouselSlide
    extra = 1 # Cuántos formularios extra para slides mostrar
    ordering = ('orden',)
    fields = ('imagen', 'imagen_preview_inline', 'titulo', 'subtitulo', 'enlace_url', 'orden', 'activo')
    readonly_fields = ('imagen_preview_inline',)
    
    def imagen_preview_inline(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="max-width: 150px; max-height: 75px; object-fit: cover; border-radius: 4px;" />', 
                obj.imagen.url
            )
        return "Sin imagen"
    imagen_preview_inline.short_description = '🖼️ Preview'

@admin.register(Carousel)
class CarouselAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activo', 'slides_count', 'updated_at')
    list_filter = ('activo',)
    search_fields = ('nombre',)
    inlines = [CarouselSlideInline] # Permite añadir/editar slides directamente desde el carrusel

    def slides_count(self, obj):
        return obj.slides.count()
    slides_count.short_description = 'Nº Slides'

@admin.register(CarouselSlide) # Opcional: si quieres una vista separada para todos los slides
class CarouselSlideAdmin(admin.ModelAdmin):
    list_display = ('titulo_o_default', 'carousel', 'orden', 'activo', 'imagen_preview_list', 'enlace_url', 'updated_at')
    list_filter = ('activo', 'carousel')
    list_editable = ('orden', 'activo')
    search_fields = ('titulo', 'subtitulo', 'carousel__nombre')
    list_select_related = ('carousel',) # Optimiza la consulta para obtener el nombre del carrusel
    list_per_page = 20

    def imagen_preview_list(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 4px;" />', 
                obj.imagen.url
            )
        return "Sin imagen"
    imagen_preview_list.short_description = '🖼️ Imagen'

    def titulo_o_default(self, obj):
        return obj.titulo if obj.titulo else f"Slide sin título (ID: {obj.id})"
    titulo_o_default.short_description = 'Título del Slide'


@admin.register(NavigationLink)
class NavigationLinkAdmin(admin.ModelAdmin):
    list_display = ('texto_del_enlace', 'url_o_ruta', 'ubicacion_display', 'orden', 'activo', 'abrir_en_nueva_pestana')
    list_filter = ('ubicacion', 'activo')
    search_fields = ('texto_del_enlace', 'url_o_ruta')
    list_editable = ('orden', 'activo', 'abrir_en_nueva_pestana') # 'url_o_ruta' puede ser largo para editar en lista
    ordering = ('ubicacion', 'orden')
    list_per_page = 25

    def ubicacion_display(self, obj):
        return obj.get_ubicacion_display() # Muestra el valor legible de la elección
    ubicacion_display.short_description = 'Ubicación'


@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin):
    list_display = ('identificador', 'titulo_corto', 'activo', 'updated_at')
    list_filter = ('activo',)
    search_fields = ('identificador', 'titulo', 'contenido_html')
    # Podrías añadir un editor de texto enriquecido para 'contenido_html' aquí
    # usando, por ejemplo, django-ckeditor o similar.
    # formfield_overrides = {
    #     models.TextField: {'widget': CKEditorWidget()},
    # }
    fieldsets = (
        (None, {
            'fields': ('identificador', 'titulo', 'activo')
        }),
        ('Contenido', {
            'fields': ('contenido_html', 'imagen_asociada', 'enlace_url')
        }),
    )
    list_per_page = 20

    def titulo_corto(self, obj):
        if obj.titulo and len(obj.titulo) > 50:
            return obj.titulo[:47] + "..."
        return obj.titulo if obj.titulo else "---"
    titulo_corto.short_description = 'Título'

