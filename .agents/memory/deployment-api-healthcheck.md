---
name: Health check publikacji API
description: Nietypowe zachowanie readiness probe dla artefaktu API podczas publikowania.
---

Artefakt API powinien udostępniać lekką, niezależną od bazy odpowiedź `200 OK` zarówno pod główną ścieżką montowania `/api`, jak i pod skonfigurowanym endpointem health check.

**Why:** Publikacja zakończyła poprawnie build, ale etap gotowości faktycznie sprawdzał `/api`, mimo że konfiguracja artefaktu wskazywała `/api/healthz`.

**How to apply:** Przy zmianach routingu API zachowaj oba endpointy jako szybkie i niezależne od inicjalizacji bazy lub zewnętrznych usług.