from django.utils import timezone
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .models import Conversation, CustomUser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.viewsets import ModelViewSet
from .models import CustomUser
from .serializers import ConversationSerializer, CustomUserSerializer, MessageSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from django.db.models import Q, Count
from django.db import models  # Add this import if not already present


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message

class UnreadMessageCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        unread_count = Message.objects.filter(receiver=user, is_read=False).count()
        return Response({"unread_count": unread_count})

class MarkMessagesAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        """
        Mark all unread messages in a specific conversation as read.
        """
        user = request.user
        try:
            conversation = Conversation.objects.get(id=conversation_id, participants=user)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        unread_messages = conversation.messages.filter(receiver=user, is_read=False)
        unread_messages.update(is_read=True)
        return Response({"detail": f"{unread_messages.count()} messages marked as read"})



class RegisterUserView(CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]




class CustomUserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from products.models import Product
from users.models import CustomUser
from products.serializers import ProductSerializer
from users.serializers import CustomUserSerializer

class SellerDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        seller = CustomUser.objects.get(pk=pk)
        products = Product.objects.filter(created_by=seller)
        print(seller)
        return Response({
            "seller": CustomUserSerializer(seller).data,
            "products": ProductSerializer(products, many=True).data
        })



class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)

from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


class MessageListCreateView(APIView):
    """
    View for listing and creating messages.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get all conversations for the logged-in user.
        """
        conversations = Conversation.objects.filter(participants=request.user)
        data = []
        print(conversations)

        for conversation in conversations:
            last_message = conversation.messages.last()
            if last_message:
                data.append({
                    "conversation_id": conversation.id,
                    "participant": last_message.receiver.id if last_message.sender == request.user else last_message.sender.id,
                    "participant_name": last_message.receiver.first_name if last_message.sender == request.user else last_message.sender.first_name,
                    "last_message": last_message.message,
                    "timestamp": last_message.timestamp,
                })

        return Response(data, status=status.HTTP_200_OK)


    def post(self, request):
        serializer = MessageSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            sender = request.user
            receiver = serializer.validated_data["receiver"]
            product_id = request.data.get("product_id")  # Get product ID from the request
            print(f'PRODUCT ID {product_id}')
            # Fetch or create the conversation
            conversation = (
                Conversation.objects.annotate(participant_count=models.Count('participants'))
                .filter(participant_count=2)
                .filter(participants=sender)
                .filter(participants=receiver)
                .filter(product_id=product_id)  # Match the product in the conversation
                .first()
            )

            if not conversation:
                # Create a new conversation if none exists
                conversation = Conversation.objects.create(product_id=product_id)
                conversation.participants.add(sender, receiver)

            # Save the message
            serializer.save(sender=sender, receiver=receiver, conversation=conversation)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response



        

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Conversation
from .serializers import ConversationSerializer

class UserConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Fetch all conversations for the authenticated user.
        """
        user = request.user
        conversations = Conversation.objects.filter(participants=user).distinct()
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConversationMessagesView(APIView):
    """
    View for retrieving messages in a specific conversation.
    """
    permission_classes = [IsAuthenticated]

    class MessagePagination(PageNumberPagination):
        """
        Custom pagination for conversation messages.
        """
        page_size = 20
        page_size_query_param = "page_size"
        max_page_size = 100

    def get(self, request, conversation_id):
        try:
            # Ensure the user is a participant in the conversation
            conversation = Conversation.objects.get(id=conversation_id, participants=request.user)

            # Query all messages in the conversation
            messages = conversation.messages.all().order_by("timestamp")
            message_serializer = MessageSerializer(messages, many=True)

            # Include product data if linked to the conversation
            product = None
            if conversation.product:  # Check if the conversation has an associated product
                product = {
                    "id": conversation.product.id,
                    "title": conversation.product.title,
                    "category": conversation.product.category,
                    "price": str(conversation.product.price),
                    "image": conversation.product.images.first().file.url if conversation.product.images.exists() else None,  # Corrected field
                }

            return Response({
                "messages": message_serializer.data,
                "product": product,
            }, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)