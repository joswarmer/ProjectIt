<script lang="ts">
    import { conceptStyle, styleToCSS } from "@projectit/core";
    import type { GridBox, GridCell, PiEditor } from "@projectit/core";
    import { afterUpdate } from "svelte";
    import { AUTO_LOGGER, ChangeNotifier, UPDATE_LOGGER } from "./ChangeNotifier";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { autorun } from "mobx";

    export let gridBox: GridBox;
    export let editor: PiEditor;

    // const className = classNames(this.props.box.style, styles.maingrid);

    let showgrid = gridBox;
    let notifier = new ChangeNotifier();
    afterUpdate(() => {
        UPDATE_LOGGER.log("ListComponent.afterUpdate")
        // Triggers autorun
        notifier.notifyChange();
    });

    let cells: GridCell[];
    let templateColumns: string;
    let templateRows: string;
    let boxStyle = ""

    autorun(() => {
        AUTO_LOGGER.log("GridComponent[" + notifier.dummy + "] ");
        showgrid = gridBox;
        cells = showgrid.cells;
        cells.forEach(cell => {
        });
        templateRows = `repeat(${showgrid.numberOfRows() - 1}, auto)`;
        templateColumns = `repeat(${showgrid.numberOfColumns() - 1}, auto)`;
        boxStyle = styleToCSS(conceptStyle(editor.style, editor.theme, gridBox.element.piLanguageConcept(), "grid", gridBox.style));

    });
</script>
<div
        style=" grid-template-columns: {templateColumns};
                grid-template-rows: {templateRows};
                {boxStyle}
              "
        id={showgrid.id}
        class="maingridcomponent"
>
    {#each cells as cell (cell.box.id)}
        <GridCellComponent cell={cell} editor={editor}/>
    {/each}
</div>

<style>
    .maingridcomponent {
        display: inline-grid;
        /*grid-gap: 2px;*/
        align-items: center;
        align-content: center;
        justify-items: stretch;
         border-width: 1pt;
        border-style: solid;
    }
</style>
