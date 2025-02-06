import { FreLogger } from "@freon4dsl/core";

/**
 * Configure loggers. Loggers are muted by default, unmuting loggers that you want to
 * activate here.
 */
export function configureLoggers() {
    // // Activate the following loggers
    FreLogger.unmute("ContextMenu")
    // FreLogger.unmute("MobxDecorators")
    // FreLogger.unmute("TextComponent")
    // FreLogger.unmute("TextDropdownComponent")
    // FreLogger.unmute("DropdownComponent")
    // FreLogger.unmute("EditorState")
    // FreLogger.unmute("InMemoryModel")
    // FreLogger.unmute("TextComponent")
    // FreLogger.unmute("ServerCommunication")
    
    // // Do not show log messages contaning any of these strings
    // FreLogger.setFilter(["beforeUpdate", "setFocus", "afterUpdate", "onMount", "REFRESH", "refresh"])
}
