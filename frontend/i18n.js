(() => {
  const STORAGE_KEY = 'orderflow_lang';
  const dictionaries = {
    fr: {
      metaDescription: 'OrderFlow — alertes de retrait en temps réel pour restaurants. Le client scanne un QR, vous marquez prêt, il est rappelé.',
      howItWorks: 'Comment ça marche',
      signIn: 'Connexion',
      getStarted: 'Commencer',
      startFree: 'Démarrer gratuitement',
      dashboard: 'Tableau de bord',
      signOut: 'Déconnexion',
      heroHeadline: 'Rappelez vos clients dès que leur commande est prête.',
      heroLede: 'Créez une commande, remettez un QR, et alertez le client en temps réel — sans bippers ni appels à travers la salle.',
      howEyebrow: 'Comment ça marche',
      howTitle: 'Trois étapes de la cuisine au retrait.',
      howLede: 'Conçu pour le service chargé — le personnel reste fluide, les clients restent informés.',
      step1Title: 'Créez la commande',
      step1Body: 'Saisissez le client ou la table et les articles. OrderFlow génère immédiatement un lien de suivi et un QR.',
      step2Title: 'Le client attend tranquillement',
      step2Body: 'Il scanne une fois, active les alertes et garde la page ouverte. Pas d’appli. Pas de ticket de file.',
      step3Title: 'Marquez prêt — il le sait',
      step3Body: 'Un geste depuis le tableau de bord cuisine. Son et vibration le rappellent pour récupérer.',
      forRestaurants: 'Pour les restaurants',
      promiseTitle: 'Une salle plus calme. Un retrait plus rapide.',
      promiseLede: 'OrderFlow est une couche d’alerte de retrait pour votre service actuel — pas un nouveau POS à réapprendre.',
      promise1Title: 'Comptes par restaurant',
      promise1Body: 'Chaque cuisine ne voit et ne gère que ses propres commandes.',
      promise2Title: 'Mises à jour en direct',
      promise2Body: 'Statuts en temps réel pour synchroniser clients et équipe.',
      promise3Title: 'QR imprimable',
      promise3Body: 'Remettez un code avec le ticket ou laissez-le au comptoir.',
      promiseVisual: 'Ambiance de salle de restaurant',
      ctaTitle: 'Prêt quand vos clients le sont.',
      ctaLede: 'Inscrivez votre restaurant en moins d’une minute et lancez votre première alerte aujourd’hui.',
      createRestaurant: 'Créer mon restaurant',
      alreadyHaveAccount: 'J’ai déjà un compte',
      footerTagline: 'Alertes de retrait en temps réel pour restaurants.',
      authEyebrow: 'OrderFlow pour restaurants',
      createYourRestaurant: 'Créez votre restaurant',
      welcomeBack: 'Bon retour',
      authLede: 'Chaque restaurant a son tableau de bord sécurisé et ses commandes.',
      restaurantName: 'Nom du restaurant',
      email: 'Adresse e-mail',
      password: 'Mot de passe (8+ caractères)',
      createAccount: 'Créer le compte',
      pleaseWait: 'Veuillez patienter…',
      alreadyAccount: 'Déjà un compte ? Connexion',
      newRestaurant: 'Nouveau restaurant ? Créer un compte',
      kitchenEyebrow: 'Centre de commande cuisine',
      staffDashboard: 'Tableau de bord équipe',
      dashboardLede: 'Créez une commande, remettez son QR, puis notifiez le client quand c’est prêt.',
      createOrder: 'Créer une commande',
      customerName: 'Nom du client',
      tableNumber: 'ou numéro de table',
      itemsPlaceholder: 'Articles, séparés par des virgules',
      createShowQr: 'Créer et afficher le QR',
      activePending: 'Commandes en attente',
      loadingOrders: 'Chargement des commandes…',
      noPending: 'Aucune commande en attente.',
      couldNotReachApi: 'Impossible de joindre l’API.',
      tableLabel: 'Table {n}',
      createdAt: 'Créée à {time}',
      markReady: 'Marquer comme prêt',
      orderValidation: 'Ajoutez des articles et un nom de client ou un numéro de table.',
      shareWithGuest: 'À partager avec le client',
      openTracking: 'Ouvrir la page de suivi',
      printQr: 'Imprimer le QR',
      qrAlt: 'Code QR de la page de suivi de cette commande',
      loadingOrder: 'Chargement de votre commande…',
      yourOrder: 'Votre commande',
      orderReadyEyebrow: 'Commande prête',
      orderReadyTitle: 'Votre commande est prête ! Venez la récupérer !',
      kitchenCalling: 'La cuisine vous appelle.',
      acknowledge: 'Arrêter le son / Confirmer',
      statusReady: 'Votre commande est prête ! Venez la récupérer !',
      statusPending: 'En préparation en cuisine… Activez l’audio s’il vous plaît',
      enableAlerts: 'J’attends ma commande — Activer les alertes',
      alertsEnabled: 'Alertes activées. Gardez cette page ouverte.',
      notificationUnsupported: 'Les notifications ne sont pas prises en charge par ce navigateur.',
      notificationSecureContext: 'Les notifications nécessitent une connexion sécurisée HTTPS.',
      notificationDenied: 'Les notifications sont bloquées. Autorisez-les dans les réglages du navigateur.',
      notificationError: 'Impossible d’activer les notifications.',
      soundError: 'Votre navigateur n’a pas pu activer le son.',
      orderNotFound: 'Commande introuvable.',
      genericError: 'Une erreur est survenue. Veuillez réessayer.',
      langFr: 'FR',
      langAr: 'AR',
      langSwitch: 'Langue'
    },
    ar: {
      metaDescription: 'OrderFlow — تنبيهات الاستلام الفورية للمطاعم. الزبون يمسح رمز QR، أنتم تحدّدون الجاهزية، فيُستدعى.',
      howItWorks: 'كيف يعمل',
      signIn: 'تسجيل الدخول',
      getStarted: 'ابدأ الآن',
      startFree: 'ابدأ مجاناً',
      dashboard: 'لوحة التحكم',
      signOut: 'تسجيل الخروج',
      heroHeadline: 'استدعِ زبائنك في اللحظة التي تصبح فيها طلباتهم جاهزة.',
      heroLede: 'أنشئ طلباً، سلّم رمز QR، ونبّه الزبون فوراً — بلا أجهزة اهتزاز ولا مناداة عبر القاعة.',
      howEyebrow: 'كيف يعمل',
      howTitle: 'ثلاث خطوات من المطبخ إلى الاستلام.',
      howLede: 'مصمّم للخدمة المزدحمة — الفريق يبقى منظّماً والزبائن على اطلاع.',
      step1Title: 'أنشئ الطلب',
      step1Body: 'أدخل الزبون أو الطاولة والأصناف. يُنشئ OrderFlow رابط تتبع ورمزاً فوراً.',
      step2Title: 'الزبون ينتظر بهدوء',
      step2Body: 'يمسح مرة واحدة، يفعّل التنبيهات، ويبقي الصفحة مفتوحة. بلا تطبيق. بلا تذكرة طابور.',
      step3Title: 'حدّد جاهز — يعرف فوراً',
      step3Body: 'ضغطة من لوحة المطبخ. صوت واهتزاز يستدعيانه للاستلام.',
      forRestaurants: 'للمطاعم',
      promiseTitle: 'قاعة أهدأ. استلام أسرع.',
      promiseLede: 'OrderFlow طبقة تنبيه استلام لخدمتكم الحالية — وليس نظام نقاط بيع جديداً تتعلمونه.',
      promise1Title: 'حسابات لكل مطعم',
      promise1Body: 'كل مطبخ يرى ويدير طلباته فقط.',
      promise2Title: 'تحديثات مباشرة',
      promise2Body: 'حالات فورية لمزامنة الزبائن والفريق.',
      promise3Title: 'QR قابل للطباعة',
      promise3Body: 'سلّموا رمزاً مع الفاتورة أو اتركوه عند الكاونتر.',
      promiseVisual: 'أجواء قاعة مطعم',
      ctaTitle: 'جاهزون عندما يكون زبائنكم جاهزين.',
      ctaLede: 'سجّلوا مطعمكم في أقل من دقيقة وأطلقوا أول تنبيه اليوم.',
      createRestaurant: 'إنشاء مطعمي',
      alreadyHaveAccount: 'لدي حساب مسبقاً',
      footerTagline: 'تنبيهات استلام فورية للمطاعم.',
      authEyebrow: 'OrderFlow للمطاعم',
      createYourRestaurant: 'أنشئ مطعمك',
      welcomeBack: 'مرحباً بعودتك',
      authLede: 'لكل مطعم لوحة آمنة وطلباته الخاصة.',
      restaurantName: 'اسم المطعم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور (8+ أحرف)',
      createAccount: 'إنشاء الحساب',
      pleaseWait: 'يرجى الانتظار…',
      alreadyAccount: 'لديك حساب؟ تسجيل الدخول',
      newRestaurant: 'مطعم جديد؟ إنشاء حساب',
      kitchenEyebrow: 'مركز قيادة المطبخ',
      staffDashboard: 'لوحة تحكم الفريق',
      dashboardLede: 'أنشئ طلباً، سلّم رمز QR، ثم أبلغ الزبون عند الجاهزية.',
      createOrder: 'إنشاء طلب',
      customerName: 'اسم الزبون',
      tableNumber: 'أو رقم الطاولة',
      itemsPlaceholder: 'الأصناف، مفصولة بفواصل',
      createShowQr: 'إنشاء وعرض QR',
      activePending: 'الطلبات المعلّقة',
      loadingOrders: 'جاري تحميل الطلبات…',
      noPending: 'لا توجد طلبات معلّقة.',
      couldNotReachApi: 'تعذّر الوصول إلى واجهة البرمجة.',
      tableLabel: 'طاولة {n}',
      createdAt: 'أُنشئ في {time}',
      markReady: 'تعيين كجاهز',
      orderValidation: 'أضف أصنافاً واسم زبون أو رقم طاولة.',
      shareWithGuest: 'للمشاركة مع الزبون',
      openTracking: 'فتح صفحة التتبع',
      printQr: 'طباعة QR',
      qrAlt: 'رمز QR لصفحة تتبع هذا الطلب',
      loadingOrder: 'جاري تحميل طلبك…',
      yourOrder: 'طلبك',
      orderReadyEyebrow: 'الطلب جاهز',
      orderReadyTitle: 'طلبك جاهز! تعال لاستلامه!',
      kitchenCalling: 'المطبخ يناديك.',
      acknowledge: 'إيقاف الصوت / تأكيد',
      statusReady: 'طلبك جاهز! تعال لاستلامه!',
      statusPending: 'جاري التحضير في المطبخ… يرجى تفعيل الصوت',
      enableAlerts: 'أنتظر طلبي — تفعيل التنبيهات',
      alertsEnabled: 'التنبيهات مفعّلة. أبقِ هذه الصفحة مفتوحة.',
      notificationUnsupported: 'هذا المتصفح لا يدعم الإشعارات.',
      notificationSecureContext: 'تتطلب الإشعارات اتصالاً آمناً عبر HTTPS.',
      notificationDenied: 'الإشعارات محظورة. فعّلها من إعدادات المتصفح.',
      notificationError: 'تعذّر تفعيل الإشعارات.',
      soundError: 'تعذّر على متصفحك تفعيل الصوت.',
      orderNotFound: 'الطلب غير موجود.',
      genericError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      langFr: 'FR',
      langAr: 'AR',
      langSwitch: 'اللغة'
    }
  };

  const normalize = value => (value === 'ar' ? 'ar' : 'fr');

  const detect = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'fr' || stored === 'ar') return stored;
    } catch { /* ignore */ }
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('ar')) return 'ar';
    return 'fr';
  };

  let lang = detect();

  const applyDocument = () => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.lang = lang;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', dictionaries[lang].metaDescription);
  };

  const t = (key, vars = {}) => {
    let value = dictionaries[lang][key] ?? dictionaries.fr[key] ?? key;
    Object.entries(vars).forEach(([name, replacement]) => {
      value = value.replaceAll(`{${name}}`, String(replacement));
    });
    return value;
  };

  const setLang = next => {
    lang = normalize(next);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    applyDocument();
    window.dispatchEvent(new CustomEvent('orderflow:lang', { detail: { lang } }));
  };

  applyDocument();

  window.OrderFlowI18n = {
    t,
    setLang,
    getLang: () => lang,
    isRtl: () => lang === 'ar'
  };
})();
