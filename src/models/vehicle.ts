export type VehicleType = '4-Wheeler' | '2-Wheeler' | 'EV-4W' | 'EV-2W';

export interface Vehicle {
  id: string;
  flatNumber: string;
  ownerName: string;
  vehicleType: VehicleType;
  makeModel: string;
  plateNumber: string; // e.g. "GA-07-C-4589"
  parkingSlotNumber: string; // e.g. "P-A12"
  stickerIssued: boolean;
  rfidTagNo?: string;
  contactPhone: string;
}
