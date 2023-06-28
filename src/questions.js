import { validateInput } from "./utils.js";

export const INITIAL_QUESTIONS = [
  {
    type: "list",
    name: "operation",
    message: "What do you want to do?",
    choices: [
      "Create branch (feature/hotfix/bugfix)",
      "Raise master to release",
      "Update tags",
      "Raise backmerge",
      "Sync current branch",
    ],
  },
];

export const CREATE_BRANCH_PROMPTS = [
  {
    type: "list",
    name: "branchType",
    message: "Select the type of branch:",
    choices: ["feature", "hotfix", "bugfix"],
  },
  {
    type: "input",
    name: "developmentBranch",
    message: "Enter the development branch to checkout from (default: master):",
    default: "master",
  },
  {
    type: "input",
    name: "jiraID",
    message: "Enter the JIRA ID:",
    validate: (value) => validateInput(value, "Please enter a JIRA ID"),
  },
];

export const RAISE_RELEASE_PROMPTS = [
  {
    type: "input",
    name: "developmentBranch",
    message: "Enter the development branch (default: master):",
    default: "master",
  },
  {
    type: "input",
    name: "releaseBranch",
    message: "Enter the release branch:",
    validate: (value) =>
      validateInput(value, "Please enter the release branch"),
  },
];

export const RAISE_UPDATE_TAG_PROMPTS = [
  {
    type: "input",
    name: "jiraID",
    message: "Enter the JIRA ID:",
    validate: (value) => validateInput(value, "Please enter a JIRA ID"),
  },
  {
    type: "input",
    name: "releaseBranch",
    message: "Enter the release branch:",
    validate: (value) =>
      validateInput(value, "Please enter the release branch"),
  },
  {
    type: "input",
    name: "k8sPath",
    message: "Enter the path of the k8s dir:",
    default: "./k8s",
  },
  {
    type: "input",
    name: "environments",
    message: "Enter the environment(s) to update tags (gamma,prod-test,prod):",
    default: "gamma,prod-test,prod",
  },
  {
    type: "input",
    name: "newTag",
    message: "Enter the new tag:",
    validate: (value) => validateInput(value, "Please enter the new tag"),
  },
];

export const SYNC_CURRENT_BRANCH = [
  {
    type: "input",
    name: "syncFromBranch",
    message:
      "Make sure all your changes are committed!! and then Enter the branch to sync from:",
    default: "master",
  },
];
