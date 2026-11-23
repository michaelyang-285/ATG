import { networks } from "@/lib/directory/social";

const groups = {
  basics: [
    ["name", "Business name"],
    ["summary", "Business description"],
    ["category", "Primary category"],
    ["categories", "Additional categories"],
    ["providerType", "Provider type"],
  ],
  location: [
    ["streetAddress", "Business street address"],
    ["city", "City"],
    ["zip", "ZIP code"],
    ["hideAddress", "Hide address on listing"],
    ["neighborhood", "Cities served"],
  ],
  links: [
    ["businessPhone", "Business phone"],
    ["hidePhone", "Hide phone on listing"],
    ["url", "Website"],
    ["booking", "Booking link"],
    ["social", "Social link"],
    ...networks.map((n) => [n.key, n.label]),
  ],
  contact: [
    ["firstName", "First name"],
    ["lastName", "Last name"],
    ["phone", "Contact phone"],
    ["email", "Contact email"],
  ],
};
export function AdminListingFields({
  group,
  values,
}: {
  group: keyof typeof groups;
  values: Record<string, unknown>;
}) {
  return (
    <div className="listing-field-grid">
      {groups[group]
        .filter(([key]) => key in values)
        .map(([key, label]) => {
          const value = values[key];
          if (typeof value === "boolean")
            return (
              <label key={key} className="listing-check">
                <input type="checkbox" name={key} defaultChecked={value} />
                {label}
              </label>
            );
          if (key === "summary" || Array.isArray(value))
            return (
              <label key={key} className="listing-wide">
                {label}
                <textarea
                  name={key}
                  rows={key === "summary" ? 4 : 2}
                  defaultValue={
                    Array.isArray(value)
                      ? JSON.stringify(value)
                      : String(value ?? "")
                  }
                />
              </label>
            );
          return (
            <label
              key={key}
              className={
                key === "name" || key === "streetAddress"
                  ? "listing-wide"
                  : undefined
              }
            >
              {label}
              <input
                name={key}
                readOnly={key === "email"}
                defaultValue={String(value ?? "")}
              />
            </label>
          );
        })}
    </div>
  );
}
