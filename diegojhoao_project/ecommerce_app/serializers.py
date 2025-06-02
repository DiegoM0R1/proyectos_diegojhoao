# ecommerce_app/serializers.py

from rest_framework import serializers
from .models import Categoria, Articulo, Imagen, ArticuloImagen, Filtro, FiltroValor, Carousel, CarouselSlide, NavigationLink, ContentBlock # Nuevos modelos
 # Importa tus modelos

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'slug', 'activo', 'orden', 'imagen_categoria', 'created_at', 'updated_at']
        # Si quieres que el slug sea solo de lectura en la API (ya que se autogenera):
        # read_only_fields = ['slug', 'created_at', 'updated_at']

# NUEVO: ArticuloSerializer
class ArticuloSerializer(serializers.ModelSerializer):
    # Para mostrar el nombre de la categoría en lugar de solo su ID al LEER datos.
    # Para ESCRIBIR datos (crear/actualizar artículo), el cliente enviará el ID de la categoría.
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    # El campo 'categoria' se usará para las operaciones de escritura (asignar por ID)
    # y por defecto mostrará el ID en la representación si no se especifica lo contrario
    # o si no se usa un serializer anidado para lectura.

    class Meta:
        model = Articulo
        fields = [
            'id',
            'categoria', # Para escritura (se espera un ID de categoría)
            'categoria_nombre', # Para lectura (muestra el nombre de la categoría)
            'nombre',
            'descripcion',
            'precio',
            'stock',
            'sku',
            'activo',
            'destacado',
            'imagen_principal', # ImageField se manejará bien por defecto
            # Más adelante podemos añadir 'imagenes_galeria' y 'filtros_aplicados'
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'categoria_nombre']

        # Opcional: Para que el campo 'categoria' (ID) solo se use para escribir,
        # y el objeto completo de categoría (usando CategoriaSerializer) se muestre al leer:
        # depth = 1 # Esto anidaría todos los ForeignKeys un nivel. Puede ser demasiado.
        # O ser más específico:
        # categoria = CategoriaSerializer(read_only=True) # Para lectura
        # categoria_id = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all(), source='categoria', write_only=True) # Para escritura

        # La combinación de 'categoria' (para el ID de escritura) y 'categoria_nombre' (para el nombre de lectura)
        # es un enfoque común y simple para empezar.

# --- NUEVOS SERIALIZERS ---

class CarouselSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarouselSlide
        fields = ['id', 'imagen', 'titulo', 'subtitulo', 'enlace_url', 'orden', 'activo']

class CarouselSerializer(serializers.ModelSerializer):
    slides = CarouselSlideSerializer(many=True, read_only=True) # Anida los slides activos

    class Meta:
        model = Carousel
        fields = ['id', 'nombre', 'activo', 'slides']
    
    def get_slides(self, obj):
        # Opcional: Si solo quieres slides activos en la API
        active_slides = obj.slides.filter(activo=True).order_by('orden')
        return CarouselSlideSerializer(active_slides, many=True).data

class NavigationLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavigationLink
        fields = ['id', 'texto_del_enlace', 'url_o_ruta', 'ubicacion', 'orden', 'abrir_en_nueva_pestana', 'activo']

class ContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentBlock
        fields = ['id', 'identificador', 'titulo', 'contenido_html', 'imagen_asociada', 'enlace_url', 'activo']
