const axios = require('axios');
const issues = require('./issues.json');

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
  },
});

function formatBody(body) {
  if (!body) return '';

  let text = '';
  if (body.context) text += `Context:\n${body.context}\n\n`;

  if (body.acceptance_criteria) {
    text += 'Acceptance Criteria:\n';
    text += body.acceptance_criteria.map(c => `- ${c}`).join('\n') + '\n';
  }

  if (body.scenarios) {
    text += 'Scenarios:\n';
    text += body.scenarios.map(s => `- ${s}`).join('\n') + '\n';
  }

  return text;
}

async function createIssue(issue) {
  await api.post(
    `/repos/${process.env.REPO_OWNER || 'Abdalla881'}/${process.env.REPO_NAME || 'event-ticketing-system'}/issues`,
    {
      title: issue.title,
      body: formatBody(issue.body),
      labels: issue.labels,
    },
  );

  console.log(`Created: ${issue.title}`);
}

async function run() {
  for (const issue of issues) {
    await createIssue(issue);
  }
}

run();