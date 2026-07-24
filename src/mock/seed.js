// Seed data for the mock backend. Deliberately spans multiple Blocks,
// Vatikas, products and DDUs at every stage of completion — including
// out-of-order fills, an unstaffed village, a dropped product, and a
// cost-economics STOP — so the app has real multiplicity to browse from the
// first run, not just one happy path.

// Org hierarchy: District > Block > Vatika. Each role operates at its own
// level, not "whatever Vatikas this person happens to touch":
//   Dhawak            -> district level (delivery network spans a district)
//   Vasuki / Vidushi   -> block level   (market connectors work across a Block)
//   SWSM               -> village level (assigned to specific Vatikas)
//   Mitra              -> village level (assigned to specific Vatikas)
//   Admin              -> no scope, sees everything

export const seed = {
  districts: [
    { id: 'd_ranchi', name: 'Ranchi' },
    { id: 'd_khunti', name: 'Khunti' },
  ],

  users: [
    { id: 'u_rekha', name: 'Rekha', phone: '98110-00001', roles: ['Vasuki'], roleScopes: { Vasuki: { level: 'block', ids: ['b_ranchi_east'] } } },
    { id: 'u_sunita', name: 'Sunita', phone: '98110-00002', roles: ['Vidushi'], roleScopes: { Vidushi: { level: 'block', ids: ['b_ranchi_east'] } } },
    { id: 'u_manoj', name: 'Manoj', phone: '98110-00003', roles: ['SWSM'], roleScopes: { SWSM: { level: 'vatika', ids: ['v_bishunpur', 'v_ratanpur', 'v_chandpur', 'v_devgaon', 'v_sonpur'] } } },
    { id: 'u_kiran', name: 'Kiran', phone: '98110-00011', roles: ['SWSM'], roleScopes: { SWSM: { level: 'vatika', ids: ['v_manpur', 'v_kesla', 'v_barhi', 'v_tilaiya'] } } },
    { id: 'u_deepak', name: 'Deepak', phone: '98110-00004', roles: ['Mitra'], roleScopes: { Mitra: { level: 'vatika', ids: ['v_bishunpur'] } } },
    { id: 'u_suresh', name: 'Suresh', phone: '98110-00005', roles: ['Dhawak'], roleScopes: { Dhawak: { level: 'district', ids: ['d_ranchi'] } } },
    { id: 'u_priya', name: 'Priya', phone: '98110-00006', roles: ['Admin'], roleScopes: {} },
    {
      id: 'u_anjali',
      name: 'Anjali',
      phone: '98110-00007',
      roles: ['Vasuki', 'Mitra'],
      roleScopes: { Vasuki: { level: 'block', ids: ['b_ranchi_east'] }, Mitra: { level: 'vatika', ids: ['v_ratanpur', 'v_devgaon'] } },
    },
    { id: 'u_anita', name: 'Anita', phone: '98110-00008', roles: ['Vasuki'], roleScopes: { Vasuki: { level: 'block', ids: ['b_ranchi_east', 'b_ranchi_west'] } } },
    { id: 'u_ramesh', name: 'Ramesh', phone: '98110-00009', roles: ['Mitra'], roleScopes: { Mitra: { level: 'vatika', ids: ['v_sonpur', 'v_manpur', 'v_devgaon', 'v_kesla'] } } },
    { id: 'u_vikram', name: 'Vikram', phone: '98110-00010', roles: ['Dhawak'], roleScopes: { Dhawak: { level: 'district', ids: ['d_ranchi', 'd_khunti'] } } },
  ],

  blocks: [
    { id: 'b_ranchi_east', name: 'Ranchi-East', districtId: 'd_ranchi' },
    { id: 'b_ranchi_west', name: 'Ranchi-West', districtId: 'd_khunti' },
  ],

  vatikas: [
    { id: 'v_bishunpur', name: 'Bishunpur', blockId: 'b_ranchi_east', region: 'Ranchi district' },
    { id: 'v_ratanpur', name: 'Ratanpur', blockId: 'b_ranchi_east', region: 'Ranchi district' },
    { id: 'v_chandpur', name: 'Chandpur', blockId: 'b_ranchi_east', region: 'Ranchi district' },
    { id: 'v_devgaon', name: 'Devgaon', blockId: 'b_ranchi_east', region: 'Ranchi district' },
    { id: 'v_sonpur', name: 'Sonpur', blockId: 'b_ranchi_east', region: 'Ranchi district' },
    { id: 'v_manpur', name: 'Manpur', blockId: 'b_ranchi_west', region: 'Khunti district' },
    { id: 'v_kesla', name: 'Kesla', blockId: 'b_ranchi_west', region: 'Khunti district' },
    { id: 'v_barhi', name: 'Barhi', blockId: 'b_ranchi_west', region: 'Khunti district' },
    { id: 'v_tilaiya', name: 'Tilaiya', blockId: 'b_ranchi_west', region: 'Khunti district' },
  ],

  products: [
    { id: 'p_amla', name: 'Amla Murabba', category: 'food', unit: 'jar', icon: '🫙' },
    { id: 'p_cloth', name: 'Cloth Tote Bags', category: 'textile', unit: 'pc', icon: '👜' },
    { id: 'p_mustard', name: 'Mustard Oil', category: 'oil', unit: 'ltr', icon: '🛢️' },
    { id: 'p_sanitary', name: 'Sanitary Pads', category: 'hygiene', unit: 'pkt', icon: '🩹' },
    { id: 'p_mango', name: 'Mango Pickle', category: 'food', unit: 'jar', icon: '🫙' },
    { id: 'p_stoles', name: 'Handloom Stoles', category: 'textile', unit: 'pc', icon: '🧣' },
    { id: 'p_millet', name: 'Millet Flour', category: 'food', unit: 'kg', icon: '🌾' },
    { id: 'p_neem', name: 'Neem Soap', category: 'hygiene', unit: 'pc', icon: '🧼' },
    { id: 'p_salplates', name: 'Sal Leaf Plates', category: 'other', unit: 'pkt', icon: '🍽️' },
  ],

  stage1MarketEntries: [
    { id: 'm1', scope: 'vatika', vatikaId: 'v_bishunpur', blockId: null, productId: 'p_amla', productName: 'Amla Murabba', shopName: 'Sharma Kirana', shopContact: '94xxx-11111', shopLocation: 'Bishunpur bazaar', brand: 'local', unit: '250g jar', mrp: 120, buyingFrequency: 'monthly', volumeEstimate: '30-100/week', shopsSelling: '2-3', seasonal: false, remarks: '', filledBy: 'u_rekha', date: '2026-06-02' },
    { id: 'm2', scope: 'vatika', vatikaId: 'v_bishunpur', blockId: null, productId: 'p_mustard', productName: 'Mustard Oil', shopName: 'Verma Medical', shopContact: '94xxx-22222', shopLocation: 'Bishunpur chowk', brand: 'branded', unit: '1 ltr', mrp: 185, buyingFrequency: 'monthly', volumeEstimate: '10-30/week', shopsSelling: '4-6', seasonal: false, remarks: '', filledBy: 'u_rekha', date: '2026-06-02' },
    { id: 'm3', scope: 'vatika', vatikaId: 'v_bishunpur', blockId: null, productId: 'p_cloth', productName: 'Cloth Tote Bags', shopName: 'Roadside Stall', shopContact: '', shopLocation: 'Bishunpur bus stand', brand: 'local', unit: '1 pc', mrp: 10, buyingFrequency: 'monthly', volumeEstimate: '100+/week', shopsSelling: '1', seasonal: false, remarks: 'Cheap, sells fast in market days', filledBy: 'u_sunita', date: '2026-06-03' },
    { id: 'm4', scope: 'vatika', vatikaId: 'v_devgaon', blockId: null, productId: 'p_mango', productName: 'Mango Pickle', shopName: 'Devgaon General Store', shopContact: '', shopLocation: 'Devgaon main road', brand: 'local', unit: '400g jar', mrp: 150, buyingFrequency: 'monthly', volumeEstimate: '30-100/week', shopsSelling: '2-3', seasonal: true, remarks: 'Peaks in mango season', filledBy: 'u_anjali', date: '2026-05-20' },
    { id: 'm5', scope: 'vatika', vatikaId: 'v_sonpur', blockId: null, productId: 'p_stoles', productName: 'Handloom Stoles', shopName: 'Sonpur Handicrafts Outlet', shopContact: '', shopLocation: 'Sonpur haat', brand: 'local', unit: '1 pc', mrp: 80, buyingFrequency: 'monthly', volumeEstimate: '10-30/week', shopsSelling: '1', seasonal: false, remarks: '', filledBy: 'u_anita', date: '2026-05-28' },
    { id: 'm6', scope: 'vatika', vatikaId: 'v_manpur', blockId: null, productId: 'p_millet', productName: 'Millet Flour', shopName: 'Manpur Kirana Hub', shopContact: '', shopLocation: 'Manpur market', brand: 'local', unit: '1 kg', mrp: 55, buyingFrequency: 'monthly', volumeEstimate: '30-100/week', shopsSelling: '2-3', seasonal: false, remarks: '', filledBy: 'u_anita', date: '2026-06-10' },
    { id: 'm7', scope: 'block', vatikaId: 'v_bishunpur', blockId: 'b_ranchi_east', productId: 'p_cloth', productName: 'Cloth Tote Bags', shopName: 'Ranchi Wholesale Mart', shopContact: '', shopLocation: 'Ranchi city', brand: 'branded', unit: '1 pc', mrp: 25, buyingFrequency: 'monthly', volumeEstimate: '100+/week', shopsSelling: '7+', seasonal: false, remarks: 'Block-wide business mapping', filledBy: 'u_manoj', date: '2026-06-15' },
  ],

  stage1InstitutionEntries: [
    { id: 'i1', scope: 'vatika', vatikaId: 'v_ratanpur', blockId: null, productId: 'p_sanitary', productName: 'Sanitary Pads', institutionName: "Govt. School, Ratanpur", institutionType: 'School', contactName: 'Head Teacher', contactNumber: '94xxx-33333', location: 'Ratanpur', brand: 'branded', unit: 'pkt', volumeMin: 40, volumeMax: 60, buyingPrice: 45, buyingFrequency: 'monthly', vendorSupplier: '', remarks: 'Bulk buyer, wants steady supply', sakhyaOpportunity: false, filledBy: 'u_sunita', date: '2026-06-05' },
    { id: 'i2', scope: 'block', vatikaId: 'v_ratanpur', blockId: 'b_ranchi_east', productId: 'p_sanitary', productName: 'Sanitary Pads', institutionName: 'District Hospital', institutionType: 'Hospital', contactName: 'Procurement Officer', contactNumber: '94xxx-44444', location: 'Ranchi city', brand: 'branded', unit: 'pkt', volumeMin: 100, volumeMax: 150, buyingPrice: 42, buyingFrequency: 'monthly', vendorSupplier: 'Currently sourced from Ranchi wholesaler', remarks: 'Interested in SHG-produced stock', sakhyaOpportunity: true, filledBy: 'u_manoj', date: '2026-06-16' },
  ],

  stage2Assessments: [
    { id: 'a1', vatikaId: 'v_bishunpur', productId: 'p_amla', filledBy: 'u_manoj', date: '2026-06-08', demandConfirmed: true, rawMaterial: 'Amla, sugar, glass jars', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'producer', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: false, readiness: { costStability: 1, trainerAvailable: 1, rawMaterialNow: 0, workspace: 1, electricity: 1, water: 1, storage: 1 } },
    { id: 'a2', vatikaId: 'v_bishunpur', productId: 'p_cloth', filledBy: 'u_manoj', date: '2026-06-09', demandConfirmed: true, rawMaterial: 'Cotton cloth, thread', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: false, externalSupportNeeded: ['Trainer', 'Technical expert'], rawSource: 'producer', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: false, readiness: { costStability: 1, trainerAvailable: 1, rawMaterialNow: 0, workspace: 1, electricity: 1, water: 1, storage: 1 } },
    { id: 'a3', vatikaId: 'v_bishunpur', productId: 'p_mustard', filledBy: 'u_manoj', date: '2026-06-01', demandConfirmed: true, rawMaterial: 'Mustard seed', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'outside', market: 'outside', packagingAvailable: false, producibleInVillage: true, sampleAvailable: null, readiness: {} },
    { id: 'a4', vatikaId: 'v_ratanpur', productId: 'p_sanitary', filledBy: 'u_manoj', date: '2026-06-18', demandConfirmed: true, rawMaterial: 'Cotton, non-woven fabric', rawMaterialAvailableLocally: false, trainingNeeded: true, trainingKind: 'Hygienic production practices', trainedWomenAvailable: false, externalSupportNeeded: ['Trainer', 'Certification'], rawSource: 'local_market', market: null, packagingAvailable: null, producibleInVillage: null, sampleAvailable: null, readiness: {} },
    { id: 'a5', vatikaId: 'v_ratanpur', productId: 'p_stoles', filledBy: 'u_manoj', date: '2026-05-30', demandConfirmed: true, rawMaterial: 'Cotton yarn', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'producer', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: true, readiness: {} },
    { id: 'a6', vatikaId: 'v_devgaon', productId: 'p_mango', filledBy: 'u_manoj', date: '2026-05-22', demandConfirmed: true, rawMaterial: 'Mangoes, mustard oil, spices', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'producer', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: false, readiness: { costStability: 1, trainerAvailable: 1, rawMaterialNow: 1, workspace: 1, electricity: 1, water: 1, storage: 1 } },
    { id: 'a7', vatikaId: 'v_sonpur', productId: 'p_stoles', filledBy: 'u_manoj', date: '2026-05-29', demandConfirmed: true, rawMaterial: 'Cotton yarn', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'producer', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: false, readiness: { costStability: 1, trainerAvailable: 1, rawMaterialNow: 0, workspace: 1, electricity: 1, water: 1, storage: 1 } },
    { id: 'a8', vatikaId: 'v_manpur', productId: 'p_millet', filledBy: 'u_manoj', date: '2026-06-11', demandConfirmed: true, rawMaterial: 'Millet grain', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'producer', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: false, readiness: { costStability: 1, trainerAvailable: 1, rawMaterialNow: 1, workspace: 1, electricity: 1, water: 1, storage: 1 } },
    { id: 'a9', vatikaId: 'v_devgaon', productId: 'p_neem', filledBy: 'u_manoj', date: '2026-06-14', demandConfirmed: true, rawMaterial: 'Neem leaves, base oil', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'local_market', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: true, readiness: {} },
    { id: 'a10', vatikaId: 'v_kesla', productId: 'p_neem', filledBy: 'u_manoj', date: '2026-06-13', demandConfirmed: true, rawMaterial: 'Neem leaves, base oil', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'local_market', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: true, readiness: {} },
    { id: 'a11', vatikaId: 'v_devgaon', productId: 'p_salplates', filledBy: 'u_manoj', date: '2026-06-19', demandConfirmed: true, rawMaterial: 'Sal leaves', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'producer', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: false, readiness: { costStability: 1, trainerAvailable: 1, rawMaterialNow: 1, workspace: 1, electricity: 1, water: 1, storage: 1 } },
    { id: 'a12', vatikaId: 'v_sonpur', productId: 'p_salplates', filledBy: 'u_manoj', date: '2026-06-20', demandConfirmed: true, rawMaterial: 'Sal leaves', rawMaterialAvailableLocally: true, trainingNeeded: false, trainingKind: '', trainedWomenAvailable: true, externalSupportNeeded: [], rawSource: 'producer', market: 'local', packagingAvailable: true, producibleInVillage: true, sampleAvailable: false, readiness: { costStability: 1, trainerAvailable: 1, rawMaterialNow: 1, workspace: 1, electricity: 1, water: 1, storage: 1 } },
  ],

  // DDU groups — the record of which Vatika(s) produce which product together.
  // Every row here is a single-Vatika group (the common case); a merged Block
  // DDU is created explicitly later, by the SWSM/Admin merge action.
  dduGroups: [
    { id: 'v_bishunpur_p_amla', productId: 'p_amla', vatikaIds: ['v_bishunpur'], blockId: null, name: '' },
    { id: 'v_bishunpur_p_cloth', productId: 'p_cloth', vatikaIds: ['v_bishunpur'], blockId: null, name: '' },
    { id: 'v_devgaon_p_mango', productId: 'p_mango', vatikaIds: ['v_devgaon'], blockId: null, name: '' },
    { id: 'v_sonpur_p_stoles', productId: 'p_stoles', vatikaIds: ['v_sonpur'], blockId: null, name: '' },
    { id: 'v_manpur_p_millet', productId: 'p_millet', vatikaIds: ['v_manpur'], blockId: null, name: '' },
    { id: 'v_kesla_p_neem', productId: 'p_neem', vatikaIds: ['v_kesla'], blockId: null, name: '' },
    { id: 'v_devgaon_p_neem', productId: 'p_neem', vatikaIds: ['v_devgaon'], blockId: null, name: '' },
    { id: 'v_tilaiya_p_amla', productId: 'p_amla', vatikaIds: ['v_tilaiya'], blockId: null, name: '' },
    // A merged Block DDU: neither Devgaon nor Sonpur alone can cover a 3,000-unit
    // institutional order (2,640 and 1,200 capacity respectively) — pooled, they can (3,840).
    { id: 'grp_salplates_de_so', productId: 'p_salplates', vatikaIds: ['v_devgaon', 'v_sonpur'], blockId: 'b_ranchi_east', name: 'Devgaon + Sonpur — Sal Leaf Plates' },
  ],

  costEconomics: [
    { id: 'c1', dduId: 'v_bishunpur_p_amla', filledBy: 'u_manoj', updatedAt: '2026-06-10', margins: { retailerPct: 20, vasukiPct: 8, dhawakPct: 5, producerPct: 15, gstPct: 0, wastagePct: 2 }, rawMaterialCost: 40, packagingCost: 5, directLabourCost: 8, manufacturingOverhead: 4, transportToHub: 1, otherCost: 0, competitorMRP: 120, targetInstitutionPrice: 90 },
    { id: 'c2', dduId: 'v_bishunpur_p_cloth', filledBy: 'u_manoj', updatedAt: '2026-06-11', margins: { retailerPct: 20, vasukiPct: 8, dhawakPct: 5, producerPct: 15, gstPct: 0, wastagePct: 2 }, rawMaterialCost: 5, packagingCost: 0.5, directLabourCost: 0.5, manufacturingOverhead: 0.5, transportToHub: 0, otherCost: 0, competitorMRP: 10, targetInstitutionPrice: 8 },
    { id: 'c3', dduId: 'v_devgaon_p_mango', filledBy: 'u_manoj', updatedAt: '2026-05-25', margins: { retailerPct: 20, vasukiPct: 8, dhawakPct: 5, producerPct: 15, gstPct: 0, wastagePct: 2 }, rawMaterialCost: 25, packagingCost: 4, directLabourCost: 5, manufacturingOverhead: 2, transportToHub: 1, otherCost: 0, competitorMRP: 70, targetInstitutionPrice: 65 },
    { id: 'c4', dduId: 'v_sonpur_p_stoles', filledBy: 'u_manoj', updatedAt: '2026-05-31', margins: { retailerPct: 20, vasukiPct: 8, dhawakPct: 5, producerPct: 15, gstPct: 0, wastagePct: 2 }, rawMaterialCost: 15, packagingCost: 2, directLabourCost: 3, manufacturingOverhead: 1, transportToHub: 0, otherCost: 0, competitorMRP: 45, targetInstitutionPrice: 40 },
    { id: 'c5', dduId: 'v_manpur_p_millet', filledBy: 'u_kiran', updatedAt: '2026-06-12', margins: { retailerPct: 20, vasukiPct: 8, dhawakPct: 5, producerPct: 15, gstPct: 0, wastagePct: 2 }, rawMaterialCost: 20, packagingCost: 3, directLabourCost: 4, manufacturingOverhead: 2, transportToHub: 1, otherCost: 0, competitorMRP: 55, targetInstitutionPrice: 50 },
    { id: 'c6', dduId: 'v_kesla_p_neem', filledBy: 'u_kiran', updatedAt: '2026-06-15', margins: { retailerPct: 20, vasukiPct: 8, dhawakPct: 5, producerPct: 15, gstPct: 0, wastagePct: 2 }, rawMaterialCost: 3, packagingCost: 0.5, directLabourCost: 1, manufacturingOverhead: 0.5, transportToHub: 0, otherCost: 0, competitorMRP: 15, targetInstitutionPrice: 14 },
    { id: 'c7', dduId: 'v_devgaon_p_neem', filledBy: 'u_manoj', updatedAt: '2026-06-16', margins: { retailerPct: 20, vasukiPct: 8, dhawakPct: 5, producerPct: 15, gstPct: 0, wastagePct: 2 }, rawMaterialCost: 3.2, packagingCost: 0.5, directLabourCost: 1, manufacturingOverhead: 0.5, transportToHub: 0, otherCost: 0, competitorMRP: null, targetInstitutionPrice: null },
    { id: 'c8', dduId: 'grp_salplates_de_so', filledBy: 'u_manoj', updatedAt: '2026-06-21', margins: { retailerPct: 20, vasukiPct: 8, dhawakPct: 5, producerPct: 15, gstPct: 0, wastagePct: 2 }, rawMaterialCost: 2, packagingCost: 0.3, directLabourCost: 0.4, manufacturingOverhead: 0.2, transportToHub: 0.1, otherCost: 0, competitorMRP: 6, targetInstitutionPrice: 5.5 },
  ],

  stage3Buyers: [
    { id: 'buy1', dduId: 'v_bishunpur_p_amla', buyerType: 'Retail shop', name: 'Sharma Kirana', contactNo: '94xxx-11111', location: 'Bishunpur bazaar', moq: 10, qtyPerMonth: 100, pricePerUnit: 120, howOften: 'weekly', whoDelivers: 'Vaibhavi', poAttachmentName: 'PO_SharmaKirana.jpg' },
    { id: 'buy2', dduId: 'v_bishunpur_p_amla', buyerType: 'Institution', name: 'Ranchi Medical Store', contactNo: '', location: 'Bishunpur', moq: 15, qtyPerMonth: 60, pricePerUnit: 115, howOften: 'fortnightly', whoDelivers: 'Dhawak', poAttachmentName: '' },
    { id: 'buy3', dduId: 'v_devgaon_p_mango', buyerType: 'Retail shop', name: 'Devgaon General Store', contactNo: '', location: 'Devgaon main road', moq: 5, qtyPerMonth: 60, pricePerUnit: 150, howOften: 'weekly', whoDelivers: 'Vaibhavi', poAttachmentName: '' },
    { id: 'buy4', dduId: 'v_sonpur_p_stoles', buyerType: 'Retail shop', name: 'Sonpur Handicrafts Outlet', contactNo: '', location: 'Sonpur haat', moq: 20, qtyPerMonth: 50, pricePerUnit: 80, howOften: 'monthly', whoDelivers: 'Buyer picks up', poAttachmentName: '' },
    { id: 'buy5', dduId: 'v_manpur_p_millet', buyerType: 'Retail shop', name: 'Manpur Kirana Hub', contactNo: '', location: 'Manpur market', moq: 15, qtyPerMonth: 70, pricePerUnit: 55, howOften: 'monthly', whoDelivers: 'Vaibhavi', poAttachmentName: '' },
    { id: 'buy6', dduId: 'v_tilaiya_p_amla', buyerType: 'Retail shop', name: 'Tilaiya General Store', contactNo: '', location: 'Tilaiya', moq: 10, qtyPerMonth: 30, pricePerUnit: 110, howOften: 'monthly', whoDelivers: 'Vaibhavi', poAttachmentName: '' },
    { id: 'buy7', dduId: 'grp_salplates_de_so', buyerType: 'Institution', name: 'Ranchi Catering Services', contactNo: '94xxx-55555', location: 'Ranchi city', moq: 500, qtyPerMonth: 3000, pricePerUnit: 5.5, howOften: 'monthly', whoDelivers: 'Dhawak', poAttachmentName: 'PO_RanchiCatering.jpg' },
  ],

  stage3SupplierLines: [
    { id: 'sup1', dduId: 'v_bishunpur_p_amla', materialName: 'Amla (raw material)', supplierName: 'Ram Farms, Bishunpur', contactNo: '', location: 'Bishunpur', moq: 50, pricePerUnit: 40, totalQtyRequiredMonthly: 200, howOftenRequired: 'weekly', whoDelivers: 'Supplier', storedWhere: 'Cold room' },
    { id: 'sup2', dduId: 'v_bishunpur_p_amla', materialName: 'Glass jars (packaging)', supplierName: 'Ranchi Glassware', contactNo: '', location: 'Ranchi', moq: 100, pricePerUnit: 5, totalQtyRequiredMonthly: 400, howOftenRequired: 'monthly', whoDelivers: 'Supplier', storedWhere: 'Godown' },
    { id: 'sup3', dduId: 'v_devgaon_p_mango', materialName: 'Mangoes', supplierName: 'Devgaon Orchard', contactNo: '', location: 'Devgaon', moq: 30, pricePerUnit: 25, totalQtyRequiredMonthly: 60, howOftenRequired: 'monthly', whoDelivers: 'Supplier', storedWhere: 'Shed' },
    { id: 'sup4', dduId: 'v_devgaon_p_mango', materialName: 'Glass jars', supplierName: 'Ranchi Glassware', contactNo: '', location: 'Ranchi', moq: 60, pricePerUnit: 4, totalQtyRequiredMonthly: 60, howOftenRequired: 'monthly', whoDelivers: 'Supplier', storedWhere: 'Godown' },
    { id: 'sup5', dduId: 'v_sonpur_p_stoles', materialName: 'Cotton yarn', supplierName: 'Sonpur Weavers Co-op', contactNo: '', location: 'Sonpur', moq: 20, pricePerUnit: 30, totalQtyRequiredMonthly: 50, howOftenRequired: 'monthly', whoDelivers: 'Supplier', storedWhere: 'Storeroom' },
    { id: 'sup6', dduId: 'v_manpur_p_millet', materialName: 'Millet grain', supplierName: 'Manpur Farmers Group', contactNo: '', location: 'Manpur', moq: 100, pricePerUnit: 18, totalQtyRequiredMonthly: 140, howOftenRequired: 'monthly', whoDelivers: 'Supplier', storedWhere: 'Warehouse' },
    { id: 'sup7', dduId: 'grp_salplates_de_so', materialName: 'Sal leaves', supplierName: 'Forest Produce Cooperative, Ranchi-East', contactNo: '', location: 'Ranchi-East', moq: 500, pricePerUnit: 2, totalQtyRequiredMonthly: 3000, howOftenRequired: 'monthly', whoDelivers: 'Supplier', storedWhere: 'Shared warehouse (Devgaon)' },
  ],

  stage3Production: [
    { id: 'prod1', dduId: 'v_bishunpur_p_amla', vatikaId: 'v_bishunpur', womenCount: 4, unitsPerWomanPerDay: 10, workingDaysPerMonth: 22 },
    { id: 'prod2', dduId: 'v_devgaon_p_mango', vatikaId: 'v_devgaon', womenCount: 3, unitsPerWomanPerDay: 8, workingDaysPerMonth: 22 },
    { id: 'prod3', dduId: 'v_sonpur_p_stoles', vatikaId: 'v_sonpur', womenCount: 2, unitsPerWomanPerDay: 3, workingDaysPerMonth: 20 },
    { id: 'prod4', dduId: 'v_manpur_p_millet', vatikaId: 'v_manpur', womenCount: 5, unitsPerWomanPerDay: 12, workingDaysPerMonth: 20 },
    { id: 'prod5', dduId: 'grp_salplates_de_so', vatikaId: 'v_devgaon', womenCount: 3, unitsPerWomanPerDay: 40, workingDaysPerMonth: 22 },
    { id: 'prod6', dduId: 'grp_salplates_de_so', vatikaId: 'v_sonpur', womenCount: 2, unitsPerWomanPerDay: 30, workingDaysPerMonth: 20 },
  ],

  stage3Money: [
    { id: 'mon1', dduId: 'v_bishunpur_p_amla', toolsToStartRs: 4200, rawMaterialPackagingMonthlyRs: 10000, unitCostRs: 59.16, vaibhaviSellingPriceRs: 68.034 },
    { id: 'mon2', dduId: 'v_devgaon_p_mango', toolsToStartRs: 3000, rawMaterialPackagingMonthlyRs: 1740, unitCostRs: 37.74, vaibhaviSellingPriceRs: 43.401 },
    { id: 'mon3', dduId: 'v_sonpur_p_stoles', toolsToStartRs: 2500, rawMaterialPackagingMonthlyRs: 1500, unitCostRs: 21.42, vaibhaviSellingPriceRs: 24.633 },
    { id: 'mon4', dduId: 'v_manpur_p_millet', toolsToStartRs: 5000, rawMaterialPackagingMonthlyRs: 2520, unitCostRs: 30.6, vaibhaviSellingPriceRs: 35.19 },
    { id: 'mon5', dduId: 'grp_salplates_de_so', toolsToStartRs: 6000, rawMaterialPackagingMonthlyRs: 6300, unitCostRs: 3.06, vaibhaviSellingPriceRs: 3.519 },
  ],

  stage3Roles: [
    { id: 'role1', dduId: 'v_bishunpur_p_amla', vatikaId: 'v_bishunpur', deliveryBy: 'Dhawak', deliveryMarginPct: 5, vasukiId: 'u_rekha', vasukiMarginPct: 8, mitraId: 'u_deepak' },
    { id: 'role2', dduId: 'v_devgaon_p_mango', vatikaId: 'v_devgaon', deliveryBy: 'Vaibhavi', deliveryMarginPct: 3, vasukiId: 'u_anjali', vasukiMarginPct: 8, mitraId: null },
    { id: 'role3', dduId: 'v_sonpur_p_stoles', vatikaId: 'v_sonpur', deliveryBy: 'Buyer picks up', deliveryMarginPct: 0, vasukiId: 'u_anita', vasukiMarginPct: 8, mitraId: 'u_ramesh' },
    { id: 'role4', dduId: 'v_manpur_p_millet', vatikaId: 'v_manpur', deliveryBy: 'Vaibhavi', deliveryMarginPct: 4, vasukiId: 'u_anita', vasukiMarginPct: 8, mitraId: 'u_ramesh' },
    { id: 'role5', dduId: 'grp_salplates_de_so', vatikaId: 'v_devgaon', deliveryBy: 'Dhawak', deliveryMarginPct: 5, vasukiId: 'u_anjali', vasukiMarginPct: 8, mitraId: 'u_ramesh' },
    { id: 'role6', dduId: 'grp_salplates_de_so', vatikaId: 'v_sonpur', deliveryBy: 'Dhawak', deliveryMarginPct: 5, vasukiId: 'u_anita', vasukiMarginPct: 8, mitraId: 'u_ramesh' },
  ],
}
