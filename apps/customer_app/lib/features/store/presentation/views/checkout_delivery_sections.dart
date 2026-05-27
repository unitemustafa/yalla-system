part of 'checkout_view.dart';

class _PaymentMethodCard extends StatelessWidget {
  const _PaymentMethodCard({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return _SectionCard(
      isDark: isDark,
      title: 'Payment Method',
      icon: AppIcons.money_3,
      actionLabel: 'Change',
      onAction: () => showPaymentMethodSheet(context, isDark),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.10),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              AppIcons.money_3,
              color: AppColors.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.tr('Cash on Delivery'),
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  context.tr('Pay when your order arrives'),
                  style: TextStyle(
                    color: mutedColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          _SoftBadge(
            label: 'Default',
            icon: AppIcons.tick_circle,
            isDark: isDark,
          ),
        ],
      ),
    );
  }
}

class _ShippingAddressCard extends StatelessWidget {
  const _ShippingAddressCard({
    required this.isDark,
    required this.address,
    required this.isLoading,
  });

  final bool isDark;
  final AddressData? address;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final selectedAddress = address;

    return _SectionCard(
      isDark: isDark,
      title: 'Shipping Address',
      icon: AppIcons.location,
      actionLabel: selectedAddress == null ? 'Add' : 'Change',
      onAction: () => showShippingAddressSheet(context, isDark),
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : selectedAddress == null
          ? Row(
              children: [
                Icon(AppIcons.location, color: mutedColor, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    context.tr('Add an address to start checkout faster.'),
                    style: TextStyle(
                      color: mutedColor,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.tr(selectedAddress.name),
                  style: TextStyle(
                    color: textColor,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                _InfoLine(
                  icon: AppIcons.call,
                  text: selectedAddress.phoneNumber,
                  color: mutedColor,
                ),
                const SizedBox(height: 10),
                _InfoLine(
                  icon: AppIcons.routing,
                  text: localizedAddressText(context, selectedAddress),
                  color: mutedColor,
                ),
              ],
            ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.isDark,
    required this.title,
    required this.icon,
    required this.actionLabel,
    required this.onAction,
    required this.child,
  });

  final bool isDark;
  final String title;
  final IconData icon;
  final String actionLabel;
  final VoidCallback onAction;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _IconTile(icon: icon, isDark: isDark),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  context.tr(title),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              TextButton.icon(
                onPressed: onAction,
                icon: const Icon(AppIcons.edit_2, size: 14),
                label: Text(context.tr(actionLabel)),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: const Size(0, 34),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  textStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}
