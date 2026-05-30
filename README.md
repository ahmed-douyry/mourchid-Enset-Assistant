<div align="center">

# Mourchid — Assistant académique ENSET Mohammedia

### Assistant **local-first** & **open-source** pour la **recherche d'informations académiques** de l'**ENSET Mohammedia** (Université Hassan II de Casablanca)

RAG agentic en français · Orchestration **LangGraph** · LLM local via **Ollama** · Vecteurs **Qdrant** · UI **React + Tailwind**

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-RAG%20agentic-1C3D5A?logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Qdrant](https://img.shields.io/badge/Qdrant-vectors-DC382D?logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Ollama](https://img.shields.io/badge/Ollama-local%20LLM-000000?logo=ollama&logoColor=white)](https://ollama.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![uv](https://img.shields.io/badge/uv-managed-DE5FE9)](https://docs.astral.sh/uv/)
[![License](https://img.shields.io/badge/license-MIT-green)](#licence)

</div>

---

## Sommaire

- [À propos](#à-propos)
- [Avertissement juridique](#avertissement-juridique)
- [Captures d'écran](#captures-décran)
- [Fonctionnalités clés](#fonctionnalités-clés)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Configuration](#configuration)
- [Docker Compose](#docker-compose)
- [API REST](#api-rest)
- [Modèles recommandés](#modèles-recommandés)
- [Tests](#tests)
- [Limites & éthique](#limites--éthique)
- [Dépannage](#dépannage)
- [Licence](#licence)

---

## À propos

**Mourchid** est une plateforme **local-first** et **open-source** pour rechercher, comprendre et structurer des informations à partir d'un **corpus documentaire** orienté **vie académique de l'ENSET Mohammedia** (filières, inscription, bourses, concours d'accès, stages/PFE, vie étudiante — exemples pédagogiques fournis). L'école est rattachée à l'**Université Hassan II de Casablanca (UH2C)**.

Le projet s'inscrit dans une logique **RAG agentic** :

- Orchestration **LangGraph** (graphe d'agents typé, traces persistées).
- Embeddings **SentenceTransformers** multilingues.
- Base vectorielle **Qdrant** (ou **Chroma**).
- LLM local via **Ollama** (option **llama.cpp**).
- Interface **React + Vite + Tailwind** (composants type shadcn).
- Exposition d'outils via un **serveur MCP** (stdio).

Le **backend Python** est géré avec **[uv](https://docs.astral.sh/uv/)** (`pyproject.toml`, environnement `.venv` géré par uv, commandes `uv sync`, `uv run`).

---

## Avertissement juridique

> Ce dépôt contient des textes **démo / simplifiés** clairement étiquetés. Le logiciel :
>
> - **ne fournit pas une information administrative officielle**,
> - **ne remplace pas** le service de scolarité ni les communications officielles de l'ENSET / UH2C,
> - **ne garantit pas** l'exhaustivité ni l'exactitude du corpus.
>
> En l'absence de sources fiables dans le corpus, le workflow renvoie un message d'insuffisance documentaire.

---

## Captures d'écran

Le dossier [`screens/`](screens/) contient des aperçus de l'interface **Mourchid** (frontend React). Les images sont servies via le CDN [jsDelivr](https://www.jsdelivr.com/) pour un affichage fiable sur GitHub.

> **Remarque** : remplacez `ahmed-douyry/enset-assistant@main` par le slug réel de votre dépôt GitHub (`<utilisateur>/<repo>@<branche>`) une fois le projet poussé.

### Assistant académique & dictée vocale

| ![Assistant — chat RAG en streaming](https://cdn.jsdelivr.net/gh/ahmed-douyry/enset-assistant@main/screens/assistant.png) | ![Dictée vocale — transcription Whisper](https://cdn.jsdelivr.net/gh/ahmed-douyry/enset-assistant@main/screens/transcription.png) |
| :---: | :---: |
| **Assistant** — Chat RAG en streaming SSE, suggestions de questions, sélecteur de niveau (Simple / Détaillé / Technique / Procédure) et panneau « Analyse & sources ». | **Dictée vocale** — Enregistrement micro, **barre de fréquence** en temps réel et **transcription Whisper** côté serveur insérée dans la zone de saisie. |

### Quiz concours & Documents

| ![Quiz concours généré par l'IA](https://cdn.jsdelivr.net/gh/ahmed-douyry/enset-assistant@main/screens/QuizCncr.png) | ![Documents — import et indexation](https://cdn.jsdelivr.net/gh/ahmed-douyry/enset-assistant@main/screens/document.png) |
| :---: | :---: |
| **Quiz concours** — Quiz **généré par l'IA** à chaque essai, choix de la filière et de la difficulté, correction commentée et score final. | **Documents** — Upload PDF / Markdown / TXT, « Réindexer tout » et statut d'indexation par fichier. |

### Workflow, Tableau de bord & Résumé

| ![Workflow — trace multi-agent](https://cdn.jsdelivr.net/gh/ahmed-douyry/enset-assistant@main/screens/workFlow.png) | ![Tableau de bord](https://cdn.jsdelivr.net/gh/ahmed-douyry/enset-assistant@main/screens/dashboard.png) | ![Résumé structuré](https://cdn.jsdelivr.net/gh/ahmed-douyry/enset-assistant@main/screens/resumedocsEnset.png) |
| :---: | :---: | :---: |
| **Workflow** — Trace d'exécution multi-agent par `conversationId` (pipeline + aperçu JSON de l'état). | **Tableau de bord** — Indicateurs d'usage, modèles utilisés et historique des questions. | **Résumé docs** — Synthèse structurée (points clés, obligations, risques) via `POST /api/summarize`. |

---

## Fonctionnalités clés

- **Chat RAG agentic** avec classification de requête, retrieval Qdrant + rerank optionnel, agents spécialisés (procédure, comparaison, résumé), citations et vérification anti-hallucination.
- **Streaming** des étapes du graphe LangGraph côté UI (transparence sur ce que fait l'agent).
- **Dictée vocale** : enregistrement micro avec **barre de fréquence** en temps réel, puis **transcription Whisper** locale (`POST /api/transcribe`) insérée dans la zone de saisie.
- **Quiz concours généré par l'IA** : quiz QCM par filière et par difficulté, généré à chaque essai par le LLM (`POST /api/quiz`), avec correction commentée et score.
- **Gestion de corpus** : upload PDF / Markdown / texte, indexation et réindexation.
- **Mode Résumé** structuré (`POST /api/summarize`).
- **Traces persistées** par conversation (`workflow/trace/{conversationId}`) pour audit / debug.
- **Serveur MCP (stdio)** exposant les outils du backend (recherche corpus, PDF, checklist, etc.).
- **Local-first** : aucun appel cloud requis (Ollama + Qdrant + embeddings + Whisper locaux).

---

## Architecture

```text
legaldoc-assistant/
├── backend/                 # FastAPI + LangGraph + RAG + MCP (uv)
│   ├── app/
│   │   ├── main.py
│   │   ├── api/             # Routes REST /api/*
│   │   ├── agents/          # Agents spécialisés
│   │   ├── graph/           # Graphe LangGraph + état + nœuds
│   │   ├── rag/             # Embeddings, Qdrant/Chroma, retriever, indexer…
│   │   ├── llm/             # Ollama / llama.cpp + prompts FR
│   │   ├── mcp/             # Outils + serveur FastMCP (stdio)
│   │   ├── services/        # Chat, documents, workflow, stats…
│   │   └── data/samples/    # Données d'exemple (fictives)
│   ├── pyproject.toml       # Dépendances + groupes (dev)
│   ├── uv.lock              # (optionnel) après `uv lock` — reproductibilité
│   ├── Dockerfile           # image basée sur `uv sync`
│   └── langgraph.json       # `uv run langgraph dev`
├── frontend/                # Vite + React + TS + Tailwind
├── docs/videos/             # GIFs + MP4 optimisés pour le README
├── scripts/                 # Scripts utilitaires (optimisation vidéos…)
├── screens/                 # Captures de l'UI et de LangGraph Studio
└── docker-compose.yml
```

**Flux principal (chat)** :

1. `POST /api/chat` → `chat_service` invoque le graphe LangGraph exporté (`app/graph/legal_workflow.py:graph`).
2. Nœuds : classification → récupération → (rerank intégré au retriever) → agent spécialisé → citations → vérification → réponse finale.
3. La trace est persistée dans `app/data/processed/traces/{conversationId}.json`.

---

## Prérequis

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gestionnaire Python (env + dépendances + `uv run`).
- **Python 3.11+** (uv peut en installer un par projet ; voir `backend/.python-version`).
- **Node 20+** (idéalement 22) pour le frontend.
- **Docker** pour Qdrant via Compose (optionnel mais recommandé).
- **Ollama** installé localement (recommandé) ou service Docker profil `ollama`.
- **FFmpeg** — requis pour la **transcription vocale** (décodage de l'audio du micro côté serveur).

Installer uv :

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Démarrage rapide

> **Cohabitation avec un autre projet** : ce dépôt partage le même Qdrant (collection dédiée `enset_academic`) et le même Ollama. Pour le faire tourner **en parallèle** d'un autre assistant, on utilise des ports distincts : **backend `8001`**, **frontend `5174`** (le frontend lit `VITE_API_BASE_URL=http://localhost:8001` dans `frontend/.env`).
>
> ```bash
> # backend
> cd backend && uv run uvicorn app.main:app --reload --port 8001
> # frontend (autre terminal)
> cd frontend && npm run dev -- --port 5174
> ```

### 1. Qdrant (base vectorielle)

```bash
docker run -p 6333:6333 qdrant/qdrant
# ou
docker compose up qdrant
```

### 2. Backend (uv)

```bash
cd backend
uv sync --group dev                       # runtime + outils dev (pytest, langgraph-cli…)
cp ../.env.example .env                   # adapter les variables
uv run python -m app.scripts.seed_index   # indexer les échantillons
uv run uvicorn app.main:app --reload --port 8000
```

Builds reproductibles (CI / Docker) :

```bash
uv lock
uv sync --frozen --group dev
```

Commandes utiles (toutes depuis `backend/`) :

| Commande | Rôle |
|----------|------|
| `uv run pytest` | Tests unitaires |
| `uv run langgraph dev` | Serveur de dev LangGraph / Studio |
| `uv run python -m app.mcp.server` | Serveur MCP stdio |

### 3. Ollama (LLM local)

```bash
ollama serve
ollama pull mistral-large-3:675b-cloud
```

### 4. Frontend (Vite + React)

```bash
cd frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

Ouvrir <http://localhost:5173>.

### 5. Serveur MCP (stdio)

```bash
cd backend
uv run python -m app.mcp.server
```

Les outils appellent la même logique que `app/mcp/tools.py` (recherche corpus, PDF, heuristique d'URL officielle, checklist, etc.).

---

## Configuration

Variables principales dans `backend/.env` :

```env
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=mistral-large-3:675b-cloud
EMBEDDING_MODEL=intfloat/multilingual-e5-base
VECTOR_DB=qdrant
QDRANT_URL=http://localhost:6333
RERANKER_ENABLED=false
```

---

## Docker Compose

L'image backend utilise **uv** (`uv sync --no-dev`) pour installer les dépendances déclarées dans `pyproject.toml`.

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Backend (FastAPI) | <http://localhost:8000> |
| Frontend (Vite dev) | <http://localhost:5173> |
| Qdrant | <http://localhost:6333> |

**Ollama dans Docker** (optionnel, profil `ollama`) :

```bash
docker compose --profile ollama up --build
```

En pratique, beaucoup d'équipes préfèrent **Ollama sur l'hôte** (`host.docker.internal` déjà prévu pour le backend).

Pour des **builds reproductibles**, générez et versionnez `uv.lock`, puis adaptez le `Dockerfile` pour `COPY uv.lock` et `uv sync --frozen --no-dev`.

---

## API REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/chat` | Chat RAG agentic (réponse, `queryType`, citations, `confidenceScore`, `workflowTrace`, `model`, `sourcePolicy`). |
| `POST` | `/api/documents/upload` | Upload d'un fichier. |
| `GET`  | `/api/documents` | Liste + métadonnées + `chunkCount`. |
| `POST` | `/api/documents/index` | Indexation / réindexation. |
| `DELETE` | `/api/documents/{documentId}` | Suppression d'un document. |
| `GET`  | `/api/workflow/trace/{conversationId}` | Trace persistée d'une conversation. |
| `POST` | `/api/quiz` | Génération d’un quiz concours par filière/difficulté (LLM). |
| `POST` | `/api/summarize` | Résumé structuré. |
| `POST` | `/api/transcribe` | Transcription vocale (Whisper) à partir d’un audio micro. |
| `GET`  | `/api/health` | État LLM / base vectorielle / modèle d'embedding. |
| `GET`  | `/api/stats/dashboard` | Indicateurs pour le dashboard UI. |

---

## Modèles recommandés

- **Embeddings** : `intfloat/multilingual-e5-base` (défaut), `BAAI/bge-m3`, `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`.
- **LLM (Ollama)** : `mistral-large-3:675b-cloud`, `mistral`, `llama3.1`, `gemma2`.
- **Reranker** (optionnel) : `cross-encoder/ms-marco-MiniLM-L-6-v2` (`RERANKER_ENABLED=true`).

---

## Tests

```bash
cd backend
uv run pytest
```

Les noms de tests respectent la convention : préfixe `test_` puis **camelCase**, par exemple `test_chatService_returnsOkWithMockedGraph`.

---

## Limites & éthique

- **Pas d'invention d'articles** : prompts FR + nœud de **vérification** + message de repli si échec.
- **Corpus démo** : à remplacer / enrichir par des textes officiels **vérifiables** avant toute utilisation réelle.
- **Arabe** : champs `language` / métadonnées déjà prévus ; UI principale en **français** pour cette version.

---

## Dépannage

| Problème | Piste |
|----------|-------|
| `uv sync` ou `uv lock` échoue | Désactivez temporairement `HTTP_PROXY` / `HTTPS_PROXY`, ou configurez uv (`UV_HTTP_TIMEOUT`, miroir PyPI). |
| Premier lancement lent | Téléchargement des poids SentenceTransformers + construction de la collection Qdrant. |
| Mémoire / GPU | Pour les LLM volumineux, privilégier des tailles 7B–8B sur GPU ou machine suffisante. |
| `externally-managed-environment` (PEP 668) | uv crée un `.venv` projet — n'installez pas dans le Python système. |
| Balise `<video>` du README invisible sur GitHub | Comportement attendu : GitHub ne rend pas `<video>` dans les README (uniquement dans les *issues* / commentaires de PR). Les GIFs servent à la preview inline ; le `.mp4` reste téléchargeable pour le HD. |
| Captures d’écran qui ne s’affichent pas dans le README | 1) Forcer le rafraîchissement (`Ctrl + F5`) pour vider le cache du proxy `camo.githubusercontent.com`. 2) Vérifier qu’aucun adblocker / proxy d’entreprise ne bloque `cdn.jsdelivr.net` et `raw.githubusercontent.com`. |

### LangGraph CLI & `langgraph.json`

Le fichier [`backend/langgraph.json`](backend/langgraph.json) référence `"dependencies": ["."]` : le CLI résout le projet à partir de `pyproject.toml`. Lancez toujours `langgraph dev` via **`uv run`** depuis `backend/`.

---

## Licence

Projet conçu pour fonctionner avec des **composants open-source** par défaut. Aucune clé API propriétaire n'est requise pour le scénario local (Ollama + Qdrant + embeddings locaux).

Code distribué sous licence **MIT** — voir le fichier `LICENSE` (à compléter selon votre choix final).

---

<div align="center">
  <sub>Conçu avec <code>uv</code>, <code>FastAPI</code>, <code>LangGraph</code>, <code>Qdrant</code>, <code>Ollama</code>, <code>React</code> &amp; <code>Tailwind</code>.</sub>
</div>
