# Git Credentials Security Incident — Investigation & Fix

## Incident

Firebase service account key file was committed to git history:
- File: `aruct-editor-firebase-adminsdk-fbsvc-9f3fcdc9bd.json`
- Contained: Google Cloud service account private key
- GitHub push protection blocked `git push` and surfaced the secret

---

## Root Cause

File was committed directly without being in `.gitignore`. Firebase Admin SDK setup instructions commonly produce this file locally; it was accidentally staged and committed.

---

## Fix applied

Rewrote entire git history (1261 commits) to remove the file using `git filter-branch`:

```bash
git stash  # required — filter-branch fails with unstaged changes
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch aruct-editor-firebase-adminsdk-fbsvc-9f3fcdc9bd.json' \
  --prune-empty --tag-name-filter cat -- --all
```

After this, history no longer contains the file in any commit.

---

## Required manual steps (security-critical)

**MUST be done by repo owner:**

1. **Revoke the key in Google Cloud Console**
   - Go to: IAM & Admin → Service Accounts → select the Firebase Admin SDK service account → Keys tab
   - Delete the compromised key
   - Create a new key, download it, store securely (NOT in git)

2. **Force push cleaned history**
   ```bash
   git push origin main --force
   ```
   Coordinate with any collaborators — their local clones will need to be re-cloned or rebased.

3. **Add to `.gitignore`**
   ```
   # Firebase service account keys
   *-firebase-adminsdk-*.json
   *.serviceAccountKey.json
   ```

4. **Store credentials in environment variables**
   - Use `FIREBASE_SERVICE_ACCOUNT_KEY` env var containing the JSON content
   - Or use individual vars: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
   - Never commit JSON credential files

---

## Prevention

Add to CI pre-commit hooks or use `gitleaks` / `trufflehog` to scan for secrets before push. GitHub push protection (already active) catches it at push time but the commit still exists locally until history is rewritten.
