import { RHSPropEntry } from "./RHSPropEntry";
import { FreBinaryExpressionConcept, FreProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";
import { BinaryExpMaker } from "../../BinaryExpMaker";
import { GenerationUtil, Names } from "../../../../utils";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil";

export class RHSBinExpListWithSeparator extends RHSPropEntry {
    type: FreBinaryExpressionConcept = null;
    private readonly separatorText: string = "";

    constructor(prop: FreProperty, type: FreBinaryExpressionConcept, separatorText: string) {
        super(prop);
        this.type = type;
        this.isList = true;
        this.separatorText = separatorText;
    }

    toGrammar(): string {
        return `[ ${BinaryExpMaker.getBinaryRuleName(GenerationUtil.findExpressionBase(this.type))} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // TODO this method is almost equal to the one in RHSPartListWithSeparator, only baseType differs
        const baseType: string = Names.classifier(this.type);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(${nodeName}[${index}], '${this.separatorText}'); // RHSBinExpListWithSeparator\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
