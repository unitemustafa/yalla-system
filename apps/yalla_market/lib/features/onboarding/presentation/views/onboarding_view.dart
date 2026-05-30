import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../core/routing/app_routes.dart';
import '../../domain/entities/onboarding_model.dart';
import '../cubit/onboarding_cubit.dart';
import '../widgets/onboarding_page_item.dart';

class OnboardingView extends StatefulWidget {
  const OnboardingView({super.key});

  @override
  State<OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<OnboardingView> {
  late final PageController _pageController;
  int _currentIndex = 0;
  bool _isFinishing = false;

  List<OnboardingModel> _pages(AppTranslations strings) {
    return [
      OnboardingModel(
        imagePath: AppAssets.onboarding1,
        title: strings.onboardingTitle1,
        description: strings.onboardingDesc1,
      ),
      OnboardingModel(
        imagePath: AppAssets.onboarding2,
        title: strings.onboardingTitle2,
        description: strings.onboardingDesc2,
      ),
      OnboardingModel(
        imagePath: AppAssets.onboarding3,
        title: strings.onboardingTitle3,
        description: strings.onboardingDesc3,
      ),
    ];
  }

  final List<Color> _accentColors = const [
    AppColors.primary,
    AppColors.success,
    AppColors.warning,
  ];

  final List<IconData> _icons = const [
    AppIcons.shopping_bag,
    AppIcons.card_tick,
    AppIcons.truck_fast,
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finishOnboarding() async {
    if (_isFinishing) return;

    setState(() {
      _isFinishing = true;
    });

    await context.read<OnboardingCubit>().markOnboardingSeen();

    if (!mounted) return;

    Navigator.of(
      context,
    ).pushNamedAndRemoveUntil(AppRoutes.login, (route) => false);
  }

  Future<void> _onNext() async {
    final page = _pageController.hasClients
        ? (_pageController.page ?? _currentIndex.toDouble()).round()
        : _currentIndex;

    if (page >= _pages(AppTranslations.current).length - 1) {
      await _finishOnboarding();
      return;
    }

    await _pageController.nextPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  void _onPrevious() {
    if (_currentIndex == 0) return;

    _pageController.previousPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final strings = AppTranslations.of(context);
    final pages = _pages(strings);
    final isDarkMode = theme.brightness == Brightness.dark;
    final isLastPage = _currentIndex == pages.length - 1;
    final accentColor = _accentColors[_currentIndex];
    final logoAsset = AppAssets.themedLogo(isDarkMode: isDarkMode);

    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final horizontalPadding = constraints.maxWidth < 360 ? 16.0 : 24.0;
            final topPadding = constraints.maxHeight < 620 ? 8.0 : 10.0;
            final bottomPadding = constraints.maxHeight < 620 ? 16.0 : 24.0;
            final maxContentWidth = constraints.maxWidth >= 600
                ? 540.0
                : constraints.maxWidth;

            return Column(
              children: [
                Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: maxContentWidth),
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(
                        horizontalPadding,
                        topPadding,
                        horizontalPadding,
                        6,
                      ),
                      child: Row(
                        children: [
                          AppImage(
                            source: logoAsset,
                            width: 42,
                            height: 42,
                            fit: BoxFit.contain,
                            borderRadius: BorderRadius.circular(8),
                            cacheWidth: 84,
                            cacheHeight: 84,
                          ),
                          const Spacer(),
                          SizedBox(
                            width: 58,
                            height: 40,
                            child: AnimatedOpacity(
                              opacity: isLastPage ? 0 : 1,
                              duration: const Duration(milliseconds: 160),
                              child: IgnorePointer(
                                ignoring: isLastPage,
                                child: TextButton(
                                  onPressed: _isFinishing
                                      ? null
                                      : _finishOnboarding,
                                  style: TextButton.styleFrom(
                                    foregroundColor:
                                        theme.colorScheme.onSurface,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 8,
                                    ),
                                  ),
                                  child: Text(strings.skip),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    itemCount: pages.length,
                    onPageChanged: (index) {
                      setState(() {
                        _currentIndex = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      return OnboardingPageItem(
                        model: pages[index],
                        accentColor: _accentColors[index],
                        icon: _icons[index],
                        pageNumber: index + 1,
                        totalPages: pages.length,
                      );
                    },
                  ),
                ),
                Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: maxContentWidth),
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(
                        horizontalPadding,
                        18,
                        horizontalPadding,
                        bottomPadding,
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: List.generate(
                              pages.length,
                              (index) => Expanded(
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 260),
                                  curve: Curves.easeOut,
                                  height: 4,
                                  margin: EdgeInsetsDirectional.only(
                                    end: index == pages.length - 1 ? 0 : 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: index <= _currentIndex
                                        ? accentColor
                                        : theme.colorScheme.onSurface
                                              .withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 18),
                          Row(
                            children: [
                              SizedBox(
                                width: 50,
                                height: 50,
                                child: IconButton(
                                  onPressed: _currentIndex == 0 || _isFinishing
                                      ? null
                                      : _onPrevious,
                                  style: IconButton.styleFrom(
                                    backgroundColor: theme.colorScheme.onSurface
                                        .withValues(
                                          alpha: isDarkMode ? 0.10 : 0.06,
                                        ),
                                    disabledBackgroundColor: Colors.transparent,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  icon: Icon(
                                    context.isArabicLanguage
                                        ? AppIcons.arrow_right_3
                                        : AppIcons.arrow_left_2,
                                    size: 20,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: SizedBox(
                                  height: 50,
                                  child: ElevatedButton(
                                    onPressed: _isFinishing ? null : _onNext,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: accentColor,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    child: FittedBox(
                                      fit: BoxFit.scaleDown,
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            isLastPage
                                                ? strings.startShopping
                                                : strings.continueText,
                                          ),
                                          const SizedBox(width: 10),
                                          Icon(
                                            context.isArabicLanguage
                                                ? AppIcons.arrow_left_2
                                                : AppIcons.arrow_right_3,
                                            size: 18,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
