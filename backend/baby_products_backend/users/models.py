from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, verbose_name=_("Email Address"))
    phone_number = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True,
        verbose_name=_("Phone Number"),
        help_text=_("Optional phone number for contact purposes")
    )
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        null=True,
        blank=True,
        verbose_name=_("Profile Picture")
    )
    address = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("Address"),
        help_text=_("Optional address for deliveries or location-based searches")
    )
    bio = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("Bio"),
        help_text=_("A short bio about yourself")
    )
    is_verified = models.BooleanField(
        default=False,
        verbose_name=_("Verified User"),
        help_text=_("Indicates if the user has been verified via email or phone")
    )
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        verbose_name=_("Date of Birth"),
        help_text=_("Optional date of birth for age verification or personalized experiences")
    )
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

from django.db import models
from django.conf import settings

from django.db import models
from django.conf import settings
from products.models import Product

class Conversation(models.Model):
    participants = models.ManyToManyField(CustomUser, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    product = models.ForeignKey(
        Product, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="conversations"
    )  # Add this field to link a product to the conversation

    def __str__(self):
        return f"Conversation between {', '.join([user.first_name for user in self.participants.all()])}"



class Message(models.Model):
    conversation = models.ForeignKey(
    'Conversation',
    on_delete=models.CASCADE,
    null=True,  # Temporarily allow null
    blank=True,  # Allow blank in forms
    related_name="messages"
)
 
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  # New field to track read status


    def create_message(sender, receiver, message_text):
        # Check if a conversation already exists between the two users
        conversation = Conversation.objects.filter(participants=sender).filter(participants=receiver).first()

        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(sender, receiver)

        # Create the message
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            receiver=receiver,
            message=message_text
        )
        return message


    def __str__(self):
        return f"Message from {self.sender} to {self.receiver}"
