import {
    AliasBox,
    Box,
    HorizontalListBox,
    isHorizontalBox,
    SelectBox,
    SelectOption,
    PiEditor,
    PiProjection, triggerToString, PiStyle
} from "../editor";
import { PiBinaryExpression, PiExpression } from "../language";
import {
    PI_BINARY_EXPRESSION_LEFT,
    PI_BINARY_EXPRESSION_RIGHT,
    AFTER_BINARY_OPERATOR,
    BEFORE_BINARY_OPERATOR,
    BINARY_EXPRESSION,
    BTREE,
    EXPRESSION,
    EXPRESSION_SYMBOL,
    LEFT_MOST,
    RIGHT_MOST,
    BehaviorExecutionResult,
    PiCaret,
    NBSP,
    PiUtils
} from "./internal";

// const LOGGER = new PiLogger("PiExpressionHelpers");

export function createDefaultExpressionBox(exp: PiExpression, role: string, children: Box[], initializer?: Partial<HorizontalListBox>): Box {
    const isLeftMost: Boolean = BTREE.isLeftMostChild(exp);
    const isRightMost: Boolean = BTREE.isRightMostChild(exp);
    if (isLeftMost || isRightMost) {
        let result: HorizontalListBox;
        if (children.length === 1 && isHorizontalBox(children[0])) {
            result = children[0] as HorizontalListBox;
        } else {
            result = new HorizontalListBox(exp, EXPRESSION, children);
        }
        if (isLeftMost) {
            // TODO Change into Svelte Style
            // result.insertChild(new AliasBox(exp, LEFT_MOST, NBSP, { style: STYLES.aliasExpression }));
            result.insertChild(new AliasBox(exp, LEFT_MOST, NBSP));
        }
        if (isRightMost) {
            // TODO Change into Svelte Style
            // result.addChild(new AliasBox(exp, RIGHT_MOST, NBSP, { style: STYLES.aliasExpression }));
            result.addChild(new AliasBox(exp, RIGHT_MOST, NBSP));
        }
        return result;
    } else {
        if (children.length === 1) {
            return children[0];
        } else {
            return new HorizontalListBox(exp, EXPRESSION, children);
        }
    }
}

/**
 * Create a binary box with eleft and right expression boxes, or alias boxes as placeholders for missing left and/or right children.
 * Also add an alias box between the operator and the left and right child to enable the user to add more operators.
 * @param exp
 * @param symbol
 * @param editor
 * @param style
 */
export function createDefaultBinaryBox(exp: PiBinaryExpression, symbol: string, editor: PiEditor, style?: string): HorizontalListBox {
    const result = new HorizontalListBox(exp, BINARY_EXPRESSION);
    const projection = editor.projection;
    const projectionToUse = !!projection.rootProjection ? projection.rootProjection : projection;

    result.addChildren([
        (!!exp.piLeft() ? projectionToUse.getBox(exp.piLeft()) : new AliasBox(exp, PI_BINARY_EXPRESSION_LEFT, "[add-left]", { propertyName: "left" })),
        // TODO  Change into Svelte styles: style: STYLES.aliasExpression
        new AliasBox(exp, BEFORE_BINARY_OPERATOR, NBSP),
        createOperatorBox(editor, exp, symbol),
        // TODO  Change into Svelte styles: style: STYLES.aliasExpression
        new AliasBox(exp, AFTER_BINARY_OPERATOR, NBSP),
        (!!exp.piRight() ? projectionToUse.getBox(exp.piRight()) : new AliasBox(exp, PI_BINARY_EXPRESSION_RIGHT, "<add-right>", { propertyName: "right" }))
    ]);
    return result;
}

/**
 * The creates an operator box as a selection to enable editing of operators.
 * @param editor
 * @param exp
 * @param symbol
 * @param style
 */
export function createOperatorBox(editor: PiEditor, exp: PiBinaryExpression, symbol: string, style?: PiStyle): Box {
    const operatorBox = new SelectBox(
        exp,
        EXPRESSION_SYMBOL,
        "<...>",
        () => {
            if (!!editor.actions && editor.actions.binaryExpressionCreators) {
                return editor.actions.binaryExpressionCreators
                    .filter(e => !e.isApplicable || e.isApplicable(operatorBox))
                    .map(e => ({
                        id: e.trigger as string,
                        label: e.trigger as string,
                        description: "empty description for operator",
                        icon: null,
                        hideInList: false
                    }));
            } else {
                return [];
            }
        },
        () => null,
        async (editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> => {
            if (editor.actions && editor.actions.binaryExpressionCreators) {
                const alias = editor.actions.binaryExpressionCreators.filter(e => (e.trigger as string) === option.id)[0];
                if (!!alias) {
                    const newExp = alias.expressionBuilder(operatorBox, triggerToString(alias.trigger), editor);
                    newExp.piSetLeft(exp.piLeft());
                    newExp.piSetRight(exp.piRight());
                    PiUtils.replaceExpression(exp, newExp, editor);
                    BTREE.balanceTree(newExp, editor);
                    exp = newExp;
                    editor.selectElement(newExp, AFTER_BINARY_OPERATOR);
                    // editor.selectBoxNew(operatorBox.nextLeafRight.firstLeaf, PiCaret.LEFT_MOST);
                    return BehaviorExecutionResult.EXECUTED;
                }
            }
            return BehaviorExecutionResult.NO_MATCH;
        },
        {
            style: style
        }
    );

    operatorBox.getSelectedOption = () => {
        return { id: symbol, label: symbol };
    };

    return operatorBox;
}
