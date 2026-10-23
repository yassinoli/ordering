const messages = {
  fr: {
    authRequired: 'Veuillez vous connecter pour continuer.',
    registerInvalid: 'Le nom du restaurant, l’e-mail et un mot de passe d’au moins 8 caractères sont requis.',
    emailTaken: 'Un compte avec cet e-mail existe déjà.',
    loginInvalid: 'E-mail ou mot de passe incorrect.',
    orderNotFound: 'Commande introuvable.',
    orderInvalid: 'Un nom de client ou un numéro de table et au moins un article sont requis.',
    qrFailed: 'Impossible de créer le code QR.',
    genericError: 'Une erreur est survenue. Veuillez réessayer.'
  },
  ar: {
    authRequired: 'يرجى تسجيل الدخول للمتابعة.',
    registerInvalid: 'اسم المطعم والبريد الإلكتروني وكلمة مرور من 8 أحرف على الأقل مطلوبة.',
    emailTaken: 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
    loginInvalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    orderNotFound: 'الطلب غير موجود.',
    orderInvalid: 'يلزم اسم الزبون أو رقم الطاولة ومادة واحدة على الأقل.',
    qrFailed: 'تعذّر إنشاء رمز QR.',
    genericError: 'حدث خطأ. يرجى المحاولة مرة أخرى.'
  }
};

export function resolveLang(req) {
  const header = String(req.headers['accept-language'] || req.query?.lang || 'fr').toLowerCase();
  if (header.startsWith('ar')) return 'ar';
  return 'fr';
}

export function t(req, key) {
  const lang = resolveLang(req);
  return messages[lang][key] || messages.fr[key] || key;
}
