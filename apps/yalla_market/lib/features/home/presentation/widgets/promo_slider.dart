import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../core/presentation/widgets/texts/app_currency_text.dart';
import '../../../../core/presentation/widgets/texts/green_currency_price.dart';
import '../../../../core/routing/app_route_arguments.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../cart/domain/entities/cart_item.dart';
import '../../../cart/presentation/cubit/cart_cubit.dart';
import '../../../location/presentation/cubit/location_cubit.dart';

class PromoSlider extends StatefulWidget {
  const PromoSlider({super.key});

  @override
  State<PromoSlider> createState() => _PromoSliderState();
}

class _PromoSliderState extends State<PromoSlider> {
  static const _offers = [
    _PromoOfferData(
      icon: AppIcons.box,
      color: AppColors.primary,
      image: AppAssets.temporaryMarketPlaceholder,
      endsAtIso: '2026-06-30T23:59:00+03:00',
      badgeEn: 'Package',
      badgeAr: 'باكج',
      titleEn: 'Weekly Package',
      titleAr: 'باكج الأسبوع',
      subtitleEn: 'Three essentials together with one bundle discount.',
      subtitleAr: 'ثلاث منتجات أساسية مع خصم باكج واحد.',
      valueEn: 'Save EGP 86',
      valueAr: 'وفر EGP 86',
      statusEn: '3 products together',
      statusAr: '3 منتجات مع بعض',
      detailEn:
          'The package price applies only when all items are ordered in the same basket.',
      detailAr: 'سعر الباكج بيتطبق لما كل المنتجات تتطلب في نفس السلة.',
      subtotal: 'EGP 355',
      discount: 'EGP 86',
      discountRateEn: '24% off',
      discountRateAr: 'خصم 24%',
      afterDiscount: 'EGP 269',
      deliveryFee: 'لم يحدد',
      total: 'EGP 269',
      actionEn: 'Add package to cart',
      visibilityMode: 'general',
      actionAr: 'ضيف الباكج للسلة',
      products: [
        _OfferProduct(
          image: AppAssets.temporaryMarketPlaceholder,
          titleEn: 'Fresh vegetable basket',
          titleAr: 'سلة خضار طازجة',
          brandEn: 'Vegetables',
          brandAr: 'خضار',
          price: 'EGP 120',
          badgeEn: 'Bundle',
          badgeAr: 'باكج',
        ),
        _OfferProduct(
          image: AppAssets.temporaryMarketPlaceholder,
          titleEn: 'Morning bakery box',
          titleAr: 'مخبوزات صباحية',
          brandEn: 'Bakery',
          brandAr: 'مخبوزات',
          price: 'EGP 89',
          badgeEn: 'Bundle',
          badgeAr: 'باكج',
        ),
        _OfferProduct(
          image: AppAssets.temporaryMarketPlaceholder,
          titleEn: 'Daily supermarket pack',
          titleAr: 'باقة سوبر ماركت يومية',
          brandEn: 'Supermarket',
          brandAr: 'سوبر ماركت',
          price: 'EGP 60',
          badgeEn: 'Bundle',
          badgeAr: 'باكج',
        ),
      ],
    ),
    _PromoOfferData(
      icon: AppIcons.flash_1,
      color: AppColors.warning,
      image: AppAssets.temporaryMarketPlaceholder,
      endsAtIso: '2026-06-20T23:59:00+03:00',
      badgeEn: 'Flash',
      badgeAr: 'فلاش',
      titleEn: 'Flash Sale',
      titleAr: 'فلاش سيل',
      subtitleEn: 'One fast offer on a selected item for a short time.',
      subtitleAr: 'عرض سريع على منتج محدد لمدة قليلة.',
      valueEn: 'Live timer',
      valueAr: 'تايمر مباشر',
      statusEn: 'Limited stock',
      statusAr: 'كمية محدودة',
      detailEn:
          'This flash price is held only during the timer and while stock lasts.',
      detailAr: 'سعر الفلاش ثابت خلال مدة العرض فقط ومع توفر الكمية.',
      subtotal: 'EGP 220',
      discount: 'EGP 60',
      discountRateEn: '33% off',
      discountRateAr: 'خصم 33%',
      afterDiscount: 'EGP 160',
      deliveryFee: 'لم يحدد',
      total: 'EGP 160',
      actionEn: 'Add flash offer',
      visibilityMode: 'regions',
      regionSlugs: ['sharm-el-sheikh'],
      regionNames: ['Sharm El Sheikh'],
      actionAr: 'ضيف عرض الفلاش',
      products: [
        _OfferProduct(
          image: AppAssets.temporaryMarketPlaceholder,
          titleEn: 'Family meal box',
          titleAr: 'وجبة عائلية جاهزة',
          brandEn: 'Restaurants',
          brandAr: 'مطاعم',
          price: 'EGP 160',
          oldPrice: 'EGP 220',
          badgeEn: '33% off',
          badgeAr: 'خصم 33%',
          metaEn: '8 left',
          metaAr: 'باقي 8',
        ),
      ],
    ),
    _PromoOfferData(
      icon: AppIcons.truck_fast,
      color: AppColors.info,
      image: AppAssets.temporaryMarketPlaceholder,
      endsAtIso: '2026-06-28T23:59:00+03:00',
      badgeEn: 'Delivery',
      badgeAr: 'توصيل',
      titleEn: 'Free Delivery',
      titleAr: 'توصيل مجاني',
      subtitleEn: 'Free delivery is unlocked for this selected product.',
      subtitleAr: 'التوصيل المجاني متاح على المنتج ده.',
      valueEn: 'Delivery EGP 0',
      valueAr: 'التوصيل EGP 0',
      statusEn: 'Free delivery item',
      statusAr: 'منتج بتوصيل مجاني',
      detailEn:
          'The delivery fee is removed automatically when this item is in your basket.',
      detailAr: 'رسوم التوصيل بتتشال تلقائيا لما المنتج ده يكون في السلة.',
      subtotal: 'EGP 150',
      discount: 'EGP 0',
      discountRateEn: 'Free delivery',
      discountRateAr: 'توصيل مجاني',
      afterDiscount: 'EGP 150',
      deliveryFee: 'لم يحدد',
      total: 'EGP 150',
      actionEn: 'Add free delivery item',
      visibilityMode: 'general',
      actionAr: 'ضيف منتج التوصيل المجاني',
      products: [
        _OfferProduct(
          image: AppAssets.temporaryMarketPlaceholder,
          titleEn: 'Fresh country chicken',
          titleAr: 'دجاج طازج بلدي',
          brandEn: 'Poultry',
          brandAr: 'طيور',
          price: 'EGP 150',
          oldPrice: 'EGP 150',
          badgeEn: 'Free delivery',
          badgeAr: 'توصيل مجاني',
          metaEn: 'Delivery saved',
          metaAr: 'وفرت التوصيل',
        ),
      ],
    ),
    _PromoOfferData(
      icon: AppIcons.notification,
      color: AppColors.success,
      image: AppAssets.temporaryMarketPlaceholder,
      endsAtIso: '2026-07-03T23:59:00+03:00',
      badgeEn: 'Ad',
      badgeAr: 'إعلان',
      titleEn: 'Sponsored Market Pick',
      titleAr: 'عرض إعلاني مختار',
      subtitleEn: 'A promoted deal shown with the same offer layout.',
      subtitleAr: 'عرض ممول ظاهر مع نفس شكل العروض.',
      valueEn: 'Sponsored',
      valueAr: 'إعلان',
      statusEn: 'Sponsored placement',
      statusAr: 'عرض إعلاني',
      detailEn:
          'This promoted offer keeps the same checkout flow and timer behavior.',
      detailAr: 'العرض الإعلاني بيظهر بنفس تجربة الشراء والتايمر.',
      subtotal: 'EGP 300',
      discount: 'EGP 30',
      discountRateEn: '10% off',
      discountRateAr: 'خصم 10%',
      afterDiscount: 'EGP 270',
      deliveryFee: 'لم يحدد',
      total: 'EGP 270',
      actionEn: 'Add sponsored offer',
      visibilityMode: 'general',
      actionAr: 'ضيف العرض الإعلاني',
      products: [
        _OfferProduct(
          image: AppAssets.temporaryMarketPlaceholder,
          titleEn: 'Sponsored grocery selection',
          titleAr: 'اختيارات بقالة ممولة',
          brandEn: 'Yalla Ads',
          brandAr: 'إعلانات يلا',
          price: 'EGP 270',
          oldPrice: 'EGP 300',
          badgeEn: 'Ad deal',
          badgeAr: 'عرض إعلان',
          metaEn: 'Featured today',
          metaAr: 'مميز اليوم',
        ),
      ],
    ),
    _PromoOfferData(
      icon: AppIcons.global,
      color: AppColors.info,
      image: AppAssets.temporaryMarketPlaceholder,
      endsAtIso: '2026-07-04T23:59:00+03:00',
      badgeEn: 'Ad link',
      badgeAr: 'إعلان برابط',
      titleEn: 'Partner Link Deal',
      titleAr: 'إعلان برابط شريك',
      subtitleEn: 'Tap the offer link to view the partner campaign.',
      subtitleAr: 'اضغط على رابط العرض وشوف حملة الشريك.',
      valueEn: 'Link offer',
      valueAr: 'رابط عرض',
      statusEn: 'Sponsored link',
      statusAr: 'إعلان برابط',
      detailEn: 'This ad includes a visible campaign link inside the offer.',
      detailAr: 'الإعلان ده فيه رابط حملة واضح داخل العرض.',
      subtotal: 'EGP 420',
      discount: 'EGP 70',
      discountRateEn: '17% off',
      discountRateAr: 'خصم 17%',
      afterDiscount: 'EGP 350',
      deliveryFee: 'لم يحدد',
      total: 'EGP 350',
      actionEn: 'Add linked ad offer',
      visibilityMode: 'general',
      actionAr: 'ضيف عرض الإعلان بالرابط',
      linkUrl: 'https://yalla.market/offers/partner-link',
      linkLabelEn: 'yalla.market/offers/partner-link',
      linkLabelAr: 'yalla.market/offers/partner-link',
      products: [
        _OfferProduct(
          image: AppAssets.temporaryMarketPlaceholder,
          titleEn: 'Partner campaign grocery bundle',
          titleAr: 'باكج بقالة حملة الشريك',
          brandEn: 'Partner Ad',
          brandAr: 'إعلان شريك',
          price: 'EGP 350',
          oldPrice: 'EGP 420',
          badgeEn: 'Linked ad',
          badgeAr: 'إعلان برابط',
          metaEn: 'Campaign link',
          metaAr: 'رابط حملة',
        ),
      ],
    ),
    _PromoOfferData(
      icon: AppIcons.receipt_text,
      color: AppColors.error,
      image: AppAssets.samsungS9Mobile,
      endsAtIso: '2026-07-05T23:59:00+03:00',
      badgeEn: 'Discount',
      badgeAr: 'خصم',
      titleEn: 'Extra Discount',
      titleAr: 'خصم إضافي',
      subtitleEn: 'A direct discount on one selected product.',
      subtitleAr: 'خصم مباشر على منتج محدد.',
      valueEn: '15% off',
      valueAr: 'خصم 15%',
      statusEn: 'Discount active',
      statusAr: 'خصم نشط',
      detailEn:
          'The discount is included in the price below and confirmed in the order summary.',
      detailAr: 'الخصم متحسب في السعر تحت وبيتأكد في ملخص الطلب.',
      subtotal: 'EGP 480',
      discount: 'EGP 100',
      discountRateEn: '21% off',
      discountRateAr: 'خصم 21%',
      afterDiscount: 'EGP 380',
      deliveryFee: 'لم يحدد',
      total: 'EGP 380',
      actionEn: 'Add discounted item',
      visibilityMode: 'regions',
      regionSlugs: ['sharm-el-sheikh'],
      regionNames: ['Sharm El Sheikh'],
      actionAr: 'ضيف المنتج المخفض',
      products: [
        _OfferProduct(
          image: AppAssets.samsungS9Mobile,
          titleEn: 'Smart phone with warranty',
          titleAr: 'موبايل ذكي بضمان',
          brandEn: 'Electronics',
          brandAr: 'أجهزة إلكترونية',
          price: 'EGP 380',
          oldPrice: 'EGP 480',
          badgeEn: '21% off',
          badgeAr: 'خصم 21%',
          metaEn: 'Selected deal',
          metaAr: 'عرض مختار',
        ),
      ],
    ),
  ];

  late final PageController _pageController;
  int _currentIndex = 0;

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

  void _showOfferSheet(BuildContext context, _PromoOfferData offer) {
    if (offer.hasExternalLink) {
      unawaited(_launchOfferLink(context, offer));
      return;
    }

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _PromoOfferSheet(offer: offer),
    );
  }

  @override
  Widget build(BuildContext context) {
    final regionSlug = context.select<LocationCubit, String>(
      (cubit) => cubit.state.selectedCity?.slug ?? 'general',
    );
    final offers = _visibleOffers(regionSlug);
    if (_currentIndex >= offers.length && offers.isNotEmpty) {
      _currentIndex = 0;
    }

    return Column(
      children: [
        RepaintBoundary(
          child: SizedBox(
            height: 154,
            child: PageView.builder(
              controller: _pageController,
              itemCount: offers.length,
              onPageChanged: (index) {
                setState(() => _currentIndex = index);
              },
              itemBuilder: (context, index) {
                final offer = offers[index];
                return Padding(
                  padding: const EdgeInsets.only(right: 2),
                  child: _PromoOfferCard(
                    offer: offer,
                    onTap: () => _showOfferSheet(context, offer),
                  ),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(offers.length, (index) {
            final isSelected = _currentIndex == index;
            final isDark = Theme.of(context).brightness == Brightness.dark;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOut,
              width: isSelected ? 18 : 6,
              height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 2.5),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : isDark
                    ? Colors.white.withValues(alpha: 0.18)
                    : Colors.black.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(8),
              ),
            );
          }),
        ),
      ],
    );
  }

  List<_PromoOfferData> _visibleOffers(String regionSlug) {
    final normalized = regionSlug.trim().toLowerCase();
    return _offers
        .where((offer) {
          if (offer.isGeneralVisibility) return true;
          if (normalized.isEmpty || normalized == 'general') return false;
          return offer.regionSlugs.contains(normalized);
        })
        .toList(growable: false);
  }
}

class _PromoOfferCard extends StatelessWidget {
  const _PromoOfferCard({required this.offer, required this.onTap});

  final _PromoOfferData offer;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = Colors.white;
    final bodyColor = Colors.white.withValues(alpha: 0.82);
    final endsAt = offer.endsAt;

    return Material(
      color: isDark ? AppColors.darkCardColor : Colors.white,
      borderRadius: BorderRadius.circular(8),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Stack(
          children: [
            Positioned.fill(
              child: AppImage(
                source: offer.image,
                fit: BoxFit.cover,
                cacheWidth: 720,
                cacheHeight: 316,
                filterQuality: FilterQuality.low,
              ),
            ),
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: AlignmentDirectional.centerStart,
                    end: AlignmentDirectional.centerEnd,
                    colors: [
                      Colors.black.withValues(alpha: 0.56),
                      Colors.black.withValues(alpha: 0.24),
                      Colors.black.withValues(alpha: 0.66),
                    ],
                  ),
                ),
              ),
            ),
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.08)
                        : Colors.black.withValues(alpha: 0.06),
                  ),
                  boxShadow: [
                    if (!isDark)
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.045),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                  ],
                ),
                padding: const EdgeInsets.fromLTRB(10, 9, 10, 10),
                child: Column(
                  children: [
                    Row(
                      textDirection: TextDirection.ltr,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          fit: FlexFit.loose,
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 116),
                              child: _OfferOverlayBadge(offer: offer),
                            ),
                          ),
                        ),
                        if (endsAt != null) ...[
                          Flexible(
                            fit: FlexFit.loose,
                            child: Align(
                              alignment: Alignment.centerRight,
                              child: _OfferCountdownChip(
                                endsAt: endsAt,
                                color: offer.color,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const Spacer(),
                    Align(
                      alignment: AlignmentDirectional.bottomStart,
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 270),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              offer.title(context),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(
                                    color: titleColor,
                                    fontSize: 21,
                                    height: 1.08,
                                    fontWeight: FontWeight.w900,
                                  ),
                            ),
                            const SizedBox(height: 6),
                            _OfferDescriptionTicker(
                              text: offer.outsideDescription(context),
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(
                                    color: bodyColor,
                                    fontSize: 12,
                                    height: 1.35,
                                    fontWeight: FontWeight.w800,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OfferOverlayBadge extends StatelessWidget {
  const _OfferOverlayBadge({required this.offer});

  final _PromoOfferData offer;

  @override
  Widget build(BuildContext context) {
    final discountRate = offer.hasExternalLink
        ? null
        : offer.discountRate(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 5),
      decoration: BoxDecoration(
        color: offer.color.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.18),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(offer.icon, color: Colors.white, size: 13),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              discountRate == null
                  ? offer.badge(context)
                  : '${offer.badge(context)} - $discountRate',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OfferDescriptionTicker extends StatefulWidget {
  const _OfferDescriptionTicker({required this.text, required this.style});

  final String text;
  final TextStyle? style;

  @override
  State<_OfferDescriptionTicker> createState() =>
      _OfferDescriptionTickerState();
}

class _OfferDescriptionTickerState extends State<_OfferDescriptionTicker> {
  final ScrollController _controller = ScrollController();
  int _runId = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _restartTicker());
  }

  @override
  void didUpdateWidget(covariant _OfferDescriptionTicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.text != widget.text) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _restartTicker());
    }
  }

  @override
  void dispose() {
    _runId++;
    _controller.dispose();
    super.dispose();
  }

  void _restartTicker() {
    if (!mounted) return;
    _runId++;
    if (_controller.hasClients) {
      _controller.jumpTo(0);
    }
    unawaited(_runTicker(_runId));
  }

  Future<void> _runTicker(int runId) async {
    await Future<void>.delayed(const Duration(milliseconds: 800));
    while (mounted && _controller.hasClients && runId == _runId) {
      final maxExtent = _controller.position.maxScrollExtent;
      if (maxExtent <= 1) return;

      final forwardMs = (maxExtent * 38).clamp(1400, 5200).round();
      await _controller.animateTo(
        maxExtent,
        duration: Duration(milliseconds: forwardMs),
        curve: Curves.linear,
      );
      await Future<void>.delayed(const Duration(milliseconds: 650));
      if (!mounted || !_controller.hasClients || runId != _runId) return;

      await _controller.animateTo(
        0,
        duration: const Duration(milliseconds: 850),
        curve: Curves.easeOut,
      );
      await Future<void>.delayed(const Duration(milliseconds: 900));
    }
  }

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: SingleChildScrollView(
        controller: _controller,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        child: Text(
          widget.text,
          maxLines: 1,
          softWrap: false,
          overflow: TextOverflow.visible,
          style: widget.style,
        ),
      ),
    );
  }
}

class _OfferCountdownChip extends StatefulWidget {
  const _OfferCountdownChip({required this.endsAt, required this.color});

  final DateTime endsAt;
  final Color color;

  @override
  State<_OfferCountdownChip> createState() => _OfferCountdownChipState();
}

class _OfferCountdownChipState extends State<_OfferCountdownChip> {
  Timer? _timer;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final remaining = widget.endsAt.difference(_now);
    final duration = remaining.isNegative ? Duration.zero : remaining;

    return Container(
      constraints: const BoxConstraints(maxWidth: 150),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: widget.color.withValues(alpha: 0.24)),
      ),
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: _CountdownUnits(
          duration: duration,
          color: widget.color,
          numberColor: AppColors.lightTextPrimary,
          isCompact: true,
          isSingleLine: true,
        ),
      ),
    );
  }
}

class _CountdownUnits extends StatelessWidget {
  const _CountdownUnits({
    required this.duration,
    required this.color,
    required this.numberColor,
    this.isCompact = false,
    this.isSingleLine = false,
  });

  final Duration duration;
  final Color color;
  final Color numberColor;
  final bool isCompact;
  final bool isSingleLine;

  @override
  Widget build(BuildContext context) {
    final totalSeconds = duration.inSeconds;
    const secondsPerDay = 24 * 60 * 60;
    final days = totalSeconds ~/ secondsPerDay;
    final hours = (totalSeconds % secondsPerDay) ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;
    final units = [
      _CountdownUnitData(
        value: days.toString(),
        label: _useArabicCopy(context) ? 'يوم' : 'day',
      ),
      _CountdownUnitData(
        value: hours.toString().padLeft(2, '0'),
        label: _useArabicCopy(context) ? 'ساعة' : 'hr',
      ),
      _CountdownUnitData(
        value: minutes.toString().padLeft(2, '0'),
        label: _useArabicCopy(context) ? 'دقيقة' : 'min',
      ),
      _CountdownUnitData(
        value: seconds.toString().padLeft(2, '0'),
        label: _useArabicCopy(context) ? 'ثانية' : 'sec',
      ),
    ];

    if (isSingleLine) {
      return Directionality(
        textDirection: TextDirection.ltr,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var index = 0; index < units.length; index++) ...[
              _CountdownUnitCell(
                data: units[index],
                color: color,
                numberColor: numberColor,
                isCompact: true,
              ),
              if (index != units.length - 1) const SizedBox(width: 3),
            ],
          ],
        ),
      );
    }

    if (isCompact) {
      return Directionality(
        textDirection: TextDirection.ltr,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _CountdownUnitCell(
                  data: units[0],
                  color: color,
                  numberColor: numberColor,
                  isCompact: true,
                ),
                const SizedBox(width: 4),
                _CountdownUnitCell(
                  data: units[1],
                  color: color,
                  numberColor: numberColor,
                  isCompact: true,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _CountdownUnitCell(
                  data: units[2],
                  color: color,
                  numberColor: numberColor,
                  isCompact: true,
                ),
                const SizedBox(width: 4),
                _CountdownUnitCell(
                  data: units[3],
                  color: color,
                  numberColor: numberColor,
                  isCompact: true,
                ),
              ],
            ),
          ],
        ),
      );
    }

    return Directionality(
      textDirection: TextDirection.ltr,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var index = 0; index < units.length; index++) ...[
            _CountdownUnitCell(
              data: units[index],
              color: color,
              numberColor: numberColor,
              isCompact: false,
            ),
            if (index != units.length - 1) const SizedBox(width: 5),
          ],
        ],
      ),
    );
  }
}

class _CountdownUnitData {
  const _CountdownUnitData({required this.value, required this.label});

  final String value;
  final String label;
}

class _CountdownUnitCell extends StatelessWidget {
  const _CountdownUnitCell({
    required this.data,
    required this.color,
    required this.numberColor,
    required this.isCompact,
  });

  final _CountdownUnitData data;
  final Color color;
  final Color numberColor;
  final bool isCompact;

  @override
  Widget build(BuildContext context) {
    final width = isCompact ? 29.0 : 44.0;

    return Container(
      width: width,
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 3 : 5,
        vertical: isCompact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              data.value,
              maxLines: 1,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: numberColor,
                fontSize: isCompact ? 10 : 14,
                height: 1,
                fontWeight: FontWeight.w900,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
          SizedBox(height: isCompact ? 2 : 3),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              data.label,
              maxLines: 1,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: color,
                fontSize: isCompact ? 7 : 10,
                height: 1,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PromoOfferSheet extends StatelessWidget {
  const _PromoOfferSheet({required this.offer});

  final _PromoOfferData offer;

  Future<void> _checkoutOffer(BuildContext context) async {
    final cartCubit = context.read<CartCubit>();

    for (final product in offer.products) {
      await cartCubit.addItem(product.toCartItem(offer, context), 1);
    }

    if (!context.mounted) return;

    final navigator = Navigator.of(context);
    navigator.pop();
    await navigator.pushNamed(AppRoutes.checkout);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final sheetColor = isDark ? const Color(0xFF222326) : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? Colors.white.withValues(alpha: 0.64)
        : Colors.black.withValues(alpha: 0.58);

    return SafeArea(
      top: false,
      child: Container(
        height: MediaQuery.sizeOf(context).height * 0.94,
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        decoration: BoxDecoration(
          color: sheetColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.06),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: mutedColor.withValues(alpha: 0.45),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            const SizedBox(height: 20),
            _OfferSheetHeader(
              offer: offer,
              textColor: textColor,
              mutedColor: mutedColor,
              isDark: isDark,
            ),
            const SizedBox(height: 14),
            if (offer.endsAt != null) ...[
              _OfferCountdownPanel(
                offer: offer,
                textColor: textColor,
                mutedColor: mutedColor,
                isDark: isDark,
              ),
              const SizedBox(height: 14),
            ],
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _OfferStatusPanel(
                    offer: offer,
                    textColor: textColor,
                    mutedColor: mutedColor,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 14),
                  _OfferProductsPanel(
                    offer: offer,
                    textColor: textColor,
                    mutedColor: mutedColor,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 14),
                  _OfferSummaryPanel(
                    offer: offer,
                    textColor: textColor,
                    mutedColor: mutedColor,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 14),
                  _OfferPaymentPanel(
                    textColor: textColor,
                    mutedColor: mutedColor,
                    isDark: isDark,
                  ),
                ],
              ),
            ),
            _OfferCheckoutBar(
              offer: offer,
              textColor: textColor,
              mutedColor: mutedColor,
              isDark: isDark,
              onCheckout: () => _checkoutOffer(context),
            ),
          ],
        ),
      ),
    );
  }
}

class _OfferSheetHeader extends StatelessWidget {
  const _OfferSheetHeader({
    required this.offer,
    required this.textColor,
    required this.mutedColor,
    required this.isDark,
  });

  final _PromoOfferData offer;
  final Color textColor;
  final Color mutedColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final discountRate = offer.discountRate(context);

    return Row(
      children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: offer.color.withValues(alpha: isDark ? 0.18 : 0.10),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(offer.icon, color: offer.color, size: 23),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      offer.badge(context),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: mutedColor,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  if (discountRate != null) ...[
                    const SizedBox(width: 8),
                    _MiniBadge(
                      text: discountRate,
                      color: offer.color,
                      isDark: isDark,
                    ),
                  ],
                ],
              ),
              if (discountRate == null)
                const SizedBox(height: 3)
              else
                const SizedBox(height: 6),
              Text(
                offer.title(context),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: textColor,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _OfferCountdownPanel extends StatefulWidget {
  const _OfferCountdownPanel({
    required this.offer,
    required this.textColor,
    required this.mutedColor,
    required this.isDark,
  });

  final _PromoOfferData offer;
  final Color textColor;
  final Color mutedColor;
  final bool isDark;

  @override
  State<_OfferCountdownPanel> createState() => _OfferCountdownPanelState();
}

class _OfferCountdownPanelState extends State<_OfferCountdownPanel> {
  Timer? _timer;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final endsAt = widget.offer.endsAt;
    if (endsAt == null) return const SizedBox.shrink();

    final remaining = endsAt.difference(_now);
    final duration = remaining.isNegative ? Duration.zero : remaining;
    final title = remaining.isNegative
        ? (context.isArabicLanguage ? 'انتهى العرض' : 'Offer ended')
        : (context.isArabicLanguage ? 'ينتهي العرض خلال' : 'Offer ends in');

    return _OfferPanel(
      isDark: widget.isDark,
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: widget.offer.color.withValues(
                alpha: widget.isDark ? 0.18 : 0.10,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(widget.offer.icon, color: widget.offer.color, size: 21),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: widget.mutedColor,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Flexible(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: AlignmentDirectional.centerEnd,
              child: _CountdownUnits(
                duration: duration,
                color: widget.offer.color,
                numberColor: widget.textColor,
                isCompact: true,
                isSingleLine: true,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OfferStatusPanel extends StatelessWidget {
  const _OfferStatusPanel({
    required this.offer,
    required this.textColor,
    required this.mutedColor,
    required this.isDark,
  });

  final _PromoOfferData offer;
  final Color textColor;
  final Color mutedColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: offer.color.withValues(alpha: isDark ? 0.14 : 0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(AppIcons.info_circle, color: offer.color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  offer.status(context),
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  offer.detail(context),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: mutedColor,
                    height: 1.4,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OfferProductsPanel extends StatelessWidget {
  const _OfferProductsPanel({
    required this.offer,
    required this.textColor,
    required this.mutedColor,
    required this.isDark,
  });

  final _PromoOfferData offer;
  final Color textColor;
  final Color mutedColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return _OfferPanel(
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _PanelTitle(
            icon: AppIcons.shopping_bag,
            title: context.isArabicLanguage
                ? 'العناصر داخل العرض'
                : 'Offer items',
            textColor: textColor,
            isDark: isDark,
          ),
          const SizedBox(height: 12),
          for (var index = 0; index < offer.products.length; index++) ...[
            _OfferProductRow(
              offer: offer,
              product: offer.products[index],
              textColor: textColor,
              mutedColor: mutedColor,
              isDark: isDark,
            ),
            if (index != offer.products.length - 1) const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _OfferProductRow extends StatelessWidget {
  const _OfferProductRow({
    required this.offer,
    required this.product,
    required this.textColor,
    required this.mutedColor,
    required this.isDark,
  });

  final _PromoOfferData offer;
  final _OfferProduct product;
  final Color textColor;
  final Color mutedColor;
  final bool isDark;

  void _openProductDetails(BuildContext context) {
    final productBadge = product.badge(context);
    final discount = _looksLikeDiscountLabel(productBadge)
        ? productBadge
        : offer.discountRate(context);
    final navigator = Navigator.of(context);

    navigator.pop();
    navigator.pushNamed(
      AppRoutes.productDetail,
      arguments: ProductDetailRouteArgs(
        image: product.image,
        title: product.title(context),
        brand: product.brand(context),
        price: product.price,
        oldPrice: product.oldPrice,
        discount: discount,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final imageFill = isDark
        ? Colors.white.withValues(alpha: 0.05)
        : const Color(0xFFF1F3F8);

    return Semantics(
      button: true,
      label: product.title(context),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => _openProductDetails(context),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: imageFill,
                borderRadius: BorderRadius.circular(8),
              ),
              child: AppImage(
                source: product.image,
                fit: BoxFit.contain,
                cacheWidth: 88,
                cacheHeight: 88,
                filterQuality: FilterQuality.low,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          product.title(context),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(
                                color: textColor,
                                height: 1.18,
                                fontWeight: FontWeight.w900,
                              ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.brand(context),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: mutedColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            SizedBox(
              width: 76,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: AlignmentDirectional.centerEnd,
                    child: GreenCurrencyPrice(
                      price: product.price,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: textColor,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  if (product.oldPrice != null &&
                      product.oldPrice != product.price) ...[
                    const SizedBox(height: 2),
                    AppCurrencyText(
                      text: product.oldPrice!,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: mutedColor,
                        decoration: TextDecoration.lineThrough,
                      ),
                      textAlign: TextAlign.end,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

bool _looksLikeDiscountLabel(String value) {
  final normalized = value.trim().toLowerCase();
  return normalized.contains('%') ||
      normalized.contains('off') ||
      normalized.contains('خصم');
}

bool _useArabicCopy(BuildContext context) {
  return context.isArabicLanguage ||
      Directionality.of(context) == TextDirection.rtl;
}

class _OfferSummaryPanel extends StatelessWidget {
  const _OfferSummaryPanel({
    required this.offer,
    required this.textColor,
    required this.mutedColor,
    required this.isDark,
  });

  final _PromoOfferData offer;
  final Color textColor;
  final Color mutedColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return _OfferPanel(
      isDark: isDark,
      child: Column(
        children: [
          _PanelTitle(
            icon: AppIcons.receipt,
            title: context.tr('Order Summary'),
            textColor: textColor,
            isDark: isDark,
          ),
          const SizedBox(height: 14),
          if (offer.discountRate(context) != null) ...[
            _SummaryLine(
              label: context.isArabicLanguage ? 'نسبة الخصم' : 'Discount rate',
              value: offer.discountRate(context)!,
              valueColor: offer.color,
              textColor: textColor,
              mutedColor: mutedColor,
            ),
            const SizedBox(height: 10),
          ],
          _SummaryLine(
            label: context.isArabicLanguage
                ? 'السعر قبل الخصم'
                : 'Before discount',
            value: offer.subtotal,
            textColor: textColor,
            mutedColor: mutedColor,
          ),
          const SizedBox(height: 10),
          _SummaryLine(
            label: context.isArabicLanguage ? 'قيمة الخصم' : 'Discount value',
            value: '- ${offer.discount}',
            valueColor: AppColors.success,
            textColor: textColor,
            mutedColor: mutedColor,
          ),
          const SizedBox(height: 10),
          _SummaryLine(
            label: context.isArabicLanguage
                ? 'السعر بعد الخصم'
                : 'After discount',
            value: offer.afterDiscount,
            valueColor: offer.color,
            textColor: textColor,
            mutedColor: mutedColor,
          ),
          const SizedBox(height: 10),
          _SummaryLine(
            label: context.isArabicLanguage ? 'التوصيل' : 'Delivery',
            value: offer.deliveryFee,
            valueColor: AppColors.success,
            textColor: textColor,
            mutedColor: mutedColor,
          ),
          const SizedBox(height: 14),
          Divider(
            height: 1,
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.06),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    context.tr('Order Total'),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: textColor,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                AppCurrencyText(
                  text: offer.total,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OfferPaymentPanel extends StatelessWidget {
  const _OfferPaymentPanel({
    required this.textColor,
    required this.mutedColor,
    required this.isDark,
  });

  final Color textColor;
  final Color mutedColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return _OfferPanel(
      isDark: isDark,
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.10),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(AppIcons.money_3, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.tr('Cash on Delivery'),
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  context.tr('Pay when your order arrives'),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: mutedColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          const Icon(AppIcons.tick_circle, color: AppColors.primary, size: 19),
        ],
      ),
    );
  }
}

class _OfferCheckoutBar extends StatelessWidget {
  const _OfferCheckoutBar({
    required this.offer,
    required this.textColor,
    required this.mutedColor,
    required this.isDark,
    required this.onCheckout,
  });

  final _PromoOfferData offer;
  final Color textColor;
  final Color mutedColor;
  final bool isDark;
  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(0, 14, 0, 0),
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.06),
            ),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    context.productCount(offer.products.length),
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: mutedColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  AppCurrencyText(
                    text: offer.total,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: textColor,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: onCheckout,
                icon: const Icon(AppIcons.card_tick, size: 19),
                label: Text(context.tr('Checkout')),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PanelTitle extends StatelessWidget {
  const _PanelTitle({
    required this.icon,
    required this.title,
    required this.textColor,
    required this.isDark,
  });

  final IconData icon;
  final String title;
  final Color textColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.10),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppColors.primary, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }
}

class _SummaryLine extends StatelessWidget {
  const _SummaryLine({
    required this.label,
    required this.value,
    required this.textColor,
    required this.mutedColor,
    this.valueColor,
  });

  final String label;
  final String value;
  final Color textColor;
  final Color mutedColor;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final color = valueColor ?? textColor;
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: mutedColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        AppCurrencyText(
          text: value,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: color,
            fontWeight: FontWeight.w900,
          ),
          currencyColor: color,
        ),
      ],
    );
  }
}

class _MiniBadge extends StatelessWidget {
  const _MiniBadge({
    required this.text,
    required this.color,
    required this.isDark,
  });

  final String text;
  final Color color;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 86),
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: isDark ? 0.18 : 0.10),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _OfferPanel extends StatelessWidget {
  const _OfferPanel({required this.child, required this.isDark});

  final Widget child;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardColor : const Color(0xFFF7F8FB),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: child,
    );
  }
}

class _PromoOfferData {
  const _PromoOfferData({
    required this.icon,
    required this.color,
    required this.image,
    this.endsAtIso,
    required this.badgeEn,
    required this.badgeAr,
    required this.titleEn,
    required this.titleAr,
    required this.subtitleEn,
    required this.subtitleAr,
    required this.valueEn,
    required this.valueAr,
    required this.statusEn,
    required this.statusAr,
    required this.detailEn,
    required this.detailAr,
    required this.subtotal,
    required this.discount,
    required this.discountRateEn,
    required this.discountRateAr,
    required this.afterDiscount,
    required this.deliveryFee,
    required this.total,
    required this.actionEn,
    required this.actionAr,
    required this.products,
    this.visibilityMode = 'general',
    this.regionSlugs = const [],
    this.regionNames = const [],
    this.linkUrl,
    this.linkLabelEn,
    this.linkLabelAr,
  });

  final IconData icon;
  final Color color;
  final String image;
  final String? endsAtIso;
  final String badgeEn;
  final String badgeAr;
  final String titleEn;
  final String titleAr;
  final String subtitleEn;
  final String subtitleAr;
  final String valueEn;
  final String valueAr;
  final String statusEn;
  final String statusAr;
  final String detailEn;
  final String detailAr;
  final String subtotal;
  final String discount;
  final String discountRateEn;
  final String discountRateAr;
  final String afterDiscount;
  final String deliveryFee;
  final String total;
  final String actionEn;
  final String actionAr;
  final List<_OfferProduct> products;
  final String visibilityMode;
  final List<String> regionSlugs;
  final List<String> regionNames;
  final String? linkUrl;
  final String? linkLabelEn;
  final String? linkLabelAr;

  bool get isGeneralVisibility =>
      visibilityMode.trim().toLowerCase() == 'general' || regionSlugs.isEmpty;

  DateTime? get endsAt {
    final value = endsAtIso;
    if (value == null || value.trim().isEmpty) return null;
    return DateTime.tryParse(value);
  }

  String badge(BuildContext context) =>
      _useArabicCopy(context) ? badgeAr : badgeEn;

  String title(BuildContext context) =>
      _useArabicCopy(context) ? titleAr : titleEn;

  String subtitle(BuildContext context) =>
      _useArabicCopy(context) ? subtitleAr : subtitleEn;

  String outsideDescription(BuildContext context) {
    final productNames = products
        .map((product) => product.title(context))
        .where((title) => title.trim().isNotEmpty)
        .join(' - ');
    final description = subtitle(context);

    if (productNames.isEmpty) return description;
    return '$description - $productNames';
  }

  String value(BuildContext context) =>
      _useArabicCopy(context) ? valueAr : valueEn;

  String status(BuildContext context) =>
      _useArabicCopy(context) ? statusAr : statusEn;

  String detail(BuildContext context) =>
      _useArabicCopy(context) ? detailAr : detailEn;

  String? discountRate(BuildContext context) {
    final value = _useArabicCopy(context) ? discountRateAr : discountRateEn;
    return value.trim().isEmpty ? null : value;
  }

  String? linkLabel(BuildContext context) {
    final value = _useArabicCopy(context) ? linkLabelAr : linkLabelEn;
    final fallback = linkUrl;
    if (value == null || value.trim().isEmpty) return fallback;
    return value;
  }

  String action(BuildContext context) =>
      _useArabicCopy(context) ? actionAr : actionEn;

  bool get hasExternalLink => linkUrl?.trim().isNotEmpty ?? false;
}

class _OfferProduct {
  const _OfferProduct({
    required this.image,
    required this.titleEn,
    required this.titleAr,
    required this.brandEn,
    required this.brandAr,
    required this.price,
    required this.badgeEn,
    required this.badgeAr,
    this.oldPrice,
    this.metaEn = '',
    this.metaAr = '',
  });

  final String image;
  final String titleEn;
  final String titleAr;
  final String brandEn;
  final String brandAr;
  final String price;
  final String? oldPrice;
  final String badgeEn;
  final String badgeAr;
  final String metaEn;
  final String metaAr;

  String title(BuildContext context) =>
      _useArabicCopy(context) ? titleAr : titleEn;

  String brand(BuildContext context) =>
      _useArabicCopy(context) ? brandAr : brandEn;

  String badge(BuildContext context) =>
      _useArabicCopy(context) ? badgeAr : badgeEn;

  String meta(BuildContext context) =>
      _useArabicCopy(context) ? metaAr : metaEn;

  CartItemData toCartItem(_PromoOfferData offer, BuildContext context) {
    return CartItemData(
      id: 'promo:${offer.titleEn}:$titleEn',
      image: image,
      brand: brand(context),
      title: title(context),
      price: _moneyValue(price),
      quantity: 1,
      itemType: 'offer',
      visibilityMode: offer.visibilityMode,
      regionSlugs: offer.regionSlugs,
      regionNames: offer.regionNames,
      attributes: [
        CartItemAttribute(
          label: context.isArabicLanguage ? 'عرض' : 'Offer',
          value: offer.title(context),
        ),
      ],
    );
  }
}

double _moneyValue(String value) {
  return double.tryParse(
        value.replaceAll(RegExp(r'[^0-9.,-]'), '').replaceAll(',', ''),
      ) ??
      0;
}

Future<void> _launchOfferLink(
  BuildContext context,
  _PromoOfferData offer,
) async {
  final rawUrl = offer.linkUrl?.trim();
  final url = rawUrl == null ? null : Uri.tryParse(rawUrl);
  final messenger = ScaffoldMessenger.of(context);
  final isArabic = context.isArabicLanguage;

  if (url == null || !url.hasScheme) {
    messenger.showSnackBar(
      SnackBar(
        content: Text(isArabic ? 'رابط الإعلان غير صالح' : 'Invalid ad link'),
      ),
    );
    return;
  }

  final didLaunch = await launchUrl(url, mode: LaunchMode.externalApplication);
  if (didLaunch || !context.mounted) return;

  messenger.showSnackBar(
    SnackBar(
      content: Text(
        isArabic ? 'تعذر فتح رابط الإعلان' : 'Could not open ad link',
      ),
    ),
  );
}
