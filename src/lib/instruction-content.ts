import type { Language } from './i18n';

export interface GuideSection {
  id: string;
  title: string;
  description: string;
  steps?: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface InstructionContent {
  heroTitle: string;
  heroSubtitle: string;
  sections: GuideSection[];
  tipsTitle: string;
  tips: string[];
  faqTitle: string;
  faq: FAQItem[];
}

export const instructionContent: Record<Language, InstructionContent> = {
  ru: {
    heroTitle: 'Руководство пользователя Ultimate',
    heroSubtitle: 'Ваш пошаговый гид по созданию железной дисциплины, продуктивности и ежедневным победам.',
    sections: [
      {
        id: 'quick-start',
        title: '1. Быстрый старт',
        description: 'Всего три простых шага, чтобы запустить свой первый трек привычек:',
        steps: [
          'Войдите в аккаунт: используйте вход через Google или введите email и пароль на странице входа.',
          'Создайте первую привычку: в Месячном Трекере нажмите кнопку «Добавить привычку», выберите иконку, цвет, название и цель в днях.',
          'Отмечайте каждый день: нажимайте на ячейку текущего дня в строке привычки. Одно нажатие отмечает выполнение.',
        ],
      },
      {
        id: 'tracker',
        title: '2. Месячный Трекер',
        description: 'Главная интерактивная таблица для визуализации и контроля привычек на протяжении месяца:',
        steps: [
          'Добавление привычки: нажмите «Добавить привычку» над таблицей, чтобы настроить название, категорию, цвет и целевое число дней.',
          'Отметка выполнения: кликните по ячейке дня — она окрасится в фирменный цвет привычки и отметит выполнение. Повторный клик снимает отметку.',
          'Управление привычками: кликните на название или иконку привычки, чтобы открыть меню: «Редактировать», «В архив», «Удалить», а также переместить строку «Выше» или «Ниже».',
          'Цель месяца: введите ключевой фокус в поле «Главная цель месяца» в верхней части трекера.',
          'Индивидуальные цели: в колонке «Цель» задайте желаемое количество дней в месяц для каждой привычки, чтобы видеть процент фактического выполнения.',
          'Навигация по месяцам: переключайтесь между месяцами стрелками «Пред. месяц» и «След. месяц» для ретроспективы или планирования.',
        ],
      },
      {
        id: 'planner',
        title: '3. Недельный Планер',
        description: 'Еженедельный спринт-дашборд для организации задач, фокуса и ежедневной осознанности:',
        steps: [
          'Задачи дня: нажмите «Добавить задачу» в колонке любого дня недели. Чекбокс слева мгновенно отмечает задачу завершённой.',
          'Заметки и мысли: фиксируйте важные идеи в поле «Заметки» для каждого дня.',
          'Анализ и улучшения: блок «Что улучшить?» помогает проводить быструю вечернюю рефлексию.',
          'Благодарность: блок «За что я благодарен?» укрепляет позитивное мышление и мотивацию.',
          'Печать и экспорт: нажмите «Печать / Экспорт PDF», чтобы получить аккуратный бумажный лист для физического заполнения и обзора.',
        ],
      },
      {
        id: 'analytics',
        title: '4. Аналитика и прогресс',
        description: 'Глубокий анализ ваших паттернов поведения, темпа и долгосрочной стабильности:',
        steps: [
          'Текущая серия: непрерывная цепочка дней, в каждый из которых выполнена хотя бы одна привычка. Засчитывается сегодня или вчера, если сегодня ещё не завершено.',
          'Рекордная серия: максимальная непрерывная серия дней активности за всю историю вашего аккаунта.',
          'Общая эффективность: процент фактически выполненных привычек от максимально возможного числа за выбранный месяц.',
          'Годовая карта постоянства: тепловая матрица всех 365 дней года, наглядно демонстрирующая плотность ваших усилий.',
          'Динамика и тренды: графики «Динамика по дням месяца» и «Тренд выполнения» помогают обнаружить спады продуктивности и дни пиковой отдачи.',
        ],
      },
      {
        id: 'profile',
        title: '5. Профиль и настройки',
        description: 'Управление аккаунтом, персональными настройками интерфейса и безопасностью данных:',
        steps: [
          'Отображаемое имя: обновите имя в блоке «Личная информация» — аватар и меню в шапке обновятся моментально.',
          'Тема оформления: переключайтесь между тёмной (Dark) и светлой (Light) темами — выбор сразу сохраняется в облаке.',
          'Язык интерфейса: приложение полностью переведено на русский, английский и узбекский языки.',
          'Звуки и вибрация: включите тактильный отклик (haptics) и звуковые сигналы для приятного тактильного подтверждения побед.',
          'Смена пароля: доступна в блоке «Безопасность» для пользователей с регистрацией по email.',
          'Экспорт данных: кнопка «Скачать мои данные (JSON)» в один клик выгружает полный архив ваших привычек, отметок, задач и заметок.',
        ],
      },
    ],
    tipsTitle: '6. Советы по формированию привычек',
    tips: [
      'Правило двух минут: сделайте первый шаг настолько простым, чтобы ему невозможно было сопротивляться (например, «прочитать 1 страницу» вместо «читать час»).',
      'Метод привязки: прикрепляйте новую привычку к уже укоренившейся рутине («После того, как я налью утренний кофе, я сделаю 5 минут растяжки»).',
      'Никогда не пропускайте дважды подряд: один пропуск — случайность, два пропуска подряд — начало новой нежелательной привычки.',
      'Фокус на сериях: берегите текущую серию. Число дней на дашборде становится мощным психологическим якорем против лени.',
      'Качественная среда: подготовьте всё заранее (положите книгу на подушку, приготовьте спортивную форму с вечера).',
    ],
    faqTitle: '7. Часто задаваемые вопросы (FAQ)',
    faq: [
      {
        question: 'Сохраняются ли мои данные в безопасности?',
        answer: 'Да. Все данные хранятся в защищённой базе данных Supabase с включённой политикой безопасности на уровне строк (RLS). Доступ к вашим привычкам, заметкам и задачам есть исключительно у вас.',
      },
      {
        question: 'Могу ли я открывать Ultimate на телефоне, планшете и компьютере?',
        answer: 'Да, конечно. Ultimate оптимизирован для любых экранов, от мобильных телефонов шириной 360px до широких мониторов. Просто войдите под своим логином на новом устройстве, и данные синхронизируются мгновенно.',
      },
      {
        question: 'Как распечатать еженедельный обзор или трекер?',
        answer: 'В Недельном Планере нажмите кнопку «Печать / Экспорт PDF» в шапке страницы. Также в меню пользователя в правом верхнем углу доступен пункт «Печать». Таблицы автоматически адаптируются для печати на формате A4.',
      },
      {
        question: 'Что происходит с данными из старой браузерной версии?',
        answer: 'При первом входе в аккаунт автоматически открывается окно переноса локальных данных. Все сохранённые в браузере привычки и отметки надёжно импортируются в ваш профиль без дублирования. Данные в браузере при этом не удаляются.',
      },
      {
        question: 'Что делать, если я забыл пароль?',
        answer: 'На странице входа нажмите «Забыли пароль?», укажите свой адрес электронной почты, и мы отправим ссылку для безопасного сброса и создания нового пароля.',
      },
    ],
  },

  en: {
    heroTitle: 'Ultimate User Guide',
    heroSubtitle: 'Your comprehensive handbook for building unstoppable discipline, momentum, and daily wins.',
    sections: [
      {
        id: 'quick-start',
        title: '1. Quick Start',
        description: 'Get your personal discipline system running in three simple steps:',
        steps: [
          'Sign in: use Continue with Google or enter your email and password on the login screen.',
          'Create your first habit: in the Monthly Tracker, click "Add Habit", select an icon, color accent, name, and target days.',
          'Check in daily: click the current day’s cell in your habit row. One tap confirms completion.',
        ],
      },
      {
        id: 'tracker',
        title: '2. Monthly Tracker',
        description: 'Your primary interactive dashboard for monthly habit execution and velocity:',
        steps: [
          'Add Habit: click "Add Habit" above the table to customize name, category icon, color, and monthly target.',
          'Check Completion: click any date cell to mark it done with your habit’s accent color. Click again to undo.',
          'Manage Habits: click the habit icon or title to open the action menu: "Edit", "Archive", "Delete", or reorder "Move Up" / "Move Down".',
          'Primary Goal: define your month’s core milestone in the "Primary Monthly Goal" field above the grid.',
          'Habit Targets: specify your goal days in the "Goal" column to track your actual completion percentage.',
          'Month Navigation: switch between months using "Prev Month" and "Next Month" buttons for retrospectives and planning.',
        ],
      },
      {
        id: 'planner',
        title: '3. Weekly Planner',
        description: 'A dedicated sprint dashboard for organizing daily tasks, focus, and mindful reflection:',
        steps: [
          'Daily Tasks: click "Add Task" under any weekday column. Click the checkbox to mark tasks completed.',
          'Daily Notes: capture quick ideas, takeaways, or reminders in the "Notes" section of each day.',
          'Continuous Improvement: use "What to improve?" for rapid evening debriefs and self-coaching.',
          'Daily Gratitude: ground yourself with "What am I grateful for?" to reinforce positive momentum.',
          'Print & PDF Export: click "Print / Export PDF" to generate a clean, printable worksheet for offline journaling.',
        ],
      },
      {
        id: 'analytics',
        title: '4. Analytics & Performance',
        description: 'Data-driven insights into your consistency, momentum curves, and milestones:',
        steps: [
          'Current Streak: consecutive days with at least one completed habit. Counts today or yesterday if today is not over.',
          'All-Time Record: your longest uninterrupted streak of consistency ever recorded on this account.',
          'Overall Efficiency: percentage of completed habits versus total possible completions for the selected month.',
          'Consistency Heatmap: an annual GitHub-style matrix showing your exact activity density across all 365 days.',
          'Dynamic Charts: "Daily Completion Velocity" and "Execution Trend" pinpoint your peak performance days and patterns.',
        ],
      },
      {
        id: 'profile',
        title: '5. Profile & Settings',
        description: 'Manage your personal account, interface preferences, and complete data sovereignty:',
        steps: [
          'Display Name: customize your name in "Personal Info" — TopNav avatar and menu update immediately.',
          'Theme: switch seamlessly between Dark and Light modes — synchronized with your cloud profile.',
          'Interface Language: fully localized in English, Russian, and Uzbek.',
          'Audio & Haptic Cues: toggle sound effects and vibration feedback for satisfying tactile feedback on checks.',
          'Password Security: update your password in "Security" (available for email/password credentials).',
          'Data Sovereignty: click "Download my data (JSON)" to export an uncompromised JSON backup of all your habits, check-ins, tasks, and notes.',
        ],
      },
    ],
    tipsTitle: '6. Habit-Building Strategies',
    tips: [
      'The Two-Minute Rule: when starting a new habit, scale it down so it takes less than two minutes (e.g., read one page, put on running shoes).',
      'Habit Stacking: anchor your new desired habit to an existing automatic behavior ("After I pour my morning coffee, I will write down three priorities").',
      'Never Miss Twice: missing one day is an accident; missing two consecutive days is the birth of an unwanted habit.',
      'Protect the Streak: visual streaks create powerful loss aversion — watching your days count up protects you on low-motivation days.',
      'Design Your Environment: remove friction for good habits and add friction for unproductive habits.',
    ],
    faqTitle: '7. Frequently Asked Questions (FAQ)',
    faq: [
      {
        question: 'Is my data private and secure?',
        answer: 'Yes. All user data is secured in Supabase with strict Row-Level Security (RLS) policies. Only your authenticated user account has permission to read or modify your data.',
      },
      {
        question: 'Can I use Ultimate across multiple devices?',
        answer: 'Absolutely. Ultimate is fully responsive down to 360px mobile screens and synchronizes across phones, tablets, and desktop browsers in real time upon sign in.',
      },
      {
        question: 'How do I print my planner or review sheets?',
        answer: 'In the Weekly Planner, click the "Print / Export PDF" button. Alternatively, open the top-right user menu and select "Print". Print stylesheets optimize formatting for A4 layout.',
      },
      {
        question: 'What happens to my legacy browser data?',
        answer: 'When you sign in for the first time, our one-time import dialog safely transfers all habits and check-ins from localStorage to your cloud account. The original browser data is never altered or deleted.',
      },
      {
        question: 'What should I do if I forget my password?',
        answer: 'On the sign-in screen, click "Forgot password?" and enter your email address. You will receive a secure password reset link immediately.',
      },
    ],
  },

  uz: {
    heroTitle: "Ultimate Foydalanuvchi Qo'llanmasi",
    heroSubtitle: "Mustahkam intizom, yuqori samaradorlik va har kungi g'alabalarga erishish bo'yicha to'liq qo'llanma.",
    sections: [
      {
        id: 'quick-start',
        title: '1. Tez boshlash',
        description: 'Shaxsiy intizom tizimingizni ishga tushirish uchun uchta oson qadam:',
        steps: [
          "Tizimga kiring: Google orqali kiring yoki kirish sahifasida email va parolingizni kiriting.",
          "Birinchi odatni yarating: Oylik Kuzatuvda «Odat qo'shish» tugmasini bosing, belgi, rang va oylik maqsad kunini belgilang.",
          "Har kuni belgilang: odat satrida bugungi kun katakchasini bosing. Bitta bosish bajarilganlikni tasdiqlaydi.",
        ],
      },
      {
        id: 'tracker',
        title: '2. Oylik Kuzatuv',
        description: 'Oy davomida odatlaringizni kuzatish va rejalashtirish uchun asosiy interaktiv jadval:',
        steps: [
          "Odat qo'shish: jadval tepasidagi «Odat qo'shish» tugmasi orqali nom, kategoriya belgisi, rang va reja kunini kiriting.",
          "Bajarilganlikni belgilash: kun katakchasini bosing — u odat rangi bilan belgilanadi. Yana bir marta bosish belgini bekor qiladi.",
          "Odatlarni boshqarish: odat nomini yoki belgisini bosing: «Tahrirlash», «Arxivlash», «O'chirish», shuningdek «Yuqoriga» / «Pastga» siljitish menyusi ochiladi.",
          "Oyning asosiy maqsadi: jadval tepasidagi «Oylik asosiy maqsad» maydoniga oylik bosh e'tiboringizni yozing.",
          "Individual maqsadlar: «Maqsad» ustunida har bir odat uchun oylik reja kunini belgilang va bajarilish foizini kuzating.",
          "Oylar bo'yicha o'tish: tahlil qilish yoki rejalashtirish uchun «Oldingi oy» va «Keyingi oy» tugmalaridan foydalaning.",
        ],
      },
      {
        id: 'planner',
        title: '3. Haftalik Rejalashtiruvchi',
        description: 'Kunlik vazifalar, diqqat va shaxsiy mulohazalarni tartibga soluvchi haftalik sprint paneli:',
        steps: [
          "Kunlik vazifalar: istalgan kun ustunida «Vazifa qo'shish» tugmasini bosing. Chapdagi chekbox vazifani bajarilgan deb belgilaydi.",
          "Qaydlar: har bir kun uchun muhim fikr va xulosalarni «Qaydlar» bo'limida yozib boring.",
          "Yaxshilanishlar: «Nimani yaxshilash mumkin?» bloki kechki tezkor tahlil o'tkazishga yordam beradi.",
          "Minnatdorchilik: «Nimadan minnatdorman?» bloki ijobiy kayfiyat va ruhiy yuksalishni mustahkamlaydi.",
          "Chop etish va eksport: qo'lda to'ldirish uchun «Chop etish / PDF eksport» tugmasini bosing.",
        ],
      },
      {
        id: 'analytics',
        title: '4. Tahlil va Statistika',
        description: 'Intizomingiz, o\'sish sur\'ati va uzoq muddatli barqarorligingizning chuqur tahlili:',
        steps: [
          "Joriy seriya: kamida bitta odat bajarilgan ketma-ket kunlar zanjiri. Bugun yoki kechagi kun hisobga olinadi.",
          "Eng yaxshi seriya: barcha vaqt davomidagi eng uzoq uzluksiz seriyangiz.",
          "Umumiy samaradorlik: joriy oyda bajarilgan odatlarning maksimal mumkin bo'lgan ko'rsatkichga nisbatan foizi.",
          "Yillik barqarorlik xaritasi: 365 kunlik faollik zichligini ko'rsatuvchi yillik matritsa.",
          "Grafiklar va tendentsiyalar: «Kunlik bajarilish sur'ati» va «Bajarilish trendi» kuchli va e'tibor talab kunlarni aniqlashga yordam beradi.",
        ],
      },
      {
        id: 'profile',
        title: '5. Profil va Sozlamalar',
        description: "Hisob ma'lumotlari, interfeys parametrlari va ma'lumotlar xavfsizligini boshqarish:",
        steps: [
          "Ko'rsatiladigan ism: «Shaxsiy ma'lumotlar» bo'limida ismingizni yangilang — avatar va menyu darhol o'zgaradi.",
          "Mavzu: Qorong'i va Yorug' mavzular o'rtasida tanlang — parametr darhol bulutda saqlanadi.",
          "Interfeys tili: dastur O'zbek, Rus va Ingliz tillarida to'liq ishlaydi.",
          "Ovoz va tebranish: odatlarni belgilashda yoqimli taktil tasdiq uchun ovoz va tebranish signallarini yoqing.",
          "Parolni o'zgartirish: email orqali ro'yxatdan o'tganlar uchun «Xavfsizlik» bo'limida mavjud.",
          "Ma'lumotlarni yuklab olish: «Ma'lumotlarimni yuklab olish (JSON)» tugmasi barcha ma'lumotlaringizni to'liq eksport qiladi.",
        ],
      },
    ],
    tipsTitle: '6. Odat shakllantirish bo\'yicha maslahatlar',
    tips: [
      "Ikki daqiqa qoidasi: yangi odatni shunchalik kichik qilib boshlangki, uni bajarmaslikning iloji bo'lmasin (masalan, 1 bet kitob o'qish).",
      "Odatlarni bog'lash usuli: yangi odatni allaqachon mavjud odatga bog'lang («Ertalabki qahvani ichgach, 5 daqiqa mashq qilaman»).",
      "Hech qachon ketma-ket ikki kun o'tkazib yubormang: bir kun o'tkazish — tasodif, ikki kun — yangi yomon odatning boshlanishi.",
      "Seriyani asrang: raqamlarning oshib borishi dangasalikka qarshi kuchli ruhiy qalqon bo'lib xizmat qiladi.",
      "Muhitni tayyorlang: foydali odatlar uchun qulaylik yarating va chalg'ituvchi omillarni olib tashlang.",
    ],
    faqTitle: "7. Ko'p so'raladigan savollar (FAQ)",
    faq: [
      {
        question: "Ma'lumotlarim qanchalik xavfsiz saqlanadi?",
        answer: "Barcha ma'lumotlar Supabase xavfsiz bazasida satr darajasidagi xavfsizlik (RLS) bilan saqlanadi. Odatlaringiz va qaydlaringizni faqat siz ko'ra olasiz.",
      },
      {
        question: "Ultimate'dan turli qurilmalarda foydalanish mumkinmi?",
        answer: "Ha, albatta. Ultimate 360px dan boshlab barcha ekran o'lchamlari uchun moslashtirilgan. Yangi qurilmada o'z hisobingizga kirsangiz kifoya.",
      },
      {
        question: "Haftalik planni qanday chop etaman?",
        answer: "Haftalik Rejalashtiruvchida «Chop etish / PDF eksport» tugmasini bosing. Shuningdek, profil menyusidagi «Chop etish» opsiyasidan foydalanishingiz mumkin.",
      },
      {
        question: "Eski brauzerdagi ma'lumotlar nima bo'ladi?",
        answer: "Birinchi marta kirganingizda import oynasi paydo bo'ladi va localStorage'dagi barcha odatlarni yangi hisobingizga xavfsiz ko'chirib beradi.",
      },
      {
        question: "Parolimni unutib qo'ysam nima qilaman?",
        answer: "Kirish sahifasida «Parolni unutdingizmi?» tugmasini bosing, emailingizni kiriting va yangi parol o'rnatish havolasini olasiz.",
      },
    ],
  },
};
