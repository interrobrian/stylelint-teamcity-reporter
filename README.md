# stylelint-teamcity-formatter

Outputs stylelint results compatible with [TeamCity](https://confluence.jetbrains.com/display/TCD10/Build+Script+Interaction+with+TeamCity#BuildScriptInteractionwithTeamCity-ReportingTests).

## Usage

Install from npm:

```
npm install stylelint-teamcity-formatter
```

Then, set stylelint's custom formatter to index.js from this project. To do this from CLI, use:

```
stylelint \"**/*.css\" --custom-formatter=node_modules/stylelint-teamcity-formatter/index.js
```