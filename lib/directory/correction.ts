export const correctionRoles = [
  "Owner",
  "Representative",
  "I just noticed the issue",
] as const;

export const correctionOptIn =
  "Yes, email me All Things Gwinnett news and offers.";

export type DirectoryRequest = "correction" | "claim" | "dispute";
