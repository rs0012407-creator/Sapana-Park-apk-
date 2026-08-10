import { Resident } from '../models/resident';
import { Vehicle } from '../models/vehicle';
import { INITIAL_RESIDENTS } from './authApi';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-1',
    flatNumber: 'A-302',
    ownerName: 'Rajesh Naik',
    vehicleType: '4-Wheeler',
    makeModel: 'Hyundai Creta Silver',
    plateNumber: 'GA-07-C-4589',
    parkingSlotNumber: 'P-A12 (Stilt)',
    stickerIssued: true,
    rfidTagNo: 'RFID-99410',
    contactPhone: '9822145670',
  },
  {
    id: 'VEH-2',
    flatNumber: 'A-302',
    ownerName: 'Priya Naik',
    vehicleType: '2-Wheeler',
    makeModel: 'TVS Jupiter Black',
    plateNumber: 'GA-07-Y-8821',
    parkingSlotNumber: 'P-A12-B',
    stickerIssued: true,
    contactPhone: '9822145671',
  },
  {
    id: 'VEH-3',
    flatNumber: 'B-101',
    ownerName: 'Anjali Deshmukh',
    vehicleType: 'EV-4W',
    makeModel: 'Tata Nexon EV Teal',
    plateNumber: 'GA-03-E-1002',
    parkingSlotNumber: 'P-B02 (EV Charger)',
    stickerIssued: true,
    rfidTagNo: 'RFID-99412',
    contactPhone: '9823011223',
  },
  {
    id: 'VEH-4',
    flatNumber: 'C-204',
    ownerName: 'David D’Souza',
    vehicleType: '4-Wheeler',
    makeModel: 'Mahindra Thar Olive',
    plateNumber: 'GA-08-AA-3344',
    parkingSlotNumber: 'P-C08 (Open)',
    stickerIssued: true,
    contactPhone: '9422055678',
  },
  {
    id: 'VEH-5',
    flatNumber: 'D-401',
    ownerName: 'Vikram Sharma',
    vehicleType: '4-Wheeler',
    makeModel: 'Honda City White',
    plateNumber: 'GA-07-F-7711',
    parkingSlotNumber: 'P-D04',
    stickerIssued: true,
    contactPhone: '8390123456',
  },
];

export function getAllResidents(): Resident[] {
  return INITIAL_RESIDENTS;
}

export function getAllVehicles(): Vehicle[] {
  return INITIAL_VEHICLES;
}
