// Copied from SplitPro `src/lib/category.ts`. Stored `Expense.category` values are either a leaf
// item (e.g. "groceries") or a section name (e.g. "food") when the user picked "other".
export const CATEGORIES = {
  entertainment: ['games', 'movies', 'music', 'sports', 'other'],
  food: ['diningOut', 'groceries', 'liquor', 'other'],
  home: [
    'electronics',
    'furniture',
    'supplies',
    'maintenance',
    'mortgage',
    'pets',
    'rent',
    'services',
    'other',
  ],
  life: ['childcare', 'clothing', 'education', 'gifts', 'insurance', 'medical', 'taxes', 'other'],
  travel: ['bicycle', 'bus', 'train', 'car', 'fuel', 'hotel', 'parking', 'plane', 'taxi', 'other'],
  utilities: ['cleaning', 'electricity', 'gas', 'internet', 'trash', 'phone', 'water', 'other'],
  general: ['other'],
} as const;

export type CategorySection = keyof typeof CATEGORIES;

export const CATEGORY_SECTIONS = Object.keys(CATEGORIES) as CategorySection[];

export interface ResolvedCategory {
  section: CategorySection;
  item: string;
}

const isSection = (value: string): value is CategorySection => value in CATEGORIES;

export const resolveCategory = (value: string | null | undefined): ResolvedCategory => {
  if (!value) {
    return { section: 'general', item: 'other' };
  }
  if (isSection(value)) {
    return { section: value, item: 'other' };
  }
  const section = CATEGORY_SECTIONS.find((s) =>
    (CATEGORIES[s] as readonly string[]).includes(value),
  );
  return section ? { section, item: value } : { section: 'general', item: 'other' };
};

// English labels, copied from SplitPro `public/locales/en/categories.json`.
export const CATEGORY_LABELS: Record<
  CategorySection,
  { name: string; items: Record<string, string> }
> = {
  entertainment: {
    name: 'Entertainment',
    items: {
      games: 'Games',
      movies: 'Movies',
      music: 'Music',
      other: 'Entertainment',
      sports: 'Sports',
    },
  },
  food: {
    name: 'Food & Drinks',
    items: {
      diningOut: 'Dining Out',
      groceries: 'Groceries',
      liquor: 'Liquor',
      other: 'Food & Drinks',
    },
  },
  general: { name: 'General', items: { general: 'General', other: 'General' } },
  home: {
    name: 'Home',
    items: {
      electronics: 'Electronics',
      furniture: 'Furniture',
      maintenance: 'Maintenance',
      mortgage: 'Mortgage',
      other: 'Home',
      pets: 'Pets',
      rent: 'Rent',
      services: 'Services',
      supplies: 'Supplies',
    },
  },
  life: {
    name: 'Life',
    items: {
      childcare: 'Childcare',
      clothing: 'Clothing',
      education: 'Education',
      gifts: 'Gifts',
      insurance: 'Insurance',
      medical: 'Medical',
      other: 'Life',
      taxes: 'Taxes',
    },
  },
  travel: {
    name: 'Travel',
    items: {
      bicycle: 'Bicycle',
      bus: 'Bus',
      car: 'Car',
      fuel: 'Fuel',
      hotel: 'Hotel',
      other: 'Travel',
      parking: 'Parking',
      plane: 'Plane',
      taxi: 'Taxi',
      train: 'Train',
    },
  },
  utilities: {
    name: 'Utilities',
    items: {
      cleaning: 'Cleaning',
      electricity: 'Electricity',
      gas: 'Gas',
      internet: 'Internet',
      other: 'Utilities',
      phone: 'Phone',
      trash: 'Trash',
      water: 'Water',
    },
  },
};

export const categoryLabel = (value: string | null | undefined): string => {
  const { section, item } = resolveCategory(value);
  return CATEGORY_LABELS[section].items[item] ?? CATEGORY_LABELS[section].name;
};

export const sectionLabel = (section: CategorySection): string => CATEGORY_LABELS[section].name;
