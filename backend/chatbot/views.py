import os
from google import genai
from google.genai import types
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from django.contrib.auth import get_user_model
from payments.models import Enrollment
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionListSerializer, ChatSessionSerializer

User = get_user_model()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))


def build_system_prompt(user):
    try:
        enrolled_courses = list(
            Enrollment.objects.filter(student=user)
                              .select_related('course')
                              .values_list('course__title', flat=True)
        )
    except Exception:
        enrolled_courses = []

    courses_text = (
        "الكورسات المسجّل فيها: " + "، ".join(enrolled_courses)
        if enrolled_courses
        else "لا توجد كورسات مسجّلة حتى الآن."
    )

    return f"""أنت مساعد تعليمي ذكي لمنصة E-Learning. اسمك "لولو".

معلومات الطالب:
- الاسم: {user.get_full_name() or user.email}
- {courses_text}

مهمتك:
- مساعدة الطلاب في فهم المحتوى التعليمي وشرح المفاهيم
- الإجابة على الأسئلة المتعلقة بالبرمجة والتكنولوجيا والمواد الدراسية
- تشجيع الطلاب ومساعدتهم على الاستمرار في التعلم
- اقتراح طرق دراسة فعّالة

قواعد:
- رد دائماً بالعربية ما لم يسألك الطالب بلغة أخرى
- كن ودوداً ومشجعاً وواضحاً
- لو السؤال خارج نطاق التعليم، أعِد توجيه المحادثة بلطف
- اجعل إجاباتك مختصرة وعملية"""


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages_data = request.data.get('messages', [])
        session_id    = request.data.get('session_id')

        if not messages_data:
            return Response({'error': 'messages are required.'}, status=status.HTTP_400_BAD_REQUEST)

        for msg in messages_data:
            if msg.get('role') not in ('user', 'assistant') or not msg.get('content'):
                return Response({'error': 'Invalid message format.'}, status=status.HTTP_400_BAD_REQUEST)

        messages_data = messages_data[-20:]
        system_prompt = build_system_prompt(request.user)

        try:
            # تحويل الـ messages لصيغة google-genai
            # الـ history = كل الرسائل ما عدا الأخيرة
            history = []
            for msg in messages_data[:-1]:
                history.append(types.Content(
                    role="model" if msg["role"] == "assistant" else "user",
                    parts=[types.Part(text=msg["content"])],
                ))

            last_message = messages_data[-1]["content"]

            chat = client.chats.create(
                model="gemini-2.0-flash-lite",
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    max_output_tokens=1024,
                    temperature=0.7,
                ),
                history=history,
            )

            response = chat.send_message(last_message)
            reply = response.text

        except Exception as e:
            err_str = str(e).lower()
            if 'quota' in err_str or 'rate' in err_str or '429' in err_str:
                return Response(
                    {'error': 'تم تجاوز الحد المسموح. حاول مجدداً بعد قليل.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            if 'api_key' in err_str or 'invalid' in err_str or '401' in err_str:
                return Response(
                    {'error': 'خطأ في إعداد الـ API Key. تواصل مع الإدارة.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            return Response(
                {'error': f'خطأ في الخادم: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # حفظ المحادثة
        try:
            if session_id:
                session = ChatSession.objects.filter(id=session_id, user=request.user).first()
            else:
                session = None

            if not session:
                first_user_msg = next((m['content'] for m in messages_data if m['role'] == 'user'), '')
                session = ChatSession.objects.create(user=request.user, title=first_user_msg[:80])

            last_user_msg = next((m['content'] for m in reversed(messages_data) if m['role'] == 'user'), None)
            if last_user_msg:
                ChatMessage.objects.create(session=session, role='user', content=last_user_msg)
            ChatMessage.objects.create(session=session, role='assistant', content=reply)

        except Exception as e:
            print(f"Chat save error: {e}")
            session = None

        return Response({
            'reply':      reply,
            'session_id': str(session.id) if session else None,
        })


class ChatSessionListView(generics.ListAPIView):
    serializer_class   = ChatSessionListSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


class ChatSessionDetailView(generics.RetrieveDestroyAPIView):
    serializer_class   = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)