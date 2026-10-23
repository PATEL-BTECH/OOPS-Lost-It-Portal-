/**
 * Configurable Campus Custody Locations & Intake Posts
 * Option B: Configurable university intake points
 */
const CUSTODY_LOCATIONS = [
  {
    id: 'MAIN_POST',
    name: 'Main Security Post (Campus Main Gate)',
    zone: 'Campus Perimeter',
    building: 'Entrance Gate 1',
    description: 'Primary campus security gate post with 24/7 guard desk.'
  },
  {
    id: 'CENTRAL_DESK',
    name: 'Central Custody Desk (Admin Block)',
    zone: 'Zone A',
    building: 'Ground Floor, Administrative Block',
    description: 'Central lost & found repository equipped with physical storage lockers A-01 to D-04.'
  },
  {
    id: 'LIBRARY_DESK',
    name: 'Library Custody Desk',
    zone: 'Zone B',
    building: 'Central Library, 1st Floor Reception',
    description: 'Intake point for books, notebooks, laptops, and study materials found in library.'
  },
  {
    id: 'SCIENCE_BLOCK',
    name: 'Science & Engineering Block Security Post',
    zone: 'Zone C',
    building: 'Block A, Ground Floor',
    description: 'Intake point for laboratory items, calculators, and electronics.'
  },
  {
    id: 'SPORTS_CANTEEN',
    name: 'Sports Complex & Canteen Gate',
    zone: 'Zone D',
    building: 'Sports Arena / Student Plaza',
    description: 'Intake point for sports gear, bottles, umbrellas, and bags.'
  }
];

module.exports = {
  CUSTODY_LOCATIONS
};
