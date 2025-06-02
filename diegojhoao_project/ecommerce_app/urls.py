# ecommerce_app/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, ArticuloViewSet, CarouselViewSet, NavigationLinkViewSet, ContentBlockViewSet 

# Crea un router y registra nuestros viewsets con él.
router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'articulos', ArticuloViewSet, basename='articulo') # NUEVA LÍNEA
# Registrar nuevos Viewsets
router.register(r'carousels', CarouselViewSet, basename='carousel')
router.register(r'navigation-links', NavigationLinkViewSet, basename='navigationlink')
router.register(r'content-blocks', ContentBlockViewSet, basename='contentblock')

# El prefijo 'categorias' será la base para las URLs de este ViewSet.
# basename='categoria' se usa para nombrar las URLs generadas. Es útil si necesitas revertir URLs.

# Más adelante, registraríamos otros ViewSets aquí:
# router.register(r'articulos', ArticuloViewSet, basename='articulo')

# Las URLs de la API son determinadas automáticamente por el router.
urlpatterns = [
    path('', include(router.urls)),
]