import { PiLanguage } from "../languagedef/metalanguage";
import { PiEditUnit } from "../editordef/metalanguage";
import { PiEditParser } from "../editordef/parser/PiEditParser";
import { PiTyperParser } from "../typerdef/parser/PiTyperParser";
import { PiTyperGenerator } from "../typerdef/generator/PiTyperGenerator";
import { FileWatcher } from "../utils/FileWatcher";
import { ValidatorGenerator } from "../validatordef/generator/ValidatorGenerator";
import { LanguageParser } from "../languagedef/parser/LanguageParser";
import { ScoperParser } from "../scoperdef/parser/ScoperParser";
import { ProjectItGenerateAction } from "./ProjectitGenerateAction";
import { ValidatorParser } from "../validatordef/parser/ValidatorParser";
import { LanguageGenerator } from "../languagedef/generator/LanguageGenerator";
import { ScoperGenerator } from "../scoperdef/generator/ScoperGenerator";
import { EditorGenerator } from "../editordef/generator/EditorGenerator";
import { PiTypeDefinition } from "../typerdef/metalanguage";
import { PiScopeDef } from "../scoperdef/metalanguage";
import { PiValidatorDef } from "../validatordef/metalanguage";
import { ReaderWriterGenerator } from "../parsergen/ReaderWriterGenerator";

import { MetaLogger } from "../utils/MetaLogger";

const LOGGER = new MetaLogger("ProjectItGenerateAllAction"); //.mute();

export class ProjectItGenerateAllAction extends ProjectItGenerateAction {
    public watch: boolean = false;

    protected languageGenerator: LanguageGenerator = new LanguageGenerator();
    protected editorGenerator: EditorGenerator = new EditorGenerator();
    protected parserGenerator: ReaderWriterGenerator = new ReaderWriterGenerator();
    protected scoperGenerator: ScoperGenerator = new ScoperGenerator();
    protected validatorGenerator: ValidatorGenerator = new ValidatorGenerator();
    protected typerGenerator: PiTyperGenerator = new PiTyperGenerator();
    protected language: PiLanguage;

    public constructor() {
        super({
            actionName: "all",
            summary: "Generates the TypeScript code for all parts of the work environment for your language",
            documentation:
                "Generates TypeScript code for the language implemention, the editor, the scoper, the typer, the reader, the writer, and the " +
                "validator for language as defined in files in DEFINITIONS_DIR."
        });
    }

    generate(): void {
        LOGGER.info(this, "Starting generation of all parts of your language as defined in " + this.defFolder.value);
        // LOGGER.log("Output will be generated in: " + this.outputFolder);

        // this try-catch is here for debugging purposes, should be removed from release
        try {
            this.findDefinitionFiles();
            this.addWatchers();

            // generate the language
            try {
                this.generateLanguage();
                this.generateEditorAndParser();
                this.generateValidator();
                this.generateScoper();
                this.generateTyper();
            } catch (e) {
                LOGGER.error(this, "Stopping generation because of errors in the language definition: " + e.message + "\n");
            }
            if (this.watch) {
                LOGGER.info(this, "Watching language definition files ...");
            }
        // this try-catch is here for debugging purposes, should be removed from release
        } catch (e) {
            LOGGER.error(this, e.stack);
        }
    }

    private addWatchers() {
        if (this.watch) {
            for (const file of this.languageFiles) {
                new FileWatcher(file, this.generateLanguage);
            }
            for (const file of this.editFiles) {
                new FileWatcher(file, this.generateEditorAndParser);
            }
            for (const file of this.validFiles) {
                new FileWatcher(file, this.generateValidator);
            }
            for (const file of this.typerFiles) {
                new FileWatcher(file, this.generateTyper);
            }
            for (const file of this.scopeFiles) {
                new FileWatcher(file, this.generateScoper);
            }
        }
    }

    private generateTyper = () => {
        LOGGER.info(this, "Generating typer");
        let typer: PiTypeDefinition;
        try {
            if (this.typerFiles.length > 0) {
                typer = new PiTyperParser(this.language).parseMulti(this.typerFiles);
            } else {
                LOGGER.log("Generating default typer");
            }
            this.typerGenerator.language = this.language;
            this.typerGenerator.outputfolder = this.outputFolder;
            this.typerGenerator.generate(typer);
        } catch (e) {
            // LOGGER.error(this, "Stopping typer generation because of errors: " + e.message + "\n" + e.stack);
            LOGGER.error(this, "Stopping typer generation because of errors: " + e.message);
        }
    };

    private generateScoper = () => {
        LOGGER.info(this, "Generating scoper");
        let scoper: PiScopeDef;
        try {
            if (this.scopeFiles.length > 0) {
                scoper = new ScoperParser(this.language).parseMulti(this.scopeFiles);
            } else {
                LOGGER.log("Generating default scoper");
            }
            this.scoperGenerator.language = this.language;
            this.scoperGenerator.outputfolder = this.outputFolder;
            this.scoperGenerator.generate(scoper);
        } catch (e) {
            // LOGGER.error(this, "Stopping scoper generation because of errors: " + e.message + "\n" + e.stack);
            LOGGER.error(this, "Stopping scoper generation because of errors: " + e.message);
        }
    };

    private generateValidator = () => {
        LOGGER.info(this, "Generating validator");
        let validator: PiValidatorDef;
        try {
            if (this.validFiles.length > 0) {
                validator = new ValidatorParser(this.language).parseMulti(this.validFiles);
            } else {
                LOGGER.log("Generating default validator");
            }
            this.validatorGenerator.language = this.language;
            this.validatorGenerator.outputfolder = this.outputFolder;
            this.validatorGenerator.generate(validator);
        } catch (e) {
            // LOGGER.error(this, "Stopping validator generation because of errors: " + e.message + "\n" + e.stack);
            LOGGER.error(this, "Stopping validator generation because of errors: " + e.message);
        }
    };

    private generateEditorAndParser = () => {
        LOGGER.info(this, "Generating editor, reader and writer");
        let editor: PiEditUnit = null;
        try {
            this.editorGenerator.outputfolder = this.outputFolder;
            this.editorGenerator.language = this.language;
            this.parserGenerator.outputfolder = this.outputFolder;
            this.parserGenerator.language = this.language;

            if (this.editFiles.length > 0) {
                editor = new PiEditParser(this.language).parseMulti(this.editFiles);
            } else {
                LOGGER.log("Generating default editor");
                editor = this.editorGenerator.createDefaultEditorDefinition();
            }

            this.editorGenerator.generate(editor);
            // this.parserGenerator.generate(editor);
        } catch (e) {
            // LOGGER.error(this, "Stopping editor and parser generation because of errors: " + e.message + "\n" + e.stack);
            LOGGER.error(this, "Stopping editor, reader and writer generation because of errors: " + e.message);
        }
        return editor;
    };

    private generateLanguage = () => {
        // generate the language
        LOGGER.info(this, "Generating language structure");
        this.language = new LanguageParser().parseMulti(this.languageFiles);
        this.languageGenerator.outputfolder = this.outputFolder;
        this.languageGenerator.generate(this.language);
    };

}
