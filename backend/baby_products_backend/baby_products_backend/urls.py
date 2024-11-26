from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from products.views import MyProductsView, ProductViewSet

# Create the router and register the ProductViewSet
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')  # Prefix with 'products'

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # User-related URLs
    path('api/users/', include('users.urls')),

    # Manually defined URL for "my-products"
    path('api/products/my-products/', MyProductsView.as_view(), name='my-products'),

    # Product-related URLs handled by the router
    path('api/', include(router.urls)),  # Add the router URLs under the 'api/' namespace
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

print("Registered URLs:", urlpatterns)  # Debug: Output registered URLs
