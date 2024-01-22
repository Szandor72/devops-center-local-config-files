/**
 * queries devops center production org to get all metadata components which need deployment.
 * Will create a manifest file with the results
 * will run against sf cli default org, so make sure to set it properly before running this script
 */
import execa from "execa";

/**
 * Queries Salesforce for source members based on the branch name.
 * @param {string} branchName - The name of the branch.
 * @returns {Promise<boolean>} - A promise that resolves to true if records are found, false otherwise.
 * @throws {Error} - If there is an error querying Salesforce.
 */
async function querySubmittedComponents(branchName) {
  if (!branchName) {
    console.error("Branch name not provided. Skipping manifest generation");
    return [];
  }
  try {
    const soqlQuery = `SELECT Id, 
                          CreatedDate, 
                          sf_devops__Source_Component__c, 
                          sf_devops__File_Path__c, 
                          sf_devops__Operation__c 
                       FROM sf_devops__Submit_Component__c 
                       WHERE sf_devops__Empty__c = false 
                          AND sf_devops__Change_Submission__r.sf_devops__Work_Item__r.Name = '${branchName}' 
                       ORDER BY CreatedDate ASC`;

    const queryCommand = [
      "sf",
      "data",
      "query",
      "--query",
      soqlQuery.replace(/\n/g, ""),
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
 * Parses the queried records to determine which components need to be deployed.
 * If the last operation is REMOVE, the component is not included because it
 * needs to be treated as destructive change
 * @param {Array} records - The queried records.
 */
function parseOperations(records) {
  let componentsWithOperations = new Map();
  records.forEach((record) => {
    if (!componentsWithOperations.has(record.sf_devops__Source_Component__c)) {
      componentsWithOperations.set(record.sf_devops__Source_Component__c, []);
    }
    componentsWithOperations.get(record.sf_devops__Source_Component__c).push({
      operation: record.sf_devops__Operation__c,
      date: record.CreatedDate,
    });
  });

  const componentsToDeploy = new Array();
  componentsWithOperations.forEach((operationDetails, metadataComponent) => {
    if (operationDetails[operationDetails.length - 1].operation != "REMOVE") {
      componentsToDeploy.push(metadataComponent);
    }
  });
  return componentsToDeploy;
}

/**
 * Generates the package.xml content based on a list of component names.
 * @param {Array} componentsToDeploy - The list of component names (eg ApexClass:AccountService)
 */
async function generatePackageXml(componentsToDeploy) {
  if (componentsToDeploy.length == 0) {
    console.warn("No components found. Skipping package.xml generation");
    return;
  }
  const metadata_list = new Array();
  componentsToDeploy.forEach((componentName) => {
    metadata_list.push("--metadata");
    metadata_list.push(componentName);
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
const changedComponents = await querySubmittedComponents(branchName);
const componentsToDeploy = parseOperations(changedComponents);
await generatePackageXml(componentsToDeploy);
