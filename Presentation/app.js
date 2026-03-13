const exportSlides = [
  {
    title: 'Atellas Fleet | Plateforme web + dashboard',
    subtitle: 'Une base digitale unique pour vendre, gérer et développer une activité de location automobile au Maroc.',
    bullets: [
      'Un site web orienté conversion pour capter les demandes, présenter la flotte et fluidifier la réservation.',
      'Un tableau de bord pour piloter véhicules, réservations, clients, messages, documents, maintenance et performance.',
      'Une proposition lisible pour le client: meilleure image, meilleure organisation, meilleure visibilité.',
    ],
    footer: 'Vision & valeur',
  },
  {
    title: 'Slide 2 | Le site web côté client',
    subtitle: 'Le front-office agit comme un commercial digital disponible en continu.',
    bullets: [
      'Parcours clair: accueil, flotte, offres, contact, localisation et réservation.',
      'Expérience responsive mobile, critique dans le contexte marocain.',
      'Formulaires, points de confiance et visibilité de marque pour convertir les visites en demandes réelles.',
      'Workflow de réservation structuré avec calcul du coût et suivi après confirmation.',
    ],
    footer: 'Site web',
  },
  {
    title: 'Slide 3 | Le dashboard côté exploitation',
    subtitle: 'L’intérêt métier est de centraliser la gestion au lieu de disperser l’information.',
    bullets: [
      'Réservations: planning, statuts, paiements, disponibilité et historique.',
      'Flotte: inventaire, plaques, documents, état, carburant, kilométrage, maintenance, infractions.',
      'Clients: base CRM, KYC, pièces, segmentation, total dépensé.',
      'Direction: analytics, KPIs, supervision GPS, contenu, avis et messages.',
    ],
    footer: 'Dashboard',
  },
  {
    title: 'Slide 4 | Pourquoi cela colle au marché marocain',
    subtitle: 'Le marché distingue déjà les offres vitrines simples des plateformes de gestion à forte valeur.',
    bullets: [
      'Les agences locales valorisent désormais design, SEO, sécurité, formation et performance.',
      'Les outils marocains de gestion mettent en avant CRM, facturation, stock, reporting, support local et conformité.',
      'Le client final veut une expérience simple; la direction veut une vision consolidée.',
    ],
    footer: 'Marché marocain',
  },
  {
    title: 'Slide 5 | Étude de prix utilisée',
    subtitle: 'Le positionnement visuel montre que nos offres restent crédibles et rassurantes pour le client.',
    bullets: [
      'Les références observées au Maroc placent les offres standard autour de 3 990 à 4 500 MAD et les offres plus poussées à partir de 9 000 MAD.',
      'Notre Pack 1 à 6 000 MAD se place au-dessus du simple site vitrine, avec une vraie valeur métier.',
      'Notre Pack 2 à 8 000 MAD ajoute plus de confort de gestion et de visibilité commerciale.',
      'Notre Pack 3 à 10 000 MAD reste compétitif tout en incluant l’ensemble des fonctionnalités attendues.',
    ],
    footer: 'Positionnement prix',
  },
  {
    title: 'Slide 6 | Packages recommandés',
    subtitle: 'Trois packs simples à comparer, tous avec abonnement 1 an, maintenance 24/7 et support 24/7.',
    bullets: [
      'Pack 1 – 6 000 MAD: une présence professionnelle, la réservation simplifiée et un outil de gestion fiable pour bien démarrer.',
      'Pack 2 – 8 000 MAD: plus d’aisance commerciale, plus de suivi et un meilleur confort de pilotage au quotidien.',
      'Pack 3 – 10 000 MAD: meilleure option, avec tous les avantages des deux premiers packs et toutes les fonctionnalités incluses.',
      'Le pack à 10 000 MAD est le plus rassurant pour le client, car il évite de revenir plus tard sur un second chantier.',
    ],
    footer: 'Packages',
  },
  {
    title: 'Slide 7 | Déploiement proposé',
    subtitle: 'La mise en œuvre doit être courte et concentrée sur l’adoption.',
    bullets: [
      'Cadrage des contenus, de la flotte, des utilisateurs et des règles de réservation.',
      'Paramétrage, personnalisation et chargement des données.',
      'Recette complète du parcours client et des scénarios métier.',
      'Mise en ligne, formation et accompagnement au démarrage.',
    ],
    footer: 'Déploiement',
  },
  {
    title: 'Slide 8 | Retour sur investissement',
    subtitle: 'La valeur vient de la conversion commerciale et de la discipline opérationnelle.',
    bullets: [
      'Plus de demandes structurées, moins de pertes liées aux échanges dispersés.',
      'Meilleure visibilité sur la flotte, les clients et les périodes sensibles.',
      'Gain de temps pour l’équipe et meilleure qualité de suivi pour le management.',
      'Une seule réservation rentable supplémentaire peut déjà couvrir une part importante de l’investissement.',
    ],
    footer: 'ROI',
  },
  {
    title: 'Slide 9 | Recommandation finale',
    subtitle: 'La recommandation la plus convaincante reste le pack complet à 10 000 MAD.',
    bullets: [
      'Pack 3 à 10 000 MAD: la meilleure décision pour activer toute la valeur dès le départ.',
      'Pack 2 à 8 000 MAD reste une alternative solide si le client veut une montée en gamme progressive.',
      'Message clé: il ne s’agit pas seulement d’un site, mais d’un outil complet pour mieux vendre, mieux gérer et mieux rassurer.',
    ],
    footer: 'Décision',
  },
  {
    title: 'Slide 10 | Sources de l’étude',
    subtitle: 'Références publiques consultées pour ancrer les offres dans le marché marocain.',
    bullets: [
      'WebSuccess, Vala et Site-vitrine.ma pour la lecture tarifaire des offres web.',
      'GestiSuite, Nizam et ManagePro pour la lecture des attentes côté outils de gestion.',
      'Interprétation retenue: la demande marocaine valorise le concret, le support local, la conformité, la simplicité et le pilotage.',
    ],
    footer: 'Sources',
  },
];

const deckTitle = 'Atellas Fleet - Presentation Client';
const statusNode = document.getElementById('export-status');
const navItems = Array.from(document.querySelectorAll('.nav-item'));
const slides = Array.from(document.querySelectorAll('.slide'));
const langButtons = {
  fr: document.getElementById('lang-fr'),
  ar: document.getElementById('lang-ar'),
};
const translatableIds = [
  'brand-eyebrow',
  'brand-title',
  'brand-copy',
  'nav-slide-1',
  'nav-slide-2',
  'nav-slide-3',
  'nav-slide-4',
  'nav-slide-5',
  'nav-slide-6',
  'nav-slide-7',
  'nav-slide-8',
  'nav-slide-9',
  'nav-slide-10',
  'download-pdf',
  'download-pptx',
  'print-deck',
  'tag-slide-1',
  'tag-slide-2',
  'tag-slide-3',
  'tag-slide-4',
  'tag-slide-5',
  'tag-slide-6',
  'tag-slide-7',
  'tag-slide-8',
  'tag-slide-9',
  'tag-slide-10',
  'slide-1-main',
  'metric-1',
  'metric-2',
  'metric-3',
  'slide-1-pills',
  'slide-2-title',
  'slide-2-card-1',
  'slide-2-card-2',
  'slide-2-highlight',
  'slide-3-title',
  'slide-3-box-1',
  'slide-3-box-2',
  'slide-3-box-3',
  'slide-3-box-4',
  'slide-3-box-5',
  'slide-3-box-6',
  'slide-3-quote',
  'slide-4-title',
  'slide-4-card-1',
  'slide-4-card-2',
  'slide-4-card-3',
  'slide-4-badges',
  'slide-5-title',
  'slide-5-card-1',
  'slide-5-card-2',
  'slide-6-title',
  'slide-6-banner',
  'slide-6-pack-1',
  'slide-6-pack-2',
  'slide-6-pack-3',
  'slide-7-title',
  'slide-7-step-1',
  'slide-7-step-2',
  'slide-7-step-3',
  'slide-7-step-4',
  'slide-8-title',
  'slide-8-card-1',
  'slide-8-card-2',
  'slide-9-title',
  'slide-9-card-1',
  'slide-9-card-2',
  'slide-9-banner',
  'slide-10-title',
  'slide-10-card-1',
  'slide-10-card-2',
  'slide-10-note',
];
const frenchContent = Object.fromEntries(
  translatableIds.map((id) => [id, document.getElementById(id)?.innerHTML || ''])
);
const arabicContent = {
  'brand-eyebrow': 'عرض تجاري',
  'brand-title': 'Atellas Fleet',
  'brand-copy': 'منصة مصممة لتحويل الزوار إلى عملاء، وتنظيم التشغيل، ومنح الإدارة رؤية مطمئنة وواضحة.',
  'nav-slide-1': '01. الرؤية',
  'nav-slide-2': '02. الموقع',
  'nav-slide-3': '03. لوحة الإدارة',
  'nav-slide-4': '04. السوق المغربي',
  'nav-slide-5': '05. تموضع الأسعار',
  'nav-slide-6': '06. الباقات',
  'nav-slide-7': '07. الإطلاق',
  'nav-slide-8': '08. العائد',
  'nav-slide-9': '09. القرار',
  'nav-slide-10': '10. المراجع',
  'download-pdf': 'تحميل PDF',
  'download-pptx': 'تحميل PPTX',
  'print-deck': 'نسخة للطباعة',
  'tag-slide-1': 'الرؤية والقيمة',
  'tag-slide-2': 'ما يراه العميل',
  'tag-slide-3': 'ما يديره الفريق',
  'tag-slide-4': 'قراءة السوق المغربي',
  'tag-slide-5': 'تحليل السعر ومنطق العرض',
  'tag-slide-6': 'الباقات المقترحة',
  'tag-slide-7': 'خطة التنفيذ',
  'tag-slide-8': 'العائد على الاستثمار',
  'tag-slide-9': 'التوصية',
  'tag-slide-10': 'أساس الدراسة',
  'slide-1-main': '<p class="eyebrow">عرض للعميل</p><h2>منصة واحدة لبيع وإدارة وتطوير نشاط كراء السيارات في المغرب.</h2><p class="lead">تجمع Atellas Fleet بين موقع موجه للتحويل ولوحة تشغيل داخلية. الفائدة واضحة منذ البداية: تشتت أقل، تحكم أكبر، صورة أقوى، وقدرة يومية على المتابعة واتخاذ القرار.</p>',
  'metric-1': '<span class="metric-value">واجهتان</span><span class="metric-label">واجهة تجارية للعميل + واجهة تشغيلية للفريق</span>',
  'metric-2': '<span class="metric-value">مسار واحد</span><span class="metric-label">الحجز من الموقع ينتقل مباشرة إلى التسيير الداخلي</span>',
  'metric-3': '<span class="metric-value">بدون فراغات</span><span class="metric-label">متابعة السيارات والعملاء والحجوزات والرسائل والوثائق والأداء في مكان واحد</span>',
  'slide-1-pills': '<span class="pill">صورة احترافية</span><span class="pill">حجز منظم</span><span class="pill">تسيير مركزي</span><span class="pill">ملائم للسوق المغربي</span>',
  'slide-2-title': 'الموقع الإلكتروني يعمل كمسؤول مبيعات رقمي حاضر بشكل دائم.',
  'slide-2-card-1': '<h3>مسار تجاري واضح</h3><ul><li>واجهة قوية لإبراز العلامة التجارية وتوجيه الزائر مباشرة إلى الأسطول أو الحجز.</li><li>عرض الأسطول والعروض وبرامج الولاء والمزايا ونقاط التواجد.</li><li>صفحة تواصل وعناصر ثقة لالتقاط العميل حتى عندما لا يكون الحجز فورياً.</li><li>تجربة مريحة على الهاتف، وهو أمر أساسي في سوق يعتمد كثيراً على الزيارات من الهاتف الذكي.</li></ul>',
  'slide-2-card-2': '<h3>حجز رقمي مبسط</h3><ul><li>اختيار السيارة والتواريخ ونقطة الاستلام.</li><li>التحقق من الهوية والوثائق ضمن مسار واضح وموجه.</li><li>عرض التكلفة قبل التأكيد لتقليل التردد.</li><li>متابعة الحجز بعد التأكيد لطمأنة العميل.</li></ul>',
  'slide-2-highlight': '<div><strong>الهدف التجاري</strong><p>تحويل الزيارة إلى طلب عرض أو حجز أو تواصل مباشر، دون الاعتماد فقط على واتساب أو مواقع التواصل.</p></div>',
  'slide-3-title': 'لوحة الإدارة تستجيب للحاجات العملية لوكالة أو أسطول في طور النمو.',
  'slide-3-box-1': '<h3>التشغيل</h3><p>الحجوزات، الجدولة، الحالات، الأداءات، تعارضات التوفر، العقود وسجل العميل.</p>',
  'slide-3-box-2': '<h3>الأسطول</h3><p>جرد السيارات، اللوحات، الوثائق، الحالة، الكيلومترات، الوقود، الصيانة والمخالفات.</p>',
  'slide-3-box-3': '<h3>العملاء</h3><p>قاعدة العملاء، التحقق من الهوية، الوثائق، التصنيف، العملاء المهمون أو المرفوضون، وإجمالي المصاريف.</p>',
  'slide-3-box-4': '<h3>التتبع GPS</h3><p>رؤية تشغيلية للموقع والإشراف، مفيدة للجهات التي تريد تحكماً أكبر على الأرض.</p>',
  'slide-3-box-5': '<h3>التواصل</h3><p>رسائل مجمعة، تدبير الطلبات، مراجعات العملاء والمحتوى التحريري.</p>',
  'slide-3-box-6': '<h3>الإدارة</h3><p>مؤشرات الأداء، التحليلات، تطور المداخيل، مؤشرات الأسطول ورؤية موحدة للنشاط.</p>',
  'slide-3-quote': '<p>الربح الحقيقي ليس تقنياً فقط، بل تنظيمي أيضاً: الفريق يعمل داخل واجهة واحدة وبمعلومة موحدة وقابلة للاستغلال.</p>',
  'slide-4-title': 'لماذا هذا العرض مناسب داخل السياق المغربي.',
  'slide-4-card-1': '<h3>1. الموقع ما زال أساس الثقة</h3><p>الفاعلون المحليون يؤكدون أن الموقع المهني ضروري لطمأنة العميل، تحسين الظهور، وجلب الطلبات خارج شبكات التواصل.</p>',
  'slide-4-card-2': '<h3>2. أدوات التسيير أصبحت أقرب للسوق</h3><p>حلول مثل GestiSuite وNizam وManagePro تبرز الامتثال المحلي، الدعم بالفرنسية والعربية، الفوترة، المخزون، CRM والتقارير. الحاجة إلى back-office منظم أصبحت واضحة.</p>',
  'slide-4-card-3': '<h3>3. العميل يريد شيئاً ملموساً</h3><p>في السوق، العروض الرخيصة جداً ترتبط غالباً بقوالب عامة. القيمة المدركة ترتفع فور إضافة التصميم، الظهور، الأمان، التكوين ووظائف المهنة.</p>',
  'slide-4-badges': '<span>مريح على الهاتف</span><span>دعم محلي</span><span>الأمان والامتثال</span><span>مسار حجز واضح</span><span>تسيير مركزي</span>',
  'slide-5-title': 'أسعارنا واضحة ومقنعة ومتموضعة في المستوى المناسب دون إرهاق ميزانية العميل.',
  'slide-5-card-1': '<h3>صورة بصرية عن السوق</h3><div class="chart-block"><div class="chart-axis"><span>قياسي</span><span>متوسط</span><span>ممتاز</span></div><div class="bar-chart"><div class="bar-row"><span class="bar-label">موقع عرض عادي</span><div class="bar-track"><span class="bar-fill soft" style="width: 36%;"></span></div><strong>3 990 إلى 4 500 درهم</strong></div><div class="bar-row"><span class="bar-label">باقتنا 1</span><div class="bar-track"><span class="bar-fill" style="width: 48%;"></span></div><strong>6 000 درهم</strong></div><div class="bar-row"><span class="bar-label">باقتنا 2</span><div class="bar-track"><span class="bar-fill" style="width: 64%;"></span></div><strong>8 000 درهم</strong></div><div class="bar-row emphasis"><span class="bar-label">باقتنا 3</span><div class="bar-track"><span class="bar-fill premium" style="width: 80%;"></span></div><strong>10 000 درهم</strong></div><div class="bar-row"><span class="bar-label">عروض ممتازة ملاحظة</span><div class="bar-track"><span class="bar-fill dark" style="width: 96%;"></span></div><strong>12 000 درهم فما فوق</strong></div></div></div>',
  'slide-5-card-2': '<h3>ما يفهمه العميل فوراً</h3><div class="benefit-curve"><div class="curve-step"><span class="curve-price">6 000</span><p>قاعدة جدية للظهور والبدء في البيع.</p></div><div class="curve-step"><span class="curve-price">8 000</span><p>راحة أكبر في التسيير وصورة أفضل أمام العميل.</p></div><div class="curve-step best"><span class="curve-price">10 000</span><p>الحل الأكثر طمأنة: كل شيء مدمج من البداية دون حاجة للرجوع لاحقاً.</p></div></div><p class="study-note">ببساطة: كل مستوى يعطي قيمة أوضح، ومع ذلك يبقى أقل من تكلفة مشروع مخصص كامل.</p>',
  'slide-6-title': 'ثلاث باقات سهلة المقارنة، مع مزايا واضحة تساعد العميل على اتخاذ القرار بسرعة.',
  'slide-6-banner': '<strong>كل الباقات تشمل</strong><span>اشتراك لمدة سنة</span><span>صيانة 24/7</span><span>دعم 24/7</span>',
  'slide-6-pack-1': '<div class="package-top"><span class="package-name">الباقة 1</span><strong class="package-price">6 000 MAD</strong></div><p class="package-summary">الباقة المناسبة للانطلاق بصورة احترافية وأداة عمل موثوقة.</p><div class="package-advantage">المزايا</div><ul><li>موقع واضح ومطمئن لعرض الشركة والأسطول.</li><li>حجز وتواصل مبسطان لالتقاط الطلبات بسهولة أكبر.</li><li>مساحة تسيير لمتابعة السيارات والحجوزات والعملاء والرسائل.</li><li>انطلاق سريع مع مواكبة أولية.</li></ul><div class="package-footer-note">يشمل: اشتراك سنة واحدة + صيانة ودعم 24/7.</div><p class="package-fit">مناسبة لـ: جهة تريد قاعدة قوية دون تجاوز الميزانية.</p>',
  'slide-6-pack-2': '<div class="package-top"><span class="package-name">الباقة 2</span><strong class="package-price">8 000 MAD</strong></div><p class="package-summary">الخيار الأكثر توازناً لتحسين البيع والتسيير اليومي.</p><div class="package-advantage">المزايا</div><ul><li>كل ما في الباقة 1 مع تجربة أكثر اكتمالاً للعميل والفريق.</li><li>تدبير وثائق العملاء ومسار تحقق أكثر طمأنة.</li><li>لوحات متابعة وآراء العملاء ومحتوى يعزز الثقة.</li><li>متابعة أعمق للأسطول والنشاط لتحسين القيادة.</li><li>مواكبة أقوى عند الانطلاق.</li></ul><div class="package-footer-note">يشمل: اشتراك سنة واحدة + صيانة ودعم 24/7.</div><p class="package-fit">مناسبة لـ: عميل يريد مستوى أعلى دون الذهاب مباشرة إلى العرض الكامل.</p>',
  'slide-6-pack-3': '<div class="package-badge">أفضل خيار</div><div class="package-top"><span class="package-name">الباقة 3</span><strong class="package-price">10 000 MAD</strong></div><p class="package-summary">الخيار الأكثر إقناعاً: كل الوظائف مفعلة من البداية مع أعلى درجة من الطمأنينة للعميل.</p><div class="package-advantage">المزايا</div><ul><li>تشمل جميع مزايا الباقتين 1 و2.</li><li>كل وظائف المنصة مفعلة منذ اليوم الأول.</li><li>متابعة متقدمة للنشاط والأسطول والصيانة والتحكم التشغيلي.</li><li>رؤية كاملة للإدارة بجميع أدوات الإشراف.</li><li>لا يوجد نقص وظيفي على المدى القريب، وبالتالي لا إحباط بعد الإطلاق.</li></ul><div class="package-footer-note strong">يشمل: اشتراك سنة واحدة + صيانة ودعم 24/7.</div><p class="package-fit">مناسبة لـ: عميل يريد اتخاذ أفضل قرار الآن والحصول على كل شيء في عرض واحد.</p>',
  'slide-7-title': 'تنفيذ قصير وواضح وموجه لتبني المنصة بسرعة.',
  'slide-7-step-1': '<span>المرحلة 1</span><h3>التأطير</h3><p>تأكيد المحتوى والهوية البصرية والصلاحيات والفروع والأسطول وقواعد الحجز.</p>',
  'slide-7-step-2': '<span>المرحلة 2</span><h3>الضبط</h3><p>تخصيص الموقع، إدخال السيارات، إعداد المستخدمين وحالات العمل.</p>',
  'slide-7-step-3': '<span>المرحلة 3</span><h3>الاختبار</h3><p>اختبار مسار العميل والواجهة الداخلية والوثائق والسيناريوهات الحساسة قبل الإطلاق.</p>',
  'slide-7-step-4': '<span>المرحلة 4</span><h3>الإطلاق</h3><p>نشر المنصة، تكوين الفريق، دعم البداية وتعديلات سريعة لتأمين الاعتماد.</p>',
  'slide-8-title': 'القيمة ليست فقط في الموقع، بل في الانضباط التشغيلي الذي يفرضه داخل النشاط.',
  'slide-8-card-1': '<h3>المكاسب المنتظرة</h3><ul><li>تحويل أفضل للزوار إلى طلبات أو حجوزات.</li><li>تقليل التشتت والأخطاء في المتابعة.</li><li>رؤية أوضح للأسطول والعملاء والفترات الحساسة.</li><li>رفع الصورة المدركة دون مضاعفة الأدوات.</li></ul>',
  'slide-8-card-2': '<h3>قراءة الإدارة</h3><p>حجز إضافي واحد لبضعة أيام على سيارة مربحة قد يغطي جزءاً مهماً من الاستثمار الأولي. وبعد ذلك يتعزز العائد عبر التكرار والوضوح وسلاسة التشغيل.</p>',
  'slide-9-title': 'التوصية: اختيار الباقة 2 بسعر 8 000 درهم أو حسم القرار مباشرة مع النسخة الكاملة بـ 10 000 درهم.',
  'slide-9-card-1': '<h3>إذا كان الهدف هو انطلاقة نظيفة</h3><p>الباقة 2 تقدم أفضل توازن بين الأثر والميزانية لتشغيل جدي ومرئي منذ البداية.</p>',
  'slide-9-card-2': '<h3>إذا كان الهدف هو تفادي مرحلة ثانية</h3><p>الباقة 3 بسعر 10 000 درهم هي الأكثر إقناعاً: كل الوظائف مفعلة دون تنازلات معطلة.</p>',
  'slide-9-banner': '<strong>الرسالة إلى العميل</strong><p>أنت لا تشتري مجرد موقع. أنت تضع قاعدة رقمية تدعم النمو التجاري وتنظم التشغيل اليومي.</p>',
  'slide-10-title': 'المصادر المستعملة لضبط هذه العروض.',
  'slide-10-card-1': '<h3>تسعير الويب في المغرب</h3><ul><li>WebSuccess: باقات معروضة بـ 4 500 / 9 000 / 12 000 درهم.</li><li>Vala: موقع احترافي بين 6 000 و15 000 درهم، والتجارة الإلكترونية بين 15 000 و45 000 درهم.</li><li>Site-vitrine.ma: موقع عرض 3 990 درهم، كتالوغ 4 990 درهم، تجارة إلكترونية 5 990 درهم.</li></ul>',
  'slide-10-card-2': '<h3>مراجع أدوات التسيير المغربية</h3><ul><li>GestiSuite: لوحة قيادة، مبيعات، مخزون، تقارير، ما قبل المحاسبة، بأسعار 299 و799 درهماً شهرياً.</li><li>Nizam: CRM، فوترة، جرد، مواعيد، تقارير، دعم بالفرنسية والعربية، وامتثال مغربي.</li><li>ManagePro: مخزون، مبيعات، علاقة عميل، خزينة، عروض أسعار، فواتير وتذاكر.</li></ul>',
  'slide-10-note': 'الاستنتاج المعتمد: السوق يميز بوضوح بين العروض المعيارية البسيطة والحلول المهنية الأكثر تنظيماً. عرض Atellas Fleet يتموضع فوق low-cost وتحت مشروع مخصص كامل، ما يجعل الباقات الثلاث مقنعة تجارياً.',
};
const statusTranslations = {
  'Exports prêts depuis cette page.': 'Les exports sont prêts depuis cette page.',
  'Bibliothèque PDF indisponible. Vérifiez la connexion internet.': 'Bibliothèque PDF indisponible. Vérifiez la connexion internet.',
  'Génération du PDF en cours...': 'Génération du PDF en cours...',
  'PDF téléchargé.': 'PDF téléchargé.',
  'Bibliothèque PPTX indisponible. Vérifiez la connexion internet.': 'Bibliothèque PPTX indisponible. Vérifiez la connexion internet.',
  'Génération du fichier PowerPoint en cours...': 'Génération du fichier PowerPoint en cours...',
  'Fichier PowerPoint téléchargé.': 'Fichier PowerPoint téléchargé.',
  ar: {
    'Exports prêts depuis cette page.': 'ملفات التصدير جاهزة من هذه الصفحة.',
    'Bibliothèque PDF indisponible. Vérifiez la connexion internet.': 'مكتبة PDF غير متاحة. يرجى التحقق من الاتصال بالإنترنت.',
    'Génération du PDF en cours...': 'يتم الآن إنشاء ملف PDF...',
    'PDF téléchargé.': 'تم تنزيل ملف PDF.',
    'Bibliothèque PPTX indisponible. Vérifiez la connexion internet.': 'مكتبة PPTX غير متاحة. يرجى التحقق من الاتصال بالإنترنت.',
    'Génération du fichier PowerPoint en cours...': 'يتم الآن إنشاء ملف PowerPoint...',
    'Fichier PowerPoint téléchargé.': 'تم تنزيل ملف PowerPoint.',
  },
};
let currentLanguage = localStorage.getItem('presentationLanguage') === 'ar' ? 'ar' : 'fr';
let lastStatusMessage = 'Exports prêts depuis cette page.';
let lastStatusIsError = false;

function translateStatus(message) {
  if (currentLanguage === 'ar') {
    return statusTranslations.ar[message] || message;
  }

  return message;
}

function applyLanguage(language) {
  const content = language === 'ar' ? arabicContent : frenchContent;

  translatableIds.forEach((id) => {
    const node = document.getElementById(id);
    if (node && content[id]) {
      node.innerHTML = content[id];
    }
  });

  currentLanguage = language;
  document.documentElement.lang = language === 'ar' ? 'ar' : 'fr';
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('is-arabic', language === 'ar');
  langButtons.fr?.classList.toggle('active', language === 'fr');
  langButtons.ar?.classList.toggle('active', language === 'ar');
  localStorage.setItem('presentationLanguage', language);
  updateStatus(lastStatusMessage, lastStatusIsError);
}

function updateStatus(message, isError = false) {
  if (!statusNode) return;
  lastStatusMessage = message;
  lastStatusIsError = isError;
  statusNode.textContent = translateStatus(message);
  statusNode.style.color = isError ? '#b42318' : '';
}

function setActiveNav(id) {
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.target === id);
  });
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    const target = document.getElementById(item.dataset.target || '');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) {
      setActiveNav(visible.target.id);
    }
  },
  {
    rootMargin: '-20% 0px -50% 0px',
    threshold: [0.2, 0.45, 0.7],
  }
);

slides.forEach((slide) => observer.observe(slide));

langButtons.fr?.addEventListener('click', () => applyLanguage('fr'));
langButtons.ar?.addEventListener('click', () => applyLanguage('ar'));
applyLanguage(currentLanguage);

function wrapText(doc, text, x, y, maxWidth, lineHeight, options = {}) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y, options);
  return y + lines.length * lineHeight;
}

async function downloadPdf() {
  const pdfLib = window.jspdf;
  if (!pdfLib || !pdfLib.jsPDF) {
    updateStatus('Bibliothèque PDF indisponible. Vérifiez la connexion internet.', true);
    return;
  }

  updateStatus('Génération du PDF en cours...');

  const { jsPDF } = pdfLib;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  exportSlides.forEach((slide, index) => {
    if (index > 0) doc.addPage();

    doc.setFillColor(247, 240, 232);
    doc.rect(0, 0, width, height, 'F');

    doc.setFillColor(22, 50, 79);
    doc.roundedRect(34, 30, width - 68, height - 60, 22, 22, 'F');

    doc.setFillColor(255, 250, 245);
    doc.roundedRect(58, 54, width - 116, height - 108, 18, 18, 'F');

    doc.setTextColor(15, 139, 141);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`ATELLAS FLEET | ${slide.footer.toUpperCase()}`, 84, 88);

    doc.setTextColor(23, 32, 51);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    let cursorY = wrapText(doc, slide.title, 84, 126, width - 168, 28);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(96, 112, 138);
    doc.setFontSize(14);
    cursorY = wrapText(doc, slide.subtitle, 84, cursorY + 6, width - 190, 22);

    cursorY += 18;
    slide.bullets.forEach((bullet) => {
      doc.setFillColor(198, 146, 57);
      doc.circle(92, cursorY - 5, 4, 'F');
      doc.setTextColor(23, 32, 51);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      cursorY = wrapText(doc, bullet, 108, cursorY, width - 150, 20);
      cursorY += 10;
    });

    doc.setDrawColor(15, 139, 141);
    doc.line(84, height - 98, width - 84, height - 98);
    doc.setTextColor(96, 112, 138);
    doc.setFontSize(10);
    doc.text(deckTitle, 84, height - 76);
    doc.text(`${String(index + 1).padStart(2, '0')} / ${String(exportSlides.length).padStart(2, '0')}`, width - 120, height - 76);
  });

  doc.save('Atellas-Fleet-Presentation.pdf');
  updateStatus('PDF téléchargé.');
}

async function downloadPptx() {
  if (!window.PptxGenJS) {
    updateStatus('Bibliothèque PPTX indisponible. Vérifiez la connexion internet.', true);
    return;
  }

  updateStatus('Génération du fichier PowerPoint en cours...');

  const pptx = new window.PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'GitHub Copilot';
  pptx.company = 'Atellas Fleet';
  pptx.subject = 'Présentation commerciale';
  pptx.title = deckTitle;
  pptx.lang = 'fr-MA';
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'Aptos',
    lang: 'fr-FR',
  };

  exportSlides.forEach((slide, index) => {
    const pptSlide = pptx.addSlide();
    pptSlide.background = { color: 'F7F0E8' };

    pptSlide.addShape(pptx.ShapeType.rect, {
      x: 0.25,
      y: 0.2,
      w: 12.83,
      h: 6.85,
      radius: 0.18,
      line: { color: '16324F', transparency: 100 },
      fill: { color: '16324F' },
    });

    pptSlide.addShape(pptx.ShapeType.roundRect, {
      x: 0.55,
      y: 0.5,
      w: 12.23,
      h: 6.25,
      rectRadius: 0.12,
      line: { color: 'FFFFFF', transparency: 100 },
      fill: { color: 'FFFAF5' },
    });

    pptSlide.addText(`ATELLAS FLEET | ${slide.footer.toUpperCase()}`, {
      x: 0.82,
      y: 0.72,
      w: 4.2,
      h: 0.3,
      fontFace: 'Aptos',
      fontSize: 10,
      bold: true,
      color: '0F8B8D',
      charSpace: 1.1,
    });

    pptSlide.addText(slide.title, {
      x: 0.82,
      y: 1.02,
      w: 8.5,
      h: 0.95,
      fontFace: 'Aptos Display',
      fontSize: 24,
      bold: true,
      color: '172033',
      breakLine: false,
      valign: 'mid',
      margin: 0,
      fit: 'shrink',
    });

    pptSlide.addText(slide.subtitle, {
      x: 0.82,
      y: 1.9,
      w: 9.8,
      h: 0.55,
      fontFace: 'Aptos',
      fontSize: 12,
      color: '60708A',
      margin: 0,
      fit: 'shrink',
    });

    let currentY = 2.55;
    slide.bullets.forEach((bullet) => {
      pptSlide.addShape(pptx.ShapeType.ellipse, {
        x: 0.92,
        y: currentY + 0.08,
        w: 0.12,
        h: 0.12,
        line: { color: 'C69239', transparency: 100 },
        fill: { color: 'C69239' },
      });

      pptSlide.addText(bullet, {
        x: 1.08,
        y: currentY,
        w: 10.7,
        h: 0.48,
        fontFace: 'Aptos',
        fontSize: 12,
        color: '172033',
        margin: 0,
        fit: 'resize',
      });

      currentY += 0.66;
    });

    pptSlide.addText(deckTitle, {
      x: 0.82,
      y: 6.15,
      w: 3.6,
      h: 0.25,
      fontFace: 'Aptos',
      fontSize: 9,
      color: '60708A',
      margin: 0,
    });

    pptSlide.addText(`${String(index + 1).padStart(2, '0')} / ${String(exportSlides.length).padStart(2, '0')}`, {
      x: 11.55,
      y: 6.15,
      w: 0.8,
      h: 0.25,
      align: 'right',
      fontFace: 'Aptos',
      fontSize: 9,
      color: '60708A',
      margin: 0,
    });
  });

  await pptx.writeFile({ fileName: 'Atellas-Fleet-Presentation.pptx' });
  updateStatus('Fichier PowerPoint téléchargé.');
}

document.getElementById('download-pdf')?.addEventListener('click', downloadPdf);
document.getElementById('download-pptx')?.addEventListener('click', downloadPptx);
document.getElementById('print-deck')?.addEventListener('click', () => window.print());