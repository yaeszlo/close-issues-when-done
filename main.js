const { getOctokit } = require("@actions/github");
const core = require("@actions/core");

const token = core.getInput("token");
const projectId = core.getInput("project_id");
const columnName = core.getInput("board_done_column_name");

const octokit = getOctokit(token);

async function run() {
  try {
    const allColumns = await octokit.request("GET /projects/{project_id}/columns", {
      project_id: projectId
    });

    console.log(allColumns);

    const columnId = allColumns.find(column => column.name === columnName).id;

    console.log(`Done column ID=${columnId}`);

    const cards = await octokit.request('GET /projects/columns/{column_id}/cards', {
      column_id: columnId,
      per_page: 100
    })

    console.log(cards);

    console.log('=======================================');
    console.log('CONTENT URL');
    console.log('=======================================');
    mapToIssues(cards)
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

async function mapToIssues(cards) {
  return cards.map(async card => {
    console.log(`card.content_url`);
  })
}

run();