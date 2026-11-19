const mailingCities = ["Hoschton", "Tucker"];

export const cities = [
  "Auburn",
  "Berkeley Lake",
  "Braselton",
  "Buford",
  "Dacula",
  "Duluth",
  "Grayson",
  "Lawrenceville",
  "Lilburn",
  "Loganville",
  "Mulberry",
  "Norcross",
  "Peachtree Corners",
  "Rest Haven",
  "Snellville",
  "Sugar Hill",
  "Suwanee",
  ...mailingCities,
].sort();

export function cityOptionLabel(city: string) {
  return mailingCities.includes(city) ? `${city} (Gwinnett portion)` : city;
}

export const facebookGroup =
  "https://www.facebook.com/groups/allthingsgwinnett";
