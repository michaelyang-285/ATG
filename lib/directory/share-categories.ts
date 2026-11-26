import {categories} from "./categories";

const families = new Map<string,string>();
for (const [family, primary] of Object.entries(categories)) {
  families.set(family, family);
  for (const category of primary) families.set(category, family);
}

const foodStyles = ["Grocery market","Noodle shop","Dim sum","Korean barbecue","Steakhouse","Diner","Chinese restaurant","Seafood restaurant","Buffet","Coffee and bakery","Tavern","Bistro"];
for (const style of foodStyles) families.set(style, "Food & Drink");
families.set("Fitness testing", "Health");
families.set("Local directory", "Local directory");

const labels: Record<string,string> = {
  "Bakers": "Bakery",
  "Restaurants": "Restaurant",
  "Plate Sellers": "Prepared meals",
  "Food Trucks": "Food truck",
  "Caterers": "Catering",
  "Cafés": "Café",
  "Barbers": "Barber",
  "Hair Salons": "Hair salon",
  "Hair Stylists": "Hair styling",
  "Loc Specialists": "Loc care",
  "Braiders": "Braiding",
  "Makeup Artists": "Makeup",
  "Estheticians": "Skin care",
  "Mechanics": "Auto repair",
  "Veterinarians": "Veterinary care",
  "Clinics": "Clinic",
  "Dentists": "Dentistry",
  "Churches": "Church",
  "Mosques": "Mosque",
  "Synagogues": "Synagogue",
  "Temples": "Temple",
  "Libraries": "Library",
  "Nonprofits": "Nonprofit",
  "Community Centers": "Community center",
  "Food Pantries": "Food pantry",
  "Civic Groups": "Civic group",
  "Preschools": "Preschool",
  "Boutiques": "Boutique",
  "Specialty Shops": "Specialty shop",
  "Local Makers": "Local maker",
  "Photographers": "Photography",
  "DJs": "DJ",
  "Venues": "Event venue",
  "Performers": "Performing arts",
  "Coffee and bakery": "Bakery café",
  "Grocery market": "Grocery market",
  "Chinese restaurant": "Chinese dining",
  "Fitness testing": "Fitness testing"
};
const palettes: Record<string,[string,string]> = {
  "Food & Drink": ["#352022","#FFD0A2"], "Health": ["#123039","#ACE9DC"],
  "Professional Services": ["#24223A","#E4CCFF"], "Beauty & Personal Care": ["#362234","#FFC7DF"],
  "Auto": ["#202C3B","#B5D8FF"], "Pets": ["#253323","#D1EBAD"],
  "Home & Property": ["#253027","#CFEBB9"], "Faith & Worship": ["#30283A","#EFDBAB"],
  "Community": ["#183239","#B6E8E4"], "Education": ["#213149","#C2DFFF"],
  "Shopping": ["#38242C","#FFD2BD"], "Events": ["#30233F","#E5C9F6"],
  "Local directory": ["#252521","#FFD2AD"],
};

export function categoryStyle(primary?: string, editorialStyle?: string) {
  const raw = primary?.trim() || "";
  // Older Sanity profiles use a single broad Food label.
  const base = raw.toLowerCase() === "food" ? "Food & Drink" : raw;
  const validBase = families.has(base) ? base : "Local directory";
  const style = editorialStyle && families.get(editorialStyle) === families.get(validBase)
    ? editorialStyle : validBase;
  const family = families.get(style)!;
  const asset = style.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [background, accent] = palettes[family];
  return {asset, label: labels[style] || style, background, accent};
}
