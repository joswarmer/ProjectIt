<!-- This component does all the screen handling for both an Alias and a Select Component.
-->
<script lang="ts">
    import {
        BehaviorExecutionResult,
        AbstractChoiceBox,
        EVENT_LOG,
        executeBehavior,
        isAliasBox,
        isMetaKey,
        isPrintable,
        PiEditor,
        PiLogger,
        PiUtils,
        toPiKey,
        isSelectBox,
        findOption,
        KEY_ENTER,
        KEY_TAB,
        KEY_ARROW_DOWN,
        KEY_ARROW_UP,
        KEY_SPACEBAR, KEY_ESCAPE, KEY_DELETE, KEY_ARROW_LEFT, KEY_BACKSPACE, KEY_ARROW_RIGHT, styleToCSS, conceptStyle
    } from "@projectit/core";
    import type { SelectOption } from "@projectit/core";
    import { action, autorun, runInAction } from "mobx";
    import { clickOutside } from "./clickOutside";
    import { afterUpdate, onMount } from "svelte";
    import { writable } from "svelte/store";
    import type { Writable } from "svelte/store";
    import { SelectOptionList } from "./SelectableOptionList";
    import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import SelectableComponent from "./SelectableComponent.svelte";
    import TextComponent from "./TextComponent.svelte";
    import DropdownComponent from "./DropdownComponent.svelte";

    // Svelte Parameters
    export let choiceBox: AbstractChoiceBox;
    export let editor: PiEditor;

    // Local Variables
    let openStore: Writable<boolean> = writable<boolean>(false);
    let LOGGER = new PiLogger("AliasComponent");
    let dropdownComponent: DropdownComponent;
    let textComponent: TextComponent;
    let selectedOption: SelectOption;
    let selectableOptionList = new SelectOptionList(editor);
    let isEditing: boolean = false;

    function setOpen(msg: string, value: boolean) {
        // LOGGER.log("SET OPEN " + choiceBox?.role + " from " + $openStore + " to " + value + " in " + msg );
        $openStore = value;
        // isEditing = true;
    }

    const getAliasOptions = (): SelectOption[] => {
        return selectableOptionList.getFilteredOptions();
    };

    const setFocus = async (): Promise<void> => {
        LOGGER.log("AliasComponent set focus " + choiceBox.role);
        if (!!textComponent) {
            textComponent.setFocus();
        } else {
            LOGGER.log("?ERROR? textComponent is null in setFocus.");
        }
    };

    onMount(() => {

        MOUNT_LOGGER.log("onMount for role [" + choiceBox.role + "] with textComponent " + textComponent);
        runInAction( () => {
            choiceBox.textBox.setFocus = setFocus;
            choiceBox.textBox.style = choiceBox.style;
            choiceBox.setFocus = setFocus;
            const selected = choiceBox.getSelectedOption();
            if (!!selected) {
                choiceBox.textBox.setText(selected.label);
            }
        });
    });

    afterUpdate(() => {
        UPDATE_LOGGER.log("AfterUpdate");
        choiceBox.triggerKeyPressEvent = triggerKeyPressEvent;
        choiceBox.textBox.setFocus = setFocus;
        choiceBox.setFocus = setFocus;
        const selected = choiceBox.getSelectedOption();
        if (!!selected) {
            choiceBox.textBox.setText(selected.label);
        }
        UPDATE_LOGGER.log("afterupdate ==> selectedBox " + !!editor.selectedBox + " choiceBox " + !!choiceBox + " choiceBox.textbox " + !!choiceBox.textBox);
    });

    /**
     * Trigger a key event for `key`.
     * @param {string} key
     * @returns {Promise<void>}
     */
    const triggerKeyPressEvent = async (key: string) => {
        LOGGER.info(this, "triggerKeyPressEvent " + key);
        isEditing = true;
        if (!!textComponent) {
            // textComponent.textOnScreen = key;
            // choiceBox.textHelper.setText(key);
        }
        const aliasResult = await executeBehavior(choiceBox, key, key, editor);
        await handleStringInput(key, aliasResult);
    };

    const handleStringInput = async (s: string, aliasResult: BehaviorExecutionResult) => {
        LOGGER.info(this, "handleStringInput for box " + choiceBox.role);
        switch (aliasResult) {
            case BehaviorExecutionResult.EXECUTED:
                // if (!!textComponent) {
                //     textComponent.textOnScreen = choiceBox.getSelectedOption().label;
                // }
                // choiceBox.textHelper.setText(s);
                setOpen("handleStringInput Alias executed", false);
                isEditing = false;
                const selected = choiceBox.getSelectedOption();
                if (!!selected) {
                    choiceBox.textBox.setText(selected.label);
                }
                break;
            case BehaviorExecutionResult.PARTIAL_MATCH:
                LOGGER.info(this, "PARTIAL_MATCH");
                selectableOptionList.text = s;
                setOpen("handleStringInput", true);
                break;
            case BehaviorExecutionResult.NO_MATCH:
                LOGGER.info(this, "NO MATCH");
                selectableOptionList.text = s;
                break;
        }
        return aliasResult;
    };

    const onKeyPress = async (e: KeyboardEvent) => {
        EVENT_LOG.log("onKeyPress: " + e.key + " for role " + choiceBox.role);
        isEditing = true;
        if (isPrintable(e) && !e.ctrlKey) {
            EVENT_LOG.log("Press: is printable, text is now [" + textComponent.getText() + "]");
        }
    };

    const onInput = async (e: InputEvent) => {
        isEditing = true;
        const value = (e.target as HTMLElement).innerText;
        LOGGER.log("onInput: [" + value + "] for role " + choiceBox.role + " with text [" + textComponent.getText() + "]");
        let aliasResult = undefined;
        if (isAliasBox(choiceBox)) {
            const selected: SelectOption = findOption(choiceBox.getOptions(editor), value);
            LOGGER.log("    onInput alias box selected " + JSON.stringify(selected));
            if (!!selected) {
                aliasResult = await choiceBox.selectOption(editor, selected);
            } else {
                aliasResult = await choiceBox.selectOption(editor, { id: value, label: value });
            }
            if (aliasResult === BehaviorExecutionResult.EXECUTED) {
                isEditing = false;
                // LOGGER.log("onInput set text to empty");
                // choiceBox.textHelper.setText("");
            }
        } else if (isSelectBox(choiceBox)) {
            const selected: SelectOption = findOption(choiceBox.getOptions(editor), value);
            LOGGER.log("    onInput select box selected " + JSON.stringify(selected));
            if (selected !== null) {
                isEditing = false;
                aliasResult = await choiceBox.selectOption(editor, { id: value, label: value });
                choiceBox.textHelper.setText("")
            } else {
                aliasResult = BehaviorExecutionResult.NO_MATCH;
            }
            if (aliasResult === BehaviorExecutionResult.EXECUTED) {
                isEditing = false;
                choiceBox.textHelper.setText("");
            }
        } else {
            console.error("AliasComponent.onInput: should be an AliasBox or SelectBox");
            return;
        }
        LOGGER.log("onInput aliasResult: [" + aliasResult + "]");
        handleStringInput(value, aliasResult);
        // switch (aliasResult) {
        //     case BehaviorExecutionResult.EXECUTED:
        //         LOGGER.log("ALIAS MATCH");
        //         if (!!textComponent) {
        //             textComponent.textOnScreen = "";
        //         }
        //         setOpen("onInput alias executed", false);
        //         break;
        //     case BehaviorExecutionResult.PARTIAL_MATCH:
        //         LOGGER.log("PARTIAL_MATCH");
        //         selectableOptionList.text = value;
        //         setOpen("onInput alias partial match", true);
        //         break;
        //     case BehaviorExecutionResult.NO_MATCH:
        //         LOGGER.log("NO MATCH");
        //         selectableOptionList.text = value;
        //         break;
        // }
        return aliasResult;
    };

    const onKeyDown = async (e: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + e.key + " for role " + choiceBox.role);
        isEditing = true;
        if (isPrintable(e) && !e.ctrlKey) {
            LOGGER.log("Down: is printable, text is now [" + textComponent.getText() + "]");
            setOpen("onKeyDown", true);
            if (dropdownComponent !== null && dropdownComponent !== undefined) {
                dropdownComponent.handleKeyDown(e);
            }
            e.stopPropagation();
            return;
        }
        if (e.key === KEY_DELETE) {
            e.stopPropagation();
        }
        if (e.key === KEY_TAB) {
            setOpen("TAB", false);
            return;
        }
        if (e.key === KEY_ARROW_LEFT || e.key === KEY_ARROW_RIGHT) {
            setOpen("arraow at the edges", false);
        }
        if (!shouldPropagate(e)) {
            e.stopPropagation();
        }
        if ((e.key === KEY_SPACEBAR && e.ctrlKey) || (e.key === KEY_ESCAPE)) {
            setOpen("cltr-space or esacape", !$openStore);
            return;
        }
        if ($openStore) {
            // Propagate key event to dropdown component
            LOGGER.log("Forwarding event to dropdown component");
            if (dropdownComponent !== null && dropdownComponent !== undefined) {
                const x = dropdownComponent.handleKeyDown(e);
                LOGGER.log("      handled result: " + x);
            } else {
                console.error("AliasComponent.onKeyDown: DROPDOWN UNDEFINED ope " + $openStore);
            }

            e.preventDefault();
            e.stopPropagation();
        } else {
            switch (e.key) {
                case KEY_ENTER:
                    e.preventDefault();
                    if (isAliasBox(choiceBox)) {
                        await PiUtils.handleKeyboardShortcut(toPiKey(e), choiceBox, editor);
                        e.stopPropagation();
                    }
                    break;
            }
        }
    };

    const shouldPropagate = (e: KeyboardEvent): boolean => {
        if (isMetaKey(e)) {
            if (e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN || e.key === KEY_TAB) {
                return true;
            }
        }
        if (e.key === KEY_ENTER || e.key === KEY_TAB || e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN ||
            e.key === KEY_ARROW_LEFT || e.key === KEY_BACKSPACE || e.key === KEY_ARROW_RIGHT ||
            e.key === KEY_DELETE) {
            return true;
        } else {
            return false;
        }
        return false;
    };

    const onSelectOption = (event: CustomEvent<SelectOption>): void => {
        LOGGER.log("set selected SVELTE option to " + JSON.stringify(event.detail));
        isEditing = false;
        choiceBox.textHelper.setText("");
        const option = event.detail;
        choiceBox.selectOption(editor, option);
        let selected = choiceBox.getSelectedOption();
        // choiceBox.textHelper.setText(!!selected ? selected.label : "");
        LOGGER.log("      selected is " + JSON.stringify(selected));
        setOpen("selectedEvent", false);
        // if (isSelectBox(choiceBox)) {
        //     if (!!textComponent) {
        //         textComponent.textOnScreen = choiceBox.getSelectedOption().label;
        //     }
        // }
    };

    const onClick = (e: MouseEvent) => {
        LOGGER.log("onClick before open is " + $openStore);
        setOpen("onClick", !$openStore);
        LOGGER.log("onClick after, open is " + $openStore);
    };

    let listForDropdown: SelectOption[];
    let aliasStyle: string = "";

    // selectableOptionList.replaceOptions(choiceBox.getOptions(editor))
    autorun(() => {
        if ($openStore) {
            listForDropdown = selectableOptionList.getFilteredOptions();
        }
        selectedOption = choiceBox.getSelectedOption();
        AUTO_LOGGER.log("AliasComponent role " + choiceBox.role + " selectOption: " + selectedOption + " label " + selectedOption?.label + "  id " + selectedOption?.id);
        if (!!selectedOption) {
            choiceBox.textBox.setText(selectedOption.label);
        }
        let style = conceptStyle(editor.style, editor.theme, choiceBox.element.piLanguageConcept(), "alias", choiceBox.style);
        aliasStyle = styleToCSS(style);
        choiceBox.textBox.style = style;

    });

    const handleClickOutside = (event): void => {
        setOpen("clickOutside", false);
        isEditing = false;
    };

    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("AliasComponent.onFocus for box " + choiceBox.role);
        const options = choiceBox.getOptions(editor);
        selectableOptionList.replaceOptions(options);
    };

    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("AliasComponent.onBlur for box " + choiceBox.role);
        isEditing = false;
    };
</script>

<div on:keydown={onKeyDown}
     on:keypress={onKeyPress}
     on:input={onInput}
     on:focus={onFocusHandler}
     on:focusin={onFocusHandler}
     on:click={onClick}
     style="{aliasStyle}"
     use:clickOutside on:click_outside={handleClickOutside}
>
    <SelectableComponent box={choiceBox.textBox} editor={editor}>
        <TextComponent
            editor={editor}
            isEditing={isEditing}
            textBox={choiceBox.textBox}
            bind:this={textComponent}
        />
    </SelectableComponent>
    {#if $openStore}
        <DropdownComponent
            bind:this="{dropdownComponent}"
            on:pi-ItemSelected={onSelectOption}
            getOptions={getAliasOptions}
            selectedOptionId="2"
        />
    {/if}

</div>
