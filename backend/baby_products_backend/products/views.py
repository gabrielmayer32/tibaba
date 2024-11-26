from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from .models import Product
from .serializers import ProductSerializer
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from .models import ProductImage
from .ai_module import assess_image_quality
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework import status
from .models import ProductImage
from .ai_module import assess_image_quality  
from rest_framework.exceptions import ValidationError

from rest_framework.permissions import BasePermission

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow safe methods or check ownership
        return request.method in ['GET', 'HEAD', 'OPTIONS'] or obj.created_by == request.user


from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from .models import Product, ProductImage
from .serializers import ProductSerializer


class ProductViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ProductSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        """
        Return the queryset for listing products, excluding the authenticated user's products.
        """
        user = self.request.user
        queryset = Product.objects.prefetch_related('images').all().order_by('-created_at')
        if user.is_authenticated:
            queryset = queryset.exclude(created_by=user)  # Exclude user's products for listing
        print(f"Queryset: {queryset}")  # Debugging
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """
        Allow any user to retrieve a product.
        """
        product_id = self.kwargs.get('pk')
        try:
            product = Product.objects.get(id=product_id)
            serializer = self.get_serializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            raise NotFound({"detail": "Product not found."})


    def get_object(self):
        print('ok')
        """
        Fetch the product object for update or delete.
        Ensure the authenticated user is the owner.
        """
        product_id = self.kwargs.get('pk')
        try:
            # Include products created by the user for specific operations
            product = Product.objects.get(id=product_id, created_by=self.request.user)
            print(product)
            return product
        except Product.DoesNotExist:
            raise NotFound({"detail": "Product not found or permission denied."})

    def perform_create(self, serializer):
        """
        Handle product creation, including image quality assessment.
        """
        product = serializer.save(created_by=self.request.user)
        failed_images = []

        for image in self.request.FILES.getlist("images"):
            uploaded_image = ProductImage(product=product, file=image)
            uploaded_image.save()

            # Verify image quality
            result = assess_image_quality(uploaded_image.file.path)
            print(f"Processing image: {uploaded_image.file.path}")
            print(result)  # Debugging purposes

            # FOR DEV 
            result['status'] = "Good"

            if result['status'] == "Good":
                uploaded_image.is_verified = True
                uploaded_image.save()
            else:
                failed_images.append({
                    "name": image.name,
                    "feedback": result['feedback'],
                })
                uploaded_image.delete()  # Remove the failed image from the database

        if failed_images:
            raise ValidationError({
                "message": "Some images failed the quality check. Please re-upload.",
                "failed_images": failed_images,
            })
    def update(self, instance, validated_data):
        # Handle partial updates for price or other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def partial_update(self, request, *args, **kwargs):
        """
        Handle partial updates (like updating the price).
        """
        product = self.get_object()  # Fetch product including user's own
        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        Handle product deletion.
        """
        product = self.get_object()  # Fetch product including user's own
        product.delete()
        return Response({"detail": "Product deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    
    
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

class MyProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(request)
        products = Product.objects.filter(created_by=request.user)
        
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
