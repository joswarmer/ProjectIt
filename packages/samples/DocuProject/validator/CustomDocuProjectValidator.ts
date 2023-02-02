// Generated by the Freon Language Generator.
import { FreError, FreErrorSeverity, FreLanguageEnvironment, FreTyper, FreWriter } from "@freon4dsl/core";
import { DocuProjectDefaultWorker } from "../utils/gen/DocuProjectDefaultWorker";
import { DocuProjectCheckerInterface } from "./gen/DocuProjectValidator";
import {
    EuroType,
    MultiplyExpression, NumberType,
    PercentageType, Product
} from "../language/gen";
import { CustomDocuProjectTyperPart } from "../typer";
import { DocuProjectEnvironment } from "../config/gen/DocuProjectEnvironment";

export class CustomDocuProjectValidator extends DocuProjectDefaultWorker implements DocuProjectCheckerInterface {
    errorList: FreError[] = [];

    public execBeforeProduct(modelelement: Product): boolean {
        CustomDocuProjectTyperPart.fromValidator = true;
        return false;
    }

    public execAfterProduct(modelelement: Product): boolean {
        CustomDocuProjectTyperPart.fromValidator = false;
        return false;
    }

    public execBeforeMultiplyExpression(modelelement: MultiplyExpression): boolean {
        CustomDocuProjectTyperPart.fromValidator = true;
        const typer: FreTyper = FreLanguageEnvironment.getInstance().typer;
        const writer: FreWriter = DocuProjectEnvironment.getInstance().writer;
        let hasFatalError: boolean = false;
        // @typecheck equalsType( self.left, self.right )
        const leftType0 = typer.inferType(modelelement.left);
        const rightType0 = typer.inferType(modelelement.right);
        // see if we are multiplying a percentage and an EUR
        if ((leftType0.toAstElement() === PercentageType.Percentage && rightType0.toAstElement() === EuroType.EUR)
            || (rightType0.toAstElement() === PercentageType.Percentage && leftType0.toAstElement() === EuroType.EUR)) {
            // everything ok
        } else              // see if we are multiplying a percentage and a number
        if ((leftType0.toAstElement() === PercentageType.Percentage && rightType0.toAstElement() === NumberType.Number)
            || (rightType0.toAstElement() === PercentageType.Percentage && leftType0.toAstElement() === NumberType.Number)) {
            // everything ok
        } else if (!typer.equals(leftType0, rightType0)) {
            this.errorList.push(
                new FreError(
                    "Type of '" +
                    writer.writeNameOnly(modelelement.left) +
                    "' (" +
                    leftType0?.toFreString(writer) +
                    ") should equal the type of '" +
                    writer.writeNameOnly(modelelement.right) +
                    "' (" +
                    rightType0?.toFreString(writer) +
                    ")",
                    modelelement.left,
                    "unnamed",
                    FreErrorSeverity.ToDo
                )
            );
        }
        CustomDocuProjectTyperPart.fromValidator = false;
        return hasFatalError;
    }
}
