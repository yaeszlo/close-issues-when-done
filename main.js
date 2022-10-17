const { getOctokit } = require("@actions/github");
const core = require("@actions/core");

const token = core.getInput("token");
const boardName = core.getInput("board_name");
const columnName = core.getInput("board_done_column_name");
const repository = core.getInput("repository");

const [owner, repo] = repository.split("/");
const octokit = getOctokit(token);

async function run() {
  try {
    const project = await findProjectByName(boardName);

    if (!project) {
      console.log(`Project with name ${boardName} was not found in repository ${repo}`);
      return;
    }

    const column = await findDoneColumn(project.id, columnName);

    if (!column) {
      console.log(`Done column with name ${columnName} was not found in project ${project.name}`);
      return;
    }

    const cards = await getLast100Cards(column.id);

    if (!cards.length) {
      console.log(`No Cards in ${columnName}`);
      return;
    }

    const potentialIssueIdsToClose = filterAndMapCardsToIssueIds(cards);

    if (!potentialIssueIdsToClose.length) {
      console.log(`No issues found within last 100 cards from ${columnName}`);
      return;
    }

    const result = await checkIssuesAndClose(potentialIssueIdsToClose);

    if (result.some(closed => closed === true)) {
      console.log("Motherfuckers were closed.");
    } else {
      console.log("Nothing to close!");
    }

  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

async function getLast100Cards(columnId) {
  return (await octokit.request("GET /projects/columns/{column_id}/cards", {
    column_id: columnId,
    per_page: 100
  }))?.data;
}

async function findDoneColumn(projectId, columnName) {
  const allColumns = (await octokit.request("GET /projects/{project_id}/columns", {
    project_id: projectId
  }))?.data;

  return allColumns.find(column => column.name === columnName);
}

async function findProjectByName(projectName) {
  const projects = (await octokit.request("GET /repos/{owner}/{repo}/projects", {
    owner, repo
  }))?.data;

  return projects.find(project => project.name = projectName);
}

function filterAndMapCardsToIssueIds(cards) {
  return cards.map(card => {
    if (card.content_url && /issues\/\d/.test(card.content_url)) {
      return card.content_url.split("/").pop();
    }
  });
}

async function checkIssuesAndClose(issueIds) {

  console.log(issueIds);

  const promises = issueIds.map(async id => {
    const issue = await octokit.request("GET /repos/{owner}/{repo}/issues/{issue_number}", {
      owner, repo, issue_number: id
    });

    if (issue.data.state === "open") {
      await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
        owner,
        repo,
        issue_number: id,
        state: "closed",
        state_reason: "completed"
      });
      return true;
    } else {
      return false;
    }
  });

  return Promise.all(promises);
}

run();