const { getOctokit } = require("@actions/github");
const core = require("@actions/core");

const token = core.getInput("token");
const columnName = core.getInput("board_done_column_name");
const repository = core.getInput("repository");

const [owner, repo] = repository.split("/");
const octokit = getOctokit(token);

async function run() {
  try {
    const project = await octokit.request("GET /repos/{owner}/{repo}/projects", {
      owner, repo
    });

    const allColumns = await octokit.request("GET /projects/{project_id}/columns", {
      project_id: project.id
    });

    console.log(allColumns);

    const columnId = allColumns.find(column => column.name === columnName).id;

    console.log(`Done column ID=${columnId}`);

    const cards = await octokit.request("GET /projects/columns/{column_id}/cards", {
      column_id: columnId,
      per_page: 100
    });

    console.log(cards);

    console.log("=======================================");
    console.log("CONTENT URL");
    console.log("=======================================");
    mapToIssues(cards);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

async function mapToIssues(cards) {
  return cards.map(async card => {
    console.log(`card.content_url`);
  });
}

run();