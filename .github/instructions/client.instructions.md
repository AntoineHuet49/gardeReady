---
applyTo: "Sources/client/**/*"
---

# Instructions Client Frontend - GardeReady

**Chemin**: `Sources/client/**`

## Architecture Frontend

Application React SPA (Single Page Application) avec TypeScript, utilisant Vite comme build tool et suivant une architecture modulaire.

```
Pages (vues principales)
    ↓
Components (réutilisables)
    ↓
Hooks (logique métier)
    ↓
API (communication backend)
```

## Structure des dossiers

```
Sources/client/src/
├── main.tsx                    # Point d'entrée React
├── App.tsx                     # Composant racine
├── App/
│   ├── Provider/              # Contextes React (User, Admin, Toast)
│   ├── Routes/                # Configuration du routage
│   └── utils/                 # Utilitaires (API, cookies, notifications)
├── Pages/                     # Vues principales de l'application
│   ├── Home/                  # Page d'accueil et authentification
│   ├── Vehicules/             # Liste des véhicules
│   ├── Verifications/         # Page de vérification détaillée
│   └── Admin/                 # Panneau d'administration
├── Components/                # Composants réutilisables
│   ├── Alert/
│   ├── Button/
│   ├── Card/
│   ├── Collapse/
│   ├── Input/
│   ├── Loader/
│   ├── Modal/
│   ├── Section/
│   └── Tabs/
├── hooks/                     # Hooks React personnalisés
├── Types/                     # Définitions TypeScript
└── assets/                    # Ressources statiques (CSS, icônes)
```

## Stack technique détaillée

### Core
- **React 18**: Bibliothèque UI
- **TypeScript**: Typage statique
- **Vite**: Build tool ultra-rapide

### Routing
- **React Router 7**: Navigation SPA
- Routes privées avec authentification

### State Management
- **TanStack Query (React Query)**: Cache et synchronisation des données serveur
- **React Context**: État global (User, Admin)

### Styling
- **Tailwind CSS 4**: Framework CSS utility-first
- **DaisyUI 5**: Composants UI basés sur Tailwind
- **SASS**: Préprocesseur pour animations et transitions personnalisées

### Forms & Validation
- **React Hook Form**: Gestion performante des formulaires
- Validation côté client

### Notifications
- **React Toastify**: Système de notifications toast

## Configuration du routage

**Fichier**: `App/Routes/routes.tsx`

```typescript
const routes = [
    {
        path: "/",              // Page d'accueil (publique)
        element: <Home />
    },
    {
        path: "/vehicules",     // Liste véhicules (protégée)
        element: <PrivateRoute><Vehicules /></PrivateRoute>
    },
    {
        path: "/details",       // Vérifications (protégée)
        element: <PrivateRoute><Verifications /></PrivateRoute>
    },
    {
        path: "/admin",         // Admin panel (protégée)
        element: <PrivateRoute><Admin /></PrivateRoute>
    }
];
```

### Routes privées

Le composant `PrivateRoute` vérifie l'authentification:
- Lit le cookie JWT
- Redirige vers `/` si non authentifié
- Affiche la page si authentifié

## Gestion de l'authentification

### UserProvider Context

**Fichier**: `App/Provider/UserProvider/`

```typescript
interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}
```

### Flux d'authentification

1. L'utilisateur se connecte sur la page Home
2. Le backend retourne un JWT dans un cookie
3. Le `UserProvider` lit le cookie et décode le JWT
4. L'état `user` est mis à jour
5. Les routes privées deviennent accessibles

### Lecture du cookie

**Fichier**: `App/utils/getCookie.ts`

```typescript
export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}
```

## Communication avec l'API

### Configuration Axios

**Fichier**: `App/utils/Api/`

```typescript
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,  // Important pour les cookies
    headers: {
        "Content-Type": "application/json"
    }
});
```

### Structure des appels API

Créer un fichier par ressource dans `App/utils/Api/`:

```typescript
// Exemple: vehiculesApi.ts
export const vehiculesApi = {
    getAll: () => api.get("/vehicules"),
    
    getById: (id: number) => api.get(`/vehicules/${id}`),
    
    create: (data: CreateVehiculeDto) => 
        api.post("/vehicules", data),
    
    update: (id: number, data: UpdateVehiculeDto) => 
        api.put(`/vehicules/${id}`, data),
    
    delete: (id: number) => 
        api.delete(`/vehicules/${id}`)
};
```

## TanStack Query (React Query)

### Configuration

**Fichier**: `App.tsx`

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,  // 5 minutes
            retry: 1
        }
    }
});

<QueryClientProvider client={queryClient}>
    <App />
</QueryClientProvider>
```

### Hooks personnalisés pour les mutations

**Fichier**: `hooks/useElementMutations.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { elementsApi } from "../App/utils/Api";

export function useElementMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: elementsApi.create,
        onSuccess: () => {
            // Invalider le cache pour recharger les données
            queryClient.invalidateQueries({ queryKey: ["elements"] });
            notify.success("Élément créé avec succès");
        },
        onError: (error) => {
            notify.error("Erreur lors de la création");
            console.error(error);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: elementsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elements"] });
            notify.success("Élément supprimé");
        }
    });

    return { createMutation, deleteMutation };
}
```

### Utilisation dans les composants

```typescript
function MonComposant() {
    // Récupérer des données
    const { data, isLoading, error } = useQuery({
        queryKey: ["vehicules"],
        queryFn: vehiculesApi.getAll
    });

    // Mutations
    const { createMutation } = useElementMutations();

    const handleCreate = (formData) => {
        createMutation.mutate(formData);
    };

    if (isLoading) return <Loader />;
    if (error) return <Alert type="error" message={error.message} />;

    return <div>{/* Affichage */}</div>;
}
```

## Système de notifications

**Fichier**: `App/utils/notify.ts`

```typescript
import { toast } from "react-toastify";

export const notify = {
    success: (message: string) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 3000
        });
    },
    
    error: (message: string) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 5000
        });
    },
    
    warning: (message: string) => {
        toast.warning(message, {
            position: "top-right",
            autoClose: 4000
        });
    },
    
    info: (message: string) => {
        toast.info(message);
    }
};
```

### Configuration dans App.tsx

```typescript
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

<ToastContainer 
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    closeOnClick
    pauseOnHover
/>
```

## Composants réutilisables

### Convention de structure

```typescript
// Components/MonComposant/MonComposant.tsx
import { FC } from "react";

interface MonComposantProps {
    title: string;
    onAction?: () => void;
    variant?: "primary" | "secondary";
}

export const MonComposant: FC<MonComposantProps> = ({ 
    title, 
    onAction, 
    variant = "primary" 
}) => {
    return (
        <div className={`composant-${variant}`}>
            <h2>{title}</h2>
            {onAction && (
                <button onClick={onAction}>Action</button>
            )}
        </div>
    );
};
```

### Composants existants

#### Button
```typescript
<Button 
    variant="primary" 
    onClick={handleClick}
    disabled={isLoading}
>
    Cliquer ici
</Button>
```

#### Modal
```typescript
<Modal 
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title="Mon titre"
>
    <div>Contenu du modal</div>
</Modal>
```

#### Card
```typescript
<Card title="Véhicule" subtitle="VSAV">
    <p>Contenu de la carte</p>
</Card>
```

#### Alert
```typescript
<Alert 
    type="error" 
    message="Une erreur est survenue"
    onClose={() => setShowAlert(false)}
/>
```

#### Collapse
```typescript
<Collapse title="Afficher plus" isOpen={isOpen}>
    <div>Contenu repliable</div>
</Collapse>
```

## Styling avec Tailwind CSS

### Classes utilitaires courantes

```tsx
// Layout
<div className="flex flex-col gap-4 p-4">

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">

// Couleurs (DaisyUI)
<button className="btn btn-primary">
<button className="btn btn-secondary">
<button className="btn btn-error">

// Cartes
<div className="card bg-base-100 shadow-xl">
```

### Configuration Tailwind

**Fichier**: `vite.config.ts`

```typescript
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ]
});
```

## Types TypeScript

### Définir les types côté client

**Dossier**: `Types/`

```typescript
// Types/Vehicule.ts
export interface Vehicule {
    id: number;
    name: string;
    sections?: Section[];
}

// Types/Section.ts
export interface Section {
    id: number;
    name: string;
    vehicule_id?: number;
    parent_section_id?: number;
    subSections?: Section[];
    elements?: Element[];
}

// Types/Element.ts
export interface Element {
    id: number;
    name: string;
    section_id: number;
}
```

### DTOs pour les formulaires

```typescript
// Types/formValues.ts
export interface CreateVehiculeFormValues {
    name: string;
}

export interface LoginFormValues {
    email: string;
    password: string;
}
```

## React Hook Form

### Exemple d'utilisation

```typescript
import { useForm } from "react-hook-form";

function MonFormulaire() {
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        reset 
    } = useForm<CreateVehiculeFormValues>();

    const onSubmit = (data: CreateVehiculeFormValues) => {
        createMutation.mutate(data, {
            onSuccess: () => reset()
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input
                {...register("name", { 
                    required: "Le nom est requis",
                    minLength: { value: 3, message: "3 caractères min" }
                })}
                className="input input-bordered"
            />
            {errors.name && (
                <span className="text-error">{errors.name.message}</span>
            )}
            
            <button type="submit" className="btn btn-primary">
                Créer
            </button>
        </form>
    );
}
```

## Variables d'environnement

**Fichier**: `.env`

```
VITE_API_URL=http://localhost:3000
```

**Accès dans le code**:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

⚠️ Les variables doivent commencer par `VITE_` pour être exposées au client.

## Build et déploiement

### Scripts npm

```json
{
  "dev": "npx vite --host",        // Dev server avec hot-reload
  "build": "tsc -b && vite build", // Build production
  "preview": "vite preview"        // Preview du build
}
```

### Output du build

Le build génère un dossier `dist/` contenant:
- `index.html`
- `assets/` (JS, CSS bundlés et minifiés)

Ce dossier est copié dans `Sources/api/public/` pour être servi par Express.

## Structure des Pages

### Page Home (Authentification)

- Formulaire de connexion
- Gestion des erreurs
- Redirection après login réussi

### Page Vehicules

- Liste des véhicules disponibles
- Navigation vers la page de vérifications

### Page Verifications

- Affichage hiérarchique des sections
- Checklist des éléments à vérifier
- Génération de rapport PDF

### Page Admin

- Gestion des utilisateurs
- Gestion des gardes
- CRUD sur les véhicules/sections/éléments
- Accessible uniquement aux admins

## Bonnes pratiques spécifiques

1. **Toujours** typer les props des composants avec TypeScript
2. **Toujours** utiliser React Query pour les appels API
3. **Toujours** gérer les états de chargement (`isLoading`) et erreurs
4. **Toujours** invalider le cache après une mutation réussie
5. **Utiliser** les composants réutilisables plutôt que dupliquer le code
6. **Préférer** les fonctions fléchées pour les composants fonctionnels
7. **Destructurer** les props pour plus de lisibilité
8. **Exporter** les composants en tant que `export const` ou `export default`
9. **Grouper** les imports par catégorie (React, libraries, local)
10. **Utiliser** les classes Tailwind plutôt que du CSS custom

## Gestion des erreurs

### Pattern try/catch dans les appels API

```typescript
const { mutate } = useMutation({
    mutationFn: api.create,
    onSuccess: () => {
        notify.success("Succès");
    },
    onError: (error: any) => {
        const message = error.response?.data?.message || "Erreur inconnue";
        notify.error(message);
        console.error("Erreur détaillée:", error);
    }
});
```

### Affichage conditionnel des erreurs

```typescript
if (error) {
    return (
        <Alert 
            type="error" 
            message="Impossible de charger les données" 
        />
    );
}
```

## Animations et transitions

**Fichier**: `assets/css/transition.css`

Utiliser pour les transitions personnalisées non couvertes par Tailwind:

```scss
.fade-enter {
    opacity: 0;
}
.fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in;
}
```

## Accessibilité

- Utiliser les attributs `aria-*` pour les composants interactifs
- Assurer la navigation au clavier
- Tester avec un lecteur d'écran
- Respecter les contrastes de couleurs (DaisyUI le fait automatiquement)

## Performance

### Optimisations React Query

- `staleTime`: Durée avant considération des données comme obsolètes
- `cacheTime`: Durée de conservation en cache
- `refetchOnWindowFocus`: Recharger au retour sur l'onglet

### Code splitting

Vite gère automatiquement le code splitting. Pour forcer:

```typescript
const MaPage = lazy(() => import("./Pages/MaPage"));
```

## Debugging

### React DevTools

Installer l'extension React DevTools pour inspecter:
- L'arbre des composants
- Les props et state
- Les contexts

### TanStack Query DevTools

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<ReactQueryDevtools initialIsOpen={false} />
```

Affiche l'état du cache et des requêtes en cours.

## Tests

Bien que non implémentés actuellement, voici la structure recommandée:

```
src/
├── Components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
```

Framework recommandé: Vitest + React Testing Library

## Gestion des Gardes et Utilisateurs

### Architecture de la page GardesUsers

**Dossier**: `Pages/Admin/GardesUsers/`

La page affiche les utilisateurs regroupés par garde dans des cards disposées en grille responsive.

#### Structure des fichiers

```
GardesUsers/
├── index.ts                          # Export du container
├── GardesUsers.container.tsx         # Logique data fetching
├── GardesUsers.tsx                   # Composant principal
├── GardeCard.tsx                     # Card individuelle pour une garde
└── AddGardeModal/
    └── AddGardeModal.tsx            # Modal d'ajout de garde
```

### Container (GardesUsers.container.tsx)

```typescript
import { useGardes } from "../../../hooks/useGardes";
import { getAllUsers } from "../../../App/utils/Api/Users";

function GardesUsersContainer() {
    const { gardes, isLoading: isLoadingGardes } = useGardes();
    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsers(),
    });

    // Regrouper les utilisateurs par garde_id
    const usersByGarde = usersData?.data?.reduce((acc, user) => {
        if (!acc[user.garde_id]) acc[user.garde_id] = [];
        acc[user.garde_id].push(user);
        return acc;
    }, {});

    // Trier les gardes par numéro
    const sortedGardes = gardes ? [...gardes].sort((a, b) => a.numero - b.numero) : [];

    return <GardesUsers gardes={sortedGardes} usersByGarde={usersByGarde} />;
}
```

**Points importants** :
- Récupère les gardes ET les utilisateurs en parallèle
- Regroupe les users par `garde_id`
- Trie les gardes par `numero` (croissant)
- Gère les états de chargement combinés

### Composant principal (GardesUsers.tsx)

```typescript
function GardesUsers({ gardes, usersByGarde, allUsers }) {
    const unassignedUsers = allUsers.filter(user => !user.garde_id);

    return (
        <>
            {/* Boutons d'action */}
            <div className="flex justify-end gap-2 mb-4">
                <AddGardeModal buttonText="+ Ajouter une garde" />
                <AddUserModal buttonText="+ Ajouter un utilisateur" />
            </div>

            {/* Grille responsive de cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gardes.map((garde) => (
                    <GardeCard
                        key={garde.id}
                        garde={garde}
                        users={usersByGarde[garde.id] || []}
                    />
                ))}
            </div>

            {/* Card pour utilisateurs non assignés */}
            {unassignedUsers.length > 0 && (
                <div className="mt-4">
                    <div className="card bg-base-100 border border-base-content/10">
                        <div className="card-body">
                            <h3 className="card-title text-warning">
                                ⚠️ Utilisateurs non assignés à une garde
                            </h3>
                            <ul>
                                {unassignedUsers.map(user => (
                                    <li key={user.id}>• {user.firstname} {user.lastname}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
```

**Layout responsive** :
- Mobile (< 768px) : 1 colonne
- Tablette (768-1024px) : 2 colonnes
- Desktop (> 1024px) : 3 colonnes

### Card de garde (GardeCard.tsx)

```typescript
import Button from "../../../Components/Button/button";

function GardeCard({ garde, users }) {
    const { isSuperAdmin } = useUser();
    const { deleteGarde } = useGardeMutations();

    // Filtrer les superAdmin si non superAdmin
    const filteredUsers = users.filter(user => {
        if (isSuperAdmin) return true;
        return user.role !== "superAdmin";
    });

    const responsable = garde.responsableUser;

    const handleDelete = () => {
        if (window.confirm(`Supprimer la Garde ${garde.numero} ?`)) {
            deleteGarde.mutate(garde.id);
        }
    };

    return (
        <div 
            className="card bg-base-100 border shadow-sm"
            style={{ 
                borderLeftWidth: '4px', 
                borderLeftColor: garde.color  // Bordure colorée
            }}
        >
            <div className="card-body">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="card-title text-2xl">
                        Garde {garde.numero}  {/* Affichage du numéro */}
                    </h2>
                    <Button
                        text={deleteGarde.isPending ? "..." : "✕"}
                        onClick={handleDelete}
                        className="btn-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                        title="Supprimer cette garde"
                        disabled={deleteGarde.isPending}
                    />
                </div>

                {/* Responsable */}
                {responsable ? (
                    <div className="mt-2">
                        <span className="font-semibold">Responsable : </span>
                        <span>{responsable.firstname} {responsable.lastname}</span>
                    </div>
                ) : (
                    <div className="mt-2 text-sm text-warning italic">
                        Aucun responsable assigné
                    </div>
                )}

                {/* Membres */}
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">
                        Membres ({filteredUsers.length}) :
                    </h3>
                    {filteredUsers.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredUsers.map((user) => (
                                <li key={user.id} className="text-sm">
                                    • {user.firstname} {user.lastname}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-base-content/60 italic">
                            Aucun membre
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
```

**Caractéristiques de la card** :
- Bordure gauche colorée (4px, couleur de la garde)
- Titre avec numéro de garde ("Garde 1", "Garde 2", etc.)
- Affichage du responsable (ou message si absent)
- Liste simple des membres (prénom nom)
- Bouton de suppression style AdminVehicules
- Filtrage des superAdmin pour les admins normaux

### Hook useGardeMutations

```typescript
// hooks/useGardeMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGarde, deleteGarde } from "../App/utils/Api/Gardes";
import { toast } from "react-toastify";

export const useGardeMutations = () => {
    const queryClient = useQueryClient();

    const createGardeMutation = useMutation({
        mutationFn: createGarde,
        onSuccess: () => {
            toast.success("Garde créée avec succès !");
            queryClient.invalidateQueries({ queryKey: ["gardes"] });
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Erreur";
            toast.error(message);
        },
    });

    const deleteGardeMutation = useMutation({
        mutationFn: deleteGarde,
        onSuccess: () => {
            toast.success("Garde supprimée avec succès !");
            queryClient.invalidateQueries({ queryKey: ["gardes"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });  // ⚠️ Important
        },
        onError: (error) => {
            const message = error.response?.data?.message || "Erreur";
            toast.error(message);
        },
    });

    return { createGarde: createGardeMutation, deleteGarde: deleteGardeMutation };
};
```

**⚠️ Important** : Invalider à la fois `gardes` ET `users` lors de la suppression car les utilisateurs sont affectés.

### Modal d'ajout de garde (AddGardeModal.tsx)

```typescript
type GardeFormValues = {
    numero: number;
    color: string;
};

function AddGardeModal({ buttonText }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<GardeFormValues>();
    const { createGarde } = useGardeMutations();

    const handleSubmitForm = (data: GardeFormValues) => {
        createGarde.mutate(
            { numero: Number(data.numero), color: data.color },
            { onSuccess: () => {
                reset();
                document.getElementById(modalId)?.close();
            }}
        );
    };

    return (
        <>
            <Button text={buttonText} className="btn-primary" onClick={openModal} />
            <dialog id={modalId} className="modal">
                <div className="modal-box">
                    <h3>Ajouter une garde</h3>
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <TextInput
                            name="numero"
                            placeholder="Numéro de la garde"
                            register={register}
                            errors={errors}
                            options={{
                                required: "Numéro requis",
                                valueAsNumber: true,
                                validate: {
                                    positive: (v) => Number(v) > 0 || "Doit être positif",
                                    isInteger: (v) => Number.isInteger(Number(v)) || "Doit être entier"
                                }
                            }}
                        />
                        <TextInput
                            name="color"
                            placeholder="Couleur (ex: Rouge, Bleu...)"
                            register={register}
                            errors={errors}
                            options={{ required: "Couleur requise" }}
                        />
                        <div className="text-sm text-base-content/60 italic">
                            Note : Le responsable pourra être assigné ultérieurement
                        </div>
                        <Button type="submit" text="Ajouter" disabled={createGarde.isPending} />
                    </form>
                </div>
            </dialog>
        </>
    );
}
```

**Points clés** :
- Pas de champ responsable (optionnel lors de la création)
- Validation du numéro (positif, entier)
- Message informatif sur l'assignation ultérieure du responsable

### API Gardes

```typescript
// App/utils/Api/Gardes.ts
export function getAllGardes() {
    return instance.get<Garde[]>(apiUrl.gardes).then(res => res.data);
}

export function createGarde(data: { numero: number; color: string; responsable?: number }) {
    return instance.post<Garde>(apiUrl.gardes, data).then(res => res.data);
}

export function deleteGarde(id: number) {
    return instance.delete(`${apiUrl.gardes}/${id}`).then(res => res.data);
}
```

### Type Garde

```typescript
// Types/Garde.ts
export type Garde = {
    id: number;
    numero: number;              // Numéro de la garde
    color: string;               // Couleur d'identification
    responsable?: number;        // ID du responsable (optionnel)
    responsableUser?: {          // Relation incluse par Sequelize
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
};
```

### Modification de AddUserModal

Le modal d'ajout d'utilisateur a été adapté pour afficher "Garde 1", "Garde 2" au lieu des anciens noms :

```typescript
useEffect(() => {
    if (gardes) {
        const sortedGardes = [...gardes].sort((a, b) => a.numero - b.numero);
        setGardesOptions(
            sortedGardes.reduce((acc, garde) => {
                acc[`Garde ${garde.numero}`] = garde.id;  // ⚠️ Affichage du numéro
                return acc;
            }, {})
        );
    }
}, [gardes]);
```

### Intégration dans Admin.tsx

```typescript
// Pages/Admin/constants.ts
export enum AdminTabs {
    GARDES = "Gardes",          // ⚠️ Tab unique (fusion Users + Gardes)
    VEHICULES = "Véhicules",
    VERIFEU = "Veri'feu",
}

// Pages/Admin/Admin.tsx
import { GardesUsers } from "./GardesUsers";

{tabToDisplay === AdminTabs.GARDES && <GardesUsers />}
```

**Changement** : Les anciens tabs "Utilisateurs" et "Gardes" ont été fusionnés en un seul tab "Gardes" affichant le composant `GardesUsers`.

### Bonnes pratiques spécifiques

1. **Toujours** trier les gardes par `numero` (ASC)
2. **Toujours** afficher "Garde X" et non un nom textuel
3. **Toujours** invalider `users` ET `gardes` lors des mutations
4. **Filtrer** les superAdmin de l'affichage pour les admins normaux
5. **Gérer** les utilisateurs non assignés (garde_id null)
6. **Utiliser** la bordure colorée à gauche des cards (4px)
7. **Valider** que le numéro est unique côté backend
8. **Permettre** la création de garde sans responsable (contrainte circulaire)
