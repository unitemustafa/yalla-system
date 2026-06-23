import 'package:flutter/widgets.dart';

import '../../../core/localization/app_translations.dart';

String localizeAuthError(BuildContext context, String message) {
  if (!context.isArabicLanguage) return message;

  final normalized = message.toLowerCase();
  if (normalized.contains('invalid login credentials') ||
      normalized.contains('invalid email or password')) {
    return 'الإيميل أو رقم الهاتف أو كلمة المرور غير صحيحة.';
  }
  if (normalized.contains('not been verified')) {
    return 'لازم تأكد بريدك الإلكتروني قبل تسجيل الدخول.';
  }
  if (normalized.contains('verification code') ||
      normalized.contains('invalid otp') ||
      normalized.contains('invalid or expired')) {
    return 'كود التأكيد غير صحيح أو انتهت صلاحيته.';
  }
  if (normalized.contains('no account found')) {
    return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني.';
  }
  if (normalized.contains('passwords do not match')) {
    return 'كلمتا المرور غير متطابقتين.';
  }
  if (normalized.contains('internet') ||
      normalized.contains('connection') ||
      normalized.contains('timed out')) {
    return 'تعذر الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.';
  }
  if (normalized.contains('session') && normalized.contains('expired')) {
    return 'انتهت الجلسة. سجل دخولك من جديد.';
  }
  if (normalized.contains('already exists') ||
      normalized.contains('already registered')) {
    return 'هذه البيانات مستخدمة في حساب آخر.';
  }
  return 'تعذر إكمال العملية. حاول مرة أخرى.';
}
