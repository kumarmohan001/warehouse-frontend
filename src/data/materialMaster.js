// Replace these seed records with the Material Master records maintained by Admin.
// The receiving form reads the material type, name, and immutable unique code together.
export const materialTypes = ['API', 'EXP', 'PPM', 'SPM', 'Solvent', 'Consumables'];

export const materialMaster = [
  { code: 'API-001', name: 'Paracetamol', type: 'API' },
  { code: 'API-002', name: 'Ibuprofen', type: 'API' },
  { code: 'EXP-001', name: 'Lactose Monohydrate', type: 'EXP' },
  { code: 'EXP-002', name: 'Microcrystalline Cellulose', type: 'EXP' },
  { code: 'PPM-001', name: 'Blister Foil', type: 'PPM' },
  { code: 'SPM-001', name: 'HDPE Bottle', type: 'SPM' },
  { code: 'SOL-001', name: 'Isopropyl Alcohol', type: 'Solvent' },
  { code: 'CON-001', name: 'Nitrile Gloves', type: 'Consumables' },
];
