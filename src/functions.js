import shell from "shelljs";

import { CURRENT_DATE_DDMMYY, colorLog, trimAnswers } from "./utils.js";
import {
  CREATE_BRANCH_PROMPTS,
  RAISE_RELEASE_PROMPTS,
  RAISE_UPDATE_TAG_PROMPTS,
  SYNC_CURRENT_BRANCH,
} from "./questions.js";

export const createBranch = async (inquirer) => {
  const branchAnswers = await inquirer.prompt(CREATE_BRANCH_PROMPTS);

  const { branchType, developmentBranch, jiraID } = trimAnswers(branchAnswers, [
    "branchType",
    "developmentBranch",
    "jiraID",
  ]);
  const newBranch = `${branchType}/${jiraID}`;

  shell.exec(`git checkout ${developmentBranch}`, { silent: true });
  shell.exec(`git pull origin ${developmentBranch}`, { silent: true });
  shell.exec(`git checkout -b ${newBranch}`, { silent: true });
};

export const raiseRelease = async (inquirer) => {
  const releaseAnswers = await inquirer.prompt(RAISE_RELEASE_PROMPTS);

  const { developmentBranch, releaseBranch } = trimAnswers(releaseAnswers, [
    "developmentBranch",
    "releaseBranch",
  ]);
  const newBranch = `${developmentBranch}-release-${CURRENT_DATE_DDMMYY()}`;

  colorLog(`Syncing ${developmentBranch}`, "green");
  shell.exec(`git checkout ${developmentBranch}`, { silent: true });
  shell.exec(`git pull origin ${developmentBranch}`, { silent: true });

  colorLog(`Syncing ${releaseBranch}`, "green");
  shell.exec(`git checkout ${releaseBranch}`, { silent: true });
  shell.exec(`git pull origin ${releaseBranch}`, { silent: true });

  colorLog(`Merging ${developmentBranch} into ${newBranch}`, "green");
  shell.exec(`git checkout -b ${newBranch}`, { silent: true });
  shell.exec(`git merge ${developmentBranch}`);

  const conflicts = shell.exec("git diff --name-only --diff-filter=U", {
    silent: true,
  }).stdout;
  if (conflicts) {
    colorLog(
      "Merge conflicts detected. Opening VS Code to resolve them...",
      "yellow"
    );
    shell.exec("code .");
    colorLog(
      'After resolving conflicts, run "git add ." and "git commit" to finalize the merge.',
      "yellow"
    );
  } else {
    shell.exec(`git push origin ${newBranch}`);
    colorLog(
      `New branch ${newBranch} pushed to remote. You can now create a pull request.`,
      "green"
    );
  }
};

export const raiseUpdateTag = async (inquirer) => {
  const updateTagAnswers = await inquirer.prompt(RAISE_UPDATE_TAG_PROMPTS);
  const { jiraID, releaseBranch, k8sPath, environments, newTag } = trimAnswers(
    updateTagAnswers,
    ["jiraID", "releaseBranch", "k8sPath", "environments", "newTag"]
  );
  const updatTagBranch = `updateTags-${jiraID}-${CURRENT_DATE_DDMMYY()}`;
  const environmentsList = environments.split(",").map((env) => env.trim());
  const newTagTrimmed = newTag.trim();
  const prefix = releaseBranch.split("/")[1].trim() + ".";

  colorLog(`Syncing ${releaseBranch}`, "green");
  shell.exec(`git checkout ${releaseBranch}`, { silent: true });
  shell.exec(`git pull origin ${releaseBranch}`, { silent: true });

  colorLog(`Creating ${updatTagBranch} from ${releaseBranch}`, "green");
  shell.exec(`git checkout -b ${updatTagBranch}`, { silent: true });

  for (let environment of environmentsList) {
    colorLog(`Updating ${environment} tags to ${newTagTrimmed}`, "green");

    // Finding old tags
    const result = shell.exec(
      `awk -F'${prefix}' '{print $2}' ${k8sPath}/${environment}/deployment.yaml | tr -d '\\n'`,
      { silent: true }
    );
    const getOldTagsResult = result.stdout.trim();
    const oldTagTrimmed = getOldTagsResult.match(/^[0-9]+/)?.[0] || "";

    // Updating to new tags
    shell.exec(
      `find ${k8sPath} -type f -name 'deployment.yaml' -exec perl -pi -e 's/${oldTagTrimmed}/${newTagTrimmed}/g' {} \\;`,
      { silent: true }
    );
  }

  colorLog(`Adding all modified deployment.yaml files to git...`, "green");
  shell.exec(`git add $(git diff --name-only | grep 'deployment.yaml')`, {
    silent: true,
  });

  colorLog(`Committing changes...`, "green");
  shell.exec(
    `git commit -m "chore: [skip ci] ${jiraID} update tags for ${environmentsList.join(
      ", "
    )} to ${newTagTrimmed}"`
  );

  shell.exec(`git push origin ${updatTagBranch}`);
  colorLog(
    `New branch ${updatTagBranch} pushed to remote. You can now create a pull request.`,
    "green"
  );
};

export const raiseBackmerge = async (inquirer) => {
  const releaseAnswers = await inquirer.prompt(RAISE_RELEASE_PROMPTS);

  const { developmentBranch, releaseBranch } = trimAnswers(releaseAnswers, [
    "developmentBranch",
    "releaseBranch",
  ]);
  const newBranch = `${developmentBranch}-backmerge-${CURRENT_DATE_DDMMYY()}`;

  colorLog(`Syncing ${releaseBranch}`, "green");
  shell.exec(`git checkout ${releaseBranch}`, { silent: true });
  shell.exec(`git pull origin ${releaseBranch}`, { silent: true });

  colorLog(`Syncing ${developmentBranch}`, "green");
  shell.exec(`git checkout ${developmentBranch}`, { silent: true });
  shell.exec(`git pull origin ${developmentBranch}`, { silent: true });

  colorLog(`Merging ${releaseBranch} into ${newBranch}`, "green");
  shell.exec(`git checkout -b ${newBranch}`, { silent: true });
  shell.exec(`git merge ${releaseBranch}`);

  const conflicts = shell.exec("git diff --name-only --diff-filter=U", {
    silent: true,
  }).stdout;
  if (conflicts) {
    colorLog(
      "Merge conflicts detected. Opening VS Code to resolve them...",
      "yellow"
    );
    shell.exec("code .");
    colorLog(
      'After resolving conflicts, run "git add ." and "git commit" to finalize the merge.',
      "yellow"
    );
  } else {
    shell.exec(`git push origin ${newBranch}`);
    colorLog(
      `New branch ${newBranch} pushed to remote. You can now create a pull request.`,
      "green"
    );
  }
};

export const syncCurrentBranch = async (inquirer) => {
  const answers = await inquirer.prompt(SYNC_CURRENT_BRANCH);

  const { syncFromBranch } = trimAnswers(answers, ["syncFromBranch"]);
  let currentBranch;

  shell.exec("git symbolic-ref --short HEAD", (code, stdout, stderr) => {
    if (code === 0) {
      currentBranch = stdout.trim();

      colorLog(`Syncing ${syncFromBranch}`, "green");
      shell.exec(`git checkout ${syncFromBranch} && git pull`, {
        silent: true,
      });

      colorLog(`Merging ${syncFromBranch} to ${currentBranch}`, "green");
      shell.exec(
        `git checkout ${currentBranch} && git merge ${syncFromBranch}`,
        { silent: true }
      );
    } else {
      console.error("Failed to retrieve the Git branch:", stderr);
    }
  });
};
