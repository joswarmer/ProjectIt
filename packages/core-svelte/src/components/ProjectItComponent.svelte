<script lang="ts">
    import {
        PiEditor,
        PiLogger,
        Box,
        KEY_ARROW_UP,
        KEY_ARROW_DOWN,
        KEY_TAB,
        KEY_BACKSPACE,
        KEY_ARROW_LEFT,
        KEY_DELETE,
        KEY_ARROW_RIGHT
    } from "@projectit/core";
    import { autorun } from "mobx";
    import { AUTO_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";

    let LOGGER = new PiLogger("ProjectItComponent");
    export let editor: PiEditor;

    function stopEvent(event: KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

    }

    const onKeyDown = async (event: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + event.key);
        // event.persist();
        if (event.ctrlKey || event.altKey) {
            switch (event.key) {
                case KEY_ARROW_UP:
                    editor.selectParentBox();
                    event.preventDefault();
                    break;
                case KEY_ARROW_DOWN:
                    editor.selectFirstLeafChildBox();
                    event.preventDefault();
                    break;
            }
        } else if (event.shiftKey) {
            switch (event.key) {
                case KEY_TAB:
                    editor.selectPreviousLeaf();
                    event.preventDefault();
                    break;
            }
        } else if (event.altKey) {
            // All alt keys here
        } else {
            // No meta key pressed
            switch (event.key) {
                case KEY_BACKSPACE:
                case KEY_ARROW_LEFT:
                    editor.selectPreviousLeaf();
                    stopEvent(event)
                    break;
                case KEY_DELETE:
                    editor.deleteBox(editor.selectedBox);
                    stopEvent(event);
                    break;
                case KEY_TAB:
                case KEY_ARROW_RIGHT:
                    editor.selectNextLeaf();
                    stopEvent(event);
                    break;
                case KEY_ARROW_DOWN:
                    const down = editor.boxBelow(editor.selectedBox);
                    LOGGER.log("!!!!!!! Select down box " + down?.role);
                    if (down !== null && down !== undefined) {
                        editor.selectBoxNew(down);
                    }
                    stopEvent(event);
                    break;
                case KEY_ARROW_UP:
                    LOGGER.log("Up: " + editor.selectedBox.role);
                    const up = editor.boxAbove(editor.selectedBox);
                    if (up !== null) {
                        editor.selectBoxNew(up);
                    }
                    stopEvent(event);
                    break;
            }
        }
        event.stopPropagation();
    };

    let rootBox: Box;
    autorun(() => {
        AUTO_LOGGER.log("==================> ProjectItComponent")
        rootBox = editor.rootBox;
    });

    /**
     * The current main element os this component.
     */
    let element: HTMLDivElement;

    /**
     * Keep track of the scrolling position in the editor, so we know exactly where bozes are
     * in relationship with each other.
     */
    function onScroll() {
        editor.scrollX = element.scrollLeft;
        editor.scrollY = element.scrollTop;
    }
</script>

<div class={"projectit"}
     tabIndex={0}
     on:keydown={onKeyDown}
     on:scroll={onScroll}
     bind:this={element}
>
    <RenderComponent editor={editor}
                     box={rootBox}
    />
</div>

<style>
    .projectit {
        height: 100%;
        width: 100%;
        overflow-x: auto;
        font-size: var(--theme-fonts-size_editor);
        font-style: var(--theme-fonts-style_editor);
        font-weight: var(--theme-fonts-weight_editor);
        font-family: var(--theme-fonts-family_editor);
        color: var(--theme-colors-text_editor);
        background-color: var(--theme-colors-bg_editor);
    }
</style>
