<script lang="ts">
    import { autorun } from "mobx";
    import { afterUpdate, onDestroy, onMount } from "svelte";
    import { AUTO_LOGGER, ChangeNotifier, FOCUS_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import { Box, conceptStyle, HorizontalListBox, PiEditor, PiLogger, styleToCSS } from "@projectit/core";
    import { isHorizontalBox } from "@projectit/core";

    // Parameters
    export let list = new HorizontalListBox(null, "l1");
    export let editor: PiEditor;

    // Local state variables
    let LOGGER: PiLogger = new PiLogger("ListComponent");
    let svList: HorizontalListBox = list;
    let svNotifier = new ChangeNotifier();
    let element: HTMLDivElement;

    onDestroy(() => {
        LOGGER.log("DESTROY LIST  COMPONENT")
    });

    async function setFocus(): Promise<void> {
        FOCUS_LOGGER.log("ListComponent.setFocus for box " + list.role);
        if (!!element) {
            element.focus();
        }
    }
    onMount( () => {
        list.setFocus = setFocus;
    });

    afterUpdate(() => {
        UPDATE_LOGGER.log("ListComponent.afterUpdate for " + list.role);
        list.setFocus = setFocus;
        // NOTE: Triggers autorun whenever an element is added or delete from the list
        svNotifier.notifyChange();
    });
    // Local Variables
    let gridStyle;
    let cssGrgVars: string;
    autorun(() => {
        svNotifier.dummy
        // let boxes: ReadonlyArray<Box> = [];
        AUTO_LOGGER.log("ListComponent[" + "] " + list.role + " children " + list.children.length)
        svList = list;
        list.setFocus = setFocus;

        const nrOfBoxes = svList.children.length;
        gridStyle =
            isHorizontalBox(svList)
                ? {
                    gridTemplateColumns: "repeat(" + nrOfBoxes + ", auto)",
                }
                : {
                    gridTemplateRows: "repeat(" + nrOfBoxes + ", auto)",
                    gridTemplateColumns: "repeat(1, auto)",
                    backgroundColor: "green"
                };
        cssGrgVars = `--pi-list-grid-template-rows:   ${gridStyle.gridTemplateRows};
                      --pi-list-grid-template-columns:${gridStyle.gridTemplateColumns};
                     `
        // useless, list has no contents!
        + styleToCSS(conceptStyle(editor.style, editor.theme, list.element.piLanguageConcept(), "list", list.style));
    });

    // TODO Empty vertical list gives empty line, try to add entities in the example.
    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ListComponent.onFocus for box " + list.role);
        // e.preventDefault();
        // e.stopPropagation();
    }
    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ListComponent.onBlur for box " + list.role);
        // e.preventDefault();
        // e.stopPropagation();
    }
</script>

<span class="list-component"
      style="{cssGrgVars}"
      on:click
      on:focus={onFocusHandler}
      on:blur={onBlurHandler}
      tabIndex={0}
      bind:this={element}
>
    {#if isHorizontalBox(svList) }
        <div class="horizontalList"  on:click>
            {#each svList.children as box (box.id)}
                <RenderComponent box={box} editor={editor}/>
            {/each}
        </div>
    {:else}
        <div class="verticalList"  on:click>
            {#each svList.children as box (box.id)}
                <RenderComponent box={box} editor={editor}/>
            {/each}
        </div>
    {/if}
</span>

<style>
    .list-component {
        --pi-list-grid-template-columns: "";
        --pi-list-grid-template-rows: "";
        --pi-list-background-color: var(--inverse-color);
    }
    .horizontalList {
        grid-template-rows: var(--pi-list-grid-template-rows);
        grid-template-columns: var(--pi-list-grid-template-columns);
        white-space: nowrap;
        vertical-align: top;
        display: inline-block;
        background-color: var(--pi-list-background-color);
    }

    .verticalList {
        grid-template-rows: var(--pi-list-grid-template-rows);
        grid-template-columns: var(--pi-list-grid-template-columns);
        display: grid;
        background-color: var(--pi-list-background-color);
        /*margin-top: 10px;*/
    }
</style>


