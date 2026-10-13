// PREVIEW ONLY — not imported by the app. Delete with the preview/ folder.
const img = seed => `https://picsum.photos/seed/${seed}/600/400`;
export const categories = [
  { id: 'c1', name: 'خضروات وفاكهة' },
  { id: 'c2', name: 'ألبان وأجبان' },
  { id: 'c3', name: 'لحوم ودواجن' },
  { id: 'c4', name: 'مخبوزات' },
  { id: 'c5', name: 'مشروبات' },
  { id: 'c6', name: 'منظفات' },
];
export const vendors = [
  { id: 'v1', shopName: 'سوبر ماركت الهدى', type: 'SUPERMARKET', status: 'OPEN', averageRating: 4.6, totalRatings: 128, address: 'شارع التحرير، الدقي، الجيزة', storeImage: img('market1'), shopDescription: 'كل احتياجات البيت اليومية بأسعار مناسبة وتوصيل سريع داخل الحي.' },
  { id: 'v2', shopName: 'ماركت النور للمواد الغذائية والمنظفات', type: 'SUPERMARKET', status: 'CLOSED', averageRating: 4.1, totalRatings: 37, address: 'مدينة نصر، القاهرة' },
  { id: 'v3', shopName: 'Fresh Market', type: 'SUPERMARKET', status: 'OPEN', averageRating: 0, totalRatings: 0, address: 'المعادي، القاهرة', storeImage: img('market3') },
  { id: 'v4', shopName: 'جزارة الأمانة', type: 'BUTCHER', status: 'OPEN', averageRating: 4.9, totalRatings: 412, address: 'شبرا، القاهرة' },
  { id: 'v5', shopName: 'خضري الخير', type: 'VEGFRUIT', status: 'OPEN', averageRating: 4.3, totalRatings: 9, address: 'الهرم، الجيزة' },
];
export const products = [
  { id: 'p1', vendorId: 'v1', name: 'طماطم بلدي', price: 18.5, measurementType: 'WEIGHT', stockWeightGrams: 20000, isAvailable: true, description: 'طماطم طازجة من المزرعة مباشرة.' },
  { id: 'p2', vendorId: 'v1', name: 'لبن جهينة كامل الدسم ١ لتر عبوة كرتون', price: 42, measurementType: 'UNIT', stockQuantity: 30, isAvailable: true },
  { id: 'p3', vendorId: 'v1', name: 'Nescafé Gold 95g', price: 189.75, measurementType: 'UNIT', stockQuantity: 4, isAvailable: true, imageUrl: img('coffee') },
  { id: 'p4', vendorId: 'v1', name: 'أرز مصري', price: 34, measurementType: 'WEIGHT', stockWeightGrams: 0, isAvailable: false },
  { id: 'p5', vendorId: 'v1', name: 'جبنة رومي قديمة', price: 420, measurementType: 'WEIGHT', stockWeightGrams: 3000, isAvailable: true },
];
export const addresses = [
  { id: 'a1', label: 'المنزل', address: '١٢ شارع مصدق، الدقي، الجيزة — الدور الثالث شقة ٧', latitude: 30.03, longitude: 31.21, isDefault: true },
  { id: 'a2', label: 'العمل', address: 'برج القاهرة الإداري، مدينة نصر', latitude: 30.06, longitude: 31.33 },
];
export const cart = [
  { ...products[0], weightGrams: 1500, weight: 1.5 },
  { ...products[1], quantity: 2 },
  { ...products[2], quantity: 1 },
];
