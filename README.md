# splitpro-stats

Tableau de bord de statistiques pour [SplitPro](https://github.com/oss-apps/split-pro), livré comme
**image Docker séparée**, branchée **en lecture seule** sur la base Postgres de SplitPro et servie
sous `/stats` du même domaine (connexion unique via le cookie de session NextAuth).

Graphes : dépenses par mois (votre part / ce que vous avez payé), par catégorie, par groupe (avec
évolution mensuelle empilée), qui paie, historique du solde net, plus grosses dépenses. Chaque
graphe a une vue tableau, des infobulles, un mode sombre dédié et suit le thème / la couleur
d'accent choisis dans SplitPro (même origine, donc même `localStorage`).

## Fonctionnement

- **Serveur** : Hono (Node 22), `pg` en SQL brut, rôle Postgres `splitpro_stats` en lecture seule.
- **Auth** : lit le cookie `__Secure-next-auth.session-token` / `next-auth.session-token`, le
  résout dans la table `Session` (stratégie _database_ de NextAuth). Sans session valide : 401,
  et le front redirige vers `/auth/signin?callbackUrl=/stats`.
- **Front** : React 19 + Recharts + Tailwind v4, construit par Vite avec `base=/stats/`.
- **Montants** : BigInt en unités mineures, décimales par devise (copie de `src/lib/currency.ts`
  de SplitPro dans `src/shared/currency.ts`), jamais de somme inter-devises.
- **Règles de calcul** : dépenses non supprimées, hors `SETTLEMENT` et `CURRENCY_CONVERSION`
  (transferts de solde, pas des dépenses) ; part de l'utilisateur =
  `(payeur = moi ? montant : 0) − ExpenseParticipant.amount`. L'historique de solde inclut en
  revanche règlements et conversions, et son dernier point doit égaler `BalanceView`.

## Déploiement (Synology / docker compose)

Prérequis : l'image SplitPro **du fork custom** (elle contient le rewrite `/stats` → ce service et
l'exception de locale dans le middleware). Sinon, utiliser `deploy/Caddyfile` devant les deux
services.

1. Créer le rôle lecture seule (une fois, avec la pile démarrée) :
   ```bash
   docker exec -i splitpro-db psql -U postgres -d splitpro < sql/create-readonly-role.sql
   ```
   (changer le mot de passe dans le fichier avant).
2. Ajouter au `.env` de SplitPro :
   ```
   GITHUB_OWNER=<votre-compte-github>
   STATS_DB_PASSWORD=<le mot de passe du rôle>
   ```
3. Utiliser `deploy/compose.synology.yml` (pile complète) ou fusionner `deploy/compose.stats.yml`
   dans votre projet existant. Le nom de service `splitpro-stats` doit correspondre à
   `STATS_INTERNAL_URL` figé dans l'image SplitPro (défaut `http://splitpro-stats:3100`).
4. Ouvrir `https://<votre-domaine>/stats` (ou Compte → _Statistics_ dans SplitPro).

L'image est publiée par `.github/workflows/publish.yml` sur `ghcr.io/<owner>/splitpro-stats`
à chaque tag `v*`. Rendre le package public sur GitHub, ou faire `docker login ghcr.io` sur le NAS.

## Développement

```bash
pnpm install
cp .env.example .env            # DATABASE_URL vers la base de dev de SplitPro
pnpm dev                        # serveur :3100 + Vite :5173 (proxy /stats/api)
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Pour tester l'API en ligne de commande, copier le cookie de session depuis le navigateur :

```bash
curl -H 'Cookie: next-auth.session-token=…' 'http://localhost:3100/stats/api/spend/by-month?currency=EUR'
```

Test d'intégration manuel : le dernier point de `/stats/api/balance/history` par devise doit
égaler `SELECT currency, SUM(amount) FROM "BalanceView" WHERE "userId" = <id> GROUP BY currency`.

## Variables d'environnement

| Variable               | Défaut                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`         | _(obligatoire)_                                                      |
| `BASE_PATH`            | `/stats` (figé au build pour le front, lu au démarrage côté serveur) |
| `PORT`                 | `3100`                                                               |
| `SESSION_COOKIE_NAMES` | `__Secure-next-auth.session-token,next-auth.session-token`           |
| `SIGNIN_URL`           | `/auth/signin`                                                       |
