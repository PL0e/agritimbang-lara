import type { Account, Page, Role } from "../types";

export const accounts: Account[] = [
  {
    username: "admin_1",
    email: "admin1@gmail.com",
    role: "admin",
    name: "Maria Santos",
    title: "System Administrator",
  },
  {
    username: "LGU_1",
    email: "lgu1gmail.com",
    role: "lgu",
    name: "Paolo Reyes",
    title: "LGU Authority",
  },
  {
    username: "lgu_encoder1",
    email: "lguencoder1@gmail.com",
    role: "lgu_encoder",
    name: "Elena Flores",
    title: "LGU Market Encoder",
  },
  {
    username: "farmer_1",
    email: "farmer1@gmail.com",
    role: "farmer",
    name: "Juan Dela Cruz",
    title: "Livestock Farmer",
  },
];

export const priceRows = [
  { species: "Cattle", breed: "Native", price: 235, trend: "+2.6%", tone: "up", updated: "Jun 10" },
  { species: "Hog", breed: "Large White", price: 198, trend: "+1.5%", tone: "up", updated: "Jun 10" },
  { species: "Goat", breed: "Boer cross", price: 210, trend: "0.0%", tone: "flat", updated: "Jun 10" },
  { species: "Carabao", breed: "Swamp", price: 220, trend: "-1.2%", tone: "down", updated: "Jun 10" },
];

export const activities = [
  { id: "TRX-0248", detail: "Cattle · 328 kg", user: "Ana Villamor", value: "₱77,080", status: "Verified" },
  { id: "TRX-0247", detail: "Hog · 96 kg", user: "Mario Lapaz", value: "₱19,008", status: "Pending" },
  { id: "VAL-0913", detail: "Goat · 42 kg", user: "Lito Sarmiento", value: "₱8,820", status: "Reference" },
  { id: "TRX-0246", detail: "Carabao · 412 kg", user: "Rosa Mercado", value: "₱90,640", status: "Verified" },
];

export const navByRole: Record<Role, { id: Page; label: string; short: string }[]> = {
  admin: [
    { id: "overview", label: "Overview", short: "OV" },
    { id: "records", label: "User management", short: "UM" },
    { id: "settings", label: "System settings", short: "SS" },
  ],
  lgu: [
    { id: "overview", label: "Authority overview", short: "OV" },
    { id: "transactions", label: "Validate transactions", short: "VT" },
    { id: "prices", label: "Price management", short: "PM" },
    { id: "monitoring", label: "Market monitoring", short: "MM" },
    { id: "valuation", label: "Reference calculators", short: "CA" },
    { id: "records", label: "Farmer approvals", short: "FA" },
  ],
  lgu_encoder: [
    { id: "overview", label: "Encoder overview", short: "OV" },
    { id: "transactions", label: "Assist transaction", short: "AT" },
    { id: "prices", label: "Draft weekly price", short: "PR" },
    { id: "valuation", label: "Calculators", short: "CA" },
  ],
  farmer: [
    { id: "overview", label: "Home", short: "HM" },
    { id: "prices", label: "Official prices", short: "PR" },
    { id: "valuation", label: "Calculators", short: "CA" },
    { id: "transactions", label: "Transactions", short: "TR" },
    { id: "records", label: "Livestock drafts", short: "DR" },
    { id: "profile", label: "Profile settings", short: "PS" },
  ],
};
