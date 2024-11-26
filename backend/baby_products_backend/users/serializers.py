from rest_framework import serializers
from .models import Conversation, CustomUser

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)  # Call the original validate method to get the token
        data["user"] = {
            "id": self.user.id,  # Add the user's id
            "email": self.user.email,  # Add the user's email
            "first_name": self.user.first_name,  # Add the user's first name (optional)
            "last_name": self.user.last_name,  # Add the user's last name (optional)
        }
        return data


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "username", 'first_name', "phone_number", "profile_picture", 
            "address", "bio", "is_verified", "date_of_birth", "date_joined"
        ]
        read_only_fields = ["is_verified", "date_joined"]


from rest_framework import serializers
from .models import Message
from rest_framework import serializers
from .models import Message

from django.contrib.auth import get_user_model

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    receiver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )
    product = serializers.SerializerMethodField()  # Include the product

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'message', 'timestamp', 'product']

    def get_sender(self, obj):
        return {"id": obj.sender.id, "first_name": obj.sender.first_name}

    def get_receiver(self, obj):
        return {"id": obj.receiver.id, "first_name": obj.receiver.first_name}

    def get_product(self, obj):
        if obj.conversation.product:
            return {
                "id": obj.conversation.product.id,
                "title": obj.conversation.product.title
            }
        return None





from rest_framework import serializers
from .models import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'created_at', 'last_message']

    def to_representation(self, instance):
        """
        Customize the representation to include participant details.
        """
        data = super().to_representation(instance)
        data['participants'] = [
            {"id": user.id, "email": user.email, "first_name": user.first_name}
            for user in instance.participants.all()
        ]
        return data

    def get_last_message(self, obj):
        """
        Retrieve the most recent message in the conversation.
        """
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return {
                "id": last_message.id,
                "message": last_message.message,
                "sender": {
                    "id": last_message.sender.id,
                    "first_name": last_message.sender.first_name,
                },
                "timestamp": last_message.timestamp,
            }
        return None
