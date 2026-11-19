import { cities } from "@/lib/gwinnett";
import { allOfGwinnett, formatServiceAreas, serviceAreaCities } from "@/lib/directory/locations";
export function ServiceAreas({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = serviceAreaCities(value);
  const select = (areas: string[]) => onChange(formatServiceAreas(areas));
  const options = Array.from(new Set([...cities, ...selected]));
  const all = cities.every((city) => selected.includes(city));
  return (
    <fieldset>
      <legend>Cities you serve</legend>
      <label>
        <input
          type="checkbox"
          checked={all}
          onChange={() => select(all ? selected.filter(city => !cities.includes(city)) : options)}
        />{" "}
        {allOfGwinnett}
      </label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
          gap: 8,
        }}
      >
        {options.map((city) => (
          <label key={city}>
            <input
              type="checkbox"
              checked={selected.includes(city)}
              onChange={() =>
                select(selected.includes(city)
                  ? selected.filter(c => c !== city)
                  : [...selected, city])
              }
            />{" "}
            {city}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
