from rest_framework import serializers
from .models import Product, ProductImage
from users.models import CustomUser  # Ensure you import your CustomUser model

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'file']

class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name']  # Include the seller details you want to expose

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    seller = SellerSerializer(source='created_by', read_only=True)  # Include the seller details

    class Meta:
        model = Product
        fields = ['id', 'title', 'description', 'price', 'category', 'images', 'seller']
