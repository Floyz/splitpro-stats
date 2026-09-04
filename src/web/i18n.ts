import { createContext, useContext, useMemo } from 'react';

export type Locale = 'en' | 'fr';

export const LOCALES: Locale[] = ['en', 'fr'];

const en = {
  'nav.overview': 'Overview',
  'nav.categories': 'Categories',
  'nav.groups': 'Groups',
  'nav.payers': 'Payers',
  'nav.balance': 'Balance',
  'nav.top': 'Top expenses',
  'header.title': 'Statistics',
  'header.back': '← SplitPro',
  'error.profile': 'Could not load your profile',
  'error.hint': 'Check the container logs (docker logs splitpro-stats) and /stats/api/health.',
  'filters.range': 'Date range',
  'filters.from': 'From',
  'filters.to': 'To (exclusive)',
  'filters.to_word': 'to',
  'filters.group': 'Group',
  'filters.all_groups': 'All groups & friends',
  'filters.archived': '(archived)',
  'filters.currency': 'Currency',
  'preset.year': 'This year',
  'preset.12m': 'Last 12 months',
  'preset.30d': 'Last 30 days',
  'preset.all': 'All time',
  'preset.custom': 'Custom range',
  'chart.no_data': 'No data for this selection.',
  'chart.view_chart': 'Chart',
  'chart.view_table': 'Table',
  'common.your_share': 'Your share',
  'common.you_paid': 'You paid',
  'common.expenses': 'Expenses',
  'common.share_of_total': 'Share of total',
  'common.other': 'Other',
  'common.friends': 'Friends',
  'common.month': 'Month',
  'common.date': 'Date',
  'common.paid': 'Paid',
  'common.net_balance': 'Net balance',
  'common.you': '(you)',
  'overview.expenses_count': '{count} expenses',
  'overview.you_paid_hint': 'Amounts you fronted',
  'overview.avg_month': 'Average per month',
  'overview.since': 'since {month}',
  'overview.owed_to_you': 'Others owe you',
  'overview.you_owe': 'You owe others',
  'overview.settled': 'Settled up',
  'overview.monthly_title': 'Monthly spending ({currency})',
  'overview.monthly_subtitle': 'Your share of each expense versus what you paid',
  'categories.title': 'By category ({currency})',
  'categories.subtitle': 'Your share, grouped by category section',
  'categories.top_title': 'Top sub-categories',
  'categories.top_subtitle': 'Twelve largest, by your share',
  'categories.column': 'Category',
  'groups.title': 'By group ({currency})',
  'groups.subtitle': 'Your share per group; expenses outside a group appear as "Friends"',
  'groups.over_time': 'Groups over time',
  'groups.over_time_subtitle': 'Monthly share, stacked by group',
  'groups.column': 'Group',
  'payers.title': 'Who pays ({currency})',
  'payers.subtitle': 'Total amount fronted by each payer, across the expenses you take part in',
  'payers.column': 'Payer',
  'balance.title': 'Net balance over time ({currency})',
  'balance.subtitle': 'Positive means others owe you, negative means you owe',
  'balance.latest_positive': 'Currently {value}: others owe you',
  'balance.latest_negative': 'Currently {value}: you owe others',
  'balance.latest_zero': 'Currently settled up',
  'top.title': 'Largest expenses ({currency})',
  'top.subtitle': 'Ranked by your share',
  'top.expense': 'Expense',
  'top.paid_by': 'Paid by',
  'top.total': 'Total',
} as const;

export type TranslationKey = keyof typeof en;

const fr: Record<TranslationKey, string> = {
  'nav.overview': "Vue d'ensemble",
  'nav.categories': 'Catégories',
  'nav.groups': 'Groupes',
  'nav.payers': 'Payeurs',
  'nav.balance': 'Solde',
  'nav.top': 'Plus grosses dépenses',
  'header.title': 'Statistiques',
  'header.back': '← SplitPro',
  'error.profile': 'Impossible de charger votre profil',
  'error.hint':
    'Vérifiez les journaux du conteneur (docker logs splitpro-stats) et /stats/api/health.',
  'filters.range': 'Période',
  'filters.from': 'Du',
  'filters.to': 'Au (exclu)',
  'filters.to_word': 'au',
  'filters.group': 'Groupe',
  'filters.all_groups': 'Tous les groupes et amis',
  'filters.archived': '(archivé)',
  'filters.currency': 'Devise',
  'preset.year': 'Cette année',
  'preset.12m': '12 derniers mois',
  'preset.30d': '30 derniers jours',
  'preset.all': 'Depuis le début',
  'preset.custom': 'Période personnalisée',
  'chart.no_data': 'Aucune donnée pour cette sélection.',
  'chart.view_chart': 'Graphique',
  'chart.view_table': 'Tableau',
  'common.your_share': 'Votre part',
  'common.you_paid': 'Vous avez payé',
  'common.expenses': 'Dépenses',
  'common.share_of_total': 'Part du total',
  'common.other': 'Autres',
  'common.friends': 'Amis',
  'common.month': 'Mois',
  'common.date': 'Date',
  'common.paid': 'Payé',
  'common.net_balance': 'Solde net',
  'common.you': '(vous)',
  'overview.expenses_count': '{count} dépenses',
  'overview.you_paid_hint': 'Montants que vous avez avancés',
  'overview.avg_month': 'Moyenne par mois',
  'overview.since': 'depuis {month}',
  'overview.owed_to_you': 'On vous doit',
  'overview.you_owe': 'Vous devez',
  'overview.settled': "À l'équilibre",
  'overview.monthly_title': 'Dépenses mensuelles ({currency})',
  'overview.monthly_subtitle': 'Votre part de chaque dépense, comparée à ce que vous avez payé',
  'categories.title': 'Par catégorie ({currency})',
  'categories.subtitle': 'Votre part, regroupée par famille de catégories',
  'categories.top_title': 'Principales sous-catégories',
  'categories.top_subtitle': 'Les douze plus importantes, selon votre part',
  'categories.column': 'Catégorie',
  'groups.title': 'Par groupe ({currency})',
  'groups.subtitle': 'Votre part par groupe ; les dépenses hors groupe apparaissent sous « Amis »',
  'groups.over_time': 'Groupes dans le temps',
  'groups.over_time_subtitle': 'Part mensuelle, empilée par groupe',
  'groups.column': 'Groupe',
  'payers.title': 'Qui paie ({currency})',
  'payers.subtitle': 'Total avancé par chaque payeur, sur les dépenses auxquelles vous participez',
  'payers.column': 'Payeur',
  'balance.title': 'Solde net dans le temps ({currency})',
  'balance.subtitle': "Positif : on vous doit de l'argent ; négatif : vous devez de l'argent",
  'balance.latest_positive': "Actuellement {value} : on vous doit de l'argent",
  'balance.latest_negative': "Actuellement {value} : vous devez de l'argent",
  'balance.latest_zero': "Actuellement à l'équilibre",
  'top.title': 'Plus grosses dépenses ({currency})',
  'top.subtitle': 'Classées selon votre part',
  'top.expense': 'Dépense',
  'top.paid_by': 'Payé par',
  'top.total': 'Total',
};

export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { en, fr };

export type Vars = Record<string, string | number>;

export const translate = (locale: Locale, key: TranslationKey, vars?: Vars): string => {
  const template = DICTIONARIES[locale][key] ?? en[key];
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
};

const isLocale = (value: string | null | undefined): value is Locale =>
  LOCALES.includes(value as Locale);

const fromTag = (tag: string | null | undefined): Locale | undefined => {
  const base = tag?.toLowerCase().split(/[-_]/)[0];
  return isLocale(base) ? base : undefined;
};

/**
 * Priority: `?lang=` in the URL, then the SplitPro user preference (`User.preferredLanguage`),
 * then the browser language; English otherwise.
 */
export const resolveLocale = (
  preferred: string | null | undefined,
  search: string,
  browserLanguage: string | undefined,
): Locale =>
  fromTag(new URLSearchParams(search).get('lang')) ??
  fromTag(preferred) ??
  fromTag(browserLanguage) ??
  'en';

/** BCP-47 tag used for `Intl` formatting. */
export const intlLocale = (locale: Locale, browserLanguage: string | undefined): string => {
  if ('fr' === locale) {
    return browserLanguage?.toLowerCase().startsWith('fr') ? browserLanguage : 'fr-FR';
  }
  return browserLanguage?.toLowerCase().startsWith('en') ? browserLanguage : 'en';
};

export const LocaleContext = createContext<Locale>('en');

export const useLocale = () => useContext(LocaleContext);

export const useT = () => {
  const locale = useLocale();
  return useMemo(
    () => (key: TranslationKey, vars?: Vars) => translate(locale, key, vars),
    [locale],
  );
};
