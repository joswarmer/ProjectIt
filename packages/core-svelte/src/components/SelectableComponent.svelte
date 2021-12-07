<script lang="ts">
    import {
        Box,
        LabelBox,
        PiEditor,
        PiLogger
    } from "@projectit/core";
    import { autorun } from "mobx";
    import { afterUpdate, tick } from "svelte";
    import { AUTO_LOGGER } from "./ChangeNotifier";

    // Parameters
    export let box: Box = new LabelBox(null, "DUMMY", "LABEL");
    export let editor: PiEditor;

    let LOGGER = new PiLogger("SelectableComponent");
    let XLOGGER = new PiLogger("X");
    let isSelected: boolean = false;
    let className: string;
    let element: HTMLDivElement = null;

    const onClick = (event: MouseEvent) => {
        LOGGER.log("SelectableComponent.onClick: " + event + " for box " + box.role);
        isSelected = !isSelected;

        if (box.selectable) {
            LOGGER.log("       ===> selected box " + box.role);
            editor.selectedBox = box;
            event.preventDefault();
            event.stopPropagation();
        }
    };

    afterUpdate(async () => {
        LOGGER.log("!!!!! SelectableComponent.afterupdate for box " + box.role + " element " + box.element.piId());
        if (element === null) {
            return;
        }
        const rect: ClientRect = element.getBoundingClientRect();
        if (box !== null && box !== undefined) {
            box.actualX = rect.left;
            box.actualY = rect.top;
            box.actualHeight = rect.height;
            box.actualWidth = rect.width;
            // XLOGGER.log("   actual is (" + Math.round(box.actualX) + ", " + Math.round(box.actualY) + ")");
        }

        if (isSelected) {
            // console.log("     setting focus from afterupdate to box " + box.role);
            box.setFocus();
        }
    });

    autorun(() => {
        AUTO_LOGGER.log("SelectableComponent for box: " + box.role);
        isSelected = editor?.selectedBox === box;
        className = (isSelected ? "selectedComponent" : "unSelectedComponent");
        if (isSelected) {
            // console.log("     setting focus from AUTO  to box " + box.role);
            box.setFocus();
        }
    });
</script>

<!-- NOTE The clientHeight binding is here to ensure that the afterUpdate is fired.
     If it isn't there, afterUpdate will never be fired.
-->
<div class={className}
     tabIndex={0}
     on:click={onClick}
     bind:clientHeight={box.actualHeight}
     bind:this={element}>
    <slot class="slot" editor={editor} />
</div>

<style>
    .slot {
        display: inline;
    }

    .unSelectedComponent {
        background: transparent;
        border: none;
        display: inline-block;
        vertical-align: top;
    }

    .selectedComponent {
        background-color: var(--theme-colors-bg_selected);
        border: 1px solid var(--theme-colors-border_selected);
        box-sizing: border-box;
        display: inline-block;
        vertical-align: top;
        border-radius: 3px;
    }
</style>
