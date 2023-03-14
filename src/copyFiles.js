import ncp from "ncp";
import path from "path";

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
  //   {
  //     src: path.join($INIT_CWD, 'node_modules', 'my-package', 'file2.js'),
  //     dest: path.join($INIT_CWD, 'lib', 'file2.js'),
  //   },
  //   {
  //     src: path.join($INIT_CWD, 'node_modules', 'my-package', 'file3.js'),
  //     dest: path.join($INIT_CWD, 'dist', 'file3.js'),
  //   },
];

const copyFile = (src, dest) => {
  ncp(src, dest, { clobber: false, stopOnErr: true }, (err) => {
    if (err) {
      console.error(`Failed to copy ${src}: ${err}`);
      process.exit(1);
    }

    console.log(`Successfully copied ${src} to ${dest}`);
  });
};

const copyFiles = () => {
  for (const file of filesToCopy) {
    copyFile(file.src, file.dest);
  }

  console.log("All files copied successfully!");
};

copyFiles();
