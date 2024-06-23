// Generated by the Freon Language Generator.
import { FreProjection, FreCombinedActions, FreTyper, FreStdlib, FreScoper } from "@freon4dsl/core";
import { CustomExampleActions, CustomExampleProjection } from "../editor";
import { CustomExampleScoper } from "../scoper";
import { CustomExampleTyperPart } from "../typer";
import { CustomExampleValidator } from "../validator";
import { CustomExampleStdlib } from "../stdlib";
import { ExampleCheckerInterface } from "../validator/gen";

/**
 * Class FreonConfiguration is the place where you can add all your customisations.
 * These will be used through the 'freonConfiguration' constant by any generated
 * part of your language environment.
 */
class FreonConfiguration {
    // add your custom editor projections here
    customProjection: FreProjection[] = [new CustomExampleProjection()];
    // add your custom editor actions here
    customActions: FreCombinedActions[] = [new CustomExampleActions()];
    // add your custom validations here
    customValidations: ExampleCheckerInterface[] = [new CustomExampleValidator()];
    // add your custom scopers here
    customScopers: FreScoper[] = [new CustomExampleScoper()];
    // add your custom type-providers here
    customTypers: FreTyper[] = [new CustomExampleTyperPart()];
    // add extra predefined instances here
    customStdLibs: FreStdlib[] = [new CustomExampleStdlib()];
}

export const freonConfiguration = new FreonConfiguration();
