// Generated by the Freon Language Generator.
import { FreError, FreErrorSeverity } from "@freon4dsl/core";
import { CalculatorModelDefaultWorker } from "../utils/gen/CalculatorModelDefaultWorker";
import { CalculatorModelCheckerInterface } from "./gen/CalculatorModelValidator";

export class CustomCalculatorModelValidator extends CalculatorModelDefaultWorker implements CalculatorModelCheckerInterface {
    errorList: FreError[] = [];
}
