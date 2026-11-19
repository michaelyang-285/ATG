export default function BusinessLocationFields({city, zip, onChange}: {
  city: string; zip: string; onChange: (key: "city" | "zip", value: string) => void;
}) {
  return <>
    <label>City (Georgia)<input required autoComplete="address-level2" maxLength={80}
      value={city} onChange={e => onChange("city", e.target.value)} /></label>
    <label>ZIP code<input required autoComplete="postal-code" maxLength={10}
      pattern="[0-9]{5}(-[0-9]{4})?" placeholder="e.g. 30096"
      value={zip} onChange={e => onChange("zip", e.target.value)} /></label>
  </>;
}
