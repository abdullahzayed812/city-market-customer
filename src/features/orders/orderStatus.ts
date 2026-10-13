import {
  CircleCheck,
  CircleX,
  Clock,
  CookingPot,
  FileQuestion,
  Hourglass,
  PackageCheck,
  Truck,
  Bike,
  type LucideIcon,
} from 'lucide-react-native';
import type { Tone } from '@city-market/mobile-ui';
import { CustomerOrderStatus, VendorOrderStatus } from '@city-market/shared';

type AnyStatus = CustomerOrderStatus | VendorOrderStatus | string | undefined | null;

/** Badge tone and icon per order status, so status is never shown by color alone. */
export const orderStatusMeta = (status: AnyStatus): { tone: Tone; icon: LucideIcon } => {
  switch (status) {
    case CustomerOrderStatus.WAITING_CUSTOMER_DECISION:
    case VendorOrderStatus.PROPOSAL_SENT:
      return { tone: 'warning', icon: FileQuestion };
    case CustomerOrderStatus.PENDING_VENDOR_CONFIRMATION:
    case VendorOrderStatus.PENDING:
      return { tone: 'warning', icon: Hourglass };
    case CustomerOrderStatus.PREPARING:
    case VendorOrderStatus.PREPARING:
    case VendorOrderStatus.CONFIRMED:
      return { tone: 'info', icon: CookingPot };
    case CustomerOrderStatus.READY:
      return { tone: 'brand', icon: PackageCheck };
    case CustomerOrderStatus.PICKED_UP:
    case VendorOrderStatus.PICKED_UP:
      return { tone: 'brand', icon: Bike };
    case CustomerOrderStatus.IN_DELIVERY:
    case VendorOrderStatus.ON_THE_WAY:
      return { tone: 'brand', icon: Truck };
    case CustomerOrderStatus.COMPLETED:
    case VendorOrderStatus.DELIVERED:
      return { tone: 'success', icon: CircleCheck };
    case CustomerOrderStatus.CANCELLED:
    case CustomerOrderStatus.CANCELLED_BY_CUSTOMER:
    case VendorOrderStatus.CANCELLED:
      return { tone: 'error', icon: CircleX };
    default:
      return { tone: 'neutral', icon: Clock };
  }
};
