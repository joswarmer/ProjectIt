# README
This is a package that is used solely to start the Freon webapp with one of the example languages 
from packages/samples. The command 'npm run dev' bundles the required packages and starts the webapp at port 8000.

## Change to a different sample language
To change to a different language from the samples folder, do the following.

1. In `package.json` adjust the dependencies to the required sample language. 
E.g. change `"@freon4dsl/samples-example": "1.0.0"` to `"@freon4dsl/samples-calculator": "1.0.0"`. Note that 
you must use the name for the language that is specified in its `package.json`, as well as the correct version.

2. Change the name of the language in the command: 
    ````
       "build-dev": "cd ../../packages/samples/Calculator && npm run build",
    
    ````
3. In `src/starter.ts` change the import of the language environment into environment of the required sample 
language. For example, change the following lines ...
    ```typescript
    /**
    * The one and only reference to the actual language for which this editor runs
    */
      import {ExampleEnvironment} from "@freon4dsl/samples-example";
      WebappConfigurator.getInstance().setEditorEnvironment(ExampleEnvironment.getInstance());
    ```
    
    into ...
    
    ```typescript
    /**
    * The one and only reference to the actual language for which this editor runs
    */
      import {CalculatorModelEnvironment} from "@freon4dsl/samples-calculator";
      WebappConfigurator.getInstance().setEditorEnvironment(CalculatorModelEnvironment.getInstance());
    ```
4. Add any external components that are used in the project's .edit files to `src/starter.ts`. For example, 
add the following when you want to use the InsuranceModel.

    ```typescript
    setCustomComponents([
        {component: ShowAnimatedGif, knownAs: "AnimatedGif"},
        {component: SMUI_Card_Component, knownAs: "SMUI_Card"},
        {component: SMUI_Accordion, knownAs: "SMUI_Accordion"},
        {component: SMUI_Dialog, knownAs: "SMUI_Dialog"},
        {component: DatePicker, knownAs: "DatePicker"}
    ]);
    ```

## Run build-dev or build from the top-level 
To make sure that the sample language and other packages are build, you can use either of the following 
two commands. Note that both need to be run from the top-level of the directory structure, e.g. 
`"~/WebstormProjects/Freon"`.

Use

```
npm run build
```
or 
```
npm run build-dev
```

The first command builds everything in the project, including all the sample languages and all languages in the test package. 
The second command skips the test package and all languages in samples directory except the one indicated in the script
in the `webapp-starter/package.json`:
```
"build-dev": "cd ../../packages/samples/Example && npm run build",
```
If you want to use the second command, which saves time, don't forget to adjust the line in the 
`webapp-starter/package.json` to the right sample language. For instance:
```
"build-dev": "cd ../../packages/samples/Calculator && npm run build",
```
