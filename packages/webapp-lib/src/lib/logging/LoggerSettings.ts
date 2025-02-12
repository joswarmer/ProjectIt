import { FreLogger } from "@freon4dsl/core";

export let inDevelopment = false

/**
 * Sets the development flag, logging will be turned off completely when false.
 * @param v
 */
export function setDevelopment(v: boolean): void {
    inDevelopment = v;
}

// Mute or unmute logs here (in addition to elsewhere).
export function muteLogs() {
    // from ~/core-svelte:
    FreLogger.mute("ContextMenu");
    FreLogger.mute("DropdownComponent");
    FreLogger.mute("EmptyLineComponent"); // currently, there is no LOGGER for EmptyLineComponent
    FreLogger.mute("ElementComponent");
    FreLogger.mute("GridCellComponent");
    FreLogger.mute("GridComponent");
    FreLogger.mute("IndentComponent"); // currently, there is no LOGGER for IndentComponent
    FreLogger.mute("LabelComponent");
    FreLogger.mute("LayoutComponent");
    FreLogger.mute("ListComponent");
    FreLogger.mute("OptionalComponent");
    FreLogger.mute("OptionalComponentNew");
    FreLogger.mute("FreonComponent");
    FreLogger.mute("RenderComponent");
    FreLogger.mute("TableCellComponent");
    FreLogger.mute("TableComponent");
    FreLogger.mute("TextComponent");
    FreLogger.mute("TextDropdownComponent");

    // from ~/core:
    FreLogger.mute("FreEditor");
    FreLogger.mute("FreUtils");
    FreLogger.mute("SelectOptionList");
    FreLogger.mute("BoxFactory");
    FreLogger.mute("FreLanguage");
    FreLogger.mute("TableUtil");
    FreLogger.mute("TableBox");
    FreLogger.mute("TextBox");
    FreLogger.mute("SelectBox");
    FreLogger.mute("HorizontalListBox");
    FreLogger.mute("ActionBox");
    FreLogger.mute("FreCommand");
    FreLogger.mute("BehaviorUtils");
    FreLogger.mute("ListUtil");
    FreLogger.mute("ArrayUtil");
    FreLogger.mute("Box");
    FreLogger.mute("ListBox");
    FreLogger.mute("LayoutBox");
    FreLogger.mute("FreProjectionHandler");
    FreLogger.mute("FreLionwebSerializer");

    // from ~/webapp:
    FreLogger.mute("EditorCommunication");
    FreLogger.mute("ServerCommunication");
    FreLogger.mute("EditorState");
    FreLogger.mute("EditorRequestsHandler");

    // from current project:
    FreLogger.mute("ExampleScoper");

    // FreLogger.muteAllLogs();
}
