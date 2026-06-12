// src/data/tracks.js
// البيانات مستخرجة من seed_science.py و seed_data.py

export const TRACKS = [
  {
    id: 'cs',
    name: 'Computer Science',
    nameAr: 'علوم الحاسب',
    icon: '💻',
    color: '#378ADD',
    colorLight: '#E6F1FB',
    courses: [
      { title: 'Python للمبتدئين من الصفر', duration: '12 ساعة', level: 'مبتدئ', dept: 'Computer Science' },
      { title: 'Data Science بالعربي', duration: '15 ساعة', level: 'متوسط', dept: 'Mathematics & Statistics' },
      { title: 'Machine Learning من الصفر للاحتراف', duration: '20 ساعة', level: 'متوسط', dept: 'Computer Science' },
      { title: 'Deep Learning وNeural Networks', duration: '18 ساعة', level: 'متقدم', dept: 'Computer Science' },
    ],
  },
  {
    id: 'web',
    name: 'Web Development',
    nameAr: 'تطوير الويب',
    icon: '🌐',
    color: '#1D9E75',
    colorLight: '#E1F5EE',
    courses: [
      { title: 'Python للمبتدئين من الصفر', duration: '12 ساعة', level: 'مبتدئ', dept: 'Computer Science' },
      { title: 'React.js الدليل الشامل', duration: '16 ساعة', level: 'متوسط', dept: 'Software Engineering' },
      { title: 'Django REST Framework الشامل', duration: '14 ساعة', level: 'متوسط', dept: 'Software Engineering' },
    ],
  },
  {
    id: 'sec',
    name: 'Cybersecurity',
    nameAr: 'أمن المعلومات',
    icon: '🔐',
    color: '#D85A30',
    colorLight: '#FAECE7',
    courses: [
      { title: 'Python للمبتدئين من الصفر', duration: '12 ساعة', level: 'مبتدئ', dept: 'Computer Science' },
      { title: 'أمن المعلومات والاختراق الأخلاقي', duration: '22 ساعة', level: 'متقدم', dept: 'Cybersecurity' },
    ],
  },
  {
    id: 'sci',
    name: 'Sciences',
    nameAr: 'العلوم',
    icon: '🔬',
    color: '#7F77DD',
    colorLight: '#EEEDFE',
    courses: [
      { title: 'الكيمياء العضوية من الصفر', duration: '10 ساعة', level: 'مبتدئ', dept: 'Chemistry' },
      { title: 'الكيمياء الفيزيائية — الترموديناميك', duration: '8 ساعة', level: 'متوسط', dept: 'Chemistry' },
      { title: 'الفيزياء العامة — المستوى الأول', duration: '9 ساعة', level: 'مبتدئ', dept: 'Physics' },
      { title: 'ميكانيكا الكم — مقدمة', duration: '11 ساعة', level: 'متقدم', dept: 'Physics' },
      { title: 'الأحياء الجزيئية وعلم الجينات', duration: '10 ساعة', level: 'متوسط', dept: 'Biology & Genetics' },
    ],
  },
  {
    id: 'math',
    name: 'Mathematics',
    nameAr: 'الرياضيات',
    icon: '📐',
    color: '#BA7517',
    colorLight: '#FAEEDA',
    courses: [
      { title: 'حساب التفاضل والتكامل', duration: '12 ساعة', level: 'مبتدئ', dept: 'Mathematics' },
      { title: 'الجبر الخطي', duration: '10 ساعة', level: 'متوسط', dept: 'Mathematics' },
    ],
  },
  {
    id: 'med',
    name: 'Medicine',
    nameAr: 'الطب',
    icon: '🩺',
    color: '#D4537E',
    colorLight: '#FBEAF0',
    courses: [
      { title: 'تشريح الجسم البشري — المستوى الأول', duration: '14 ساعة', level: 'مبتدئ', dept: 'Medicine' },
      { title: 'الفسيولوجيا البشرية المبسطة', duration: '12 ساعة', level: 'متوسط', dept: 'Medicine' },
    ],
  },
  {
    id: 'econ',
    name: 'Economics',
    nameAr: 'الاقتصاد',
    icon: '📈',
    color: '#0F6E56',
    colorLight: '#E1F5EE',
    courses: [
      { title: 'الاقتصاد الجزئي — المستوى الأول', duration: '8 ساعة', level: 'مبتدئ', dept: 'Economics & Finance' },
      { title: 'الأسواق المالية والاستثمار', duration: '10 ساعة', level: 'متوسط', dept: 'Economics & Finance' },
    ],
  },
  {
    id: 'lang',
    name: 'Arabic Language',
    nameAr: 'اللغة العربية',
    icon: '📖',
    color: '#533F2B',
    colorLight: '#F1EFE8',
    courses: [
      { title: 'النحو العربي الميسّر', duration: '8 ساعة', level: 'مبتدئ', dept: 'Arabic Language' },
      { title: 'الإعراب التطبيقي — نصوص محلولة', duration: '6 ساعة', level: 'متوسط', dept: 'Arabic Language' },
    ],
  },
];

export const AVATARS = ['🧑‍💻', '👩‍🔬', '👨‍🏫', '👩‍💼', '🧑‍🎓', '🦊', '🐼', '🦁'];
