<Menu style="border-radius: 2px; background-color: var(--theme-colors-inverse_color)" origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="File menu">{activatorTitle} <Icon> <svelte:component this={arrowDropDown}/> </Icon></Button>
		</span>
    <!--  here the list of menu options should be placed -->
    <div class="menu-list">
        {#each menuItems as item (item.id)}
            <!-- style needs to be added here, not as class -->
            <Menuitem style="font-size: var(--pi-menuitem-font-size);
                    margin: 4px 10px;
                    padding: 2px;
                    height: 28px;"
                      on:click={() => handleClick(item.id)}>
                {item.title}
            </Menuitem>
            <!-- show a line between the import and other menu items -->
            {#if (item.id == 6)}
                <hr>
            {/if}
        {:else}
            <p>There are no items to show...</p>
        {/each}
    </div>
</Menu>

<!-- `file_selector` is a hidden element to be able to show a file selection browser -->
<!-- The `multiple` attribute lets users select multiple files. -->
<!-- The `accept` attribute sets the file extensions that are allowed.  -->
<input class:file_selector bind:this={file_selector} {...file_selector_props} on:change={process_files}>

<script lang="ts">
    import { Button, Icon, Menu, Menuitem } from "svelte-mui";
    import arrowDropDown from "../assets/icons/svg/arrow_drop_down.svg";
    import type { MenuItem } from "../webapp-ts-utils/MenuUtils";
    import { metaTypeForExtension } from "../webapp-ts-utils/MenuUtils";
    import { ServerCommunication } from "../server/ServerCommunication";
    import { EditorCommunication } from "../editor/EditorCommunication";

    import {
        currentModelName,
        currentUnitName,
        fileExtensions,
        leftPanelVisible,
        modelNames,
        newUnitDialogVisible,
        openModelDialogVisible,
        openMpsModelDialogVisible,
        deleteModelDialogVisible,
        unitNames
    } from "../webapp-ts-utils/WebappStore";
    import { setUserMessage } from "../webapp-ts-utils/UserMessageUtils";

    // variables for the file import
    let file_selector;
    let file_extensions = `${$fileExtensions.map(entry => `${entry}`).join(", ")}`;
    let file_selector_props = {
        type: "file",
        multiple: true,
        accept: file_extensions,
    };

    // when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
        menuItem.action(id);
        // if the leftpanel is opened (is the case when this menu is used from MenuList), then close it
        $leftPanelVisible = false;
    };

    // new model menuitem
    const changeModel = () => {
        // get list of models from server
        ServerCommunication.getInstance().loadModelList((names: string[]) => {
            if (names.length > 0) {
                $modelNames = names;
            }
            $openModelDialogVisible = true;
        });
    }

    // new unit menuitem
    const newUnit = () => {
        // get list of units from server, because new unit may not have the same name as an existing one
        ServerCommunication.getInstance().loadUnitList($currentModelName, (names: string[]) => {
            // list may be empty => this is the first unit to be stored
            $unitNames = names;
            $newUnitDialogVisible = true;
        });
    }

    // save unit menuitem
    const saveUnit = () => {
        console.log("FileMenu.saveUnit: " + $currentUnitName);
        EditorCommunication.getInstance().saveCurrentUnit();
    }

    // delete model menuitem
    const deleteModel = () => {
        console.log("FileMenu.deleteModel");
        // get list of models from server
        ServerCommunication.getInstance().loadModelList((names: string[]) => {
            // if list not empty, show dialog
            if (names.length > 0) {
                $modelNames = names;
                $deleteModelDialogVisible = true;
                console.log("dialog visible is true")
            }
        });
    }

    // import model unit menuitem
    const importUnit = () => {
        // open the file browse dialog
        file_selector.click();
    }

    const process_files = (event) => {
        const fileList: FileList = event.target.files;
        const reader = new FileReader();
        // todo check whether the name of the unit already exists in the model
        for (let file of fileList) {
            // todo async: wait for file to be uploaded before starting next
            // todo do something with progress indicator
            // reader.addEventListener('progress', (event) => {
            //     if (event.loaded && event.total) {
            //         const percent = (event.loaded / event.total) * 100;
            //         console.log(`Progress: ${Math.round(percent)}`);
            //     }
            // });
            // to check whether the file is recognisable as a model unit, we examine the file extension
            const extension: string = file.name.slice(-4);
            let metaType: string = metaTypeForExtension(extension);
            // if the right extension has been found, continue
            if (metaType.length > 0) {
                reader.readAsText(file);
                reader.onload = function() {
                    const text = reader.result;
                    if (typeof text == "string") {
                        try {
                            EditorCommunication.getInstance().unitFromFile(reader.result as string, metaType);
                        } catch (e) {
                            setUserMessage(`${e.message}`);
                        }
                    }
                };
                reader.onerror = function() {
                    setUserMessage(reader.error.message);
                };
            } else {
                setUserMessage(`File ${file.name} does not have the right (extension) type.`);
            }
        }
    }

    // new model menuitem
    const openMPS = async () => {
        // TODO Thiss model URL is fixed for now
        const answer = await fetch(`http://localhost:2904/modules/org.projectit.mps.structure.to.ast.example`);
        // const answer = await fetch(`http://localhost:2904/modules`);
        // alert(answer);
        const text = await answer.text();
        // alert(text);
        const msg = JSON.parse(text)
        if (msg["success"] === false) {
            alert("data not obtained: " + msg["message"]);
            return;
        }else {
            const roots: Object[] = msg["value"]["models"];
            $modelNames = roots.map(model => {
                const conceptParts = (model["qualifiedName"] as string).split('.');
                const concept = conceptParts[conceptParts.length-1];
                return (!!model["qualifiedName"] ? model["qualifiedName"] : "no name"+ " (" + concept + ")");
            });
        }
        const data = msg.value;
        // document.getElementById("title").innerHTML = data.properties["name"];
        // // get list of models from server
        // ServerCommunication.getInstance().loadModelList((names: string[]) => {
        //     if (names.length > 0) {
        //         $modelNames = names;
        //     }
            $openMpsModelDialogVisible = true;
        // });
    }


    // the content of this menu
    let activatorTitle: string = "File";
    // TODO should we disable import when no parser is available??
    let menuItems: MenuItem[] = [
        {title: "New or Open Model", action: changeModel, id: 1},
        {title: 'New Unit', action: newUnit, id: 3},
        {title: 'Save Current Unit', action: saveUnit, id: 5},
        {title: 'Delete Model', action: deleteModel, id: 6},
        {title: '(Experimental) Import Unit(s)...', action: importUnit, id: 7},
        {title: '(TODO) Open MPS model', action: openMPS, id: 8}
    ];

    // the styling of the menu activator
    export let props;
</script>

<style>
    .menu-list {
        color: var(--theme-colors-color);
        background-color: var(--theme-colors-inverse_color);
    }
    .file_selector {
        display:none;
    }
</style>
