import 'package:yalla_market/features/auth/domain/entities/auth_session.dart';
import 'package:yalla_market/features/auth/domain/entities/auth_user.dart';
import 'package:yalla_market/features/cart/domain/entities/cart_item.dart';
import 'package:yalla_market/features/personalization/domain/entities/address.dart';
import 'package:yalla_market/features/store/domain/entities/brand_data.dart';
import 'package:yalla_market/features/store/domain/entities/category_data.dart';
import 'package:yalla_market/features/store/domain/entities/order.dart';
import 'package:yalla_market/features/store/domain/entities/product_data.dart';
import 'package:yalla_market/features/wishlist/domain/entities/wishlist_item.dart';

const sampleUser = AuthUser(
  id: 'user_1',
  email: 'mustafa@example.com',
  firstName: 'Mustafa',
  lastName: 'Ali',
  role: 'CUSTOMER',
);

final sampleSession = AuthSession(
  user: sampleUser,
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresAt: DateTime.utc(2026, 5, 16, 18),
);

const sampleCartItem = CartItemData(
  id: 'cart_1',
  productId: 'product_1',
  image: 'shoe.png',
  brand: 'Yalla',
  title: 'Running Shoe',
  price: 1200,
  quantity: 1,
);

const sampleWishlistItem = WishlistItem(
  image: 'shoe.png',
  title: 'Running Shoe',
  brand: 'Yalla',
  price: '1200 EGP',
);

const sampleAddress = AddressData(
  id: 'address_1',
  name: 'Mustafa Ali',
  phoneNumber: '+201000000000',
  street: '12 Tahrir St',
  city: 'Cairo',
  state: 'Cairo',
  country: 'Egypt',
  postalCode: '11511',
  isDefault: true,
);

const sampleProduct = ProductData(
  id: 'product_1',
  slug: 'running-shoe',
  image: 'shoe.png',
  title: 'Running Shoe',
  brand: 'Yalla',
  price: '1200 EGP',
  oldPrice: '1500 EGP',
  discount: '20%',
  tags: ['shoes'],
  citySlug: 'sharm-el-sheikh',
  cityName: 'Sharm El Sheikh',
);

const sampleCategory = CategoryData(
  id: 'shoes',
  name: 'Shoes',
  slug: 'shoes',
  productCount: 1,
  image: 'shoe.png',
  galleryImages: ['shoe.png'],
  accentColorValue: 0xFF4F60F6,
  keywords: ['shoes'],
);

const sampleBrand = BrandData(
  id: 'yalla',
  name: 'Yalla',
  slug: 'yalla',
  productCount: 1,
  image: 'shoe.png',
  accentColorValue: 0xFF4F60F6,
  keywords: ['yalla'],
);

const sampleShippingAddress = ShippingAddressData(
  fullName: 'Mustafa Ali',
  phone: '+201000000000',
  line1: '12 Tahrir St',
  city: 'Cairo',
  state: 'Cairo',
  country: 'Egypt',
  postalCode: '11511',
);

const sampleOrderItem = OrderItemData(
  id: 'cart_1',
  productId: 'product_1',
  image: 'shoe.png',
  brand: 'Yalla',
  title: 'Running Shoe',
  unitPrice: 1200,
  quantity: 1,
);

final sampleOrder = OrderData(
  id: 'order_1',
  orderNumber: 'YM-10001',
  status: OrderStatus.pending,
  placedAt: DateTime.utc(2026, 5, 16, 15),
  shippingAddress: sampleShippingAddress,
  paymentMethod: 'cash_on_delivery',
  items: const [sampleOrderItem],
  subtotal: 1200,
  shippingFee: 50,
  taxTotal: 0,
  discountTotal: 0,
  total: 1250,
);
