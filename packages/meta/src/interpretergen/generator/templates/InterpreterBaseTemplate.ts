import { PiLanguage } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils/index";
import { PiInterpreterDef } from "../../metalanguage/PiInterpreterDef";

export class InterpreterBaseTemplate {
    constructor() {}

    /**
     * The base class containing all interpreter functions that should be defined.
     * @param language
     * @param interpreterDef
     */
    public interpreterBase(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        return `// Generated my Freon, will be overwritten with every generation.
        import { InterpreterContext, RtObject, RtError } from "@projectit/core";
        import { ${interpreterDef.conceptsToEvaluate.map((c) => Names.concept(c)).join(",")} } from "../../language/gen";
        import { ${Names.interpreterContext(language)} } from "./${Names.interpreterTypesname(language)}";
        
        /**
         * The base class containing all interpreter functions that should be defined. 
         * All functions throw an error when called.
         */
        export class ${Names.interpreterBaseClassname(language)} {
        
            constructor() {}
            
            ${interpreterDef.conceptsToEvaluate
                .map(
                    (c) =>
                        `eval${Names.concept(c)} (node: ${Names.concept(c)} , ctx: ${Names.interpreterContext(language)}): RtObject {
                    throw new RtError("eval${Names.concept(c)} is not defined");
                }`
                )
                .join("\n\n")}
        }
        `;
    }

    public interpreterClass(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        const baseName = Names.interpreterBaseClassname(language);
        return `// Generated my Freon once, will NEVER be overwritten.
        import { InterpreterContext, IMainInterpreter, RtObject } from "@projectit/core";
        import { ${baseName} } from "./gen/${baseName}";
        import { ${Names.mainInterpreterInterface(language)} } from "./gen/${Names.interpreterTypesname(language)}";
        
        let main: ${Names.mainInterpreterInterface(language)};
        
        /**
         * The class containing all interpreter functions twritten by thge language engineer. 
         * This class is initially empty,  and will not be overwritten if it already exists..
         */
        export class ${Names.interpreterClassname(language)} extends ${baseName} {
        
            constructor(m: ${Names.mainInterpreterInterface(language)}) {
                super();
                main = m;
            }
        }
        `;
    }

    public interpreterInit(language: PiLanguage, interpreterDef: PiInterpreterDef): string {
        const interpreter = Names.interpreterClassname(language);
        return `import { ${Names.mainInterpreterInterface(language)} } from "./${Names.interpreterTypesname(language)}";
        import { ${interpreter} } from "../${interpreter}";
        
        /**
         * The class that registers all interpreter function with the main interpreter. 
         */
        export function ${Names.interpreterInitname(language)}(main: ${Names.mainInterpreterInterface(language)}) {
            const interpreter = new ${interpreter}(main);
            
            ${interpreterDef.conceptsToEvaluate
                .map((c) => {
                    return `main.registerFunction("${Names.concept(c)}", interpreter.eval${Names.concept(c)});`;
                })
                .join("\n")} // DONE

        }`;
    }
}
