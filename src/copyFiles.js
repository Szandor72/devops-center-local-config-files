const path = require("path");
const fs = require("fs-extra");

const filesToCopy = [
  {
    src: path.join(
      process.env.INIT_CWD,
      "node_modules",
      "devops-center-local-config-files",
      "pmd-rulesets",
      "apex-ruleset.xml"
    ),
    dest: path.join(process.env.INIT_CWD, "apex-ruleset.xml"),
  },
];

const copyFile = async (src, dest) => {
  try {
    fs.copy(src, dest, {
      overwrite: false,
      errorOnExist: true,
      stopOnErr: true,
    });
    console.log(`Successfully copied ${src} to ${dest}`);
  } catch (error) {
    console.error(`Failed to copy ${src}: ${error}`);
    process.exit(1);
  }
};

const copyFiles = async () => {
  for (const file of filesToCopy) {
    if (fs.existsSync(file.dest)) {
      console.log(`File ${file.dest} already exists, skipping...`);
      continue;
    }
    await copyFile(file.src, file.dest);
  }

  console.log("All files copied successfully!");
};

copyFiles();
