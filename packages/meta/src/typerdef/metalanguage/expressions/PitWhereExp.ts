import { PitExp } from "./PitExp";
import { PiClassifier } from "../../../languagedef/metalanguage";
import { PitVarDecl } from "../PitVarDecl";
import { PitBinaryExp } from "./PitBinaryExp";
import { PitPropertyCallExp } from "./PitPropertyCallExp";
import { PitVarCallExp } from "./PitVarCallExp";
import { PitEqualsExp } from "./PitEqualsExp";
import { PitConformsExp } from "./PitConformsExp";

export class PitWhereExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitWhereExp>): PitWhereExp {
        const result = new PitWhereExp();
        if (!!data.variable) {
            result.variable = data.variable;
        }
        if (!!data.conditions) {
            data.conditions.forEach(x => result.conditions.push(x));
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    readonly $typename: string = "PitWhereExp"; // holds the metatype in the form of a string
    variable: PitVarDecl; // this object is not part of the AST, it is here to embody e.g. 'x: UnitOfMeasurement'
    conditions: PitBinaryExp[] = [];

    toPiString(): string {
        return `${this.variable.toPiString()} where {
        ${this.conditions.map(cond => cond.toPiString()).join("\n\t\t")}
    }`;
    }
    get type(): PiClassifier {
        return this.variable.type;
    }
    // baseSource(): PitExp {
    //     return this;
    // }

    /**
     * Returns the conditions of the expressions such that the part that refers to the extra variable
     * is always the left.
     */
    sortedConditions(): PitBinaryExp[] {
        const result: PitBinaryExp[] = [];
        this.conditions.forEach(cond => {
            // find out which part of the condition refers to 'variable'
            let variablePart: PitExp;
            let knownTypePart: PitExp;
            let baseSource = cond.left.baseSource();
            if (baseSource instanceof PitVarCallExp && baseSource.variable === this.variable) {
                variablePart = cond.left;
                knownTypePart = cond.right;
            } else {
                baseSource = cond.right.baseSource();
                if (baseSource instanceof PitVarCallExp && baseSource.variable === this.variable) {
                    variablePart = cond.right;
                    knownTypePart = cond.left;
                }
            }
            // // strip the source from part that refers to the extra variable
            // variablePart = TyperGenUtils.removeBaseSource(variablePart);
            // return a new condition with the knownTypePart always as the right
            if (cond instanceof PitEqualsExp) {
                result.push(PitEqualsExp.create({left: variablePart, right: knownTypePart}));
            } else if (cond instanceof PitConformsExp) {
                result.push(PitConformsExp.create({left: variablePart, right: knownTypePart}));
            }
        });
        return result;
    }

}
