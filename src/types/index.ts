export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'CUSTOMER_SUPPORT'
  | 'CUSTOMER';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'COD';

export type ReturnStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ITEM_RECEIVED'
  | 'REFUNDED'
  | 'CANCELLED';

export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type WatchMovement =
  | 'Automatic'
  | 'Manual Wind'
  | 'Quartz'
  | 'Solar'
  | 'Kinetic'
  | 'Spring Drive'
  | 'Co-Axial';

export type WatchGender = 'Men' | 'Women' | 'Unisex';
