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

export type CategoryLocale = 'en' | 'fr';

type CategoryLabels = Record<CategorySection, { name: string; items: Record<string, string> }>;

// Labels copied from SplitPro `public/locales/{en,fr}/categories.json`.
const EN_LABELS: CategoryLabels = {
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

const FR_LABELS: CategoryLabels = {
  entertainment: {
    name: 'Divertissements',
    items: {
      games: 'Jeux',
      movies: 'Films',
      music: 'Musique',
      other: 'Divertissements',
      sports: 'Sports',
    },
  },
  food: {
    name: 'Nourriture & boissons',
    items: {
      diningOut: 'Restaurant',
      groceries: 'Courses',
      liquor: 'Alcools',
      other: 'Nourriture & boissons',
    },
  },
  general: { name: 'Général', items: { general: 'Général', other: 'Général' } },
  home: {
    name: 'Habitat',
    items: {
      electronics: 'Appareils électroniques',
      furniture: 'Meubles',
      maintenance: 'Entretien courant',
      mortgage: 'Prêt',
      other: 'Habitat',
      pets: 'Animaux',
      rent: 'Loyer',
      services: 'Réparations',
      supplies: 'Fournitures',
    },
  },
  life: {
    name: 'Vie courante',
    items: {
      childcare: "Garde d'enfants",
      clothing: 'Habits',
      education: 'Formations',
      gifts: 'Cadeaux',
      insurance: 'Assurance',
      medical: 'Médical',
      other: 'Vie courante',
      taxes: 'Impôts et taxes',
    },
  },
  travel: {
    name: 'Déplacements',
    items: {
      bicycle: 'Vélo',
      bus: 'Bus & car',
      car: 'Voiture',
      fuel: 'Essence',
      hotel: 'Hôtel',
      other: 'Déplacements',
      parking: 'Parking',
      plane: 'Avion',
      taxi: 'Taxi',
      train: 'Train',
    },
  },
  utilities: {
    name: 'Frais courants',
    items: {
      cleaning: 'Ménage',
      electricity: 'Électricité',
      gas: 'Gaz',
      internet: 'Internet',
      other: 'Autres frais',
      phone: 'Téléphonie',
      trash: 'Déchets',
      water: 'Eau',
    },
  },
};

export const CATEGORY_LABELS: Record<CategoryLocale, CategoryLabels> = {
  en: EN_LABELS,
  fr: FR_LABELS,
};

export const categoryLabel = (
  value: string | null | undefined,
  locale: CategoryLocale = 'en',
): string => {
  const { section, item } = resolveCategory(value);
  const labels = CATEGORY_LABELS[locale][section];
  return labels.items[item] ?? labels.name;
};

export const sectionLabel = (section: CategorySection, locale: CategoryLocale = 'en'): string =>
  CATEGORY_LABELS[locale][section].name;
