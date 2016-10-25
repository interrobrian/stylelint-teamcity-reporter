module.exports = (stylelintResults) => {
  function tcEscape(message) {
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
    for (key in properties)
    {
      message += ` ${key}='${tcEscape(properties[key])}'`;
    }
    message += "]\n";
    return message;
  }

  let resultString = "";
  stylelintResults
    .forEach(fileResults => {
      resultString += formatTeamCityMessage("testSuiteStarted", { name: fileResults.source });
      fileResults.warnings.forEach(warning => {
        const testName = `(${warning.line}, ${warning.column}) ${warning.rule}`;
        const testMessage = warning.text;
        if(fileResults.ignored) {
          resultString += formatTeamCityMessage("testIgnored", { name: testName, message: testMessage });
        } else {
          resultString += formatTeamCityMessage("testStarted", { name: testName });
          if (warning.severity === "error") {
            resultString += formatTeamCityMessage("testFailed", { name: testName, message: testMessage });
          }
          resultString += formatTeamCityMessage("testFinished", { name: testName });
        }
      });
      resultString += formatTeamCityMessage("testSuiteFinished", { name: fileResults.source });
    });
    return resultString;
}
