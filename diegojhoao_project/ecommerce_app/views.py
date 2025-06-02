from django.shortcuts import render

# Create your views here.
# ecommerce_app/views.py

from rest_framework import viewsets, permissions
from .models import Categoria, Articulo, Carousel, NavigationLink, ContentBlock
# Más adelante importaremos Articulo, Imagen, etc.
from .serializers import CategoriaSerializer, ArticuloSerializer, CarouselSerializer, NavigationLinkSerializer, ContentBlockSerializer
# Más adelante importaremos ArticuloSerializer, etc.

class CategoriaViewSet(viewsets.ModelViewSet):
    """
    Este ViewSet provee automáticamente acciones `list`, `create`, `retrieve`,
    `update`, y `destroy` para el modelo Categoria.
    """
    queryset = Categoria.objects.all().order_by('orden', 'nombre')
    serializer_class = CategoriaSerializer
    # Opcional: Define permisos. Por ahora, usaremos los definidos en settings.py (AllowAny)
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Ejemplo: solo lectura para anónimos, escritura para autenticados
# NUEVO: ArticuloViewSet
class ArticuloViewSet(viewsets.ModelViewSet):
    queryset = Articulo.objects.all().order_by('-created_at', 'nombre')
    serializer_class = ArticuloSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # AÑADE ESTA LÍNEA PARA HABILITAR EL FILTRADO POR CATEGORÍA
    filterset_fields = ['categoria', 'activo', 'destacado'] 
    # 'categoria' permitirá filtrar por el ID de la categoría.
    # También he añadido 'activo' y 'destacado' como ejemplos de otros campos por los que podrías querer filtrar.
# --- NUEVOS VIEWSETS ---

class CarouselViewSet(viewsets.ReadOnlyModelViewSet): # ReadOnly porque se gestionan desde el admin
    """
    API endpoint para obtener carruseles activos con sus slides activos.
    Filtra por el 'nombre' del carrusel para obtener uno específico, ej: /api/carousels/?nombre=principal
    """
    queryset = Carousel.objects.filter(activo=True)
    serializer_class = CarouselSerializer
    filterset_fields = ['nombre'] # Permite filtrar por el nombre identificador del carrusel

class NavigationLinkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para obtener enlaces de navegación activos, ordenados.
    Filtra por 'ubicacion', ej: /api/navigation-links/?ubicacion=header
    """
    queryset = NavigationLink.objects.filter(activo=True).order_by('ubicacion', 'orden')
    serializer_class = NavigationLinkSerializer
    filterset_fields = ['ubicacion']

class ContentBlockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para obtener bloques de contenido activos.
    Filtra por 'identificador', ej: /api/content-blocks/?identificador=banner-bienvenida-home
    """
    queryset = ContentBlock.objects.filter(activo=True)
    serializer_class = ContentBlockSerializer
    filterset_fields = ['identificador'] # Permite buscar un bloque específico por su slug

