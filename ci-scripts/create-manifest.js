// queries devops center production org to get all metadata components which need deployment. Will create a manifest file with the results
// will run against sf cli default org, so make sure to set it properly before running this script
import execa from "execa";

/**
 * Queries Salesforce for source members based on the branch name.
 * @param {string} branchName - The name of the branch.
 * @returns {Promise<boolean>} - A promise that resolves to true if records are found, false otherwise.
 * @throws {Error} - If there is an error querying Salesforce.
 */
async function querySourceMembers(branchName) {
  if (!branchName) {
    console.error("Branch name not provided. Skipping manifest generation");
    return [];
  }
  try {
    const soqlQuery = `SELECT Id, 
                              Name, 
                              sf_devops__Source_Component__c 
                       FROM sf_devops__Remote_Change__c 
                       WHERE (sf_devops__Remote_Change_Type__c = 'ADD' 
                              OR sf_devops__Remote_Change_Type__c = 'CHANGE') 
                       AND sf_devops__Change_Submission__r.sf_devops__Work_Item__r.Name = '${branchName}'`;
    const queryCommand = [
      "sf",
      "data",
      "query",
      "--query",
      `${soqlQuery}`,
      "--result-format",
      "json",
    ];

    const { stdout } = await execa(queryCommand[0], queryCommand.slice(1));
    const response = JSON.parse(stdout);

    return response?.result?.records?.length > 0 ? response.result.records : [];
  } catch (error) {
    console.error("Error querying Salesforce:", error);
    throw error; // Rethrow to handle in the calling function
  }
}

/**
 * Generates the package.xml content based on the queried records.
 * @param {Array} records - The queried records.
 */
async function generatePackageXml(records) {
  if (records.length == 0) {
    console.warn("No records found. Skipping package.xml generation");
    return;
  }
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
      ...metadata_list,
    ]);
    console.log(stdout);
  } catch (error) {
    console.error("Error generating package.xml:", error);
    throw error; // Rethrow to handle in the calling function
  }
}

const branchName = process.argv[2];
const changedComponents = await querySourceMembers(branchName);
await generatePackageXml(changedComponents);
