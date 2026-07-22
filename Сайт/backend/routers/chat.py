
from fastapi import APIRouter, Depends

from models.user import User
from schemas.chat import ChatMessage, ChatResponse
from services.chat_service import ChatService
from services.auth_service import get_current_user

router = APIRouter()
chat_service = ChatService()


@router.post("/message", response_model=ChatResponse)
def send_message(
    payload: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    response = chat_service.get_response(payload.message, user_name=current_user.name)
    return ChatResponse(response=response)
