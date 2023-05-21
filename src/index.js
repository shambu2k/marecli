#!/usr/bin/env node
import inquirer from "inquirer";

import {
  createBranch,
  raiseRelease,
  raiseUpdateTag,
  raiseBackmerge,
} from "./functions.js";
import { CHECK_GIT_DIR, colorLog } from "./utils.js";
import { INITIAL_QUESTIONS } from "./questions.js";

CHECK_GIT_DIR();

const answers = await inquirer.prompt(INITIAL_QUESTIONS);
switch (answers.operation) {
  case "Create branch (feature/hotfix/bugfix)":
    createBranch(inquirer);
    break;
  case "Raise master to release":
    raiseRelease(inquirer);
    break;
  case "Update tags":
    raiseUpdateTag(inquirer);
    break;
  case "Raise backmerge":
    raiseBackmerge(inquirer);
    break;
  default:
    colorLog("Feature not yet implemented.", "yellow");
}
