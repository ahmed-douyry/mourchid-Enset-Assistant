"""Indexe les fichiers de démonstration dans `app/data/samples/`."""

from __future__ import annotations

from pathlib import Path

from app.config import Settings, get_settings
from app.rag.indexer import delete_vectors_by_document_id, index_file


def _fail_if_qdrant_unreachable(s: Settings) -> None:
    if s.vector_db != "qdrant":
        return
    from qdrant_client import QdrantClient

    try:
        QdrantClient(url=s.qdrant_url).get_collections()
    except Exception as e:
        raise SystemExit(
            "\nQdrant est injoignable "
            f"({s.qdrant_url!r}): {e}\n\n"
            "Actions possibles :\n"
            "  - Démarrer Qdrant (ex. : docker run -p 6333:6333 qdrant/qdrant)\n"
            "  - Ou dans backend/.env : VECTOR_DB=chroma (base locale, sans serveur)\n",
        )


SAMPLE_META: dict[str, dict] = {
    "filieres_enset_demo.md": {
        "domain": "filieres",
        "document_type": "guide_demo",
        "url": "https://www.demo.local/enset-filieres",
    },
    "inscription_demo.md": {
        "domain": "scolarite",
        "document_type": "procedure_demo",
        "url": "https://www.demo.local/enset-inscription",
    },
    "bourse_demo.md": {
        "domain": "bourses",
        "document_type": "procedure_demo",
        "url": "https://www.demo.local/enset-bourse",
    },
    "concours_acces_demo.md": {
        "domain": "admission",
        "document_type": "procedure_demo",
        "url": "https://www.demo.local/enset-concours",
    },
    "stage_pfe_demo.md": {
        "domain": "stages",
        "document_type": "procedure_demo",
        "url": "https://www.demo.local/enset-stage-pfe",
    },
    "attestation_demo.md": {
        "domain": "scolarite",
        "document_type": "procedure_demo",
        "url": "https://www.demo.local/enset-attestation",
    },
    "vie_etudiante_demo.md": {
        "domain": "vie_etudiante",
        "document_type": "guide_demo",
        "url": "https://www.demo.local/enset-vie-etudiante",
    },
}


def seed() -> int:
    s = get_settings()
    _fail_if_qdrant_unreachable(s)
    base = Path(__file__).resolve().parents[1] / "data" / "samples"
    count = 0
    for path in sorted(base.glob("*.md")):
        doc_id = f"sample_{path.stem}"
        delete_vectors_by_document_id(doc_id, s)
        meta = dict(SAMPLE_META.get(path.name, {}))
        meta.setdefault("country", "Morocco")
        meta.setdefault("language", "fr")
        meta.setdefault("source", path.name)
        meta.setdefault("title", path.stem.replace("_", " ").title())
        index_file(path, document_id=doc_id, extra_metadata=meta, settings=s)
        count += 1
    return count


if __name__ == "__main__":
    n = seed()
    print(f"Indexed {n} sample documents.")
