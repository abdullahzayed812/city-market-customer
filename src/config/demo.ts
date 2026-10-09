// Demo accounts on the login screen (prefilled + one-tap list).
// Temporarily ON in every build, including production, at the owner's request.
// To limit it to development builds: export const DEMO_MODE = __DEV__;
export const DEMO_MODE = true;

// Seed accounts from services/auth-service/src/infrastructure/database/seed-db.ts
export const DEMO_PASSWORD = 'password123';
export const DEMO_ACCOUNTS = [{ label: 'عميل تجريبي', email: 'customer@citymarket.com' }];
