from django.db import models
from django.conf import settings


class Product(models.Model):
    """
    Model representing a product being sold in the marketplace.
    """
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="products"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    """
    Model representing images associated with a product.
    Includes fields for verification status and feedback.
    """
    product = models.ForeignKey(
        Product, 
        related_name="images", 
        on_delete=models.CASCADE
    )
    file = models.ImageField(upload_to="products/")
    is_verified = models.BooleanField(default=False)
    feedback = models.TextField(blank=True, null=True)
    verification_task_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Image for {self.product.title} ({self.file.name})"
