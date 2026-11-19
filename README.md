# Citizen-Science-App-for-Kids
The Citizen Science App for Kids is a cross-platform mobile app for K-8 students to collect observations for science projects, plus a website where teachers can create projects, see results, and download the data as a CSV. 

**Status:** In development (Oregon State University capstone, Fall 2026). Final version due Nov 30, 2026. 

## How it will work

1. A teacher signs up on the **admin website** and creates a project, such as "Backyard Bug Count", with the questions kids should answer. 
2. The website give the project a **join code**.
3. Kids enter the code in the **field app** and submit observations.
4. The teacher sees the results, charts and stats on the website and can download a CSV.

Kids never create accounts or enter personal information. 

## Progress

- [x] Repo setup, CI checks and branch protection
- [x] Admin website started (React + Vite)
- [x] Field app research (learning Expo and wireframe designs)
- [x] Teacher sign up and login 
- [x] Supabase project and database design
- [x] Database tables and security rules
- [x] Create projects with join codes
- [ ] Add observations from the app
- [ ] Results page, charts and CSV download

## Team 

| Name | Role |
| --- | --- |
| Kelcie | Database (Supabase), repo and CI, project management/scrum master |
| Alice | Teacher administration website |
| Thomas | Kids' cros-platform mobile field app |

## Tech stack

- **Admin website:** React + Vite
- **Field app:** cross-platform mobile (Expo)
- **Backend:** Supabase (PostgreSQL database, Auth)
- **CI:** GitHub Actions

## Repo layout

| Folder | What's in it |
| --- | --- |
| `apps/admin/` | Teacher admin website |
| `apps/mobile/` | Kids' field app  |
| `supabase/` | Database setup and migrations |
| `docs/` | Design docs |
| `.github/workflows/` | CI checks that run on every pull request |

---
## Getting started

### 1. Install the tools (one time)
 
| Tool | Mac | Windows |
| --- | --- | --- |
| **Git** | `xcode-select --install` | `winget install --id Git.Git -e` |
| **Node.js** 22 or newer | `brew install node` | `winget install --id OpenJS.NodeJS.LTS -e` |
| **VS Code** (recommended) | [code.visualstudio.com](https://code.visualstudio.com) | `winget install --id Microsoft.VisualStudioCode -e` |
| **Expo Go** (phone) | App Store or Google Play | App Store or Google Play |
 
You can also download the installers from [git-scm.com](https://git-scm.com), [nodejs.org](https://nodejs.org) and [code.visualstudio.com](https://code.visualstudio.com).
 
**Windows users:**
 
- Close and reopen your terminal after installing, so it finds the new tools.
- Use **Git Bash** (installed with Git) or **PowerShell**. Every command in this README works in both unless it says otherwise.
- Run this once so line endings don't cause problems between Mac and Windows:
```bash
  git config --global core.autocrlf true
```
 
- If PowerShell says **"running scripts is disabled on this system"** when you run `npm` or `npx`, run this once and then try again:
```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
 
**Check everything installed:**
 
```bash
git --version
node --version
npm --version
```
### 2. Clone the team repo
 
```bash
git clone https://github.com/ksir0601/Citizen-Science-App-for-Kids.git
cd Citizen-Science-App-for-Kids
```
 
---
 
## Running the admin website
 
### 1. Install packages
 
```bash
cd apps/admin
npm install
```
 
### 2. Add the Supabase settings
 
Create a file named `apps/admin/.env.local` with these two lines:
 
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```
 
Get the values from the Supabase dashboard:
 
- **Project URL:** the **Connect** button, or **Project Settings → Data API**. Use only `https://...supabase.co`, with nothing after it and no slash at the end.
- **Key:** **Project Settings → API Keys** → the **publishable** key (`sb_publishable_...`). Never use the secret key.
No spaces around `=` and no quotes. `.env.local` is git-ignored, so it's never committed.
 
### 3. Start it
 
```bash
npm run dev
```
 
Open the link it prints (usually http://localhost:5173). Press **Ctrl+C** to stop.
 
If you change `.env.local`, stop and restart `npm run dev`. Vite only reads it at startup.
 
---
 
## Running the field mobile app
 
### 1. Install packages
 
```bash
cd apps/mobile
npm install
```
### 2. Add the Supabase settings

Copy `apps/mobile/.env.example` to `apps/mobile/.env.local` and fill in the same URL and publishable key the website uses:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

`.env.local` is git-ignored. If you change it, restart with `npx expo start --clear`. Using local Supabase on a real phone? Use your computer's Wi-Fi IP instead of `127.0.0.1` (see the notes in `.env.example`).

### 3. Start Expo
 
```bash
npx expo start
```
 
Then choose how to view it:
 
| Where | How |
| --- | --- |
| **Your phone** (best) | Install **Expo Go**. iPhone: scan the QR code with the Camera app. Android: scan it in Expo Go. Phone and computer must be on the same Wi-Fi |
| **Web browser** (quickest) | Press **`w`** |
 
Press **Ctrl+C** to stop.
 
**Tip:** if your phone can't connect (common on school Wi-Fi), use a tunnel instead. Say yes if it asks to install `@expo/ngrok`.
 
```bash
npx expo start --tunnel
```
 
Pressing **`i`** opens the iPhone simulator, but that needs Xcode installed. Use your phone or the browser instead.
---
 
## How we work
 
1. Pick an issue from the project board and move it to **In Progress**.
2. Start from the latest main: `git switch main && git pull`
3. Make a branch
4. Commit, push, and open a pull request
5. CI must pass (**CI passed** check), and one teammate must approve.
6. **Squash and merge.** The issue closes and the card moves to **Done**.
7. Don't reuse a branch after it merges. Start a new one for the next task.