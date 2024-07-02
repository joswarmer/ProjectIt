// Generated by the Freon Language Generator.
// Generated my Freon, will be overwritten with every generation.
import {
    ConceptFunction,
    FreInterpreter,
    IMainInterpreter,
    InterpreterContext,
    InterpreterTracer,
    MainInterpreter,
    OwningPropertyFunction,
    FreNode,
    RtObject,
    RtError,
} from "@freon4dsl/core";
import { UndoModelInterpreterInit } from "./gen/UndoModelInterpreterInit";

const getPropertyFunction: OwningPropertyFunction = (node: Object) => {
    const index = (node as FreNode).freOwnerDescriptor().propertyIndex;
    return (node as FreNode).freOwnerDescriptor().propertyName + (index !== undefined ? "[" + index + "]" : "");
};

/**
 * Function that returns the concept name for `node`.
 * Used by the interpreter to find which evaluator should be use for each node.
 */
const getConceptFunction: ConceptFunction = (node: Object) => {
    if (node === undefined) {
        return "";
    }
    return (node as FreNode).freLanguageConcept();
};

/**
 * The facade around the actual interpreter to avoid improper usage.
 * Sets the functions used to access the expression tree.
 * Ensures all internal interpreter state is cleaned when creating a new instance.
 */
export class MainUndoModelInterpreter implements FreInterpreter {
    private static main: IMainInterpreter = null;

    constructor() {
        if (MainUndoModelInterpreter.main === null) {
            MainUndoModelInterpreter.main = MainInterpreter.instance(UndoModelInterpreterInit, getConceptFunction, getPropertyFunction);
        }
    }

    setTracing(value: boolean) {
        MainUndoModelInterpreter.main.setTracing(value);
    }

    getTrace(): InterpreterTracer {
        return MainUndoModelInterpreter.main.getTrace();
    }

    evaluate(node: Object): RtObject {
        MainUndoModelInterpreter.main.reset();
        try {
            return MainUndoModelInterpreter.main.evaluate(node, InterpreterContext.EMPTY_CONTEXT);
        } catch (e: any) {
            return new RtError(e.message);
        }
    }
}
