from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Sum, Count
 
 
class FocusSessionViewSet(viewsets.ModelViewSet):
    """
    POST /api/focus/sessions/       → حفظ جلسة تركيز
    GET  /api/focus/sessions/       → جلساتي
    GET  /api/focus/sessions/stats/ → إحصائياتي
    """
    permission_classes = [IsAuthenticated]
 
    def get_serializer_class(self):
        if self.action == 'create':
            return FocusSessionCreateSerializer
        return FocusSessionSerializer
 
    def get_queryset(self):
        return FocusSession.objects.filter(student=self.request.user)\
                                   .select_related('lecture')
 
    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        agg = qs.aggregate(
            avg_score        = Avg('focus_score'),
            total_sessions   = Count('id'),
            total_watch_secs = Sum('total_watch_seconds'),
            total_distracted = Sum('distracted_count'),
        )
 
        # أكثر أوقات الشرود
        level_counts = {
            'excellent': qs.filter(focus_score__gte=90).count(),
            'good'     : qs.filter(focus_score__gte=70, focus_score__lt=90).count(),
            'average'  : qs.filter(focus_score__gte=50, focus_score__lt=70).count(),
            'poor'     : qs.filter(focus_score__lt=50).count(),
        }
 
        return Response({
            'avg_focus_score'     : round(agg['avg_score'] or 0, 1),
            'total_sessions'      : agg['total_sessions'],
            'total_watch_minutes' : round((agg['total_watch_secs'] or 0) / 60, 1),
            'total_distracted'    : agg['total_distracted'] or 0,
            'level_breakdown'     : level_counts,
        })
 