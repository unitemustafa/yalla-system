class AppAssets {
  AppAssets._();

  static const String blackLogo = 'assets/logos/yallamarket_blacklogo.png';
  static const String whiteLogo = 'assets/logos/yallamarket_whitelogo.png';

  static String themedLogo({required bool isDarkMode}) {
    return isDarkMode ? whiteLogo : blackLogo;
  }
}
