import 'package:flutter/foundation.dart';

class SessionExpiredNotifier extends ChangeNotifier {
  SessionExpiredNotifier();

  static final SessionExpiredNotifier instance = SessionExpiredNotifier();

  int _version = 0;

  int get version => _version;

  void notifyExpired() {
    _version += 1;
    notifyListeners();
  }
}
