import shell from "shelljs";

export const colorLog = (message, color) => {
  const colorCodes = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
  };
  console.log(`${colorCodes[color]}%s${colorCodes.reset}`, message);
};

export const CHECK_GIT_DIR = () => {
  // Check if current directory is a Git repository
  if (!shell.which("git")) {
    colorLog("Sorry, this script requires git", "red");
    shell.exit(1);
  } else if (
    !shell.exec("git rev-parse --is-inside-work-tree", { silent: true }).stdout
  ) {
    colorLog("The current directory is not a git repository", "yellow");
    shell.exit(1);
  }
};

export const CURRENT_DATE_DDMMYY = () => {
  const now = new Date();
  const formattedDate =
    ("0" + now.getDate()).slice(-2) +
    ("0" + (now.getMonth() + 1)).slice(-2) +
    now.getFullYear().toString().slice(-2);
  return formattedDate;
};

export const validateInput = (value, errMsg) => {
  const pass = value.trim().length > 0;
  if (pass) return true;
  return errMsg;
};

export const trimAnswers = (answers, keysToTrim) => {
  let trimmedAnswers = {};
  for (let key in answers) {
    if (keysToTrim.includes(key) && typeof answers[key] === 'string') {
      trimmedAnswers[key] = answers[key].trim();
    } else {
      trimmedAnswers[key] = answers[key];
    }
  }
  return trimmedAnswers;
};
