from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import  CustomTokenObtainPairView, ConversationMessagesView, MarkMessagesAsReadView,  MessageListCreateView,   RegisterUserView, SellerDetailView, UnreadMessageCountView, UserConversationsView, UserProfileView

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet

router = DefaultRouter()
router.register("users", CustomUserViewSet, basename="user")




urlpatterns = [
    path('auth/register/', RegisterUserView.as_view(), name='register'),
    # path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("", include(router.urls)),
    path("sellers/<int:pk>/", SellerDetailView.as_view(), name="seller-detail"),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    # # path('messages/send/', MessageCreateView.as_view(), name='create-message'),
    # path('messages/', MessageCreateView.as_view(), name='message-list'),
    path("messages/", MessageListCreateView.as_view(), name="message-list-create"),
    path("messages/conversation/<int:conversation_id>/", ConversationMessagesView.as_view(), name="conversation-messages"),
    path("messages/conversations/", UserConversationsView.as_view(), name="user-conversations"),
    path('messages/unread-count/', UnreadMessageCountView.as_view(), name='unread-message-count'),
    path("messages/conversation/<int:conversation_id>/read/", MarkMessagesAsReadView.as_view(), name="mark-messages-as-read"),




]
