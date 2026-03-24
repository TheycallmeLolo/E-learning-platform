from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .models import Notification


# ─── HTML Email Templates ─────────────────────────────────────────────────────

def _base_html(title, body_html, cta_text=None, cta_url=None):
    cta_block = ""
    if cta_text and cta_url:
        cta_block = f"""
        <div style="text-align:center;margin:32px 0;">
          <a href="{cta_url}"
             style="background:#e94560;color:#fff;padding:14px 32px;
                    border-radius:8px;text-decoration:none;font-weight:700;
                    font-size:15px;display:inline-block;">
            {cta_text}
          </a>
        </div>"""

    return f"""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body {{ margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl; }}
    .wrapper {{ max-width:600px;margin:40px auto;background:#fff;border-radius:16px;
                overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08); }}
    .header  {{ background:linear-gradient(135deg,#1a1a2e,#16213e);padding:36px 40px;text-align:center; }}
    .header h1 {{ color:#fff;margin:0;font-size:26px;letter-spacing:1px; }}
    .header span {{ color:#e94560;font-size:32px; }}
    .body    {{ padding:36px 40px; }}
    .body p  {{ color:#444;font-size:15px;line-height:1.8;margin:0 0 16px; }}
    .footer  {{ background:#f9f9f9;padding:20px 40px;text-align:center;
                border-top:1px solid #eee; }}
    .footer p {{ color:#999;font-size:12px;margin:0; }}
    .highlight {{ background:#fff5f7;border-right:4px solid #e94560;
                  padding:14px 18px;border-radius:6px;margin:20px 0; }}
    .highlight p {{ margin:0;color:#333; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span>🎓</span>
      <h1>EduPlatform</h1>
    </div>
    <div class="body">
      <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:20px;">{title}</h2>
      {body_html}
      {cta_block}
    </div>
    <div class="footer">
      <p>هذا البريد أُرسل تلقائياً من EduPlatform — لا ترد على هذه الرسالة.</p>
    </div>
  </div>
</body>
</html>"""


def _send_html_email(subject, html_content, recipient_email):
    """إرسال إيميل HTML"""
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body="",                          # plain text fallback (فارغ)
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return True
    except Exception as e:
        print(f"[Email Error] {e}")
        return False


# ─── Notification + Email helpers ────────────────────────────────────────────

def create_notification(recipient, notification_type, title, message,
                        course=None, send_email=True, email_html=None):
    """أنشئ إشعار داخلي وابعت إيميل اختياري"""
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        course=course,
    )
    if send_email and recipient.email:
        html = email_html or _base_html(title, f"<p>{message}</p>")
        _send_html_email(f"[EduPlatform] {title}", html, recipient.email)

    return notification


# ─── 1. إيميل ترحيب بعد التسجيل ─────────────────────────────────────────────

def send_welcome_email(user):
    role = "مدرّس" if getattr(user, 'is_instructor', False) else "طالب"
    name = user.get_full_name() or user.email

    html = _base_html(
        title=f"أهلاً وسهلاً يا {name}! 🎉",
        body_html=f"""
        <p>يسعدنا انضمامك لمنصة <strong>EduPlatform</strong> كـ <strong>{role}</strong>.</p>
        <div class="highlight">
          <p>📧 بريدك الإلكتروني: <strong>{user.email}</strong></p>
          <p>👤 نوع الحساب: <strong>{role}</strong></p>
        </div>
        <p>ابدأ رحلتك التعليمية الآن واستكشف مئات الكورسات المتاحة.</p>
        """,
        cta_text="ابدأ الاستكشاف",
        cta_url=f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/courses",
    )
    _send_html_email("🎓 أهلاً بك في EduPlatform!", html, user.email)


# ─── 2. إيميل تأكيد الاشتراك في كورس ────────────────────────────────────────

def notify_enrollment(enrollment):
    student    = enrollment.student
    course     = enrollment.course
    instructor = course.instructor
    frontend   = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')

    # ── إشعار + إيميل للطالب ──────────────────────────────────────────────
    student_html = _base_html(
        title=f"تم تسجيلك في كورس «{course.title}» ✅",
        body_html=f"""
        <p>مبروك يا <strong>{student.get_full_name() or student.email}</strong>!</p>
        <div class="highlight">
          <p>📚 الكورس: <strong>{course.title}</strong></p>
          <p>👨‍🏫 المدرّس: <strong>{instructor.get_full_name() or instructor.email}</strong></p>
        </div>
        <p>يمكنك البدء في مشاهدة المحتوى الآن مباشرةً.</p>
        """,
        cta_text="ابدأ التعلم الآن ▶",
        cta_url=f"{frontend}/courses/{course.id}",
    )
    create_notification(
        recipient=student,
        notification_type='enrollment',
        title=f'تم التسجيل في {course.title}',
        message=f'تم تسجيلك بنجاح في كورس "{course.title}".',
        course=course,
        email_html=student_html,
    )

    # ── إشعار + إيميل للمدرّس ────────────────────────────────────────────
    instructor_html = _base_html(
        title="طالب جديد سجّل في كورسك 🎉",
        body_html=f"""
        <p>مبروك يا <strong>{instructor.get_full_name() or instructor.email}</strong>!</p>
        <div class="highlight">
          <p>👤 الطالب: <strong>{student.get_full_name() or student.email}</strong></p>
          <p>📚 الكورس: <strong>{course.title}</strong></p>
        </div>
        <p>استمر في تقديم محتوى رائع لطلابك! 💪</p>
        """,
        cta_text="عرض الكورس",
        cta_url=f"{frontend}/courses/{course.id}/manage",
    )
    create_notification(
        recipient=instructor,
        notification_type='enrollment',
        title='طالب جديد سجّل في كورسك',
        message=f'{student.get_full_name() or student.email} سجّل في "{course.title}".',
        course=course,
        email_html=instructor_html,
    )


# ─── 3. إيميل موافقة الأدمن على الكورس ──────────────────────────────────────

def notify_course_approved(course):
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    instructor = course.instructor

    html = _base_html(
        title=f"تم اعتماد كورسك «{course.title}» ✅",
        body_html=f"""
        <p>تهانينا يا <strong>{instructor.get_full_name() or instructor.email}</strong>!</p>
        <p>قام فريق EduPlatform بمراجعة كورسك والموافقة عليه. الكورس أصبح متاحاً للطلاب الآن.</p>
        <div class="highlight">
          <p>📚 الكورس: <strong>{course.title}</strong></p>
          <p>✅ الحالة: <strong>معتمد ومنشور</strong></p>
        </div>
        """,
        cta_text="عرض الكورس",
        cta_url=f"{frontend}/courses/{course.id}",
    )
    create_notification(
        recipient=instructor,
        notification_type='enrollment',
        title=f'تم اعتماد كورس "{course.title}"',
        message='تهانينا! تمت الموافقة على كورسك وأصبح متاحاً للطلاب.',
        course=course,
        email_html=html,
    )


# ─── 4. إيميل رفض الكورس ─────────────────────────────────────────────────────

def notify_course_rejected(course, reason=""):
    instructor = course.instructor

    reason_block = f"""
    <div class="highlight">
      <p>📝 السبب: <strong>{reason}</strong></p>
    </div>""" if reason else ""

    html = _base_html(
        title=f"كورسك «{course.title}» يحتاج مراجعة ⚠️",
        body_html=f"""
        <p>مرحباً يا <strong>{instructor.get_full_name() or instructor.email}</strong>،</p>
        <p>بعد مراجعة كورسك من قِبل فريق EduPlatform، تم إعادته للمراجعة.</p>
        {reason_block}
        <p>يمكنك تعديل الكورس وإعادة تقديمه للاعتماد مرة أخرى.</p>
        """,
    )
    create_notification(
        recipient=instructor,
        notification_type='enrollment',
        title=f'كورس "{course.title}" يحتاج مراجعة',
        message=f'تم إعادة الكورس للمراجعة. {reason}',
        course=course,
        email_html=html,
    )

def notify_new_content(lesson, course):
    """إشعار الطلاب لما المدرّس يضيف محتوى جديد"""
    try:
        enrollments = course.enrollments.select_related('student').all()
        for enrollment in enrollments:
            create_notification(
                recipient=enrollment.student,
                notification_type='new_content',
                title=f'محتوى جديد في {course.title}',
                message=f'تم إضافة "{lesson.title}" في كورس "{course.title}".',
                course=course,
            )
    except Exception as e:
        print(f"[notify_new_content error] {e}")