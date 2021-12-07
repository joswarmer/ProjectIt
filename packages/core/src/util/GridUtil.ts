import {
    AliasBox,
    Box,
    HorizontalListBox,
    LabelBox,
    GridBox,
    GridCell,
    KeyboardShortcutBehavior,
    PiEditor, PiStyle, styleToCSS, BoxFactory
} from "../editor";
import { PiElement } from "../language";
// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import { MetaKey, PiKey } from "./Keys";
import * as Keys from "./Keys";
import { PiUtils, NBSP, isNullOrUndefined } from "./internal";
import { Language } from "../storage";

export class GridUtil {
    /**
     * Create grid for collection a la VerticalPiElementListBox
     */
    public static createCollectionRowGrid<ELEMENT_TYPE extends PiElement>(
        element: PiElement,
        role: string,
        listPropertyName: string,
        list: ELEMENT_TYPE[],
        columnNames: string[],
        headerStyles: PiStyle[],
        rowStyles: PiStyle[],
        columnBoxes: ((e: ELEMENT_TYPE) => Box)[],
        elementConcept: string,
        newRowText: string,
        editor: PiEditor,
        initializer?: Partial<GridBox>
    ): Box {
        PiUtils.CHECK(element[listPropertyName] === list, "createCollectionRowGrid: listPropertyname should result in the list");
        const cells: GridCell[] = [];
        if( columnNames.length !== null ) {
            columnNames.forEach((item: string, index: number) => {
                cells.push({
                    row: 1,
                    column: index + 1,
                    box: new LabelBox(element, "header" + index, () => item, {
                        // TODO Change into Svelte Style
                        // style: STYLES.headerText,
                        selectable: false
                    }),
                    style: headerStyles[index]
                });
            });
        }
        list.forEach((item: ELEMENT_TYPE, rowIndex: number) => {
            columnBoxes.forEach((projector, columnIndex) => {
                cells.push({
                    row: rowIndex + 2,
                    column: columnIndex + 1,
                    box: new HorizontalListBox(item, "xx-" + columnIndex, [projector(item), new AliasBox(item, "new-" + columnIndex, NBSP)]),
                    style: rowStyles[columnIndex]
                });
            });
        });
        cells.push({
            row: list.length + 3,
            column: 1,
            columnSpan: columnBoxes.length,
            box: new AliasBox(element, "alias-add-row-" + elementConcept, newRowText,
                {propertyName: listPropertyName, conceptName: elementConcept } ),
            style: rowStyles[0]
         });

        // Add keyboard actions to grid such that new rows can be added by Return Key
        editor.keyboardActions.splice(0, 0, this.createKeyboardShortcutForCollectionGrid<ELEMENT_TYPE>(element, role, elementConcept));
        editor.keyboardActions.splice(
            0,
            0,
            this.createKeyboardShortcutForEmptyCollectionGrid<ELEMENT_TYPE>(element, listPropertyName, elementConcept)
        );
        return new GridBox(element, role, cells, initializer);
    }

    public static createCollectionColumnGrid<ELEMENT_TYPE extends PiElement>(
        element: PiElement,
        role: string,
        list: ELEMENT_TYPE[],
        columnNames: string[],
        columnBoxes: ((e: ELEMENT_TYPE) => Box)[],
        elementConcept: string,
        editor: PiEditor,
        initializer?: Partial<GridBox>
    ): Box {
        const cells: GridCell[] = [];
        columnNames.forEach((item: string, index: number) => {
            cells.push({
                row: index + 1,

                column: 1,
                box: new LabelBox(element, "header" + index, () => item, {
                    // TODO Change into Svelte Style
                    // style: STYLES.header
                })
            });
        });
        list.forEach((item: ELEMENT_TYPE, rowIndex: number) => {
            columnBoxes.forEach((projector, columnIndex) => {
                cells.push({
                    column: rowIndex + 2,
                    row: columnIndex + 1,
                    box: new HorizontalListBox(item, "xx-" + columnIndex, [projector(item), new AliasBox(item, "new-" + columnIndex, NBSP)])
                });
            });
        });
        editor.keyboardActions.splice(0, 0, this.createKeyboardShortcutForCollectionGrid<ELEMENT_TYPE>(element, role, elementConcept));
        return new GridBox(element, role, cells, initializer);
    }

    /**
     * Create a keyboard shortcut for use in an element list
     * @param collectionRole
     * @param elementCreator
     * @param roleToSelect
     */
    public static createKeyboardShortcutForCollectionGrid<ELEMENT_TYPE extends PiElement>(
        container: PiElement,
        collectionRole: string,
        elementConcept: string,
        roleToSelect?: string
    ): KeyboardShortcutBehavior {
        console.log("GridUtil.createKeyboardShortcutForCollectionGrid " + container.piLanguageConcept() + "[" + collectionRole + "]")
        const listKeyboardShortcut: KeyboardShortcutBehavior = {
            trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
            // TODO The new-0... should become more generic.
            activeInBoxRoles: ["new-0", "new-1", "new-2", "new-3", "new-4", "new-5", "new-6", "new-7", "new-8", "new-9", "new-10"],
            action: async (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
                const element = box.element;
                const proc = element.piContainer();
                const parent: PiElement = proc.container;
                PiUtils.CHECK(parent[proc.propertyName][proc.propertyIndex] === element);
                const newElement = Language.getInstance().concept(elementConcept).constructor();
                parent[proc.propertyName].splice(proc.propertyIndex + 1, 0, newElement);

                if (!!roleToSelect) {
                    editor.selectElement(newElement, roleToSelect);
                } else {
                    editor.selectElement(newElement);
                    editor.selectFirstEditableChildBox();
                    // await editor.selectFirstLeafChildBox();
                }
                return null;
            }
        };
        return listKeyboardShortcut;
    }

    public static createKeyboardShortcutForEmptyCollectionGrid<ELEMENT_TYPE extends PiElement>(
        container: PiElement,
        propertyRole: string,
        elementConcept: string,
        roleToSelect?: string
    ): KeyboardShortcutBehavior {
        console.log("GridUtil.createKeyboardShortcutForEmptyCollectionGrid " + container.piLanguageConcept() + "[" + propertyRole + "]")
        const listKeyboardShortcut: KeyboardShortcutBehavior = {
            trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
            activeInBoxRoles: ["alias-add-row-" + elementConcept, "alias-alias-add-row-" + elementConcept + "-textbox"],
            action: async (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
                const element = box.element;
                const aliasBox = box.parent as AliasBox
                // console.log("XX ELEMENT: " + element + " role " + box.role + " boxtype " + box.kind);
                // console.log("XX ELEMENT: " + element + " parent.role " + aliasBox.role + " parent boxtype " + aliasBox.kind);
                // console.log("XX ELEMENT: " + element.piLanguageConcept() + " property: " + aliasBox.conceptName + "." + aliasBox.propertyName);
                // console.log("Type [" + elementConcept + "] concept " +  Language.getInstance().concept(aliasBox.conceptName));
                const newElement = Language.getInstance().concept(aliasBox.conceptName).constructor();
                element[aliasBox.propertyName].push(newElement);

                // console.log("Parent of new elemnt " + newElement.piLanguageConcept() + " is " + newElement.piContainer().container.piLanguageConcept());
                // console.log("Property of new elemnt " + newElement.piLanguageConcept() + " is " + newElement.piContainer().propertyName);
                if (!!roleToSelect) {
                    editor.selectElement(newElement, roleToSelect);
                } else {
                    editor.selectElement(newElement);
                    editor.selectFirstEditableChildBox();
                    // await editor.selectFirstLeafChildBox();
                }
                return null;
            }
        };
        return listKeyboardShortcut;
    }
}
