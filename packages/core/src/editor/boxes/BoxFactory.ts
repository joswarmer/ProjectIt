import { runInAction } from "mobx";
import { PiElement } from "../../language/PiElement";
import { BehaviorExecutionResult } from "../../util/BehaviorUtils";
import { PiLogger } from "../../util/PiLogging";
import { PiUtils } from "../../util/PiUtils";
import { PiEditor } from "../PiEditor";
import {
    Box,
    AliasBox,
    LabelBox,
    TextBox,
    SelectOption,
    SelectBox,
    IndentBox,
    OptionalBox,
    HorizontalListBox, VerticalListBox, SvgBox, BoolFunctie
} from "./internal";

type RoleCache<T extends Box> = {
    [role: string]: T;
}
type BoxCache<T extends Box> = {
    [id: string]: RoleCache<T>;
}

const LOGGER: PiLogger = new PiLogger("BoxFactory");

// The box caches
let aliasCache: BoxCache<AliasBox> = {};
let labelCache: BoxCache<LabelBox> = {};
let textCache: BoxCache<TextBox> = {};
let selectCache: BoxCache<SelectBox> = {};
let indentCache: BoxCache<IndentBox> = {};
let optionalCache: BoxCache<OptionalBox> = {};
let svgCache: BoxCache<SvgBox> = {};
let horizontalListCache: BoxCache<HorizontalListBox> = {};
let verticalListCache: BoxCache<VerticalListBox> = {};

let cacheAliasOff: boolean = false;
let cacheLabelOff: boolean = false;
let cacheTextOff: boolean = true;
let cacheSelectOff: boolean = true;
let cacheIndentOff: boolean = true;

/**
 * Caching of boxes, avoid recalculating them.
 */
export class BoxFactory {
    public static clearCaches() {
        aliasCache = {};
        labelCache = {};
        textCache = {};
        selectCache = {};
        indentCache = {};
        optionalCache = {};
        svgCache = {};
        horizontalListCache = {};
        verticalListCache = {};
    }
    public static cachesOff() {
        cacheAliasOff = true;
        cacheLabelOff = true;
        cacheTextOff = true;
        cacheSelectOff = true;
        cacheIndentOff = true;
    }
    public static cachesOn() {
        cacheAliasOff = false;
        cacheLabelOff = false;
        cacheTextOff = false;
        cacheSelectOff = false;
        cacheIndentOff = false;
    }

    /**
     * Find the Box for the given element id and role in the cache,
     * When not there, create the element and put it in the cache
     * @param element The element for which the box should be found
     * @param role    The role of the box
     * @param creator The function with which the box can be createed , if not there
     * @param cache   The cache to use
     */
    private static find<T extends Box>(element: PiElement, role: string, creator: () => T, cache: BoxCache<T>): T {
        // 1. Create the alias box, or find the one that already exists for this element and role
        const elementId = element.piId();
        if (!!cache[elementId]) {
            const box = cache[elementId][role];
            if (!!box) {
                LOGGER.log(":: new " + box.kind + " for entity " + elementId + " role " + role + " already exists");
                return box;
            } else {
                const newBox = creator();
                LOGGER.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "            CREATED");
                cache[elementId][role] = newBox;
                return newBox;
            }
        } else {
            const newBox = creator();
            LOGGER.log(":: new " + newBox.kind + " for entity " + elementId + " role " + role + "               CREATED");
            cache[elementId] = {};
            cache[elementId][role] = newBox;
            return newBox;
        }
    }

    static alias(element: PiElement, role: string, placeHolder: string, initializer?: Partial<AliasBox>): AliasBox {
        if (cacheAliasOff) {
            return new AliasBox(element, role, placeHolder, initializer);
        }
        // 1. Create the alias box, or find the one that already exists for this element and role
        const creator = () => new AliasBox(element, role, placeHolder, initializer);
        const result: AliasBox = this.find<AliasBox>(element, role, creator, aliasCache);

        runInAction( () => {
            // 2. Apply the other arguments in case they have changed
            result.placeholder = placeHolder;
            result.textHelper.setText("");
            PiUtils.initializeObject(result, initializer);
        });
        return result;
    }

    static label(element: PiElement, role: string, getLabel: string | (() => string), initializer?: Partial<LabelBox>): LabelBox {
        if (cacheLabelOff) {
            return new LabelBox(element, role, getLabel, initializer);
        }
        // 1. Create the alias box, or find the one that already exists for this element and role
        const creator = () => new LabelBox(element, role, getLabel, initializer);
        const result: LabelBox = this.find<LabelBox>(element, role, creator, labelCache);

        // 2. Apply the other arguments in case they have changed
        PiUtils.initializeObject(result, initializer);

        return result;
    }

    static text(element: PiElement, role: string, getText: () => string, setText: (text: string) => void, initializer?: Partial<TextBox>): TextBox {
        if (cacheTextOff) {
            return new TextBox(element, role, getText, setText, initializer);
        }
        // 1. Create the  box, or find the one that already exists for this element and role
        const creator = () => new TextBox(element, role, getText, setText, initializer);
        const result: TextBox = this.find<TextBox>(element, role, creator, textCache);

        // 2. Apply the other arguments in case they have changed
        runInAction( () => {
            result.getText = getText;
            result.setText = setText;
            PiUtils.initializeObject(result, initializer);
        });

        return result;
    }

    static indent(element: PiElement, role: string, indent: number, childBox: Box): IndentBox {
        return new IndentBox(element, role, indent, childBox);
        // 1. Create the  box, or find the one that already exists for this element and role
        // const creator = () => new IndentBox(element, role, indent, childBox);
        // const result: IndentBox = this.find<IndentBox>(element, role, creator, indentCache);

        // 2. Apply the other arguments in case they have changed
        // result.indent = indent;
        // result.child= childBox
        //
        // return result;
    }

    static horizontalList(element: PiElement, role: string, children?: (Box | null)[], initializer?: Partial<HorizontalListBox>): HorizontalListBox {
        return new HorizontalListBox(element, role, children, initializer);
    }

    static verticalList(element: PiElement, role: string, children?: (Box | null)[], initializer?: Partial<VerticalListBox>): VerticalListBox {
        return new VerticalListBox(element, role, children, initializer);
    }

    static select(element: PiElement,
                  role: string,
                  placeHolder: string,
                  getOptions: (editor: PiEditor) => SelectOption[],
                  getSelectedOption: () => SelectOption | null,
                  selectOption: (editor: PiEditor, option: SelectOption) => Promise<BehaviorExecutionResult>,
                  initializer?: Partial<SelectBox>): SelectBox {
        if (cacheSelectOff) {
            return new SelectBox(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer);
        }
        // 1. Create the  box, or find the one that already exists for this element and role
        const creator = () => new SelectBox(element, role, placeHolder, getOptions, getSelectedOption, selectOption, initializer);
        const result: SelectBox = this.find<SelectBox>(element, role, creator, selectCache);

        // 2. Apply the other arguments in case they have changed
        result.placeholder = placeHolder;
        result.getOptions = getOptions;
        result.getSelectedOption = getSelectedOption;
        result.selectOption = selectOption;
        PiUtils.initializeObject(result, initializer);

        return result;
    }

    static optional(element: PiElement, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, aliasText: string): OptionalBox {
        return new OptionalBox(element, role, condition, box, mustShow, aliasText);
    }
}
