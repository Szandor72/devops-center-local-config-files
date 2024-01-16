// queries devops center production org to get all metadata components which need deployment. Will create a manifest file with the results
// query: select id, name, sf_devops__Source_Component__c from sf_devops__Remote_Change__c where sf_devops__Change_Submission__r.sf_devops__Work_Item__r.Name = 'WI-000030'

import execa from "execa";

const DEVOPS_CENTER_HOME_ORGANIZATION = "OHEV-PROD";

/**
 * Queries Salesforce for source members based on the branch name.
 * @param {string} branchName - The name of the branch.
 * @returns {Promise<boolean>} - A promise that resolves to true if records are found, false otherwise.
 * @throws {Error} - If there is an error querying Salesforce.
 */
async function querySourceMembers(branchName) {
  try {
    const soqlQuery = `SELECT Id, Name, sf_devops__Source_Component__c FROM sf_devops__Remote_Change__c WHERE sf_devops__Change_Submission__r.sf_devops__Work_Item__r.Name = '${branchName}'`;
    const queryCommand = [
      "sf",
      "data",
      "query",
      "--query",
      `${soqlQuery}`,
      "--result-format",
      "json",
      "--target-org",
      DEVOPS_CENTER_HOME_ORGANIZATION,
    ];

    const { stdout } = await execa(queryCommand[0], queryCommand.slice(1));
    const result = JSON.parse(stdout);

    return result?.records?.length > 0 ? result.records : [];
  } catch (error) {
    console.error("Error querying Salesforce:", error);
    throw error; // Rethrow to handle in the calling function
  }
}

/**
 * Generates the package.xml content based on the queried records.
 * @param {Array} records - The queried records.
 * @returns {Promise<string>} - A promise that resolves to the package.xml content.
 */
async function generatePackageXml(records) {
  let metadata_list = new Array();
  records.forEach((record) => {
    metadata_list.push("--metadata");
    metadata_list.push(record.sf_devops__Source_Component__c);
  });
  try {
    const { stdout } = await execa("sf", [
      "project",
      "generate",
      "manifest",
      "",
      ...metadata_list,
    ]);
    return stdout;
  } catch (error) {
    console.error("Error generating package.xml:", error);
    throw error; // Rethrow to handle in the calling function
  }
}

const branchName = process.argv[2];
const changedComponents = await querySourceMembers(branchName);
await generatePackageXml(changedComponents);
