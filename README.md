# Vitefait

Plateforme SaaS permettant à un restaurant de gérer ses commandes en ligne
(QR code + lien direct) sans payer de commission sur les ventes. Le
restaurant garde le contrôle total sur son menu, ses commandes et ses
données clients.

## Stack

- **Frontend** : React 19 + Vite + TypeScript, TailwindCSS v4, React Router 7
- **Backend** : Supabase (Postgres, Auth, Storage, Realtime, RLS)
- **Logique serveur** : fonctions SQL `SECURITY DEFINER` pour les règles
  métier internes (placement de commande, onboarding, assignation
  livreur), et Supabase Edge Functions (Deno) pour les intégrations
  externes (Stripe, WhatsApp Cloud API)
- **État global / data fetching** : TanStack React Query + `supabase-js`
- **i18n** : `react-i18next`, français par défaut, bascule arabe (RTL) via
  le sélecteur de langue dans le header
- **Paiement** : Stripe Checkout + Billing Portal

## Démarrage

```bash
npm install
cp .env.example .env   # renseigner VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

### Base de données

Ce dépôt ne provisionne pas de projet Supabase (aucun projet/organisation
n'était accessible dans cet environnement). Pour déployer :

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Appliquer les migrations dans l'ordre, via le SQL Editor ou la CLI :
   ```bash
   supabase link --project-ref <votre-ref>
   supabase db push
   ```
   (fichiers dans `supabase/migrations/0001` à `0005`)
3. Déployer les Edge Functions :
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy billing-portal
   supabase functions deploy stripe-webhook
   supabase functions deploy send-whatsapp-campaign
   ```
4. Configurer les secrets des fonctions (voir `.env.example` pour la liste
   complète) : `supabase secrets set STRIPE_SECRET_KEY=... ...`
5. Dans Stripe, créer les deux Price (Pro mensuel 9,90 €, Annuel 89 €) et
   pointer le webhook vers
   `https://<project-ref>.functions.supabase.co/stripe-webhook`.

## Décisions & valeurs par défaut

Le brief laissait volontairement certains paramètres business non précisés.
Voici les choix faits, documentés aussi en commentaire dans le code source :

| Paramètre | Valeur par défaut | Où |
|---|---|---|
| Limite du plan Gratuit | 100 commandes / mois | `create_order()` (SQL), `src/lib/plans.ts` |
| Essai gratuit plan Pro | 3 jours | `create-checkout-session` Edge Function |
| Commission livraison par défaut | 10 MAD fixe (configurable par restaurant : fixe / % / au km) | `restaurants.delivery_commission_*` |
| Seuil "client inactif" (campagne WhatsApp) | 30 jours sans commande | `send-whatsapp-campaign` Edge Function |
| Devise affichée | MAD (dirham marocain) | `src/lib/i18n` — modifiable via `common.currency` |
| API WhatsApp | Meta WhatsApp Cloud API (facilement remplaçable par Twilio dans `send-whatsapp-campaign/index.ts`) | Edge Function |

## Architecture des données & sécurité (RLS)

Le schéma complet (tables, enums, index) est dans
`supabase/migrations/0001_schema.sql`. Points clés de sécurité :

- **RLS strict** : chaque table est isolée par restaurant via des policies
  vérifiant `owner_user_id = auth.uid()`. Un restaurant ne peut jamais lire
  les données d'un autre restaurant dans le dashboard.
- **Commandes publiques par id** : la page de suivi client (`/r/:slug/order/:orderId`)
  doit être accessible sans authentification, mais uniquement en connaissant
  l'id (UUID) de la commande — jamais en liste. RLS ne peut pas exprimer
  littéralement "lisible seulement si on connaît déjà l'id" : l'app suit
  donc le même modèle que les liens Stripe / liens de paiement (URL comme
  jeton de capacité), documenté en détail dans `0003_rls.sql`.
- **Écritures sensibles via fonctions `SECURITY DEFINER`** : la création de
  commande (`create_order`) recalcule les prix côté serveur à partir de
  `menu_items` (jamais de confiance dans un prix envoyé par le client),
  vérifie que le restaurant est ouvert, et applique la limite du plan
  Gratuit — tout cela dans une seule transaction atomique.
- **Stockage** : bucket public unique `restaurant-assets`, organisé par
  `{restaurant_id}/{logo|cover|menu|offers}/...`, avec policies
  d'écriture limitées au propriétaire du restaurant correspondant.

## Fonctionnalités livrées

1. Auth & onboarding (création automatique de la ligne `restaurants`)
2. Gestion du menu (CRUD + upload photo)
3. Page publique de commande `/r/:slug` (panier, sur place/livraison)
4. Dashboard des commandes en direct + changement de statut
5. QR code + lien, générés à partir du slug, avec suivi séparé scan/clic
6. Suivi client en direct `/r/:slug/order/:orderId` via Supabase Realtime
7. Statut Ouvert/Fermé (désactive la commande côté client)
8. Offres & promotions
9. Module livraison (livreurs, commission fixe/%/distance)
10. Statistiques (scans/clics, historique commandes, clients récurrents)
11. Abonnements Stripe (Free/Pro/Annuel, limite Free, essai Pro)
12. Campagnes WhatsApp (Pro/Annuel), segment tous/inactifs
13. FR/AR complet dès le départ (RTL pris en charge)

## Ce qui reste à affiner

- **Logo** : un emplacement est prévu partout (header dashboard, page
  publique, favicon, landing) mais utilise un badge "B" en attendant le
  fichier logo réel — voir les commentaires `Logo placeholder` dans le code
  pour les points d'intégration exacts.
- **Provisioning Supabase** : aucun projet Supabase n'était disponible dans
  cet environnement ; les migrations sont prêtes mais n'ont pas été
  appliquées à un projet réel. À faire avant la mise en production.
- **Stripe / WhatsApp en conditions réelles** : le code est fonctionnel
  mais n'a pas pu être testé contre de vraies clés API (aucune fourniture
  de clés dans ce contexte). Tester le flux Checkout → webhook de bout en
  bout, et confirmer le format de numéro attendu par l'API WhatsApp choisie.
  Prévoir aussi la vérification du numéro business WhatsApp (processus Meta).
- **Suppression de compte / RGPD** : pas de flux dédié d'export/suppression
  des données client au-delà de la suppression en cascade des tables liées
  à un restaurant.
- **Emails transactionnels** : la confirmation de commande n'envoie pas de
  SMS/email au client — seul le suivi en direct sur la page web est
  implémenté (conforme au brief, qui ne demandait pas de notification par
  ce canal).
