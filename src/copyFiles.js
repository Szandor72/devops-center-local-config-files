const path = require("path");
const fs = require("fs-extra");

const sourcePath = path.join(
  process.env.INIT_CWD,
  "node_modules",
  "devops-center-local-config-files"
);

const targetPath = process.env.INIT_CWD;

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

const pmdConfigFiles = [
  {
    src: path.join(sourcePath, "pmd-rulesets", "apex-ruleset.xml"),
    dest: path.join(targetPath, ".pmd", "apex-ruleset.xml"),
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
  ...eslintConfigFiles,
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

const copyFiles = () => {
  for (const file of filesToCopy) {
    if (fs.existsSync(file.dest)) {
      console.log(`File ${file.dest} already exists, skipping...`);
      continue;
    }
    fs.ensureDirSync(path.dirname(file.dest));
    copyFile(file.src, file.dest);
  }
};

copyFiles();