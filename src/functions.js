import shell from "shelljs";

import { CURRENT_DATE_DDMMYY, colorLog, trimAnswers } from "./utils.js";
import {
  CREATE_BRANCH_PROMPTS,
  RAISE_RELEASE_PROMPTS,
  RAISE_UPDATE_TAG_PROMPTS,
} from "./questions.js";

export const createBranch = async (inquirer) => {
  const branchAnswers = await inquirer.prompt(CREATE_BRANCH_PROMPTS);

  const { branchType, developmentBranch, jiraID } = trimAnswers(branchAnswers, [
    "branchType",
    "developmentBranch",
    "jiraID",
  ]);
  const newBranch = `${branchType}/${jiraID}`;

  shell.exec(`git checkout ${developmentBranch}`);
  shell.exec(`git pull origin ${developmentBranch}`);
  shell.exec(`git checkout -b ${newBranch}`);
};

export const raiseRelease = async (inquirer) => {
  const releaseAnswers = await inquirer.prompt(RAISE_RELEASE_PROMPTS);

  const { developmentBranch, releaseBranch } = trimAnswers(releaseAnswers, [
    "developmentBranch",
    "releaseBranch",
  ]);
  const newBranch = `${developmentBranch}-release-${CURRENT_DATE_DDMMYY()}`;

  colorLog(`Syncing ${developmentBranch}`, "green");
  shell.exec(`git checkout ${developmentBranch}`);
  shell.exec(`git pull origin ${developmentBranch}`);

  colorLog(`Syncing ${releaseBranch}`, "green");
  shell.exec(`git checkout ${releaseBranch}`);
  shell.exec(`git pull origin ${releaseBranch}`);

  colorLog(`Merging ${developmentBranch} into ${newBranch}`, "green");
  shell.exec(`git checkout -b ${newBranch}`);
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
  debugger;
  const { jiraID, releaseBranch, k8sPath, oldTag, newTag } = trimAnswers(
    updateTagAnswers,
    ["jiraID", "releaseBranch", "k8sPath", "oldTag", "newTag"]
  );
  const updatTagBranch = `updateTags-${jiraID}-${CURRENT_DATE_DDMMYY()}`;
  const oldTags = oldTag.split(",").map((tag) => tag.trim());
  const newTagTrimmed = newTag.trim();

  colorLog(`Syncing ${releaseBranch}`, "green");
  shell.exec(`git checkout ${releaseBranch}`);
  shell.exec(`git pull origin ${releaseBranch}`);

  colorLog(`Creating ${updatTagBranch} from ${releaseBranch}`, "green");
  shell.exec(`git checkout -b ${updatTagBranch}`);

  colorLog(
    `Updating release tags to ${newTag} from ${oldTag} in deployment.yaml files in ${k8sPath}`,
    "green"
  );
  for (let oldTagTrimmed of oldTags) {
    colorLog(`Updating tag ${oldTagTrimmed} to ${newTagTrimmed}`, "green");
    shell.exec(
      `find ${k8sPath} -type f -name 'deployment.yaml' -exec perl -pi -e 's/${oldTagTrimmed}/${newTagTrimmed}/g' {} \\;`
    );
  }

  colorLog(`Adding all modified deployment.yaml files to git...`, "green");
  shell.exec(`git add $(git diff --name-only | grep 'deployment.yaml')`);

  colorLog(`Committing changes...`, "green");
  shell.exec(
    `git commit -m "chore: [skip ci] ${jiraID} update tags ${oldTags.join(
      ", "
    )} -> ${newTagTrimmed}"`
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
  shell.exec(`git checkout ${releaseBranch}`);
  shell.exec(`git pull origin ${releaseBranch}`);

  colorLog(`Syncing ${developmentBranch}`, "green");
  shell.exec(`git checkout ${developmentBranch}`);
  shell.exec(`git pull origin ${developmentBranch}`);

  colorLog(`Merging ${releaseBranch} into ${newBranch}`, "green");
  shell.exec(`git checkout -b ${newBranch}`);
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
