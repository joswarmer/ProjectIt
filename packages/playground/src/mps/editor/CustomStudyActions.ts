// Generated by the ProjectIt Language Generator.
import {
    KeyboardShortcutBehavior,
    PiBinaryExpressionCreator,
    PiCustomBehavior,
    PiExpressionCreator,
    PiActions,
    Box, PiEditor, AliasBox, PiCaret
} from "@projectit/core";
import { Org_iets3_core_expr_simpleTypes_NumberLiteral } from "../language/gen";


/**
 * Class CustomStudyActions provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These custom build additions are merged with the default and definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */

export class CustomStudyActions implements PiActions {
    binaryExpressionCreators: PiBinaryExpressionCreator[] = MANUAL_BINARY_EXPRESSION_CREATORS;
    customBehaviors: PiCustomBehavior[] = MANUAL_CUSTOM_BEHAVIORS;
    expressionCreators: PiExpressionCreator[] = MANUAL_EXPRESSION_CREATORS;
    keyboardActions: KeyboardShortcutBehavior[] = MANUAL_KEYBOARD;
}

export const MANUAL_EXPRESSION_CREATORS: PiExpressionCreator[] = [
    // Add your own custom expression creators here
    {

        activeInBoxRoles: [
            "Accenture_study_base_TimeOffset-value",
            "Accenture_study_base_AccLogicalNotExpression-expr",
            "Accenture_study_base_AccLogicalAndExpression-left",
            "Accenture_study_base_AccLogicalAndExpression-right",
            "Accenture_study_base_DayExpr-value",
            "Accenture_study_base_ExpressionWord-expr",
            "Accenture_study_base_AccLogicalOrExpression-left",
            "Accenture_study_base_AccLogicalOrExpression-right",
            "Accenture_study_core_BuiltInSegmentChange-condition",
            "Accenture_study_core_EndEventSegChange-condition",
            "Accenture_study_core_CalculatedPointInTime-expr",
            "Accenture_study_core_TakeOfList-list",
            "Accenture_study_core_CountListProcessor-list",
            "Accenture_study_core_ActivityDuration-condition",
            "Accenture_study_core_CodelistEntry-value",
            "Accenture_study_core_LocalValue-expr",
            "Accenture_study_core_StartEventSegChange-condition",
            "Accenture_study_core_VariableSetter-var",
            "Accenture_study_core_VariableSetter-value",
            "Accenture_study_core_LocalVariableAssign-variable",
            "Accenture_study_core_LocalVariableAssign-value",
            "Accenture_study_core_TrackChange-condition",
            "Accenture_study_core_EventReactionSegChange-condition",
            "Accenture_study_core_ActivityCanBeRescheduled-condition",
            "Accenture_study_core_MakeList-list",
            "Accenture_study_core_AbstractListProcessor-list",
            "Accenture_study_core_AtomicActivity-condition",
            "Accenture_study_core_ParamValue-value",
            "Accenture_study_core_RoleChange-condition",
            "Accenture_study_core_BeforeNow-value",
            "Accenture_study_core_Form-initialBranch",
            "Accenture_study_core_ActivityOption-condition",
            "Accenture_study_core_BranchExpression-targetField",
            "Accenture_study_core_Workflow-activationCondition",
            "Accenture_study_core_FilterCondition-condition",
            "Accenture_study_core_RepeatingActivity-computedName",
            "Accenture_study_core_RepeatingActivity-maxRepeatCount",
            "Accenture_study_core_RepeatingActivity-terminationCondition",
            "Accenture_study_core_ActivityCanBeSkippedOption-condition",
            "Accenture_study_core_Field-validationCondition",
            "Accenture_study_core_AllowOthersOnSameDay-condition",
            "Accenture_study_core_SegmentChange-condition",
            "Accenture_study_core_ActivityCanBeClosedOption-condition",
            "Accenture_study_core_PhaseChange-condition",
            "Accenture_study_core_Mapper-valueCompute",
            "Accenture_study_core_CalculatedSchedulingConstraint-expr",
            "Accenture_study_devices_ECGConfig-initialPSRatio",
            "Accenture_study_test_CalculatedValueAssert-expected",
            "Accenture_study_test_FieldValue-value",
            "Accenture_study_test_AssertingFieldValue-value",
            "Accenture_study_test_BranchAssert-target",
            "Jetbrains_mps_lang_core_BaseCommentAttribute-commentedNode",
            "Org_iets3_core_expr_base_DotExpression-expr",
            "Org_iets3_core_expr_base_LessEqualsExpression-left",
            "Org_iets3_core_expr_base_LessEqualsExpression-right",
            "Org_iets3_core_expr_base_PragmaExpression-expr",
            "Org_iets3_core_expr_base_Precondition-expr",
            "Org_iets3_core_expr_base_Precondition-err",
            "Org_iets3_core_expr_base_TupleValue-values",
            "Org_iets3_core_expr_base_AltOption-when",
            "Org_iets3_core_expr_base_AltOption-then",
            "Org_iets3_core_expr_base_LogicalNotExpression-expr",
            "Org_iets3_core_expr_base_PragmaDisableCaching-expr",
            "Org_iets3_core_expr_base_IsSomeExpression-expr",
            "Org_iets3_core_expr_base_OneOfTarget-values",
            "Org_iets3_core_expr_base_ContractItem-expr",
            "Org_iets3_core_expr_base_ContractItem-err",
            "Org_iets3_core_expr_base_AssignmentExpr-left",
            "Org_iets3_core_expr_base_AssignmentExpr-right",
            "Org_iets3_core_expr_base_GreaterEqualsExpression-left",
            "Org_iets3_core_expr_base_GreaterEqualsExpression-right",
            "Org_iets3_core_expr_base_BinaryLogicalExpression-left",
            "Org_iets3_core_expr_base_BinaryLogicalExpression-right",
            "Org_iets3_core_expr_base_TracerExpression-traced",
            "Org_iets3_core_expr_base_IfElseSection-expr",
            "Org_iets3_core_expr_base_ColonCast-expr",
            "Org_iets3_core_expr_base_LessExpression-left",
            "Org_iets3_core_expr_base_LessExpression-right",
            "Org_iets3_core_expr_base_GreaterExpression-left",
            "Org_iets3_core_expr_base_GreaterExpression-right",
            "Org_iets3_core_expr_base_DivExpression-left",
            "Org_iets3_core_expr_base_DivExpression-right",
            "Org_iets3_core_expr_base_TupleAccessExpr-tuple",
            "Org_iets3_core_expr_base_NotEqualsExpression-left",
            "Org_iets3_core_expr_base_NotEqualsExpression-right",
            "Org_iets3_core_expr_base_BinaryEqualityExpression-left",
            "Org_iets3_core_expr_base_BinaryEqualityExpression-right",
            "Org_iets3_core_expr_base_EqualsExpression-left",
            "Org_iets3_core_expr_base_EqualsExpression-right",
            "Org_iets3_core_expr_base_Revealer-condition",
            "Org_iets3_core_expr_base_BinaryArithmeticExpression-left",
            "Org_iets3_core_expr_base_BinaryArithmeticExpression-right",
            "Org_iets3_core_expr_base_IfExpression-condition",
            "Org_iets3_core_expr_base_IfExpression-thenPart",
            "Org_iets3_core_expr_base_IfExpression-elsePart",
            "Org_iets3_core_expr_base_Invariant-expr",
            "Org_iets3_core_expr_base_Invariant-err",
            "Org_iets3_core_expr_base_MinusExpression-left",
            "Org_iets3_core_expr_base_MinusExpression-right",
            "Org_iets3_core_expr_base_TrySuccessClause-expr",
            "Org_iets3_core_expr_base_MulExpression-left",
            "Org_iets3_core_expr_base_MulExpression-right",
            "Org_iets3_core_expr_base_BangOp-optionValue",
            "Org_iets3_core_expr_base_BangOp-expr",
            "Org_iets3_core_expr_base_FailExpr-message",
            "Org_iets3_core_expr_base_FailExpr-contextExpression",
            "Org_iets3_core_expr_base_ConvenientValueCond-expr",
            "Org_iets3_core_expr_base_TryErrorClause-expr",
            "Org_iets3_core_expr_base_SuccessExpression-expr",
            "Org_iets3_core_expr_base_CastExpression-expr",
            "Org_iets3_core_expr_base_PlainConstraint-expr",
            "Org_iets3_core_expr_base_PlainConstraint-err",
            "Org_iets3_core_expr_base_ModExpression-left",
            "Org_iets3_core_expr_base_ModExpression-right",
            "Org_iets3_core_expr_base_ReductionInspector-reduced",
            "Org_iets3_core_expr_base_ParensExpression-expr",
            "Org_iets3_core_expr_base_MinExpression-values",
            "Org_iets3_core_expr_base_RangeTarget-min",
            "Org_iets3_core_expr_base_RangeTarget-max",
            "Org_iets3_core_expr_base_CheckTypeConstraintsExpr-expr",
            "Org_iets3_core_expr_base_LogicalAndExpression-left",
            "Org_iets3_core_expr_base_LogicalAndExpression-right",
            "Org_iets3_core_expr_base_LogicalIffExpression-left",
            "Org_iets3_core_expr_base_LogicalIffExpression-right",
            "Org_iets3_core_expr_base_NonStrictEqualsExpression-left",
            "Org_iets3_core_expr_base_NonStrictEqualsExpression-right",
            "Org_iets3_core_expr_base_LogicalImpliesExpression-left",
            "Org_iets3_core_expr_base_LogicalImpliesExpression-right",
            "Org_iets3_core_expr_base_OperatorGroup-expressions",
            "Org_iets3_core_expr_base_BinaryComparisonExpression-left",
            "Org_iets3_core_expr_base_BinaryComparisonExpression-right",
            "Org_iets3_core_expr_base_UnaryMinusExpression-expr",
            "Org_iets3_core_expr_base_UnaryExpression-expr",
            "Org_iets3_core_expr_base_TryExpression-expr",
            "Org_iets3_core_expr_base_MaxExpression-values",
            "Org_iets3_core_expr_base_Postcondition-expr",
            "Org_iets3_core_expr_base_Postcondition-err",
            "Org_iets3_core_expr_base_InlineMessage-text",
            "Org_iets3_core_expr_base_LogicalOrExpression-left",
            "Org_iets3_core_expr_base_LogicalOrExpression-right",
            "Org_iets3_core_expr_base_AbstractMinMaxExpression-values",
            "Org_iets3_core_expr_base_PlusExpression-left",
            "Org_iets3_core_expr_base_PlusExpression-right",
            "Org_iets3_core_expr_base_OptionOrExpression-left",
            "Org_iets3_core_expr_base_OptionOrExpression-right",
            "Org_iets3_core_expr_collections_StringJoinOp-arg",
            "Org_iets3_core_expr_collections_WhereOp-arg",
            "Org_iets3_core_expr_collections_OneCollBaseTypedArgCollectionOp-arg",
            "Org_iets3_core_expr_collections_UpToTarget-max",
            "Org_iets3_core_expr_collections_FoldOp-seed",
            "Org_iets3_core_expr_collections_FoldOp-combiner",
            "Org_iets3_core_expr_collections_AllWithIndexOp-arg",
            "Org_iets3_core_expr_collections_OneArgPredicateCollectionOp-arg",
            "Org_iets3_core_expr_collections_AtOp-arg",
            "Org_iets3_core_expr_collections_ContainsOp-arg",
            "Org_iets3_core_expr_collections_AbstractStringListJoiner-arg",
            "Org_iets3_core_expr_collections_ListPickOp-selectorList",
            "Org_iets3_core_expr_collections_ListLiteral-elements",
            "Org_iets3_core_expr_collections_ForeachOp-arg",
            "Org_iets3_core_expr_collections_BracketOp-index",
            "Org_iets3_core_expr_collections_BracketOp-expr",
            "Org_iets3_core_expr_collections_StringTerminateOp-arg",
            "Org_iets3_core_expr_collections_OneArgCollectionOp-arg",
            "Org_iets3_core_expr_collections_KeyValuePair-key",
            "Org_iets3_core_expr_collections_KeyValuePair-val",
            "Org_iets3_core_expr_collections_FindFirstOp-arg",
            "Org_iets3_core_expr_collections_AllOp-arg",
            "Org_iets3_core_expr_collections_AnyOp-arg",
            "Org_iets3_core_expr_collections_TwoArgPredicateCollectionOp-arg",
            "Org_iets3_core_expr_collections_MapOp-arg",
            "Org_iets3_core_expr_collections_LastNOp-arg",
            "Org_iets3_core_expr_collections_AnyWithIndexOp-arg",
            "Org_iets3_core_expr_collections_FoldLeftOp-seed",
            "Org_iets3_core_expr_collections_FoldLeftOp-combiner",
            "Org_iets3_core_expr_collections_SetLiteral-elements",
            "Org_iets3_core_expr_collections_ListInsertOp-index",
            "Org_iets3_core_expr_collections_ListInsertOp-arg",
            "Org_iets3_core_expr_collections_FirstNOp-arg",
            "Org_iets3_core_expr_data_DataTableLookUp-arg",
            "Org_iets3_core_expr_data_DataCell-value",
            "Org_iets3_core_expr_datetime_ContainsRangeRelOp-other",
            "Org_iets3_core_expr_datetime_DaysDeltaLiteral-value",
            "Org_iets3_core_expr_datetime_UntilOp-endDate",
            "Org_iets3_core_expr_datetime_YearsDeltaLiteral-value",
            "Org_iets3_core_expr_datetime_UpToOp-date",
            "Org_iets3_core_expr_datetime_MonthsDeltaLiteral-value",
            "Org_iets3_core_expr_datetime_FromOp-date",
            "Org_iets3_core_expr_datetime_EarliestExpression-values",
            "Org_iets3_core_expr_datetime_IntersectRangeOp-other",
            "Org_iets3_core_expr_datetime_YearRangeLiteral-year",
            "Org_iets3_core_expr_datetime_DateDeltaLiteral-value",
            "Org_iets3_core_expr_datetime_LatestExpression-values",
            "Org_iets3_core_expr_datetime_AbstractRangeRelOp-other",
            "Org_iets3_core_expr_datetime_OverlapsRangeRelOp-other",
            "Org_iets3_core_expr_datetime_AbstractEarliestLastestExpression-values",
            "Org_iets3_core_expr_datetime_MakeDate-yearExpr",
            "Org_iets3_core_expr_datetime_MakeDate-monthExpr",
            "Org_iets3_core_expr_datetime_MakeDate-dayExpr",
            "Org_iets3_core_expr_datetime_FitsInRangeRelOp-other",
            "Org_iets3_core_expr_datetime_WeeksDeltaLiteral-value",
            "Org_iets3_core_expr_datetime_MonthRangeLiteral-year",
            "Org_iets3_core_expr_datetime_MonthRangeLiteral-month",
            "Org_iets3_core_expr_lambda_ValExpression-expr",
            "Org_iets3_core_expr_lambda_AssertExpr-expr",
            "Org_iets3_core_expr_lambda_LocalVarDeclExpr-expr",
            "Org_iets3_core_expr_lambda_LambdaExpression-expression",
            "Org_iets3_core_expr_lambda_BindOp-args",
            "Org_iets3_core_expr_lambda_FunctionStyleExecOp-fun",
            "Org_iets3_core_expr_lambda_FunctionStyleExecOp-args",
            "Org_iets3_core_expr_lambda_ExecOp-args",
            "Org_iets3_core_expr_lambda_BlockExpression-expressions",
            "Org_iets3_core_expr_lambda_ShortLambdaExpression-expression",
            "Org_iets3_core_expr_lambda_FunCompose-left",
            "Org_iets3_core_expr_lambda_FunCompose-right",
            "Org_iets3_core_expr_lambda_AttachedConstraint-constraints",
            "Org_iets3_core_expr_math_ArcTangens-expr",
            "Org_iets3_core_expr_math_PolynomialExpression-expression",
            "Org_iets3_core_expr_math_LogExpression-expr",
            "Org_iets3_core_expr_math_LogExpression-logOf",
            "Org_iets3_core_expr_math_ArcSinus-expr",
            "Org_iets3_core_expr_math_SumExpression-lower",
            "Org_iets3_core_expr_math_SumExpression-upper",
            "Org_iets3_core_expr_math_SumExpression-body",
            "Org_iets3_core_expr_math_SinusExpression-expr",
            "Org_iets3_core_expr_math_IntegralExpression-lower",
            "Org_iets3_core_expr_math_IntegralExpression-upper",
            "Org_iets3_core_expr_math_ProductLoopExpression-lower",
            "Org_iets3_core_expr_math_ProductLoopExpression-upper",
            "Org_iets3_core_expr_math_ProductLoopExpression-body",
            "Org_iets3_core_expr_math_SqrtExpression-expr",
            "Org_iets3_core_expr_math_FractionExpression-numerator",
            "Org_iets3_core_expr_math_FractionExpression-denominator",
            "Org_iets3_core_expr_math_MathLoopExpr-lower",
            "Org_iets3_core_expr_math_MathLoopExpr-upper",
            "Org_iets3_core_expr_math_MathLoopExpr-body",
            "Org_iets3_core_expr_math_TrigonometricExpression-expr",
            "Org_iets3_core_expr_math_ArcSinusHyperbolicus-expr",
            "Org_iets3_core_expr_math_TangensExpression-expr",
            "Org_iets3_core_expr_math_CosinusHyperbolicus-expr",
            "Org_iets3_core_expr_math_ArcCosinusHyperbolicus-expr",
            "Org_iets3_core_expr_math_SinusHyperbolicus-expr",
            "Org_iets3_core_expr_math_AbsExpression-expr",
            "Org_iets3_core_expr_math_ArcCosinus-expr",
            "Org_iets3_core_expr_math_RatExpr-value",
            "Org_iets3_core_expr_math_ArcTangensHyperbolicus-expr",
            "Org_iets3_core_expr_math_PowerExpression-expr",
            "Org_iets3_core_expr_math_PowerExpression-exponent",
            "Org_iets3_core_expr_math_TangensHyperbolicus-expr",
            "Org_iets3_core_expr_math_CosinusExpression-expr",
            "Org_iets3_core_expr_metafunction_MetaFunction-body",
            "Org_iets3_core_expr_simpleTypes_InterpolExprWord-expr",
            "Org_iets3_core_expr_simpleTypes_LimitExpression-expr",
            "Org_iets3_core_expr_simpleTypes_StringEndsWithTarget-value",
            "Org_iets3_core_expr_simpleTypes_ConvertPrecisionNumberExpression-expr",
            "Org_iets3_core_expr_simpleTypes_StringStartsWithTarget-value",
            "Org_iets3_core_expr_simpleTypes_BoundsExpression-expr",
            "Org_iets3_core_expr_simpleTypes_BoundsExpression-lower",
            "Org_iets3_core_expr_simpleTypes_BoundsExpression-upper",
            "Org_iets3_core_expr_simpleTypes_ToleranceExpr-value",
            "Org_iets3_core_expr_simpleTypes_ToleranceExpr-tolerance",
            "Org_iets3_core_expr_simpleTypes_StringContainsTarget-value",
            "Org_iets3_core_expr_temporal_SpreadValuesOp-fromTime",
            "Org_iets3_core_expr_temporal_SpreadValuesOp-toTime",
            "Org_iets3_core_expr_temporal_DefaultSliceValueExpr-value",
            "Org_iets3_core_expr_temporal_DefaultSliceValueExpr-body",
            "Org_iets3_core_expr_temporal_BetweenOp-from",
            "Org_iets3_core_expr_temporal_BetweenOp-to",
            "Org_iets3_core_expr_temporal_AfterOp-time",
            "Org_iets3_core_expr_temporal_MapSlicesOp-arg",
            "Org_iets3_core_expr_temporal_MaskOp-mask",
            "Org_iets3_core_expr_temporal_MaskOp-defaultVal",
            "Org_iets3_core_expr_temporal_ReduceOp-daterange",
            "Org_iets3_core_expr_temporal_AlwaysExpression-value",
            "Org_iets3_core_expr_temporal_BeforeOp-time",
            "Org_iets3_core_expr_temporal_ValueAtOp-time",
            "Org_iets3_core_expr_temporal_FullOverlapExpr-values",
            "Org_iets3_core_expr_temporal_Slice-pointInTime",
            "Org_iets3_core_expr_temporal_Slice-value",
            "Org_iets3_core_expr_toplevel_GroupByOp-arg",
            "Org_iets3_core_expr_toplevel_EnumLiteral-value",
            "Org_iets3_core_expr_toplevel_NewValueSetter-newValue",
            "Org_iets3_core_expr_toplevel_Constant-value",
            "Org_iets3_core_expr_toplevel_FieldSetter-value",
            "Org_iets3_core_expr_toplevel_ExtensionFunctionCall-args",
            "Org_iets3_core_expr_toplevel_RecordLiteral-memberValues",
            "Org_iets3_core_expr_toplevel_ProjectMember-expr",
            "Org_iets3_core_expr_typetags_TaggedExpression-expr",
            "Org_iets3_core_expr_typetags_units_ConversionSpecifier-expression",
            "Org_iets3_core_expr_typetags_units_ConvertExpression-expr",
            "Org_iets3_core_expr_typetags_units_StripUnitExpression-expr",
            "Org_iets3_core_expr_util_SplitValue-value",
            "Org_iets3_core_expr_util_Content-exprs",
            "Org_iets3_core_expr_util_DecTabColHeader-expressions",
            "Org_iets3_core_expr_util_RootTreeNode-defaultValue",
            "Org_iets3_core_expr_util_LessThanRS-bound",
            "Org_iets3_core_expr_util_LessOrEqualThanRS-bound",
            "Org_iets3_core_expr_util_SplitExpression-expression",
            "Org_iets3_core_expr_util_DecTreeNode-expression",
            "Org_iets3_core_expr_util_DecTabExpression-expressions",
            "Org_iets3_core_expr_util_SingleValueRS-bound",
            "Org_iets3_core_expr_util_TopLevelTableValueSpec-value",
            "Org_iets3_core_expr_util_TableCallExpression-target",
            "Org_iets3_core_expr_util_IntermediateRS-lower",
            "Org_iets3_core_expr_util_IntermediateRS-upper",
            "Org_iets3_core_expr_util_MoreThanRS-bound",
            "Org_iets3_core_expr_util_ExceptRS-bound",
            "Org_iets3_core_expr_util_DecTabRowHeader-expressions",
            "Org_iets3_core_expr_util_MoreOrEqualThanRS-bound",
            "Org_iets3_core_expr_util_DecTab-predefX",
            "Org_iets3_core_expr_util_DecTab-predefY",
            "Org_iets3_core_expr_util_DecTab-default",
            "Org_iets3_core_expr_util_DecTabContent-expressions",
            "Org_iets3_core_expr_util_QueryColDef-expr",
            "alias-PiBinaryExpression-right-textbox",
            "alias-PiBinaryExpression-left-textbox"
        ],
        trigger: /[0-9]/,
        expressionBuilder: (box: Box, trigger: string, editor: PiEditor) => {
            const parent = box.element;
            const x = new Org_iets3_core_expr_simpleTypes_NumberLiteral();
            x.value = trigger; // Number.parseInt(trigger.toString());
            parent[(box as AliasBox).propertyName] = x;
            return x;
        },
        boxRoleToSelect: "NumberLiteralExpression-value",
        caretPosition: PiCaret.RIGHT_MOST
    }
];

export const MANUAL_BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
    // Add your own custom binary expression creators here
];

export const MANUAL_CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
    // Add your own custom behavior here
];

export const MANUAL_KEYBOARD: KeyboardShortcutBehavior[] = [
    // Add your own custom keyboard shortcuts here
];
