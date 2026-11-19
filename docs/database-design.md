# Database design

Status: **updates for team review Prog Report 3** · Owner: Kelcie

## Overview

Six tables. Teachers own classes and projects, and each project can belong to one of the teacher's classes; each project has a list of questions and a join code; students join a project with the code and submit observations that answer those questions.

```mermaid
erDiagram
    TEACHERS ||--o{ CLASSES : "teaches"}
    TEACHERS ||--o{ PROJECTS : "creates"
    CLASSES |o--o{ PROJECTS : "groups"
    PROJECTS ||--o{ QUESTIONS : "asks"
    PROJECTS ||--o{ PROJECT_MEMBERS : "is joined by"
    PROJECTS ||--o{ OBSERVATIONS : "collects"
    OBSERVATIONS ||--o{ OBSERVATION_PHOTOS : "has (stretch)"

    TEACHERS {
        uuid id PK "same id as the Supabase Auth user"
        text display_name
        timestamptz created_at
    }
    CLASSES {
        uuid id PK
        uuid teacher_id FK
        text name
        int student_count "optional"
        timestamptz created_at
    }
    PROJECTS {
        uuid id PK
        uuid teacher_id FK
        uuid class_id FK "optional"
        text name
        text description
        text join_code UK "6 letters, e.g. KTRWBP"
        boolean is_open "false = no new observations"
        timestamptz created_at
    }
    QUESTIONS {
        uuid id PK
        uuid project_id FK
        int position "order shown in the app"
        text type "checkbox, dropdown, number, text"
        text label
        text_array options "choices for dropdown"
        boolean required
    }
    PROJECT_MEMBERS {
        uuid project_id PK, FK
        uuid user_id PK "the student's anonymous device id"
        timestamptz joined_at
    }
    OBSERVATIONS {
        uuid id PK
        uuid project_id FK
        uuid created_by "the student's anonymous device id"
        text nickname "optional, first name or nickname only"
        jsonb answers "question id -> answer"
        timestamptz observed_at
        timestamptz created_at
        timestamptz updated_at
    }
    OBSERVATION_PHOTOS {
        uuid id PK
        uuid observation_id FK
        text storage_path "file in Supabase Storage"
        timestamptz created_at
    }
```

## How the main flows use the tables

| Flow | What happens in the database |
| --- | --- |
| Teacher signs up | Supabase Auth creates the user; we add a row in `teachers` |
| Teacher creates a project | New row in `projects` with a generated `join_code`, plus one row per question in `questions` |
| Student opens the app | The app signs in **anonymously** (no name, email or password); Supabase gives the device an id |
| Student enters a join code | A database function looks up the project by code and adds a row in `project_members` |
| Student views the project page | Reads the project and its `questions` (allowed because they're a member) |
| Student adds an observation | New row in `observations` with `answers` filled in |
| Student views / edits their observations | Reads and updates rows where `created_by` is their device id |
| Teacher views results | Reads all `observations` for their projects; stats and charts are calculated from `answers` |
| Teacher downloads CSV | One row per observation, one column per question (headers come from `questions.label`) |

## Tables

### teachers
One row per teacher account. The `id` is the same as the Supabase Auth user id, so there's no separate password storage.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | primary key, references the Auth user |
| display_name | text | shown on the website, e.g. "Teacher 1" |
| created_at | timestamptz | defaults to now |

### classes
Added Nov 19 (migration `20261116203046_add_classes.sql`). The website groups a teacher's projects by class.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | primary key |
| teacher_id | uuid | → teachers.id; defaults to the signed-in teacher. Deleting a teacher deletes their classes |
| name | text | required, 1-100 characters, e.g. "Room 12 - 3rd Grade" |
| student_count | int | optional, 1-500. Only the website uses it |
| created_at | timestamptz | defaults to now |

### projects
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | primary key |
| teacher_id | uuid | → teachers.id; deleting a teacher deletes their projects |
| class_id | uuid | optional → classes.id. Must be one of the teacher's own classes. Deleting a class keeps its projects and sets this to null |
| name | text | required, e.g. "Backyard Bug Count" |
| description | text | the explanation and instructions students read |
| join_code | text | **unique**, 6 uppercase letters, generated automatically. Skips look-alike letters (I, L, O) |
| is_open | boolean | defaults to true. Teacher can close a project to stop new observations |
| created_at | timestamptz | defaults to now |

### questions
What the students are asked for each observation. Kept as its own table so the app can build the form, and the CSV gets readable column headers.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | primary key |
| project_id | uuid | → projects.id; deleted with the project |
| position | int | 1, 2, 3... order in the form and CSV |
| type | text | one of: `checkbox` (yes/no), `dropdown` (pick one), `number`, `text` (comment) |
| label | text | the question, e.g. "How many bugs did you see?" |
| options | text[] | only for `dropdown`, e.g. `{Ant, Ladybug, Bee, Butterfly, Other}` |
| required | boolean | defaults to false |

### project_members
Which devices have joined which project with the code. This is how the security rules know a student is allowed to see a project and add observations to it.

| Column | Type | Notes |
| --- | --- | --- |
| project_id | uuid | → projects.id |
| user_id | uuid | the student's anonymous device id |
| joined_at | timestamptz | defaults to now |

Primary key is (project_id, user_id)

### observations
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | primary key |
| project_id | uuid | → projects.id; deleted with the project |
| created_by | uuid | the student's anonymous device id (set automatically) |
| nickname | text | optional. First name or nickname only |
| answers | jsonb | answers keyed by question id (example below) |
| observed_at | timestamptz | when the student made the observation; defaults to now. Useful for offline mode later |
| created_at | timestamptz | when it reached the database |
| updated_at | timestamptz | changes on every edit |

Example `answers` for a bug-count project:
```json
{
  "4b1c...": true,
  "9e2a...": "ladybug",
  "c7d0...": 3,
  "f15b...": "It was on a flower stem"
}
```
Keys are `questions.id`; values are `true/false` for checkbox, the chosen option for dropdown, a number, or text.

### observation_photos (stretch goal)
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | primary key |
| observation_id | uuid | → observations.id; deleted with the observation |
| storage_path | text | path of the image in a Supabase Storage bucket |
| created_at | timestamptz | defaults to now |

Separate table so an observation can have more than one photo, and so we can skip it entirely if we don't get to the stretch goal.

## Security rules (Row Level Security, built in Progress Report 2)

Every table has Row Level Security turned on. The app and website use the public key, so these rules are what actually protect the data.

| Who | Can do |
| --- | --- |
| **Teacher** (logged in with email) | See, create, edit and delete **their own** classes, projects and questions. Can only put a project in one of their own classes. See and delete observations in their own projects. Cannot see other teachers' projects |
| **Student** (anonymous sign-in) | Join a project **only with its code**. See projects they've joined and those projects' questions. Add observations to joined projects that are open. See and edit **only their own** observations |
| **Not signed in** | Nothing |

The join code lookup runs in a database function, so students can never list or browse all projects.

## Students' privacy

- No student accounts, emails, last names, birthdays or school names. Anonymous sign-in gives each device a random id and nothing else.
- `nickname` is optional and the app should say "first name or nickname only".
- No location data for now (see open questions).
- This keeps us clear of collecting children's personal information (relevant under COPPA for students under 13).

## Why these choices

- **Answers in one JSON column** instead of a separate answers table: saving or editing an observation is one simple insert/update from the app, and the teacher's questions can be different for every project. Trade-off: stats are calculated in the website code instead of in SQL, which is fine at classroom size.
- **Questions in their own table** instead of inside the project: easy to show in order, easy to edit one, and gives clean CSV headers.
- **Anonymous sign-in for students** instead of no sign-in: it's what lets a student see and edit their own observations (an Objectives requirement) without collecting any personal data.

## Known limitations

- If a student deletes and reinstalls the app, they get a new anonymous id and can no longer edit their older observations (the teacher still sees them).
- Don't delete a question after students have answered it; old answers would lose their column in the CSV. Closing and copying the project is safer.

## Setup notes

- Turn on **Anonymous sign-ins** in the Supabase dashboard: Authentication → Sign In / Providers.
- Tables are created with migration files in `supabase/migrations/` (Progress Report 2) never by clicking in the dashboard.