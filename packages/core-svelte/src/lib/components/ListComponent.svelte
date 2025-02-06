<svelte:options immutable={true}/>
<script lang="ts">
    import { LIST_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component shows a list of elements that have the same type (a 'true' list).
     * It can be shown horizontally or vertically, both are displayed as a grid with one
     * row or column, respectively.
     * This component supports drag and drop.
     */
    import { flip } from "svelte/animate";
    import {
        Box,
        dropListElement,
        isActionBox,
        isNullOrUndefined,
        FreLanguage,
        ListBox,
        ListDirection,
        ListElementInfo,
        MenuOptionsType,
        moveListElement,
        FreEditor,
        FreLogger, isReferenceBox, isLabelBox, isHorizontalBox
    } from "@freon4dsl/core";
    import RenderComponent from "./RenderComponent.svelte";
    import {
        activeElem,
        activeIn,
        draggedElem,
        draggedFrom,
        contextMenu,
        contextMenuVisible,
        componentId
    } from "$lib/index.js";
    import { afterUpdate, onMount } from "svelte";

    // Parameters
    export let box: ListBox ;
    export let editor: FreEditor;

    // Local state variables
    let LOGGER: FreLogger = LIST_LOGGER
    let id: string;                             // an id for the html element showing the list
    let htmlElement: HTMLSpanElement;
    let isHorizontal: boolean;                  // indicates whether the list should be shown horizontally or vertically
    let shownElements: Box[];                   // the parts of the list that are being shown

    // determine the type of the elements in the list
    // this speeds up the check whether an element may be dropped here
    let myMetaType: string;
    $: myMetaType = box.conceptName;

    const drop = (event: DragEvent, targetIndex) => {
        const data: ListElementInfo = $draggedElem;

        LOGGER.log("drag DROPPING item [" + data.element.freId() + "] from [" + data.componentId + "] in list [" + id + "] on position [" + targetIndex + "]");
        if (data.componentId === id) { // dropping in the same list
            moveListElement(box.node, data.element, box.propertyName, targetIndex);
        } else { // dropping in another list
            dropListElement(editor, data, myMetaType, box.node, box.propertyName, targetIndex);
        }
        // everything is done, so reset the variables
        $draggedElem = null;
        $draggedFrom = "";
        $activeElem = { row: -1, column: -1 };
        $activeIn = "";
        // Clear the drag data cache (for all formats/types)
        // event.dataTransfer.clearData(); // has problems in Firefox!
    };

    const dragend = (event: DragEvent, listId: string, listIndex: number) => {
        LOGGER.log("Drag End " + box.id ); // + " index: " + listIndex);
        return false;
    }
    const dragstart = (event: DragEvent, listId: string, listIndex: number) => {
        LOGGER.log("Drag Start " + box.id + " index: " + listIndex);
        // close any context menu
        $contextMenuVisible = false;

        // give the drag an effect
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.dropEffect = "move";

        // See https://stackoverflow.com/questions/11927309/html5-dnd-datatransfer-setdata-or-getdata-not-working-in-every-browser-except-fi,
        // which explains why we cannot use event.dataTransfer.setData. We use a svelte store instead.
        // create the data to be transferred and notify the store that something is being dragged
        $draggedElem = new ListElementInfo(shownElements[listIndex].node, id);
        $draggedFrom = listId;
    };
    const dragleave = (event: DragEvent, index): boolean => {
        LOGGER.log("Drag Leave" + box.id + " index: " + index);
        return false;
    }
    const dragenter = (event: DragEvent, index): boolean => {
        LOGGER.log("Drag Enter" + box.id+ " index: " + index);
        event.preventDefault();
        const data: ListElementInfo = $draggedElem;
        // Do nothing if no element is being dragged. Stops Svelte from thinking something has changed.
        if (isNullOrUndefined($draggedElem)) {
            return;
        }
        // only show this item as active when the type of the element to be dropped is the right one
        if (FreLanguage.getInstance().metaConformsToType(data.element, myMetaType)) {
            $activeElem = { row: index, column: -1 };
            $activeIn = id;
        }
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };
    // const dragover = (event: DragEvent, index): boolean => {
    //     LOGGER.log("drag over " + box.id);
    //     event.preventDefault();
    //     return false;
    // }
    const mouseout = (): boolean => {
        LOGGER.log("LIST mouse out " + box.id);
        // Do nothing if no element is being dragged. Stops Svelte from thinking something has changed.
        if (isNullOrUndefined($draggedElem)) {
            return;
        }
        $activeElem = { row: -1, column: -1 };
        $activeIn = "";
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };

    function showContextMenu(event: MouseEvent, index: number) {
        event.preventDefault();
        // TODO Hack to avoid separator and terminator problems.
        if (box.children.some(ch => isLabelBox(ch))) {
            console.log(" ./.. skipping")
            return;
        }
        event.stopPropagation();
        if (index >= 0 && index <= shownElements.length) {
            const elemBox: Box = shownElements[index];
            if (editor.selectedBox !== elemBox) {
                editor.selectElementForBox(elemBox);
                // $selectedBoxes = [elemBox];
            }
            // determine the contents of the menu based on listBox, before showing the menu!
            if (isActionBox(elemBox)) { // the selected box is the placeholder => show different menu items
                $contextMenu.items = box.options(MenuOptionsType.placeholder);
            } else {
                $contextMenu.items = box.options(MenuOptionsType.normal);
            }
            $contextMenu.show(event, index); // this function sets $contextMenuVisible to true
        }
    }

    async function setFocus(): Promise<void> {
        LOGGER.log("ListComponent.setFocus for box " + box.role);
        if (!!htmlElement) {
            htmlElement.focus();
        }
    }

    onMount( () => {
        LOGGER.log("ListComponent onMount --------------------------------")
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    afterUpdate(() => {
        LOGGER.log("ListComponent.afterUpdate for " + box.role);
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    const onFocusHandler = (e: FocusEvent) => {
        LOGGER.log("ListComponent.onFocus for box " + box.role);
        // e.preventDefault();
        // e.stopPropagation();
    }
    const onBlurHandler = (e: FocusEvent) => {
        LOGGER.log("ListComponent.onBlur for box " + box.role);
        // e.preventDefault();
        // e.stopPropagation();
    }

    function setPrevious(b: Box): string {
        previousBox = b;
        return "";
    }

    let previousBox = null;

    const refresh = (why?: string): void =>  {
        LOGGER.log("REFRESH ListComponent( " + why + ") " + box?.node?.freLanguageConcept());
        shownElements = [...box.children];
        id = !!box ? componentId(box) : 'list-for-unknown-box';
        isHorizontal = !!box ? (box.getDirection() === ListDirection.HORIZONTAL) : false;
    }

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("Refresh from ListComponent box changed:   " + box?.id);
    }
    // The mouseover fires when the mouse cursor is outside the element and then move to inside the boundaries of the element.
    // The mouseout fires when the mouse cursor is over an element and then moves another element.
    // The mouseenter fires when the mouse cursor is outside an element and then moves to inside the boundaries of the element.
    // The mouseleave fires when the mouse cursor is over an element and then moves to the outside of the element’s boundaries.
    // Both mouseenter and mouseleave do not bubble and do not fire when the mouse cursor moves over descendant elements.
</script>

<!-- on:focus is here to avoid a known bug in svelte 3.4*: "A11y: on:mouseover must be accompanied by on:focus with Svelte v3.40 #285" -->
<!-- Likewise on:blur is needed for on:mouseout -->
<span class={isHorizontal ? "list-component-horizontal" : "list-component-vertical"}
      id="{id}"
      bind:this={htmlElement}
      style:grid-template-columns="{!isHorizontal ? 1 : shownElements.length}"
      style:grid-template-rows="{isHorizontal ? 1 : shownElements.length}"
>
    {#each shownElements as box1, index (box1.id)}
        <span
                class="list-item"
                class:is-active={$activeElem?.row === index && $activeIn === id}
                class:dragged={$draggedElem?.propertyIndex === index && $draggedFrom === id}
                style:grid-column="{!isHorizontal ? 1 : index+1}"
                style:grid-row="{isHorizontal ? 1 : index+1}"
                animate:flip
                draggable=true
                on:dragstart|stopPropagation={event => dragstart(event, id, index)}
                on:dragend|stopPropagation={event => dragend(event, id, index)}
                on:drop|stopPropagation={event => drop(event, index)}
                on:dragover|preventDefault={event => {}}
                on:dragenter|stopPropagation={(event) => dragenter(event, index)}
                on:dragleave|stopPropagation={(event) => dragleave(event, index)}
                on:mouseout|stopPropagation={mouseout}
                on:focus={() => {}}
                on:blur={() => {$contextMenu.hide()}}
                on:contextmenu={(event) => showContextMenu(event, index)}
                role="none"
        >
            <RenderComponent box={box1} editor={editor}/>
		</span>
    {/each}
</span>
<!--                on:contextmenu|stopPropagation|preventDefault={(event) => showContextMenu(event, index)}-->

