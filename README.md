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
- [ ] Teacher sign up and login *(in review)*
- [ ] Supabase project and database design *(in review)*
- [ ] Database tables and security rules
- [ ] Create projects with join codes
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
| `apps/mobile/` | Kids' field app *(coming soon)* |
| `supabase/` | Database setup and migrations |
| `docs/` | Design docs *(coming soon)* |
| `.github/workflows/` | CI checks that run on every pull request |

## Running the admin website locally

You need [Node.js](https://nodejs.org) 22 or newer.

```bash
cd apps/admin
npm install
npm run dev
```

Then open the link it prints in your browser.

## How we work

1. Pick an issue from the project board and move it to **In Progress**.
2. Make a branch:
3. Commit, push, and open a pull request
4. CI must pass, and one teammate must approve before merging.
5. **Squash and merge**. The issue closes and the card moves to **Done**.