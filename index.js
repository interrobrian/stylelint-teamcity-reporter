"use strict";

const fs = require("fs");

module.exports = (stylelintResults) => {
  function tcEscape(message) {
    if(!message.replace) {
      return message;
    }
    return message
      .replace("'", "|'")
      .replace("\n", "|n")
      .replace("\r", "|r")
      .replace("|", "||")
      .replace("[", "|[")
      .replace("]", "|]");
  }

  function formatTeamCityMessage(name, properties) {
    let message = `##teamcity[${tcEscape(name)}`;
    for (const key in properties)
    {
      message += ` ${key}='${tcEscape(properties[key])}'`;
    }
    message += "]\n";
    return message;
  }

  function getResultsAsTestFailures(lintingResults) {
    let resultString = "";
    lintingResults
      .forEach(fileResults => {
        if(fileResults.errored) {
          const testSuiteName = `stylelint: ${fileResults.source}`;
          resultString += formatTeamCityMessage("testSuiteStarted", { name: testSuiteName });
          fileResults.warnings.forEach(warning => {
            const testName = `(${warning.line}, ${warning.column}) ${warning.text}`;
            const testMessage = `[${warning.rule}] ${warning.text}`;
            if(fileResults.ignored) {
              resultString += formatTeamCityMessage("testIgnored", { name: testName, message: testMessage });
            } else {
              resultString += formatTeamCityMessage("testStarted", { name: testName });
              if(warning.severity === "error") {
                resultString += formatTeamCityMessage("testFailed", { name: testName, message: testMessage });
              }
              resultString += formatTeamCityMessage("testFinished", { name: testName });
            }
          });
          resultString += formatTeamCityMessage("testSuiteFinished", { name: testSuiteName });
        }
      });
    return resultString;
  }

  function formatPath(path) {
    return path
      .replace(__dirname, "")
      .substring(1)
      .replace(/\\/g, "/");
  }

  function getResultsAsInspections(lintingResults) { 
    let resultString = "";
    const inspectionTypes = {};
    const deprecations = "deprecations";
    const invalidRuleOptions = "invalid-rule-options";
    lintingResults
      .forEach(fileResults => {
        if(fileResults.errored) {
          const sourceFile = formatPath(fileResults.source);
          fileResults.warnings.forEach(warning => {
            if(!inspectionTypes[warning.rule]) { 
              inspectionTypes[warning.rule] = true;
              resultString += formatTeamCityMessage("inspectionType", {
                id: warning.rule,
                name: warning.rule,
                category: "Rule Violations",
                description: `Stylelint ${warning.rule} rule violations`
              });
            }
            const severity = fileResults.ignored ? "INFO" : warning.severity === "error" ? "ERROR" : "WARNING";
            resultString += formatTeamCityMessage("inspection", {
              typeId: warning.rule,
              message: `line ${warning.line}, col ${warning.column}: ${warning.text}`,
              file: sourceFile,
              line: warning.line,
              SEVERITY: severity
            });
          });
          fileResults.deprecations.forEach(deprecation => {
            if(!inspectionTypes[deprecations]) { 
              inspectionTypes[deprecations] = true;
              resultString += formatTeamCityMessage("inspectionType", {
                id: deprecations,
                name: deprecations,
                category: "Deprecated Features",
                description: "Features that will be removed in the next major version"
              });
            }
            resultString += formatTeamCityMessage("inspection", {
              typeId: deprecations,
              message: `${deprecation.text} See more at ${deprecation.reference}`,
              file: sourceFile,
              SEVERITY: "WEAK WARNING"
            });
          });
          fileResults.invalidOptionWarnings.forEach(warning => {
            if(!inspectionTypes[invalidRuleOptions]) { 
              inspectionTypes[invalidRuleOptions] = true;
              resultString += formatTeamCityMessage("inspectionType", {
                id: invalidRuleOptions,
                name: invalidRuleOptions,
                category: "Invalid Options",
                description: "Invalid or unknown rule configuration options"
              });
            }
            resultString += formatTeamCityMessage("inspection", {
              typeId: invalidRuleOptions,
              message: warning.text,
              file: sourceFile,
              SEVERITY: "ERROR"
            });
          });
        }
      });
    return resultString;
  }

  function loadUserConfigFromPackageJson() {
    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json"));
      return packageJson["stylelint-teamcity-reporter"] || {};
    } catch (e) {
      console.warn("Unable to load config from package.json");
      return {};
    }
  }

  const config = loadUserConfigFromPackageJson();
  const reporter = config.reporter || process.env.STYLELINT_TEAMCITY_REPORTER || "errors";

  if (reporter === "inspections") { 
    return getResultsAsInspections(stylelintResults);
  }

  return getResultsAsTestFailures(stylelintResults);
}
