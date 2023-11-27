import path = require("path");
import fs = require("fs-extra");

const sourcePath = path.join(
  process.env.INIT_CWD,
  "node_modules",
  "devops-center-local-config-files"
);

const targetPath = process.env.INIT_CWD;

const ciScripts = [
  {
    src: path.join(sourcePath, "ci-scripts", "prepare-scan.js"),
    dest: path.join(
      targetPath,
      ".ci",
      "prepare-scan.js"
    ),
  },
  {
    src: path.join(sourcePath, "ci-scripts", "parse-scan-results.js"),
    dest: path.join(
      targetPath,
      ".ci",
      "parse-scan-results.js"
    ),
  },
]

const eslintConfigFiles = [
  {
    src: path.join(sourcePath, "eslint-config", ".eslintignore"),
    dest: path.join(targetPath, ".eslintignore"),
  },
  {
    src: path.join(sourcePath, "eslint-config", "aura-eslintrc.json"),
    dest: path.join(
      targetPath,
      "force-app",
      "main",
      "default",
      "aura",
      ".eslintrc.json"
    ),
  },
  {
    src: path.join(sourcePath, "eslint-config", "lwc-eslintrc.json"),
    dest: path.join(
      targetPath,
      "force-app",
      "main",
      "default",
      "lwc",
      ".eslintrc.json"
    ),
  },
];

const jestConfigFiles = [
  {
    src: path.join(sourcePath, "jest-config", "jest.config.js"),
    dest: path.join(targetPath, "jest.config.js"),
  },
];

const jsConfigFiles = [
  {
    src: path.join(sourcePath, "js-config", "jsconfig.json"),
    dest: path.join(
      targetPath,
      "force-app",
      "main",
      "default",
      "lwc",
      "jsconfig.json"
    ),
  },
];

const pmdConfigFiles = [
  {
    src: path.join(sourcePath, "pmd-rulesets", "apex-ruleset.xml"),
    dest: path.join(targetPath, ".pmd", "apex-ruleset.xml"),
  },
  {
    src: path.join(sourcePath, "pmd-rulesets", "flow-ruleset.xml"),
    dest: path.join(targetPath, ".pmd", "flow-ruleset.xml"),
  },
  {
    src: path.join(sourcePath, "pmd-rulesets", "misc-ruleset.xml"),
    dest: path.join(targetPath, ".pmd", "misc-ruleset.xml"),
  },
  {
    src: path.join(sourcePath, "pmd-rulesets", "sobject-ruleset.xml"),
    dest: path.join(targetPath, ".pmd", "sobject-ruleset.xml"),
  },
];

const prettierConfigFiles = [
  {
    src: path.join(sourcePath, "prettier-config", ".prettierrc"),
    dest: path.join(targetPath, ".prettierrc"),
  },
  {
    src: path.join(sourcePath, "prettier-config", ".prettierignore"),
    dest: path.join(targetPath, ".prettierignore"),
  },
];

const filesToCopy = [
  ...ciScripts,
  ...eslintConfigFiles,
  ...jestConfigFiles,
  ...jsConfigFiles,
  ...pmdConfigFiles,
  ...prettierConfigFiles,
];

const copyFile = (src, dest) => {
  const filename = path.basename(src);
  try {
    fs.copySync(src, dest);
    console.log(`Copied ${filename}`);
  } catch (error) {
    console.error(`Failed to copy ${filename}: ${error}`);
    process.exit(1);
  }
};

const main = () => {
  for (const file of filesToCopy) {
    if (fs.existsSync(file.dest)) {
      console.log(`File ${file.dest} already exists, skipping...`);
      continue;
    }
    fs.ensureDirSync(path.dirname(file.dest));
    copyFile(file.src, file.dest);
  }
};

main();
