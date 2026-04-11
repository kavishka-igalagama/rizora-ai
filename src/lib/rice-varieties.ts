export const RICE_VARIETIES = [
  "Nadu",
  "Samba",
  "Keeri Samba",
  "Bg 300",
  "Bg 352",
  "At 362",
  "Pachchaperumal",
  "Suwandel",
] as const;

export type RiceVariety = (typeof RICE_VARIETIES)[number];

const RICE_VARIETY_ALIAS_MAP: Record<string, RiceVariety> = {
  nadu: "Nadu",
  "red nadu": "Nadu",
  samba: "Samba",
  "keeri samba": "Keeri Samba",
  "bg 300": "Bg 300",
  bg300: "Bg 300",
  "bg 352": "Bg 352",
  bg352: "Bg 352",
  "at 362": "At 362",
  at362: "At 362",
  pachchaperumal: "Pachchaperumal",
  suwandel: "Suwandel",
};

export const normalizeRiceVariety = (
  value?: string | null,
): RiceVariety | null => {
  if (!value) return null;

  const key = value.trim().toLowerCase();
  if (!key) return null;

  return RICE_VARIETY_ALIAS_MAP[key] ?? null;
};

export const isRiceVariety = (value?: string | null): value is RiceVariety =>
  normalizeRiceVariety(value) !== null;
