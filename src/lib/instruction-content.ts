import type { Language } from '@/lib/i18n';

/**
 * Content for the /instruction page. Short on purpose.
 * Button and section names below match src/lib/i18n.ts. If a label there
 * changes, update the text here too.
 */
export interface InstructionContent {
  title: string;
  intro: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  lawsTitle: string;
  laws: { name: string; text: string }[];
  tip: string;
  book: {
    eyebrow: string;
    title: string;
    author: string;
    text: string;
  };
  faqTitle: string;
  faq: { q: string; a: string }[];
}

export const instructionContent: Record<Language, InstructionContent> = {
  en: {
    title: 'How to use Ultimate',
    intro:
      'Ultimate is built on the ideas of Atomic Habits by James Clear: start small, check in every day, and keep the chain going.',
    stepsTitle: 'Get started in 4 steps',
    steps: [
      {
        title: 'Add 2–3 habits',
        text: 'In the Monthly Tracker, tap “Add Habit”. Pick a name, an icon, a colour and a monthly target. Start small: each habit should take just a couple of minutes.',
      },
      {
        title: 'Check in every day',
        text: 'When you’ve done a habit, tap today’s cell. A row that keeps filling up is your reward.',
      },
      {
        title: 'Plan your week',
        text: 'In the Weekly Planner, add tasks for each day and jot down two short notes: “What to improve?” and “What am I grateful for?”.',
      },
      {
        title: 'Look at your progress',
        text: 'Analytics shows your streaks, the Consistency Heatmap, your Strongest Habits and the ones that Need Attention. Check it once a week and adjust.',
      },
    ],
    lawsTitle: '4 simple rules from the book',
    laws: [
      {
        name: 'Make it obvious',
        text: 'Name the habit clearly and attach it to something you already do: “After my morning coffee, I read 2 pages.”',
      },
      {
        name: 'Make it attractive',
        text: 'Pair it with something you enjoy, and choose an icon and colour you like.',
      },
      {
        name: 'Make it easy',
        text: 'Shrink the habit until starting feels effortless. Two minutes is enough.',
      },
      {
        name: 'Make it satisfying',
        text: 'Check the cell right away and watch your streak grow.',
      },
    ],
    tip: 'Golden rule: never miss twice. One missed day is fine. Just come back the next day.',
    book: {
      eyebrow: 'Recommended reading',
      title: 'Atomic Habits',
      author: 'James Clear',
      text: 'The book Ultimate is based on. A simple, practical read about how tiny steps change your life.',
    },
    faqTitle: 'Quick answers',
    faq: [
      {
        q: 'Is my data saved?',
        a: 'Yes. Everything is stored in your account. Sign in from any device and it’s all there.',
      },
      {
        q: 'I missed a day. What now?',
        a: 'Don’t worry. Come back tomorrow. The goal is simply not to miss two days in a row.',
      },
      {
        q: 'Can I print my week?',
        a: 'Yes. In the Weekly Planner, tap “Print / Export PDF”.',
      },
      {
        q: 'How do I change the language or theme?',
        a: 'Use the language and sun/moon buttons in the top bar.',
      },
    ],
  },

  ru: {
    title: 'Как пользоваться Ultimate',
    intro:
      'Ultimate основан на идеях книги «Атомные привычки» Джеймса Клира: начинайте с малого, отмечайте каждый день и не прерывайте цепочку.',
    stepsTitle: 'Начните за 4 шага',
    steps: [
      {
        title: 'Добавьте 2–3 привычки',
        text: 'В «Месячном Трекере» нажмите «Добавить привычку». Выберите название, иконку, цвет и цель на месяц. Начинайте с малого: пусть каждая привычка занимает пару минут.',
      },
      {
        title: 'Отмечайте каждый день',
        text: 'Когда привычка выполнена, нажмите на клетку сегодняшнего дня. Всё больше заполненных клеток в строке — это ваша награда.',
      },
      {
        title: 'Планируйте неделю',
        text: 'В «Недельном Планере» добавляйте задачи на каждый день и коротко отвечайте на два вопроса: «Что улучшить?» и «За что я благодарен?».',
      },
      {
        title: 'Следите за прогрессом',
        text: 'В «Аналитике» видны серии, годовая карта постоянства, самые стабильные привычки и те, что требуют внимания. Заглядывайте раз в неделю и корректируйте план.',
      },
    ],
    lawsTitle: '4 простых правила из книги',
    laws: [
      {
        name: 'Сделайте заметным',
        text: 'Назовите привычку конкретно и привяжите к тому, что уже делаете: «После утреннего кофе читаю 2 страницы».',
      },
      {
        name: 'Сделайте привлекательным',
        text: 'Соедините привычку с чем-то приятным и выберите иконку и цвет, которые вам нравятся.',
      },
      {
        name: 'Сделайте простым',
        text: 'Уменьшайте привычку, пока начать не станет легко. Достаточно двух минут.',
      },
      {
        name: 'Сделайте приятным',
        text: 'Отмечайте клетку сразу и наблюдайте, как растёт серия.',
      },
    ],
    tip: 'Золотое правило: не пропускайте дважды. Один пропущенный день — не беда. Просто вернитесь на следующий.',
    book: {
      eyebrow: 'Рекомендуем прочитать',
      title: 'Атомные привычки',
      author: 'Джеймс Клир',
      text: 'Книга, на которой основан Ultimate. Простой и практичный рассказ о том, как маленькие шаги меняют жизнь.',
    },
    faqTitle: 'Быстрые ответы',
    faq: [
      {
        q: 'Мои данные сохраняются?',
        a: 'Да. Всё хранится в вашем аккаунте. Войдите с любого устройства, и всё будет на месте.',
      },
      {
        q: 'Я пропустил день. Что делать?',
        a: 'Ничего страшного. Вернитесь завтра. Главное — не пропускать два дня подряд.',
      },
      {
        q: 'Можно распечатать неделю?',
        a: 'Да. В «Недельном Планере» нажмите «Печать / Экспорт PDF».',
      },
      {
        q: 'Как сменить язык или тему?',
        a: 'Кнопки языка и темы (солнце/луна) находятся в верхней панели.',
      },
    ],
  },

  uz: {
    title: 'Ultimate’dan qanday foydalanish mumkin',
    intro:
      'Ultimate Jeyms Klirning “Atomic Habits” kitobidagi g‘oyalarga asoslangan: kichikdan boshlang, har kuni belgilang va zanjirni uzmang.',
    stepsTitle: '4 qadamda boshlang',
    steps: [
      {
        title: '2–3 ta odat qo‘shing',
        text: '“Oylik Kuzatuv” bo‘limida “Odat qo‘shish” tugmasini bosing. Nom, belgi, rang va oylik maqsadni tanlang. Kichikdan boshlang: har bir odat bir-ikki daqiqa olsin.',
      },
      {
        title: 'Har kuni belgilang',
        text: 'Odatni bajarganingizda bugungi katakchani bosing. Qatorda to‘lib borayotgan kataklar — sizning mukofotingiz.',
      },
      {
        title: 'Haftani rejalashtiring',
        text: '“Haftalik Reja” bo‘limida har kun uchun vazifalar qo‘shing va ikki savolga qisqa javob yozing: “Nimani yaxshilash mumkin?” va “Nimadan minnatdorman?”.',
      },
      {
        title: 'Yutuqlaringizni kuzating',
        text: '“Tahlil” bo‘limida seriyalar, barqarorlik xaritasi, eng kuchli odatlar va e’tibor talab qiladiganlar ko‘rinadi. Haftada bir marta qarab, rejani to‘g‘rilang.',
      },
    ],
    lawsTitle: 'Kitobdan 4 ta oddiy qoida',
    laws: [
      {
        name: 'Ko‘zga tashlanadigan qiling',
        text: 'Odatni aniq nomlang va allaqachon qilayotgan ishingizga bog‘lang: “Ertalabki kofedan keyin 2 bet o‘qiyman”.',
      },
      {
        name: 'Jozibali qiling',
        text: 'Odatni yoqimli narsa bilan bog‘lang va o‘zingizga yoqqan belgi hamda rangni tanlang.',
      },
      {
        name: 'Oson qiling',
        text: 'Boshlash oson bo‘lguncha odatni kichraytiring. Ikki daqiqa yetarli.',
      },
      {
        name: 'Yoqimli qiling',
        text: 'Katakchani darhol belgilang va seriyangiz o‘sishini kuzating.',
      },
    ],
    tip: 'Oltin qoida: ketma-ket ikki marta o‘tkazib yubormang. Bir kun o‘tkazib yuborish xavfli emas. Ertasi kuni qaytish kifoya.',
    book: {
      eyebrow: 'O‘qishni tavsiya qilamiz',
      title: 'Atomic Habits',
      author: 'James Clear',
      text: 'Ultimate shu kitobga asoslangan. Kichik qadamlar hayotni qanday o‘zgartirishi haqida sodda va amaliy kitob.',
    },
    faqTitle: 'Tezkor javoblar',
    faq: [
      {
        q: 'Ma’lumotlarim saqlanadimi?',
        a: 'Ha. Hammasi hisobingizda saqlanadi. Istalgan qurilmadan kiring, ma’lumotlaringiz joyida bo‘ladi.',
      },
      {
        q: 'Bir kunni o‘tkazib yubordim. Nima qilay?',
        a: 'Xavotir olmang. Ertaga qayting. Asosiysi, ketma-ket ikki kun o‘tkazib yubormaslik.',
      },
      {
        q: 'Haftani chop etsam bo‘ladimi?',
        a: 'Ha. “Haftalik Reja” bo‘limida “Chop etish / PDF eksport” tugmasini bosing.',
      },
      {
        q: 'Til yoki tashqi ko‘rinishni qanday o‘zgartiraman?',
        a: 'Til va mavzu (quyosh/oy) tugmalari yuqori panelda joylashgan.',
      },
    ],
  },
};
