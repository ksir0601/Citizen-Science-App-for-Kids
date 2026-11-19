# Mock Data Guide

Build your screens now with mock data. When the real database is connected you just change one import line and your screens keep working.

## 1. Import it

| App | Import line (from a file in `src/pages/` or `src/app/`) |
| --- | --- |
| Website | `import * as api from '../mock/mockApi.js';` |
| Mobile | `import * as api from '../mock/mockApi';` |

## 2. Call it

Every function is `async` and returns `{ data, error }`. Always check `error` first:

```js
const { data, error } = await api.getMyProjects();
if (error) setMessage(error.message);
else setProjects(data);
```

Each call waits half a second

## 3. The functions

| Who | Function | Returns `data` |
| --- | --- | --- |
| Alice | `api.getMyProjects()` | The teacher's projects, newest first |
| Alice | `api.createProject(name, description, questions)` | The new project, with its `join_code` |
| Alice | `api.setProjectOpen(projectId, true/false)` | The updated project |
| Thomas | `api.joinProject(code)` | The joined project (`id`, `name`, `description`) |
| Thomas | `api.getQuestions(projectId)` | The project's questions, in order |
| Thomas | `api.addObservation(projectId, nickname, answers)` | The saved observation |

`questions` for `createProject` looks like:
`[{ type: 'dropdown', label: 'What kind of bug?', options: ['Ant', 'Ladybug'], required: true }]`

`answers` for `addObservation` is `{ questionId: answer }`. Leave out any optional question the kid skipped.

### Who writes what

| Code | Who |
| --- | --- |
| The functions above (`mockApi.js` now, the real `api.js` ) | Kelcie |
| The screens that call them: layout, buttons, loading, error messages, form checks | Alice (website) and Thomas (mobile) |

everything that talks to the database lives in one place, owned by Kelcie, so the queries, security rules and data shapes stay consistent. If a screen needs something the functions don't do yet, ask Kelcie to add it to both `mockApi.js` and `api.js` with the same name.

## 4. Test data

| Project | Join code | Status |
| --- | --- | --- |
| Backyard Bug Count | `BUGCNT` | Open |
| Weather Watchers | `WEATHR` | Open |
| Fall Leaf Hunt | `TREHNT` | **Closed** (joining gives an error) |

Switch who's signed in (mock only) with `api.signInAs(...)`:

- `'teacher1'`: has the two open projects (the default)
- `'teacher2'`: has only the closed project
- `'new'`: a teacher with no projects, or a fresh app install for a kid. **Thomas: call this once when the app starts.**

## 5. Rules

1. Screens only call `api.something()`, never `supabase` directly for project data.
2. Don't edit `mockData.js`. It must match `supabase/seed.sql`, so ask Kelc for changes.
3. Always show `error.message` when there's an error.

The mock resets when you reload, so anything you create disappears on refresh as expected

## After Kelcie is done with final task

- Change the import to `'../lib/api.js'`.
- Add a private `.env.local` file (Kelcie sends the values, never commit it).
- Thomas: replace `api.signInAs('new')` with `api.startKidSession()`.