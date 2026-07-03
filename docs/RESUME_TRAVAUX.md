# YouzFul — Résumé des travaux de développement

---

## 1. Architecture du projet

**Stack technique :**
- React Native 0.72 (TypeScript) — Android + iOS
- Redux + Redux Thunk + Redux Persist (état global)
- React Navigation (Stack + Bottom Tabs + Drawer)
- Axios pour les appels HTTP vers `https://api.youz-ful.com`
- AsyncStorage pour le cache local
- i18next pour la traduction FR/AR
- React Native Paper (composants UI)
- PHP + PDO MySQL côté backend

**Modules principaux :**

| Module | Rôle |
|--------|------|
| BabySitter (3 étapes + récap) | Réservation d'une garde d'enfants |
| Guide | Réservation d'un guide touristique |
| Transfert | Réservation d'un chauffeur |
| Restaurant | Réservation resto + panier |
| Activité | Réservation d'activités |
| History (Mes Demandes) | Liste + suivi de toutes les réservations |
| Payment | Formulaire carte bancaire |

**Tables DB utilisées :**

| Table | Module |
|-------|--------|
| `request` | Babysitter |
| `guide` | Guide touristique |
| `transfert` | Transfert |
| `reservation_resto` | Restaurant |
| `reservations` | Activités |

---

## 2. Logique History / Mes Demandes

### Flux de données
1. Ouverture de l'écran → lecture du **cache AsyncStorage** (affichage immédiat)
2. Appel API `AllReservationsHistory` → mise à jour en arrière-plan
3. Refresh automatique toutes les **60 secondes**
4. Toast si le `statut_prestataire` change sur une réservation existante

### Statuts
`en_attente` → `accepte` → `en_cours` → `termine` / `annule`

### 3 timers parallèles (useEffect)
| Timer | Fréquence | Rôle |
|-------|-----------|------|
| Alerte début de mission | 30s | Notifie quand l'heure de départ est atteinte |
| Rappel J-1 | 30s | Alerte 24h avant une mission `accepte` |
| Chrono babysitter | 60s | Propose terminer ou prolonger (+30 min) |

---

## 3. Corrections effectuées

### 3.1 Fonction `CancelReservation` manquante

**Problème :** La fonction était appelée dans `History/Details.tsx` mais n'existait pas dans `src/api/settings.js`.

**Correction :** Ajout de la fonction et de son export dans `settings.js` :

```js
const CancelReservation = (token, type, id) =>
  axios.post(
    `${BASE_URL}/History/api.php?action=CancelReservation`,
    { id, type },
    { headers: { Authorization: `Bearer ${token}` } }
  ).then(r => r.data);
```

---

### 3.2 Backend PHP — 3 nouvelles actions API

**Fichier :** `/History/api.php` sur le serveur FileZilla

**Actions ajoutées :**

#### `UpdateStatusBooking`
Met à jour le `statut_prestataire` d'une réservation dans la bonne table selon le type.

```
POST /History/api.php?action=UpdateStatusBooking
Body: { id, type, statut_prestataire }
```

#### `ExtendBabysittingMission`
Prolonge une mission babysitter de 30 minutes avec mise à jour du prix.

```
POST /History/api.php?action=ExtendBabysittingMission
Body: { id, temps_ajoute, totalprice, cout_ajoute }
```

#### `CancelReservation`
Annule une réservation (statut → `annule`).

```
POST /History/api.php?action=CancelReservation
Body: { id, type }
```

**Mapping table selon le type :**

| Type reçu | Table DB |
|-----------|----------|
| babysitter | `request` |
| guide | `guide` |
| resto | `reservation_resto` |
| activite / activité | `reservations` |
| transfert | `transfert` |

---

### 3.3 Logique babysitter — Chrono + Extension + Sauvegarde backend

**Problèmes corrigés :**

| # | Bug | Correction |
|---|-----|------------|
| 1 | Pas de sauvegarde en DB lors de "Oui, terminer" | Appel `UpdateStatusBooking` avant mise à jour locale |
| 2 | Pas de sauvegarde en DB lors de "+30 min" | Appel `ExtendBabysittingMission` avant mise à jour locale |
| 3 | `temps_ajoute` initialisé à 0 (perd les extensions après refresh) | Initialisé depuis `item.temps_ajoute` (valeur DB) |
| 4 | `nextAlertAt` dans le `try` → re-alerte immédiate si API échoue | Mise à jour **optimiste avant** l'appel API |
| 5 | Race condition : verrou libéré avant le re-render | `nextAlertAt: Infinity` avant l'API, `+5min` si erreur |
| 6 | Toast affiché si `statut_prestataire` est null/undefined | Vérification que les deux valeurs sont truthy |
| 7 | Intervalle de 10 secondes (trop agressif → spam) | Passé à **60 secondes** |

**Règles métier appliquées :**
- "Oui, terminer" → `statut_prestataire = 'termine'`
- "Non, +30 min" → `temps_ajoute += 0.5`, `totalprice += THBS/2`
- Si l'API échoue sur "terminer" → retry dans 5 minutes
- Le verrou d'alerte (`alertesActivesRef`) ne bloque plus définitivement en cas d'erreur

---

### 3.4 Suppression du bandeau rouge "LANCER LE TEST (MOCK SECURISÉ)"

**Problème :** Un bandeau rouge avec ce texte s'affichait sur le visuel de la carte bancaire dans les écrans de paiement.

**Cause :** L'image `card-front.png` embarquée dans les deux packages de carte bancaire contenait ce bandeau gravé dans le PNG.

**Packages concernés :**
- `react-native-credit-card-input-view` → utilisé dans `History/Details.tsx`
- `react-native-credit-card-input-plus` → utilisé dans `Payment/index.tsx`, `Panier.tsx`

**Correction :** Patch des deux packages via `patch-package` :
- `<ImageBackground source={card-front.png}>` remplacé par `<View style={{ backgroundColor: '#1a1f71' }}>` (face)
- `<ImageBackground source={card-back.png}>` remplacé par `<View style={{ backgroundColor: '#2c2c5e' }}>` (dos)
- Import `ImageBackground` supprimé des deux fichiers

**Patches créés (persistants après `npm install`) :**
```
patches/react-native-credit-card-input-view+0.0.7.patch
patches/react-native-credit-card-input-plus+0.4.8.patch
```

**Pour appliquer après un `npm install` :**
```bash
npx patch-package
```
(automatique si `"postinstall": "patch-package"` est dans `package.json`)

---

## 4. Commandes utiles

```bash
# Lancer Metro avec cache vidé (après modification de node_modules)
npm start -- --reset-cache

# Tuer Metro s'il tourne déjà (PowerShell)
Get-NetTCPConnection -LocalPort 8081 -State Listen | 
  Select-Object -ExpandProperty OwningProcess | 
  ForEach-Object { Stop-Process -Id $_ -Force }

# Lancer l'app Android
npx react-native run-android

# Ré-appliquer tous les patches
npx patch-package
```

---

## 5. Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/api/settings.js` | Ajout `CancelReservation` |
| `src/pages/History/index.tsx` | Fix chrono babysitter (alertes, backend, spam) |
| `/History/api.php` (serveur) | Ajout 3 actions API PHP |
| `node_modules/react-native-credit-card-input-view/src/CardView/CardView.js` | Suppression ImageBackground |
| `node_modules/react-native-credit-card-input-plus/src/CardView.js` | Suppression ImageBackground |
| `patches/react-native-credit-card-input-view+0.0.7.patch` | Patch généré |
| `patches/react-native-credit-card-input-plus+0.4.8.patch` | Patch généré |
