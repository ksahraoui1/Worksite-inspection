# Cloudflare Origin Certificate

Ce dossier doit contenir 2 fichiers (NON commités dans git) :

- `origin.pem` — Certificat Cloudflare (PEM format)
- `origin.key` — Clé privée (PEM format)

## Comment les obtenir

1. Cloudflare Dashboard → ton domaine `securionis.com`
2. **SSL/TLS** → **Origin Server**
3. **Create Certificate**
   - Hostnames : `quickref.securionis.com`
   - Validity : 15 years (recommandé)
   - Key type : RSA (2048)
4. Copier **Certificate** → coller dans `origin.pem`
5. Copier **Private Key** → coller dans `origin.key`

⚠️ La clé privée n'est affichée qu'une seule fois. La sauvegarder immédiatement.
