<div>
    <Group>
        {#each $unitTypes as name}
            <Separator/>
            <Subtitle>{name}</Subtitle>
            <List class="demo-list" dense>
                {#if !!myUnits}
                    {#each myUnits as unit, index}
                        {#if unit.freLanguageConcept() === name}
                            <div
                                    class={Object.keys(anchorClasses).join(index + ' ')}
                                    use:Anchor={{addClass: addClass, removeClass: removeClass}}
                                    bind:this={anchor[index]}
                            >
                                <Item activated={(unit.name === $currentUnitName?.name)}
                                      on:SMUI:action={() => menus[index].setOpen(true)}>
                                    <Text>{unit.name}</Text>
                                </Item>
                                <Menu bind:this={menus[index]}
                                      anchor={false}
                                      bind:anchorElement={anchor[index]}
                                      anchorCorner="BOTTOM_LEFT"
                                >
                                    <List>
                                        <Item on:SMUI:action={() => (openUnit(index))}>
                                            <Text>Open</Text>
                                        </Item>
                                        <Item on:SMUI:action={() => (saveUnit(index))} disabled={WebappConfigurator.getInstance().isDemo}>
                                            <Text>Save</Text>
                                        </Item>
                                        <Item on:SMUI:action={() => (renameUnit(index))} disabled={WebappConfigurator.getInstance().isDemo}>
                                            <Text>Rename</Text>
                                        </Item>
                                        <Item on:SMUI:action={() => (deleteUnit(index))} disabled={WebappConfigurator.getInstance().isDemo}>
                                            <Text>Delete</Text>
                                        </Item>
                                        <Separator/>
                                        <Item on:SMUI:action={() => (exportUnit(index))} disabled={WebappConfigurator.getInstance().isDemo}>
                                            <Text>Export</Text>
                                        </Item>
                                    </List>
                                </Menu>
                            </div>
                        {/if}
                    {/each}
                {:else}
                    <div>
                        <Item activated={false}>
                            <Text>no units available</Text>
                        </Item>
                    </div>
                {/if}
            </List>
        {/each}
        <Separator/>
    </Group>
</div>

<script lang="ts">
    import List, { Group, Item, Separator, Text } from "@smui/list";
    import { unitTypes } from "../stores/LanguageStore.js";
    import { currentUnitName, toBeDeleted, toBeRenamed, units } from "../stores/ModelStore.js";
    import MenuComponentDev from "@smui/menu";
    import Menu from "@smui/menu";
    import { Subtitle } from "@smui/drawer";
    import { deleteUnitDialogVisible, renameUnitDialogVisible } from "../stores/DialogStore.js";
    import { EditorState } from "../../language/EditorState.js";
    import { setUserMessage } from "../stores/UserMessageStore.js";
    import { ImportExportHandler } from "../../language/ImportExportHandler.js";
    import { Anchor } from "@smui/menu-surface";
    import { FreErrorSeverity, type FreModelUnit } from "@freon4dsl/core";
    import {WebappConfigurator} from "$lib";
    
    // TODO add rename option to context menu
    let menus: MenuComponentDev[] = [];
    // following is used to position the menu
    let anchor: HTMLDivElement[] = [];
    let anchorClasses: { [k: string]: boolean } = {};

    const addClass = (className: string) => {
        if (!anchorClasses[className]) {
            anchorClasses[className] = true;
        }
    }
    const removeClass = (className: string) => {
        if (anchorClasses[className]) {
            delete anchorClasses[className];
            anchorClasses = anchorClasses;
        }
    }
    // end positioning

    let myUnits: FreModelUnit[] = [];
    $: myUnits = !!$units && $units.length > 0
        ? $units.sort((u1, u2) => {
            if (u1.name > u2.name) {
                return 1;
            }
            if (u1.name < u2.name) {
                return -1;
            }
            return 0;
        })
        : [];

    const openUnit = (index: number) => {
        EditorState.getInstance().openModelUnit($units[index]);
    };

    const deleteUnit = (index: number) => {
        // console.log("ModelInfo.deleteUnit: " + $units[index].name);
        $toBeDeleted = $units[index];
        $deleteUnitDialogVisible = true;
    };

    const saveUnit = (index: number) => {
        // console.log("ModelInfo.saveUnit: " + $units[index].name);
        if ($units[index].name === $currentUnitName.name) {
            EditorState.getInstance().saveCurrentUnit();
            setUserMessage(`Unit '${$units[index].name}' saved.`, FreErrorSeverity.Warning);
        } else {
            setUserMessage(`Unit '${$units[index].name}' has no changes.`, FreErrorSeverity.Warning);
        }
    };

    const renameUnit = (index: number) => {
        // console.log("ModelInfo.renameUnit: " + $units[index].name);
        $toBeRenamed = $units[index];
        $renameUnitDialogVisible = true;
    };

    const exportUnit = (index: number) => {
        // TODO Only allow export of current unit, may be extended to other units.
        if ($units[index].name !== $currentUnitName.name) {
            // TODO make error message more clear
            setUserMessage('Can only export unit in editor', FreErrorSeverity.Warning);
        } else {
            new ImportExportHandler().exportUnit($units[index]);
        }
    };
</script>

<style>
    * :global(.demo-list) {
        max-width: 600px;
        /* todo use color variable here */
        border-left: 1px solid darkred;
    }
</style>
