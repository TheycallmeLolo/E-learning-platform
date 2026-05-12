# backend/management/commands/seed_science.py
# ══════════════════════════════════════════════════════════════
# شغّله بـ: python manage.py seed_science
# ══════════════════════════════════════════════════════════════
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import InstructorProfile, StudentProfile
from courses.models import Course, Section, Lecture
from payments.models import Enrollment
from experiences.models import Experience

User = get_user_model()

# ── دكاتره جدد ─────────────────────────────────────────────────
INSTRUCTORS = [
    {
        'email': 'dr.chemistry@edu.com', 'password': 'Test1234!',
        'first_name': 'هاني', 'last_name': 'عبدالله',
        'profile': {
            'title': 'dr', 'department': 'Chemistry',
            'university': 'Cairo University',
            'expertise': 'Organic Chemistry, Physical Chemistry, Biochemistry',
            'bio': 'دكتور متخصص في الكيمياء العضوية والفيزيائية مع خبرة 15 عاماً في التدريس الجامعي.',
            'years_experience': 15, 'is_featured': True,
            'office_hours': 'السبت والاثنين 9ص-11ص',
        }
    },
    {
        'email': 'dr.physics@edu.com', 'password': 'Test1234!',
        'first_name': 'رامي', 'last_name': 'الشريف',
        'profile': {
            'title': 'prof', 'department': 'Physics',
            'university': 'Alexandria University',
            'expertise': 'Quantum Mechanics, Thermodynamics, Optics',
            'bio': 'أستاذ دكتور في الفيزياء النظرية، متخصص في ميكانيكا الكم والديناميكا الحرارية.',
            'years_experience': 20, 'is_featured': True,
        }
    },
    {
        'email': 'dr.math@edu.com', 'password': 'Test1234!',
        'first_name': 'نادية', 'last_name': 'فاروق',
        'profile': {
            'title': 'dr', 'department': 'Mathematics',
            'university': 'Mansoura University',
            'expertise': 'Calculus, Linear Algebra, Differential Equations',
            'bio': 'دكتورة رياضيات متخصصة في التحليل الرياضي والجبر الخطي وحل المعادلات التفاضلية.',
            'years_experience': 12, 'is_featured': True,
        }
    },
    {
        'email': 'dr.biology@edu.com', 'password': 'Test1234!',
        'first_name': 'إيمان', 'last_name': 'مصطفى',
        'profile': {
            'title': 'dr', 'department': 'Biology & Genetics',
            'university': 'Ain Shams University',
            'expertise': 'Molecular Biology, Genetics, Cell Biology',
            'bio': 'دكتورة أحياء جزيئية وجينيات، لها أبحاث منشورة في مجلات علمية دولية.',
            'years_experience': 11, 'is_featured': False,
        }
    },
    {
        'email': 'dr.economics@edu.com', 'password': 'Test1234!',
        'first_name': 'طارق', 'last_name': 'حلمي',
        'profile': {
            'title': 'dr', 'department': 'Economics & Finance',
            'university': 'Helwan University',
            'expertise': 'Microeconomics, Macroeconomics, Financial Markets',
            'bio': 'دكتور اقتصاد وتمويل، خبير في الأسواق المالية والتحليل الاقتصادي.',
            'years_experience': 14, 'is_featured': True,
        }
    },
    {
        'email': 'dr.arabic@edu.com', 'password': 'Test1234!',
        'first_name': 'سلمى', 'last_name': 'الدسوقي',
        'profile': {
            'title': 'dr', 'department': 'Arabic Language & Literature',
            'university': 'Cairo University',
            'expertise': 'Arabic Grammar, Literature, Linguistics',
            'bio': 'دكتورة لغة عربية وأدب، متخصصة في النحو والصرف والبلاغة والنقد الأدبي.',
            'years_experience': 13, 'is_featured': False,
        }
    },
    {
        'email': 'dr.medicine@edu.com', 'password': 'Test1234!',
        'first_name': 'أحمد', 'last_name': 'الجندي',
        'profile': {
            'title': 'dr', 'department': 'Medicine & Surgery',
            'university': 'Cairo University',
            'expertise': 'Anatomy, Physiology, Pharmacology',
            'bio': 'طبيب واستشاري ومدرس في كلية الطب، متخصص في تدريس مواد السنوات الأولى.',
            'years_experience': 16, 'is_featured': True,
        }
    },
    {
        'email': 'dr.engineering@edu.com', 'password': 'Test1234!',
        'first_name': 'مصطفى', 'last_name': 'النجار',
        'profile': {
            'title': 'eng', 'department': 'Civil & Structural Engineering',
            'university': 'Zagazig University',
            'expertise': 'Structural Analysis, Fluid Mechanics, Engineering Drawing',
            'bio': 'مهندس إنشائي وأستاذ جامعي متخصص في التحليل الإنشائي وميكانيكا الموائع.',
            'years_experience': 9, 'is_featured': False,
        }
    },
]

# ── كورسات جديدة ────────────────────────────────────────────────
COURSES_DATA = [
    # ── كيمياء ────────────────────────────────────────────────
    {
        'instructor_email': 'dr.chemistry@edu.com',
        'title': 'الكيمياء العضوية من الصفر',
        'description': 'شرح شامل لمادة الكيمياء العضوية — المجموعات الوظيفية، التفاعلات، والآليات.',
        'price': 0,
        'sections': [
            {
                'title': 'مقدمة في الكيمياء العضوية',
                'lectures': [
                    {'title': 'ما هي الكيمياء العضوية؟', 'url': 'https://www.youtube.com/watch?v=4GqJRPz3oBc', 'duration': 20, 'free': True},
                    {'title': 'الهيدروكربونات الأساسية', 'url': 'https://www.youtube.com/watch?v=GfYgZMa2Gc0', 'duration': 30, 'free': True},
                    {'title': 'الألكانات والألكينات', 'url': 'https://www.youtube.com/watch?v=UMzGaWr1PO8', 'duration': 35, 'free': False},
                ]
            },
            {
                'title': 'المجموعات الوظيفية',
                'lectures': [
                    {'title': 'الكحولات والإيثرات', 'url': 'https://www.youtube.com/watch?v=lOBpCH_MJxo', 'duration': 40, 'free': False},
                    {'title': 'الألدهيدات والكيتونات', 'url': 'https://www.youtube.com/watch?v=Y3bpIBbqSKs', 'duration': 38, 'free': False},
                    {'title': 'الأحماض الكربوكسيلية', 'url': 'https://www.youtube.com/watch?v=UMzGaWr1PO8', 'duration': 42, 'free': False},
                ]
            },
            {
                'title': 'التفاعلات العضوية',
                'lectures': [
                    {'title': 'تفاعلات الإحلال', 'url': 'https://www.youtube.com/watch?v=4GqJRPz3oBc', 'duration': 45, 'free': False},
                    {'title': 'تفاعلات الإضافة', 'url': 'https://www.youtube.com/watch?v=GfYgZMa2Gc0', 'duration': 40, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.chemistry@edu.com',
        'title': 'الكيمياء الفيزيائية — الترموديناميك',
        'description': 'شرح معمّق لقوانين الديناميكا الحرارية في الكيمياء مع حل مسائل متقدمة.',
        'price': 249,
        'discount_price': 179,
        'sections': [
            {
                'title': 'القانون الأول للترموديناميك',
                'lectures': [
                    {'title': 'الطاقة الداخلية والحرارة', 'url': 'https://www.youtube.com/watch?v=4GqJRPz3oBc', 'duration': 35, 'free': True},
                    {'title': 'الانثالبي وقياس الحرارة', 'url': 'https://www.youtube.com/watch?v=GfYgZMa2Gc0', 'duration': 40, 'free': False},
                ]
            },
            {
                'title': 'القانون الثاني والإنتروبي',
                'lectures': [
                    {'title': 'مفهوم الإنتروبي', 'url': 'https://www.youtube.com/watch?v=lOBpCH_MJxo', 'duration': 45, 'free': False},
                    {'title': 'طاقة جيبس وتلقائية التفاعل', 'url': 'https://www.youtube.com/watch?v=Y3bpIBbqSKs', 'duration': 50, 'free': False},
                ]
            },
        ]
    },

    # ── فيزياء ────────────────────────────────────────────────
    {
        'instructor_email': 'dr.physics@edu.com',
        'title': 'الفيزياء العامة — المستوى الأول',
        'description': 'مادة الفيزياء العامة لطلاب الجامعة: الميكانيكا، الديناميكا الحرارية، الأمواج.',
        'price': 0,
        'sections': [
            {
                'title': 'الميكانيكا الكلاسيكية',
                'lectures': [
                    {'title': 'الحركة والسرعة والتسارع', 'url': 'https://www.youtube.com/watch?v=ZM8ECpBuQYE', 'duration': 25, 'free': True},
                    {'title': 'قوانين نيوتن للحركة', 'url': 'https://www.youtube.com/watch?v=kKKM8Y-u7ds', 'duration': 35, 'free': True},
                    {'title': 'الشغل والطاقة', 'url': 'https://www.youtube.com/watch?v=2WS1sG9fhOk', 'duration': 30, 'free': False},
                ]
            },
            {
                'title': 'الأمواج والصوت',
                'lectures': [
                    {'title': 'خصائص الأمواج', 'url': 'https://www.youtube.com/watch?v=TXa7penBT_I', 'duration': 28, 'free': False},
                    {'title': 'الأمواج الصوتية', 'url': 'https://www.youtube.com/watch?v=GkB_T5FqaQQ', 'duration': 32, 'free': False},
                    {'title': 'ظاهرة دوبلر', 'url': 'https://www.youtube.com/watch?v=h4OnBYrbCjY', 'duration': 25, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.physics@edu.com',
        'title': 'ميكانيكا الكم — مقدمة',
        'description': 'مقدمة شاملة في ميكانيكا الكم: موجة دي برولي، مبدأ عدم اليقين، معادلة شرودنجر.',
        'price': 349,
        'discount_price': 279,
        'sections': [
            {
                'title': 'أسس ميكانيكا الكم',
                'lectures': [
                    {'title': 'الجسيم والموجة', 'url': 'https://www.youtube.com/watch?v=p7bzE1E5PMY', 'duration': 40, 'free': True},
                    {'title': 'مبدأ عدم اليقين', 'url': 'https://www.youtube.com/watch?v=TQKELOE9eY4', 'duration': 35, 'free': False},
                    {'title': 'معادلة شرودنجر', 'url': 'https://www.youtube.com/watch?v=ZcESkQVFm1M', 'duration': 50, 'free': False},
                ]
            },
            {
                'title': 'التطبيقات',
                'lectures': [
                    {'title': 'الجسيم في صندوق', 'url': 'https://www.youtube.com/watch?v=n7FBjJNS7Qs', 'duration': 45, 'free': False},
                    {'title': 'المتذبذب التوافقي', 'url': 'https://www.youtube.com/watch?v=8HGJMsOCGdA', 'duration': 48, 'free': False},
                ]
            },
        ]
    },

    # ── رياضيات ───────────────────────────────────────────────
    {
        'instructor_email': 'dr.math@edu.com',
        'title': 'حساب التفاضل والتكامل',
        'description': 'شرح شامل لمادة الكالكولوس: الحدود، الاشتقاق، التكامل، مع أمثلة محلولة.',
        'price': 0,
        'sections': [
            {
                'title': 'الحدود والاستمرارية',
                'lectures': [
                    {'title': 'مفهوم الحد', 'url': 'https://www.youtube.com/watch?v=riXcZT2ICjA', 'duration': 22, 'free': True},
                    {'title': 'قوانين الحدود', 'url': 'https://www.youtube.com/watch?v=Yt6L-4tDXsQ', 'duration': 28, 'free': True},
                    {'title': 'الاستمرارية', 'url': 'https://www.youtube.com/watch?v=-hgHlHkCF3g', 'duration': 25, 'free': False},
                ]
            },
            {
                'title': 'الاشتقاق',
                'lectures': [
                    {'title': 'تعريف المشتقة', 'url': 'https://www.youtube.com/watch?v=9vKqVkMQHKk', 'duration': 35, 'free': False},
                    {'title': 'قواعد الاشتقاق', 'url': 'https://www.youtube.com/watch?v=kAv5pahIevE', 'duration': 40, 'free': False},
                    {'title': 'قاعدة السلسلة', 'url': 'https://www.youtube.com/watch?v=H-ybCx8gt-8', 'duration': 35, 'free': False},
                ]
            },
            {
                'title': 'التكامل',
                'lectures': [
                    {'title': 'التكامل غير المحدود', 'url': 'https://www.youtube.com/watch?v=rfG8ce4nNh0', 'duration': 38, 'free': False},
                    {'title': 'التكامل المحدود', 'url': 'https://www.youtube.com/watch?v=0RdI3-8G4Fs', 'duration': 42, 'free': False},
                    {'title': 'نظرية الحساب الأساسية', 'url': 'https://www.youtube.com/watch?v=1p0NHR5w0Lc', 'duration': 40, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.math@edu.com',
        'title': 'الجبر الخطي',
        'description': 'المصفوفات، المحددات، الفضاءات الجزيئية، والقيم الذاتية — شرح وافٍ مع تمارين.',
        'price': 199,
        'sections': [
            {
                'title': 'المصفوفات والمحددات',
                'lectures': [
                    {'title': 'مقدمة في المصفوفات', 'url': 'https://www.youtube.com/watch?v=xyAuNHPsq-g', 'duration': 30, 'free': True},
                    {'title': 'العمليات على المصفوفات', 'url': 'https://www.youtube.com/watch?v=FX4C-JpTFgY', 'duration': 35, 'free': False},
                    {'title': 'المحددات', 'url': 'https://www.youtube.com/watch?v=aKhhYguY0DQ', 'duration': 40, 'free': False},
                ]
            },
            {
                'title': 'الأنظمة الخطية والقيم الذاتية',
                'lectures': [
                    {'title': 'حل الأنظمة الخطية', 'url': 'https://www.youtube.com/watch?v=4eyURs_szNw', 'duration': 45, 'free': False},
                    {'title': 'القيم والمتجهات الذاتية', 'url': 'https://www.youtube.com/watch?v=PFDu9oVAE-g', 'duration': 50, 'free': False},
                ]
            },
        ]
    },

    # ── أحياء ─────────────────────────────────────────────────
    {
        'instructor_email': 'dr.biology@edu.com',
        'title': 'الأحياء الجزيئية وعلم الجينات',
        'description': 'DNA، RNA، الوراثة الجزيئية، وتقنيات البيولوجيا الحديثة مع تطبيقات طبية.',
        'price': 279,
        'discount_price': 199,
        'sections': [
            {
                'title': 'تركيب DNA والنسخ',
                'lectures': [
                    {'title': 'تركيب الحمض النووي', 'url': 'https://www.youtube.com/watch?v=8kK2zwjRV0M', 'duration': 30, 'free': True},
                    {'title': 'تضاعف DNA', 'url': 'https://www.youtube.com/watch?v=TNKWgcFPHqw', 'duration': 35, 'free': False},
                    {'title': 'النسخ والترجمة', 'url': 'https://www.youtube.com/watch?v=gG7uCskUOrA', 'duration': 40, 'free': False},
                ]
            },
            {
                'title': 'الوراثة والجينات',
                'lectures': [
                    {'title': 'قوانين مندل', 'url': 'https://www.youtube.com/watch?v=NWqgZUnJdAY', 'duration': 38, 'free': False},
                    {'title': 'الطفرات الجينية', 'url': 'https://www.youtube.com/watch?v=8m6hHRlKwxY', 'duration': 42, 'free': False},
                    {'title': 'الهندسة الوراثية', 'url': 'https://www.youtube.com/watch?v=MkLBos_Yfmc', 'duration': 45, 'free': False},
                ]
            },
        ]
    },

    # ── اقتصاد ────────────────────────────────────────────────
    {
        'instructor_email': 'dr.economics@edu.com',
        'title': 'الاقتصاد الجزئي — المستوى الأول',
        'description': 'مقدمة شاملة في الاقتصاد الجزئي: العرض والطلب، المرونة، نظرية المستهلك.',
        'price': 0,
        'sections': [
            {
                'title': 'العرض والطلب',
                'lectures': [
                    {'title': 'قانون الطلب وأسبابه', 'url': 'https://www.youtube.com/watch?v=PNtKXWNKGN8', 'duration': 22, 'free': True},
                    {'title': 'قانون العرض', 'url': 'https://www.youtube.com/watch?v=ewPNugIqCUM', 'duration': 20, 'free': True},
                    {'title': 'التوازن وآليات السوق', 'url': 'https://www.youtube.com/watch?v=JFBHPkLH1h8', 'duration': 28, 'free': False},
                ]
            },
            {
                'title': 'المرونة ونظرية المستهلك',
                'lectures': [
                    {'title': 'مرونة الطلب السعرية', 'url': 'https://www.youtube.com/watch?v=9RfPx5V_gX4', 'duration': 35, 'free': False},
                    {'title': 'منفعة المستهلك', 'url': 'https://www.youtube.com/watch?v=swnoF533C_c', 'duration': 38, 'free': False},
                    {'title': 'منحنيات السواء', 'url': 'https://www.youtube.com/watch?v=Lp6HFd2DLFQ', 'duration': 32, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.economics@edu.com',
        'title': 'الأسواق المالية والاستثمار',
        'description': 'فهم أسواق الأسهم والسندات وصناديق الاستثمار وكيفية اتخاذ قرارات استثمارية صحيحة.',
        'price': 349,
        'discount_price': 249,
        'sections': [
            {
                'title': 'أساسيات الأسواق المالية',
                'lectures': [
                    {'title': 'ما هي الأسواق المالية؟', 'url': 'https://www.youtube.com/watch?v=f5j9v9dfinQ', 'duration': 25, 'free': True},
                    {'title': 'أنواع الأوراق المالية', 'url': 'https://www.youtube.com/watch?v=LX2I8b4o9lI', 'duration': 30, 'free': False},
                    {'title': 'تحليل السوق المالي', 'url': 'https://www.youtube.com/watch?v=EiwQyJf2lE0', 'duration': 40, 'free': False},
                ]
            },
            {
                'title': 'إدارة المحافظ الاستثمارية',
                'lectures': [
                    {'title': 'تنويع المحفظة', 'url': 'https://www.youtube.com/watch?v=obNXgGP_uU0', 'duration': 35, 'free': False},
                    {'title': 'تقييم المخاطر والعائد', 'url': 'https://www.youtube.com/watch?v=0wvvJmv-XdQ', 'duration': 42, 'free': False},
                ]
            },
        ]
    },

    # ── لغة عربية ─────────────────────────────────────────────
    {
        'instructor_email': 'dr.arabic@edu.com',
        'title': 'النحو العربي الميسّر',
        'description': 'تعلم قواعد النحو العربي بأسلوب سهل وممتع مع تطبيقات على نصوص قرآنية وأدبية.',
        'price': 0,
        'sections': [
            {
                'title': 'المبتدأ والخبر',
                'lectures': [
                    {'title': 'تعريف المبتدأ وأنواعه', 'url': 'https://www.youtube.com/watch?v=YfKGzC8X6go', 'duration': 20, 'free': True},
                    {'title': 'الخبر وأشكاله', 'url': 'https://www.youtube.com/watch?v=YfKGzC8X6go', 'duration': 22, 'free': True},
                    {'title': 'الجملة الاسمية كاملاً', 'url': 'https://www.youtube.com/watch?v=YfKGzC8X6go', 'duration': 28, 'free': False},
                ]
            },
            {
                'title': 'الفعل والفاعل',
                'lectures': [
                    {'title': 'أنواع الفعل', 'url': 'https://www.youtube.com/watch?v=YfKGzC8X6go', 'duration': 25, 'free': False},
                    {'title': 'الفاعل ونائب الفاعل', 'url': 'https://www.youtube.com/watch?v=YfKGzC8X6go', 'duration': 30, 'free': False},
                    {'title': 'المفعول به والمطلق', 'url': 'https://www.youtube.com/watch?v=YfKGzC8X6go', 'duration': 35, 'free': False},
                ]
            },
        ]
    },

    # ── طب ────────────────────────────────────────────────────
    {
        'instructor_email': 'dr.medicine@edu.com',
        'title': 'تشريح الجسم البشري — المستوى الأول',
        'description': 'مادة التشريح لطلاب الطب: الجهاز الهيكلي، الجهاز العضلي، وأجهزة الجسم الرئيسية.',
        'price': 299,
        'discount_price': 229,
        'sections': [
            {
                'title': 'الجهاز الهيكلي',
                'lectures': [
                    {'title': 'مقدمة في علم التشريح', 'url': 'https://www.youtube.com/watch?v=uBGl2BujkPQ', 'duration': 25, 'free': True},
                    {'title': 'عظام الجمجمة والعمود الفقري', 'url': 'https://www.youtube.com/watch?v=_LuAf1Gzmzw', 'duration': 40, 'free': False},
                    {'title': 'عظام الأطراف العلوية', 'url': 'https://www.youtube.com/watch?v=uBGl2BujkPQ', 'duration': 38, 'free': False},
                ]
            },
            {
                'title': 'الجهاز القلبي الوعائي',
                'lectures': [
                    {'title': 'تشريح القلب', 'url': 'https://www.youtube.com/watch?v=X9ZZ6tcxArI', 'duration': 45, 'free': False},
                    {'title': 'الدورة الدموية', 'url': 'https://www.youtube.com/watch?v=CWFyxn0qDEU', 'duration': 42, 'free': False},
                    {'title': 'الشرايين والأوردة الرئيسية', 'url': 'https://www.youtube.com/watch?v=X9ZZ6tcxArI', 'duration': 50, 'free': False},
                ]
            },
        ]
    },
    {
        'instructor_email': 'dr.medicine@edu.com',
        'title': 'الفسيولوجيا البشرية المبسطة',
        'description': 'كيف يعمل جسم الإنسان؟ الجهاز العصبي، التنفس، الهضم، والغدد الصماء.',
        'price': 0,
        'sections': [
            {
                'title': 'الجهاز العصبي',
                'lectures': [
                    {'title': 'تركيب الخلية العصبية', 'url': 'https://www.youtube.com/watch?v=ob5L9E7gabY', 'duration': 28, 'free': True},
                    {'title': 'انتقال السيالة العصبية', 'url': 'https://www.youtube.com/watch?v=KGXmL7DqsM8', 'duration': 32, 'free': True},
                    {'title': 'الجهاز العصبي المركزي', 'url': 'https://www.youtube.com/watch?v=oa6rvUJlg7o', 'duration': 40, 'free': False},
                ]
            },
            {
                'title': 'الجهاز الهضمي',
                'lectures': [
                    {'title': 'مراحل الهضم', 'url': 'https://www.youtube.com/watch?v=ulBpMPPcOaY', 'duration': 35, 'free': False},
                    {'title': 'امتصاص العناصر الغذائية', 'url': 'https://www.youtube.com/watch?v=oa6rvUJlg7o', 'duration': 30, 'free': False},
                ]
            },
        ]
    },

    # ── هندسة ──────────────────────────────────────────────────
    {
        'instructor_email': 'dr.engineering@edu.com',
        'title': 'ميكانيكا الموائع',
        'description': 'شرح شامل لمبادئ ميكانيكا الموائع: الضغط، الجريان، معادلة برنولي، والتطبيقات الهندسية.',
        'price': 199,
        'sections': [
            {
                'title': 'الضغط وقانون باسكال',
                'lectures': [
                    {'title': 'تعريف الضغط وأنواعه', 'url': 'https://www.youtube.com/watch?v=y4tFnbWQiSQ', 'duration': 25, 'free': True},
                    {'title': 'قانون باسكال', 'url': 'https://www.youtube.com/watch?v=gQbZLSUr3Ns', 'duration': 30, 'free': False},
                    {'title': 'الطفو وأرخميدس', 'url': 'https://www.youtube.com/watch?v=Eu-_4G2XQjI', 'duration': 28, 'free': False},
                ]
            },
            {
                'title': 'الجريان وقانون برنولي',
                'lectures': [
                    {'title': 'أنواع الجريان', 'url': 'https://www.youtube.com/watch?v=aeEyiGZqpis', 'duration': 32, 'free': False},
                    {'title': 'معادلة برنولي', 'url': 'https://www.youtube.com/watch?v=TcMgkU3pFBY', 'duration': 40, 'free': False},
                    {'title': 'تطبيقات هندسية', 'url': 'https://www.youtube.com/watch?v=y4tFnbWQiSQ', 'duration': 38, 'free': False},
                ]
            },
        ]
    },
]

# ── تجارب جديدة ────────────────────────────────────────────────
EXPERIENCES_DATA = [
    {
        'instructor_email': 'dr.chemistry@edu.com',
        'title': 'حل مسائل الكيمياء العضوية — الامتحانات',
        'description': 'شرح حلول أصعب مسائل الكيمياء العضوية التي تأتي في الامتحانات مع تحليل كل خطوة.',
        'price': 119, 'discount_price': 89,
        'preview': 'https://www.youtube.com/watch?v=4GqJRPz3oBc',
        'content': 'https://www.youtube.com/watch?v=UMzGaWr1PO8',
    },
    {
        'instructor_email': 'dr.physics@edu.com',
        'title': 'تجربة سكشن الديناميكا الحرارية — حلول',
        'description': 'كيف تحل مسائل الترموديناميك في 3 خطوات فقط مع نماذج امتحانات محلولة.',
        'price': 149,
        'preview': 'https://www.youtube.com/watch?v=ZM8ECpBuQYE',
        'content': 'https://www.youtube.com/watch?v=2WS1sG9fhOk',
    },
    {
        'instructor_email': 'dr.math@edu.com',
        'title': 'ورشة التكامل — 20 مسألة محلولة',
        'description': 'حل 20 مسألة تكامل من مستويات مختلفة مع شرح الأسلوب والتقنية المستخدمة.',
        'price': 0,
        'preview': 'https://www.youtube.com/watch?v=rfG8ce4nNh0',
        'content': 'https://www.youtube.com/watch?v=0RdI3-8G4Fs',
    },
    {
        'instructor_email': 'dr.biology@edu.com',
        'title': 'تجربة الجينات والوراثة — مسائل محلولة',
        'description': 'حل مسائل الوراثة المندلية والجزيئية من امتحانات سابقة مع شرح المفاهيم.',
        'price': 129,
        'preview': 'https://www.youtube.com/watch?v=NWqgZUnJdAY',
        'content': 'https://www.youtube.com/watch?v=8kK2zwjRV0M',
    },
    {
        'instructor_email': 'dr.economics@edu.com',
        'title': 'تحليل سوق مالي حقيقي — تجربة عملية',
        'description': 'تحليل كامل لسوق بورصة حقيقية خطوة بخطوة مع استخدام مؤشرات فنية وأساسية.',
        'price': 199, 'discount_price': 149,
        'preview': 'https://www.youtube.com/watch?v=f5j9v9dfinQ',
        'content': 'https://www.youtube.com/watch?v=LX2I8b4o9lI',
    },
    {
        'instructor_email': 'dr.medicine@edu.com',
        'title': 'تشريح القلب — جلسة مكثفة',
        'description': 'شرح مكثف لتشريح القلب والدورة الدموية مع رسومات توضيحية وأسئلة امتحانية.',
        'price': 169, 'discount_price': 129,
        'preview': 'https://www.youtube.com/watch?v=X9ZZ6tcxArI',
        'content': 'https://www.youtube.com/watch?v=CWFyxn0qDEU',
    },
    {
        'instructor_email': 'dr.arabic@edu.com',
        'title': 'الإعراب التطبيقي — نصوص محلولة',
        'description': 'إعراب 15 جملة من القرآن الكريم والنصوص الأدبية مع شرح كامل لكل كلمة.',
        'price': 0,
        'preview': 'https://www.youtube.com/watch?v=YfKGzC8X6go',
        'content': 'https://www.youtube.com/watch?v=YfKGzC8X6go',
    },
    {
        'instructor_email': 'dr.engineering@edu.com',
        'title': 'تطبيقات برنولي في الهندسة',
        'description': 'حل مسائل هندسية حقيقية باستخدام معادلة برنولي مع أمثلة من الصناعة.',
        'price': 99,
        'preview': 'https://www.youtube.com/watch?v=TcMgkU3pFBY',
        'content': 'https://www.youtube.com/watch?v=aeEyiGZqpis',
    },
]

# ── طلاب إضافيين ────────────────────────────────────────────────
EXTRA_STUDENTS = [
    {'email': 'student9@test.com',  'first_name': 'لميس',   'last_name': 'سعد'},
    {'email': 'student10@test.com', 'first_name': 'حسام',   'last_name': 'عمر'},
    {'email': 'student11@test.com', 'first_name': 'ريم',    'last_name': 'إسماعيل'},
    {'email': 'student12@test.com', 'first_name': 'باسم',   'last_name': 'النجار'},
    {'email': 'student13@test.com', 'first_name': 'شيماء',  'last_name': 'حافظ'},
    {'email': 'student14@test.com', 'first_name': 'زياد',   'last_name': 'مجدي'},
]


class Command(BaseCommand):
    help = 'إضافة داتا في مجالات الكيمياء والفيزياء والرياضيات وغيرها'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true',
                            help='احذف الداتا القديمة المرتبطة بهذا الـ seed فقط')

    def handle(self, *args, **options):
        if options['clear']:
            emails = [i['email'] for i in INSTRUCTORS]
            User.objects.filter(email__in=emails).delete()
            self.stdout.write('✅ تم حذف الداتا القديمة')

        self.stdout.write('🚀 بدء إضافة الداتا الجديدة...\n')

        instructors = self._create_instructors()
        students    = self._create_students()
        courses     = self._create_courses(instructors)
        self._create_experiences(instructors)
        self._create_enrollments(students, courses)

        self.stdout.write(self.style.SUCCESS('\n✅ تم ملء الداتابيز بنجاح!\n'))
        self.stdout.write('─' * 55)
        self.stdout.write(f'👨‍🏫 دكاتره جدد:  {len(instructors)}')
        self.stdout.write(f'👨‍🎓 طلاب جدد:    {len(students)}')
        self.stdout.write(f'📚 كورسات جديدة: {len(courses)}')
        self.stdout.write(f'🧪 تجارب جديدة:  {len(EXPERIENCES_DATA)}')
        self.stdout.write('─' * 55)
        self.stdout.write('\nالمجالات المضافة:')
        self.stdout.write('  🧪 كيمياء | ⚛️ فيزياء | 📐 رياضيات')
        self.stdout.write('  🧬 أحياء  | 💰 اقتصاد | 📝 لغة عربية')
        self.stdout.write('  🩺 طب     | ⚙️ هندسة')
        self.stdout.write('\n📧 بيانات الدخول:')
        for inst in INSTRUCTORS:
            self.stdout.write(f'  {inst["first_name"]}: {inst["email"]} / {inst["password"]}')
        self.stdout.write('  الطلاب: student9→14@test.com / Test1234!')

    def _create_instructors(self):
        self.stdout.write('👨‍🏫 إنشاء الدكاتره...')
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
            status = '✅' if created else '⏭'
            self.stdout.write(f'  {status} {data["first_name"]} — {data["profile"]["expertise"].split(",")[0]}')

        return instructors

    def _create_students(self):
        self.stdout.write('\n👨‍🎓 إنشاء الطلاب...')
        students = []
        for data in EXTRA_STUDENTS:
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
                self.stdout.write(f'  ⏭ موجود: {data["title"][:45]}')
                courses.append(course)
                continue

            for sec_order, sec_data in enumerate(data.get('sections', []), 1):
                section = Section.objects.filter(
                    course=course, title=sec_data['title']
                ).first()
                if not section:
                    used = set(Section.objects.filter(course=course).values_list('order', flat=True))
                    order = sec_order
                    while order in used:
                        order += 1
                    section = Section.objects.create(
                        course=course, title=sec_data['title'], order=order
                    )

                for lec_order, lec in enumerate(sec_data.get('lectures', []), 1):
                    used_lec = set(Lecture.objects.filter(section=section).values_list('order', flat=True))
                    order = lec_order
                    while order in used_lec:
                        order += 1
                    Lecture.objects.get_or_create(
                        section=section, title=lec['title'],
                        defaults={
                            'video_type':      'youtube',
                            'video_url':       lec['url'],
                            'video_status':    'approved',
                            'duration_minutes': lec['duration'],
                            'order':           order,
                            'is_free_preview': lec.get('free', False),
                        }
                    )

            courses.append(course)
            price_str = 'مجاني' if data.get('price', 0) == 0 else f"{data['price']} EGP"
            self.stdout.write(f'  ✅ {data["title"][:45]} ({price_str})')

        return courses

    def _create_experiences(self, instructors):
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
                    'is_featured':        data.get('price', 0) > 100,
                    'instructor_cut':     70,
                    'college_cut':        30,
                }
            )
            status = '✅' if created else '⏭'
            price_str = 'مجاني' if data.get('price', 0) == 0 else f"{data['price']} EGP"
            self.stdout.write(f'  {status} {data["title"][:45]} ({price_str})')

    def _create_enrollments(self, students, courses):
        self.stdout.write('\n📝 إنشاء الاشتراكات...')
        count = 0
        published = [c for c in courses if c.is_published and c.is_approved]
        if not published:
            self.stdout.write('  ⚠ لا توجد كورسات منشورة')
            return
        for student in students:
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
