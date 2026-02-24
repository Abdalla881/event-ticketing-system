require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const issues = require('./issues.json');

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
  },
});

async function createIssue(issue) {
  await api.post(
    `/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/issues`,
    {
      title: issue.title,
      body: issue.body,
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
