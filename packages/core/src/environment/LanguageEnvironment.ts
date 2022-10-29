import { PiEditor, PiProjection } from "../editor/index";
import { PiEnvironment } from "../environment/index";
import { PiModel } from "../ast/index";
import { FreonInterpreter } from "../interpreter/index";
import { PiReader } from "../reader/index";
import { FreScoperComposite } from "../scoper/index";
import { PiStdlib } from "../stdlib/index";
import { FreCompositeTyper } from "../typer/index";
import { PiValidator } from "../validator/index";
import { PiWriter } from "../writer/index";

export class LanguageEnvironment implements PiEnvironment {
    private static theInstance: PiEnvironment = null;

    static setInstance(env: PiEnvironment): void {
        LanguageEnvironment.theInstance = env;
    }

    static getInstance(): PiEnvironment {
        if (LanguageEnvironment.theInstance === null) {
            LanguageEnvironment.theInstance = new LanguageEnvironment();
        }
        return LanguageEnvironment.theInstance;
    }

    public scoper: FreScoperComposite = null;
    public typer: FreCompositeTyper = null;
    public projection: PiProjection = null;
    public editor: PiEditor;
    public fileExtensions: Map<string, string>;
    public languageName: string;
    public reader: PiReader;
    public stdlib: PiStdlib;
    public unitNames: string[];
    public validator: PiValidator;
    public writer: PiWriter;
    public interpreter: FreonInterpreter<Object, Object>;

    public newModel(modelName: string): PiModel {
        return undefined;
    }
}
