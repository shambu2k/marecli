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
    name: "oldTag",
    message:
      "Enter the old tags (if there are different tags, enter them separated by comma):",
    validate: (value) => validateInput(value, "Please enter the old tag(s)"),
  },
  {
    type: "input",
    name: "newTag",
    message: "Enter the new tag:",
    validate: (value) => validateInput(value, "Please enter the new tag"),
  },
];
