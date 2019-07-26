# stylelint-teamcity-reporter

Outputs [stylelint](https://stylelint.io) results compatible with [TeamCity](https://confluence.jetbrains.com/display/TCD10/Build+Script+Interaction+with+TeamCity#BuildScriptInteractionwithTeamCity-ReportingTests).

## Usage

Install from npm:

```
npm install --save-dev stylelint-teamcity-reporter
```

or Yarn:

```
yarn add -D stylelint-teamcity-reporter
```

Then, set stylelint's custom formatter to the package. To do this from CLI, use:

```
stylelint \"**/*.css\" --custom-formatter=node_modules/stylelint-teamcity-reporter
```

## Configuration

Without any configuration, stylelint results will be reported as tests on a TeamCity build (`"reporter": "errors"`). You can also configure it to produce code inspection-style output (`"reporter": "inspections"`), which is displayed on the "Code Inspections" tab in TeamCity.
Settings are looked for in the following priority:

#### 1. From your package.json
If you have a package.json file in the current directory, you can add an extra "stylelint-teamcity-reporter" property to it:

```json
{
  "stylelint-teamcity-reporter": {
    "reporter": "inspections"
  }
}
```

#### 2. ENV variables

```sh
export STYLELINT_TEAMCITY_REPORTER="inspections"
```