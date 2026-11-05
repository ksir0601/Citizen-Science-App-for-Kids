// =====================================================================
// MOCK DATA: fake rows for building screens before the real database
// is connected. Same ids and join codes as supabase/seed.sql.
// Notify Kelcie if you change this file or seed.sql
// Each list has the same columns as the table with the same name as the seed file
// =====================================================================

export const teachers = [
  { id: '10000000-0000-0000-0000-000000000001', display_name: 'Teacher 1' },
  { id: '10000000-0000-0000-0000-000000000002', display_name: 'Teacher 2' },
];

export const kids = [
  { id: '20000000-0000-0000-0000-000000000001', nickname: 'Maya' },
  { id: '20000000-0000-0000-0000-000000000002', nickname: null },
  { id: '20000000-0000-0000-0000-000000000003', nickname: 'Leo' },
  { id: '20000000-0000-0000-0000-000000000004', nickname: 'Sam' },
];

export const projects = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    teacher_id: '10000000-0000-0000-0000-000000000001',
    name: 'Backyard Bug Count',
    description: "Explore your backyard or schoolyard for 10 minutes. Look under leaves, on flowers and near rocks. Count the bugs you find and tell us what kind they are. Look, but don't touch!",
    join_code: 'BUGCNT',
    is_open: true,
    created_at: '2026-10-05T16:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    teacher_id: '10000000-0000-0000-0000-000000000001',
    name: 'Weather Watchers',
    description: 'Step outside at lunchtime. Look at the sky, check the temperature, and tell us what you notice.',
    join_code: 'WEATHR',
    is_open: true,
    created_at: '2026-10-12T15:30:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    teacher_id: '10000000-0000-0000-0000-000000000002',
    name: 'Fall Leaf Hunt',
    description: 'Collect fallen leaves on the playground and sort them by color.',
    join_code: 'TREHNT',
    is_open: false,
    created_at: '2026-09-28T17:00:00Z',
  },
];

export const questions = [
  // Backyard Bug Count
  { id: '40000000-0000-0000-0000-000000000101', project_id: '30000000-0000-0000-0000-000000000001', position: 1, type: 'checkbox', label: 'Did you find any bugs?', options: null, required: true },
  { id: '40000000-0000-0000-0000-000000000102', project_id: '30000000-0000-0000-0000-000000000001', position: 2, type: 'dropdown', label: 'What kind of bug?', options: ['Ant', 'Ladybug', 'Bee', 'Butterfly', 'Beetle', 'Spider', 'Other'], required: true },
  { id: '40000000-0000-0000-0000-000000000103', project_id: '30000000-0000-0000-0000-000000000001', position: 3, type: 'number', label: 'How many did you see?', options: null, required: true },
  { id: '40000000-0000-0000-0000-000000000104', project_id: '30000000-0000-0000-0000-000000000001', position: 4, type: 'text', label: 'Where did you find it?', options: null, required: false },
  // Weather Watchers
  { id: '40000000-0000-0000-0000-000000000201', project_id: '30000000-0000-0000-0000-000000000002', position: 1, type: 'dropdown', label: 'What does the sky look like?', options: ['Sunny', 'Partly cloudy', 'Cloudy', 'Rainy'], required: true },
  { id: '40000000-0000-0000-0000-000000000202', project_id: '30000000-0000-0000-0000-000000000002', position: 2, type: 'number', label: 'Temperature (°F)', options: null, required: true },
  { id: '40000000-0000-0000-0000-000000000203', project_id: '30000000-0000-0000-0000-000000000002', position: 3, type: 'checkbox', label: 'Is it raining right now?', options: null, required: false },
  { id: '40000000-0000-0000-0000-000000000204', project_id: '30000000-0000-0000-0000-000000000002', position: 4, type: 'text', label: 'Anything else you noticed?', options: null, required: false },
  // Fall Leaf Hunt
  { id: '40000000-0000-0000-0000-000000000301', project_id: '30000000-0000-0000-0000-000000000003', position: 1, type: 'dropdown', label: 'What color are most of your leaves?', options: ['Red', 'Orange', 'Yellow', 'Brown'], required: true },
  { id: '40000000-0000-0000-0000-000000000302', project_id: '30000000-0000-0000-0000-000000000003', position: 2, type: 'number', label: 'How many leaves did you collect?', options: null, required: true },
];

export const projectMembers = [
  { project_id: '30000000-0000-0000-0000-000000000001', user_id: '20000000-0000-0000-0000-000000000001' },
  { project_id: '30000000-0000-0000-0000-000000000001', user_id: '20000000-0000-0000-0000-000000000002' },
  { project_id: '30000000-0000-0000-0000-000000000001', user_id: '20000000-0000-0000-0000-000000000003' },
  { project_id: '30000000-0000-0000-0000-000000000002', user_id: '20000000-0000-0000-0000-000000000001' },
  { project_id: '30000000-0000-0000-0000-000000000002', user_id: '20000000-0000-0000-0000-000000000003' },
  { project_id: '30000000-0000-0000-0000-000000000003', user_id: '20000000-0000-0000-0000-000000000004' },
];

// A few sample observations 
// Kid 2's skipped the optional "where" question, so that key is missing.
export const observations = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    project_id: '30000000-0000-0000-0000-000000000001',
    created_by: '20000000-0000-0000-0000-000000000001',
    nickname: 'Maya',
    answers: {
      '40000000-0000-0000-0000-000000000101': true,
      '40000000-0000-0000-0000-000000000102': 'Ant',
      '40000000-0000-0000-0000-000000000103': 2,
      '40000000-0000-0000-0000-000000000104': 'Under a rock',
    },
    observed_at: '2026-11-03T16:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    project_id: '30000000-0000-0000-0000-000000000001',
    created_by: '20000000-0000-0000-0000-000000000002',
    nickname: null,
    answers: {
      '40000000-0000-0000-0000-000000000101': true,
      '40000000-0000-0000-0000-000000000102': 'Ladybug',
      '40000000-0000-0000-0000-000000000103': 1,
    },
    observed_at: '2026-11-02T16:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    project_id: '30000000-0000-0000-0000-000000000003',
    created_by: '20000000-0000-0000-0000-000000000004',
    nickname: 'Sam',
    answers: {
      '40000000-0000-0000-0000-000000000301': 'Orange',
      '40000000-0000-0000-0000-000000000302': 6,
    },
    observed_at: '2026-10-20T16:00:00Z',
  },
];