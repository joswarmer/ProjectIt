import { PiLanguage } from "../languagedef/metalanguage";
import { ParseLocation, PiDefinitionElement } from "../utils";

export type NestedCheck = { check: boolean; error: string; whenOk?: () => void };

export abstract class Checker<DEFINITION> {
    errors: string[] = [];
    warnings: string[] = [];
    language: PiLanguage; // should be set in every checker, except the checker for the language definition language (LDL)

    constructor(language: PiLanguage) {
        this.language = language;
    }

    public abstract check(lang: DEFINITION): void;

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public hasWarnings(): boolean {
        return this.warnings.length > 0;
    }

    public simpleCheck(check: boolean, error: string): boolean {
        if (!check) {
            this.errors.push(error);
            return false;
        }
        return true;
    }

    public nestedCheck(check: NestedCheck | NestedCheck[]): void {
        if (Array.isArray(check)) {
            check.forEach(chk => this.simpleCheck(chk.check, chk.error));
        } else {
            if (this.simpleCheck(check.check, check.error)) {
                if (!!check.whenOk) {
                    check.whenOk();
                }
            }
        }
    }

    public simpleWarning(check: boolean, error: string): boolean {
        if (!check) {
            this.warnings.push(error);
            return false;
        }
        return true;
    }

    public nestedWarning(check: NestedCheck | NestedCheck[]): void {
        if (Array.isArray(check)) {
            check.forEach(chk => this.simpleWarning(chk.check, chk.error));
        } else {
            if (this.simpleWarning(check.check, check.error)) {
                if (!!check.whenOk) {
                    check.whenOk();
                }
            }
        }
    }

    static location(elem: PiDefinitionElement): string {
        if (!!elem && !!elem.location) {
            const shortFileName: string[] = elem.location.filename.split("/");
            return `[file: ${shortFileName[shortFileName.length - 1]}, line: ${elem.location.start.line}, column: ${elem.location.start.column}]`;
        }
        return `[no location]`;
    }

    static locationPlus(fileName: string, location: ParseLocation) {
        if (!!location && !!fileName) {
            const shortFileName: string[] = fileName.split("/");
            return `[file: ${shortFileName[shortFileName.length - 1]}, line: ${location.start.line}, column: ${location.start.column}]`;
        }
        return `[no location]`;
    }
}
