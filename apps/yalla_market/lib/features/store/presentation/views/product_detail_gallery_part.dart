part of 'product_detail_view.dart';

class _ProductGallery extends StatelessWidget {
  const _ProductGallery({
    required this.isDark,
    required this.currentImage,
    required this.thumbnailImages,
    required this.isFavorite,
    required this.onBack,
    required this.onImageTap,
    required this.onWishlistTap,
    required this.onThumbnailTap,
  });

  final bool isDark;
  final String currentImage;
  final List<String> thumbnailImages;
  final bool isFavorite;
  final VoidCallback onBack;
  final VoidCallback onImageTap;
  final VoidCallback onWishlistTap;
  final ValueChanged<String> onThumbnailTap;

  @override
  Widget build(BuildContext context) {
    final backIcon = Directionality.of(context) == TextDirection.rtl
        ? AppIcons.arrow_right_3
        : AppIcons.arrow_left_2;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 18),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardColor : const Color(0xFFF1F3F8),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(8)),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _CircleActionButton(
                  icon: backIcon,
                  isDark: isDark,
                  onTap: onBack,
                ),
                _CircleActionButton(
                  icon: isFavorite ? AppIcons.heart5 : AppIcons.heart,
                  color: isFavorite ? AppColors.error : null,
                  isDark: isDark,
                  onTap: onWishlistTap,
                ),
              ],
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: onImageTap,
              child: SizedBox(
                height: 226,
                width: double.infinity,
                child: AppImage(
                  source: currentImage,
                  fit: BoxFit.contain,
                  fallback: const Icon(AppIcons.image),
                ),
              ),
            ),
            const SizedBox(height: 14),
            SizedBox(
              height: 64,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                shrinkWrap: true,
                itemCount: thumbnailImages.length,
                separatorBuilder: (_, _) => const SizedBox(width: 10),
                itemBuilder: (context, index) {
                  final asset = thumbnailImages[index];
                  return _ThumbnailButton(
                    asset: asset,
                    isSelected: currentImage == asset,
                    isDark: isDark,
                    onTap: () => onThumbnailTap(asset),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CircleActionButton extends StatelessWidget {
  const _CircleActionButton({
    required this.icon,
    required this.isDark,
    required this.onTap,
    this.color,
  });

  final IconData icon;
  final bool isDark;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isDark
          ? Colors.black.withValues(alpha: 0.22)
          : Colors.white.withValues(alpha: 0.92),
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 42,
          height: 42,
          child: Icon(
            icon,
            size: 21,
            color: color ?? (isDark ? Colors.white : Colors.black),
          ),
        ),
      ),
    );
  }
}

class _ThumbnailButton extends StatelessWidget {
  const _ThumbnailButton({
    required this.asset,
    required this.isSelected,
    required this.isDark,
    required this.onTap,
  });

  final String asset;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        width: 64,
        height: 64,
        padding: const EdgeInsets.all(7),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkBackground : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
            width: 1.6,
          ),
        ),
        child: AppImage(
          source: asset,
          fit: BoxFit.contain,
          cacheWidth: 128,
          cacheHeight: 128,
          fallback: const Icon(AppIcons.image),
        ),
      ),
    );
  }
}
