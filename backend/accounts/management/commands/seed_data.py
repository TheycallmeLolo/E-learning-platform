# backend/management/commands/seed_data.py
# ══════════════════════════════════════════════════════════════
# شغّله بـ: python manage.py seed_data
# ══════════════════════════════════════════════════════════════
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import InstructorProfile, StudentProfile
from courses.models import Course, Section, Lecture
from payments.models import Enrollment
from experiences.models import Experience

User = get_user_model()

# ── بيانات الدكاتره ────────────────────────────────────────────
INSTRUCTORS = [
    {
        'email': 'dr.ahmed@edu.com', 'password': 'Test1234!',
        'first_name': 'أحمد', 'last_name': 'محمد',
        'profile': {
            'title': 'dr', 'department': 'Computer Science',
            'university': 'Cairo University',
            'expertise': 'Python, Machine Learning, Data Science',
            'bio': 'دكتور متخصص في الذكاء الاصطناعي وتعلم الآلة مع خبرة 12 عاماً في التدريس والبحث العلمي.',
            'years_experience': 12, 'is_featured': True,
            'linkedin': 'https://linkedin.com', 'office_hours': 'الأحد والثلاثاء 10ص-12ظ',
        }
    },
    {
        'email': 'dr.sara@edu.com', 'password': 'Test1234!',
        'first_name': 'سارة', 'last_name': 'علي',
        'profile': {
            'title': 'prof', 'department': 'Mathematics & Statistics',
            'university': 'Ain Shams University',
            'expertise': 'Data Science, Statistics, R Programming',
            'bio': 'أستاذة دكتورة متخصصة في علم البيانات والإحصاء التطبيقي.',
            'years_experience': 18, 'is_featured': True,
            'linkedin': 'https://linkedin.com',
        }
    },
    {
        'email': 'dr.khaled@edu.com', 'password': 'Test1234!',
        'first_name': 'خالد', 'last_name': 'إبراهيم',
        'profile': {
            'title': 'dr', 'department': 'Software Engineering',
            'university': 'Alexandria University',
            'expertise': 'Web Development, React, Django, Node.js',
            'bio': 'مهندس برمجيات ودكتور متخصص في تطوير تطبيقات الويب.',
            'years_experience': 8, 'is_featured': True,
        }
    },
    {
        'email': 'dr.mona@edu.com', 'password': 'Test1234!',
        'first_name': 'منى', 'last_name': 'حسن',
        'profile': {
            'title': 'dr', 'department': 'Electrical Engineering',
            'university': 'Mansoura University',
            'expertise': 'Deep Learning, Neural Networks, Computer Vision',
            'bio': 'دكتورة متخصصة في التعلم العميق ومعالجة الصور والرؤية الحاسوبية.',
            'years_experience': 10, 'is_featured': False,
        }
    },
    {
        'email': 'eng.omar@edu.com', 'password': 'Test1234!',
        'first_name': 'عمر', 'last_name': 'يوسف',
        'profile': {
            'title': 'eng', 'department': 'Cybersecurity',
            'university': 'Helwan University',
            'expertise': 'Cybersecurity, Ethical Hacking, Networking',
            'bio': 'مهندس متخصص في أمن المعلومات والاختراق الأخلاقي.',
            'years_experience': 7, 'is_featured': False,
        }
    },
]

# ── بيانات الطلاب ──────────────────────────────────────────────
STUDENTS = [
    {'email': 'student1@test.com', 'first_name': 'محمود', 'last_name': 'سامي'},
    {'email': 'student2@test.com', 'first_name': 'نور',   'last_name': 'أحمد'},
    {'email': 'student3@test.com', 'first_name': 'كريم',  'last_name': 'علي'},
    {'email': 'student4@test.com', 'first_name': 'دينا',  'last_name': 'محمد'},
    {'email': 'student5@test.com', 'first_name': 'يوسف',  'last_name': 'حسن'},
    {'email': 'student6@test.com', 'first_name': 'مريم',  'last_name': 'خالد'},
    {'email': 'student7@test.com', 'first_name': 'أمير',  'last_name': 'إبراهيم'},
    {'email': 'student8@test.com', 'first_name': 'هنا',   'last_name': 'يوسف'},
]

# ── بيانات الكورسات ────────────────────────────────────────────
COURSES_DATA = [
    {
        'instructor_email': 'dr.ahmed@edu.com',
        'title': 'Python للمبتدئين من الصفر',
        'description': 'تعلم لغة Python من الصفر حتى الاحتراف. ستتعلم الأساسيات والمتقدمات مع تطبيقات عملية حقيقية.',
        'price': 0,
        'sections': [
            {
                'title': 'مقدمة في Python',
                'lectures': [
                    {'title': 'ما هي Python ولماذا نتعلمها؟', 'url': 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'duration': 12, 'free': True},
                    {'title': 'تثبيت Python وإعداد البيئة', 'url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg', 'duration': 15, 'free': True},
                    {'title': 'أول برنامج Hello World', 'url': 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'duration': 10, 'free': False},
                ]
            },
            {
                'title': 'المتغيرات وأنواع البيانات',
                'lectures': [
                    {'title': 'المتغيرات والأنواع الأساسية', 'url': 'https://www.youtube.com/watch?v=Z1Yd7upQsXY', 'duration': 20, 'free': False},
                    {'title': 'القوائم والقواميس', 'url': 'https://www.youtube.com/watch?v=W8KRzm-HUcc', 'duration': 25, 'free': False},
                    {'title': 'العمليات على البيانات', 'url': 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'duration': 18, 'free': False},
                ]
            },
            {
                'title': 'الدوال والـ OOP',
                'lectures': [
                    {'title': 'الدوال Functions', 'url': 'https://www.youtube.com/watch?v=9Os0o3wzS_I', 'duration': 30, 'free': False},
                    {'title': 'البرمجة الكائنية OOP', 'url': 'https://www.youtube.com/watch?v=JeznW_7DlB0', 'duration': 35, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.ahmed@edu.com',
        'title': 'Machine Learning من الصفر للاحتراف',
        'description': 'رحلة شاملة في تعلم الآلة من الأساسيات النظرية حتى التطبيق العملي باستخدام Python وScikit-learn.',
        'price': 299,
        'discount_price': 199,
        'sections': [
            {
                'title': 'مقدمة في Machine Learning',
                'lectures': [
                    {'title': 'ما هو Machine Learning؟', 'url': 'https://www.youtube.com/watch?v=ukzFI9rgwfU', 'duration': 20, 'free': True},
                    {'title': 'أنواع التعلم الآلي', 'url': 'https://www.youtube.com/watch?v=1FZ0A1QCMWc', 'duration': 25, 'free': True},
                    {'title': 'إعداد بيئة العمل', 'url': 'https://www.youtube.com/watch?v=WFr2WgN9_xE', 'duration': 15, 'free': False},
                ]
            },
            {
                'title': 'Supervised Learning',
                'lectures': [
                    {'title': 'Linear Regression', 'url': 'https://www.youtube.com/watch?v=owI7zxCqNY0', 'duration': 40, 'free': False},
                    {'title': 'Logistic Regression', 'url': 'https://www.youtube.com/watch?v=yIYKR4sgzI8', 'duration': 35, 'free': False},
                    {'title': 'Decision Trees', 'url': 'https://www.youtube.com/watch?v=7VeUPuFGJHk', 'duration': 45, 'free': False},
                ]
            },
            {
                'title': 'Unsupervised Learning',
                'lectures': [
                    {'title': 'K-Means Clustering', 'url': 'https://www.youtube.com/watch?v=4b5d3muPQmA', 'duration': 38, 'free': False},
                    {'title': 'PCA - تقليل الأبعاد', 'url': 'https://www.youtube.com/watch?v=FgakZw6K1QQ', 'duration': 42, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.khaled@edu.com',
        'title': 'React.js الدليل الشامل',
        'description': 'تعلم React.js من البداية حتى بناء تطبيقات احترافية. يشمل Hooks و Context API و Redux.',
        'price': 249,
        'sections': [
            {
                'title': 'أساسيات React',
                'lectures': [
                    {'title': 'مقدمة في React وJSX', 'url': 'https://www.youtube.com/watch?v=SqcY0GlETPk', 'duration': 22, 'free': True},
                    {'title': 'Components و Props', 'url': 'https://www.youtube.com/watch?v=Y6aYx_KKM7A', 'duration': 28, 'free': False},
                    {'title': 'State و Events', 'url': 'https://www.youtube.com/watch?v=4ORZ1GmjaMc', 'duration': 32, 'free': False},
                ]
            },
            {
                'title': 'React Hooks',
                'lectures': [
                    {'title': 'useState و useEffect', 'url': 'https://www.youtube.com/watch?v=O6P86uwfdR0', 'duration': 45, 'free': False},
                    {'title': 'useContext و useReducer', 'url': 'https://www.youtube.com/watch?v=5LrDIWkK_Bc', 'duration': 40, 'free': False},
                    {'title': 'Custom Hooks', 'url': 'https://www.youtube.com/watch?v=6ThXsUwLWvc', 'duration': 35, 'free': False},
                ]
            },
            {
                'title': 'React Router وAPI',
                'lectures': [
                    {'title': 'React Router v6', 'url': 'https://www.youtube.com/watch?v=Ul3y1LXxzdU', 'duration': 30, 'free': False},
                    {'title': 'Axios و REST APIs', 'url': 'https://www.youtube.com/watch?v=6LyagkoRWYA', 'duration': 38, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.khaled@edu.com',
        'title': 'Django REST Framework الشامل',
        'description': 'بناء APIs احترافية باستخدام Django REST Framework مع JWT Authentication وتوثيق Swagger.',
        'price': 349,
        'discount_price': 249,
        'sections': [
            {
                'title': 'مقدمة في Django',
                'lectures': [
                    {'title': 'إعداد مشروع Django', 'url': 'https://www.youtube.com/watch?v=rHux0gMZ3Eg', 'duration': 25, 'free': True},
                    {'title': 'Models والداتابيز', 'url': 'https://www.youtube.com/watch?v=PtQiiknWUcI', 'duration': 35, 'free': False},
                    {'title': 'Views و URLs', 'url': 'https://www.youtube.com/watch?v=SM7oOFG3EjA', 'duration': 30, 'free': False},
                ]
            },
            {
                'title': 'Django REST Framework',
                'lectures': [
                    {'title': 'Serializers', 'url': 'https://www.youtube.com/watch?v=cJveiktaOSQ', 'duration': 40, 'free': False},
                    {'title': 'ViewSets و Routers', 'url': 'https://www.youtube.com/watch?v=pY-oje5b5Qk', 'duration': 45, 'free': False},
                    {'title': 'JWT Authentication', 'url': 'https://www.youtube.com/watch?v=0d7cIfiydAc', 'duration': 38, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.sara@edu.com',
        'title': 'Data Science بالعربي',
        'description': 'تعلم علم البيانات بشكل شامل: تنظيف البيانات، التحليل، التصور، والنمذجة باستخدام Python.',
        'price': 199,
        'sections': [
            {
                'title': 'مقدمة في Data Science',
                'lectures': [
                    {'title': 'ما هو Data Science؟', 'url': 'https://www.youtube.com/watch?v=X3paOmcrTjQ', 'duration': 18, 'free': True},
                    {'title': 'Pandas للمبتدئين', 'url': 'https://www.youtube.com/watch?v=vmEHCJofslg', 'duration': 45, 'free': True},
                    {'title': 'NumPy الأساسيات', 'url': 'https://www.youtube.com/watch?v=QUT1VHiLmmI', 'duration': 35, 'free': False},
                ]
            },
            {
                'title': 'تصور البيانات',
                'lectures': [
                    {'title': 'Matplotlib أساسيات', 'url': 'https://www.youtube.com/watch?v=3Xc3CA655Y4', 'duration': 40, 'free': False},
                    {'title': 'Seaborn للرسوم المتقدمة', 'url': 'https://www.youtube.com/watch?v=6GUZXDef2U0', 'duration': 38, 'free': False},
                    {'title': 'Plotly التفاعلي', 'url': 'https://www.youtube.com/watch?v=GGL6U0k8WYA', 'duration': 42, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.mona@edu.com',
        'title': 'Deep Learning وNeural Networks',
        'description': 'غوص عميق في عالم التعلم العميق وشبكات الخوارزميات العصبية باستخدام TensorFlow وKeras.',
        'price': 399,
        'discount_price': 299,
        'sections': [
            {
                'title': 'أساسيات Neural Networks',
                'lectures': [
                    {'title': 'ما هي الشبكات العصبية؟', 'url': 'https://www.youtube.com/watch?v=aircAruvnKk', 'duration': 30, 'free': True},
                    {'title': 'Backpropagation شرح مبسط', 'url': 'https://www.youtube.com/watch?v=Ilg3gGewQ5U', 'duration': 35, 'free': False},
                    {'title': 'Activation Functions', 'url': 'https://www.youtube.com/watch?v=s-V7gKrsels', 'duration': 25, 'free': False},
                ]
            },
            {
                'title': 'TensorFlow وKeras',
                'lectures': [
                    {'title': 'مقدمة في TensorFlow', 'url': 'https://www.youtube.com/watch?v=tPYj3fFJGjk', 'duration': 40, 'free': False},
                    {'title': 'بناء أول Neural Network', 'url': 'https://www.youtube.com/watch?v=wQ8BIBpya2k', 'duration': 50, 'free': False},
                    {'title': 'CNN للصور', 'url': 'https://www.youtube.com/watch?v=YRhxdVk_sIs', 'duration': 55, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'eng.omar@edu.com',
        'title': 'أمن المعلومات والاختراق الأخلاقي',
        'description': 'تعلم أساسيات الأمن السيبراني والاختراق الأخلاقي من الصفر مع تطبيقات عملية في بيئات معزولة.',
        'price': 0,
        'sections': [
            {
                'title': 'مقدمة في الأمن السيبراني',
                'lectures': [
                    {'title': 'ما هو الأمن السيبراني؟', 'url': 'https://www.youtube.com/watch?v=inWWhr5tnEA', 'duration': 20, 'free': True},
                    {'title': 'أنواع التهديدات', 'url': 'https://www.youtube.com/watch?v=Dk-ZqQ-bfy4', 'duration': 25, 'free': True},
                    {'title': 'أدوات الاختراق الأخلاقي', 'url': 'https://www.youtube.com/watch?v=3Kq1MIfTWCE', 'duration': 30, 'free': False},
                ]
            },
            {
                'title': 'أدوات وتقنيات',
                'lectures': [
                    {'title': 'Kali Linux أساسيات', 'url': 'https://www.youtube.com/watch?v=lZAoFs75_cs', 'duration': 45, 'free': False},
                    {'title': 'Nmap وفحص الشبكات', 'url': 'https://www.youtube.com/watch?v=4t4kBkMsDbQ', 'duration': 38, 'free': False},
                ]
            },
        ]
    },
]

# ── بيانات التجارب ──────────────────────────────────────────────
EXPERIENCES_DATA = [
    {
        'instructor_email': 'dr.ahmed@edu.com',
        'title': 'حل تمارين Recursion خطوة بخطوة',
        'description': 'شرح مفصّل لحل 10 تمارين على الـ Recursion من مستوى متوسط لمتقدم مع شرح كل خطوة.',
        'price': 99, 'discount_price': 79,
        'preview': 'https://www.youtube.com/watch?v=ngCos392W4w',
        'content': 'https://www.youtube.com/watch?v=KEEKn7Me-ms',
    },
    {
        'instructor_email': 'dr.ahmed@edu.com',
        'title': 'تجربة سكشن Machine Learning Algorithms',
        'description': 'كيف اتحلّت مسائل الـ ML الصعبة في الامتحانات مع شرح كامل للخوارزميات.',
        'price': 149,
        'preview': 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
        'content': 'https://www.youtube.com/watch?v=1FZ0A1QCMWc',
    },
    {
        'instructor_email': 'dr.khaled@edu.com',
        'title': 'ورشة عمل React Hooks متكاملة',
        'description': 'تطبيق عملي شامل على جميع الـ Hooks الأساسية والمتقدمة في React.',
        'price': 129, 'discount_price': 99,
        'preview': 'https://www.youtube.com/watch?v=O6P86uwfdR0',
        'content': 'https://www.youtube.com/watch?v=5LrDIWkK_Bc',
    },
    {
        'instructor_email': 'dr.sara@edu.com',
        'title': 'تحليل بيانات حقيقي من الصفر للنهاية',
        'description': 'تجربة كاملة لتحليل dataset حقيقي من جمع البيانات حتى تقديم التقرير النهائي.',
        'price': 0,
        'preview': 'https://www.youtube.com/watch?v=vmEHCJofslg',
        'content': 'https://www.youtube.com/watch?v=X3paOmcrTjQ',
    },
    {
        'instructor_email': 'dr.mona@edu.com',
        'title': 'بناء CNN لتصنيف الصور',
        'description': 'تجربة عملية كاملة لبناء شبكة CNN تصنّف الصور مع شرح كل layer.',
        'price': 199,
        'preview': 'https://www.youtube.com/watch?v=aircAruvnKk',
        'content': 'https://www.youtube.com/watch?v=YRhxdVk_sIs',
    },
]


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true',
                            help='احذف الداتا القديمة قبل الإضافة')

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('🗑  حذف الداتا القديمة...')
            Experience.objects.all().delete()
            Enrollment.objects.all().delete()
            Course.objects.all().delete()
            User.objects.filter(is_staff=False).delete()
            self.stdout.write('✅ تم الحذف')

        self.stdout.write('🚀 بدء إضافة الداتا...\n')

        instructors = self._create_instructors()
        students    = self._create_students()
        courses     = self._create_courses(instructors)
        self._create_experiences(instructors, courses)
        self._create_enrollments(students, courses)

        self.stdout.write(self.style.SUCCESS('\n✅ تم ملء الداتابيز بنجاح!\n'))
        self.stdout.write('─' * 50)
        self.stdout.write(f'👨‍🏫 دكاتره: {len(instructors)}')
        self.stdout.write(f'👨‍🎓 طلاب:  {len(students)}')
        self.stdout.write(f'📚 كورسات: {len(courses)}')
        self.stdout.write('─' * 50)
        self.stdout.write('\n📧 بيانات الدخول:')
        self.stdout.write('  الأدمن:   admin@edu.com / Admin1234!')
        for inst in INSTRUCTORS:
            self.stdout.write(f'  {inst["first_name"]}: {inst["email"]} / {inst["password"]}')
        self.stdout.write('  الطلاب:   student1@test.com → student8@test.com / Test1234!')

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _create_instructors(self):
        self.stdout.write('👨‍🏫 إنشاء الدكاتره...')
        # أنشئ أدمن لو مش موجود
        if not User.objects.filter(email='admin@edu.com').exists():
            User.objects.create_superuser(
                email='admin@edu.com', password='Admin1234!',
                first_name='Admin', last_name='System',
            )
            self.stdout.write('  ✅ admin@edu.com')

        instructors = {}
        for data in INSTRUCTORS:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'first_name':    data['first_name'],
                    'last_name':     data['last_name'],
                    'is_instructor': True,
                    'is_approved':   True,
                    'is_active':     True,
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()

            profile, _ = InstructorProfile.objects.get_or_create(user=user)
            for k, v in data['profile'].items():
                setattr(profile, k, v)
            profile.save()

            instructors[data['email']] = user
            status = '✅ جديد' if created else '⏭ موجود'
            self.stdout.write(f'  {status} {data["first_name"]} {data["last_name"]}')

        return instructors

    def _create_students(self):
        self.stdout.write('\n👨‍🎓 إنشاء الطلاب...')
        students = []
        for data in STUDENTS:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name':  data['last_name'],
                    'is_instructor': False,
                    'is_active': True,
                }
            )
            if created:
                user.set_password('Test1234!')
                user.save()
                StudentProfile.objects.get_or_create(user=user)
            students.append(user)
            status = '✅' if created else '⏭'
            self.stdout.write(f'  {status} {data["first_name"]}')
        return students

    def _create_courses(self, instructors):
        self.stdout.write('\n📚 إنشاء الكورسات...')
        courses = []
        for data in COURSES_DATA:
            instructor = instructors.get(data['instructor_email'])
            if not instructor:
                continue

            course, created = Course.objects.get_or_create(
                title=data['title'],
                defaults={
                    'instructor':    instructor,
                    'description':   data['description'],
                    'price':         data.get('price', 0),
                    'discount_price':data.get('discount_price'),
                    'is_approved':   True,
                    'is_published':  True,
                }
            )
            if not created:
                self.stdout.write(f'  ⏭ موجود: {data["title"][:40]}')
                courses.append(course)
                continue

            # أنشئ الـ sections والـ lectures
            for sec_order, sec_data in enumerate(data.get('sections', []), 1):
                # نتعامل مع unique_together بحذر
                section = Section.objects.filter(
                    course=course, title=sec_data['title']
                ).first()
                if not section:
                    # ابحث عن order متاح
                    used_orders = set(
                        Section.objects.filter(course=course).values_list('order', flat=True)
                    )
                    order = sec_order
                    while order in used_orders:
                        order += 1
                    section = Section.objects.create(
                        course=course, title=sec_data['title'], order=order
                    )

                for lec_order, lec in enumerate(sec_data.get('lectures', []), 1):
                    used_lec_orders = set(
                        Lecture.objects.filter(section=section).values_list('order', flat=True)
                    )
                    order = lec_order
                    while order in used_lec_orders:
                        order += 1
                    Lecture.objects.get_or_create(
                        section=section, title=lec['title'],
                        defaults={
                            'video_type':     'youtube',
                            'video_url':      lec['url'],
                            'video_status':   'approved',
                            'duration_minutes': lec['duration'],
                            'order':          order,
                            'is_free_preview': lec.get('free', False),
                        }
                    )

            courses.append(course)
            self.stdout.write(f'  ✅ {data["title"][:40]}')
        return courses

    def _create_experiences(self, instructors, courses):
        self.stdout.write('\n🧪 إنشاء التجارب...')
        for data in EXPERIENCES_DATA:
            instructor = instructors.get(data['instructor_email'])
            if not instructor:
                continue

            exp, created = Experience.objects.get_or_create(
                title=data['title'],
                defaults={
                    'instructor':         instructor,
                    'description':        data['description'],
                    'price':              data.get('price', 0),
                    'discount_price':     data.get('discount_price'),
                    'preview_video_url':  data.get('preview'),
                    'content_video_url':  data.get('content'),
                    'is_approved':        True,
                    'status':             'published',
                    'is_featured':        data.get('price', 0) > 0,
                    'instructor_cut':     70,
                    'college_cut':        30,
                }
            )
            status = '✅ جديد' if created else '⏭ موجود'
            self.stdout.write(f'  {status} {data["title"][:40]}')

    def _create_enrollments(self, students, courses):
        self.stdout.write('\n📝 إنشاء الاشتراكات...')
        count = 0
        published = [c for c in courses if c.is_published and c.is_approved]
        for student in students:
            # كل طالب يشترك في 2-4 كورسات عشوائية
            sample = random.sample(published, min(random.randint(2, 4), len(published)))
            for course in sample:
                _, created = Enrollment.objects.get_or_create(
                    student=student, course=course,
                    defaults={
                        'amount_paid':    course.effective_price,
                        'payment_status': 'completed',
                    }
                )
                if created:
                    count += 1
        self.stdout.write(f'  ✅ {count} اشتراك جديد')