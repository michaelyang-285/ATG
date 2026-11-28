export const categories = {
  "Food & Drink": [
    "Plate Sellers",
    "Restaurants",
    "Coffee",
    "Cafés",
    "Food Trucks",
    "Caterers",
    "Bakers",
  ],
  "Beauty & Personal Care": [
    "Barbers",
    "Hair Salons",
    "Hair Stylists",
    "Loc Specialists",
    "Braiders",
    "Nails",
    "Brows",
    "Lashes",
    "Makeup Artists",
    "Estheticians",
  ],
  Auto: ["Mechanics", "Detailing", "Tires", "Towing", "Transportation"],
  Pets: [
    "Pet Grooming",
    "Pet Sitting",
    "Dog Walking",
    "Boarding",
    "Veterinarians",
  ],
  "Home & Property": [
    "Junk Removal",
    "Cleaning",
    "Lawn Care",
    "Handyman Services",
    "Plumbing",
    "Electrical",
    "HVAC",
    "Moving",
  ],
  "Faith & Worship": [
    "Churches",
    "Mosques",
    "Synagogues",
    "Temples",
    "Other Faith Communities",
  ],
  Community: [
    "Nonprofits",
    "Libraries",
    "Community Centers",
    "Food Pantries",
    "Civic Groups",
    "Government Services",
  ],
  Education: [
    "Childcare",
    "Tutoring",
    "Preschools",
    "Lessons",
    "Youth Programs",
  ],
  Health: ["Clinics", "Dentists", "Counseling", "Fitness", "Senior Care"],
  Shopping: ["Grocery Stores & Supermarkets", "Boutiques", "Specialty Shops", "Local Makers"],
  Events: ["Photographers", "DJs", "Venues", "Party Rentals", "Performers"],
  "Professional Services": [
    "Accounting",
    "Legal",
    "Real Estate",
    "Insurance",
    "Marketing",
    "Technology",
    "Other Services",
  ],
};
export const services = [
  "Mobile",
  "Storefront",
  "Remote / online",
  "Pickup",
  "Delivery",
  "Appointment only",
];

export const additionalCategoryLimit = 3;
export const additionalCategoryError = `Choose up to ${additionalCategoryLimit} additional categories.`;

export function additionalCategories(primary: string, selected: string[]) {
  return Array.from(new Set(selected.filter(category => category !== primary)));
}
