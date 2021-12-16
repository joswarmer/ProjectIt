<svelte:options accessors={true} />

<script lang="ts">
    import { autorun } from "mobx";
    import {
        KEY_BACKSPACE,
        KEY_DELETE,
        KEY_ARROW_DOWN,
        KEY_ARROW_LEFT,
        KEY_ARROW_RIGHT,
        KEY_ARROW_UP,
        KEY_ENTER, KEY_SPACEBAR,
        KEY_TAB,
        EVENT_LOG,
        isMetaKey,
        KeyPressAction, PiUtils,
        TextBox,
        PiEditor,
        toPiKey,
        isAliasTextBox,
        PiCaret, PiCaretPosition, PiLogger, isPrintable, AliasBox, KEY_ESCAPE, styleToCSS, conceptStyle, SelectBox
    } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { AUTO_LOGGER, FOCUS_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";

    const LOGGER = new PiLogger("TextComponent");
    // Is this component currently being edited by the user?
    export let isEditing: boolean = false;
    export let textBox = new TextBox(null, "role:", () => "Editable textbox", (v: string) => {
    });
    export let editor: PiEditor;

    export let getText = (): string => {
        // TODO loopt eentje achter tijdens onKeyDown, want we kunnen de key nog negeren.
        return currentText();
    };

    export const setFocus = async () => {
        logBox("setFocus in setFocus");
        if (hasFocus()) {
            LOGGER.log("    has focus already");
            return;
        }
        element.focus();
        setCaretPosition(textBox.caretPosition);
    };

    function hasFocus(): boolean {
        return document.activeElement === element;
    }

    /**
     * Decides whether the default behavior of the event should be ignored
     * @param e
     */
    const shouldIgnore = (e: KeyboardEvent): boolean => {
        if (e.altKey) {
            return true;
        }
        return e.key === KEY_ENTER || e.key === KEY_TAB;
    };

    /**
     * Decides whether the  event should be propagated to the parent component
     * @param e
     */
    const shouldPropagate = (e: KeyboardEvent): boolean => {
        if (isPrintable(e)) {
            return true;
        }
        if (isMetaKey(e)) {
            if (e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN || e.key === KEY_TAB || e.key === KEY_SPACEBAR) {
                return true;
            }
        }
        if (e.key === KEY_ENTER || e.key === KEY_DELETE || e.key === KEY_TAB) {
            return true;
        }
        if (e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN || e.key === KEY_ESCAPE) {
            return true;
        }
        const caretPosition = getCaretPosition();
        if (e.key === KEY_ARROW_LEFT || e.key === KEY_BACKSPACE) {
            return caretPosition <= 0;
        } else if (e.key === KEY_ARROW_RIGHT || e.key === KEY_DELETE) {
            return caretPosition >= currentLength();
        } else {
            return false;
        }
    };

    function currentLength(): number {
        if (!!element && !!element.innerText) {
            return element.innerText.length;
        } else {
            return 0;
        }
    }

    function currentText(): string {
        if (!!element && !!element.innerText) {
            return element.innerText;
        } else {
            return "";
        }
    }

    let originalText: string;

    onMount(() => {
        LOGGER.log("onMount for role [" + textBox.role + "]");
        textBox.setFocus = setFocus;
        textBox.setCaret = setCaret;
        originalText = textBox.getText();
    });

    /**
     * Used to handle non-printing characters
     * @param event
     */
    const onKeyDown = async (event: KeyboardEvent) => {
        LOGGER.log("onKeyDown: [" + event.key + "] alt [" + event.ctrlKey + "] shift [" + event.shiftKey + "] key [" + event.key + "]");
        isEditing = true;
        if (event.key === KEY_DELETE) {
            if (currentText() === "") {
                if (textBox.deleteWhenEmptyAndErase) {
                    await editor.deleteBox(editor.selectedBox);
                    event.stopPropagation();
                    return;
                }
            }
            event.stopPropagation();
            return;
        }
        if (event.key === KEY_BACKSPACE) {
            if (currentText() === "") {
                if (textBox.deleteWhenEmptyAndErase) {
                    await editor.deleteBox(editor.selectedBox);
                    event.stopPropagation();
                    return;
                }
            }
        }
        if (!shouldPropagate(event)) {
            LOGGER.log("StopPropagation");
            event.stopPropagation();
        }
        if (shouldIgnore(event)) {
            event.preventDefault();
        }
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === KEY_ENTER) {
            const isKeyboardShortcutForThis = await PiUtils.handleKeyboardShortcut(piKey, textBox, editor);
            if (!isKeyboardShortcutForThis) {
                LOGGER.log("Key not handled for element " + textBox.element);
                if (event.key === KEY_ENTER) {
                    LOGGER.log("   ENTER, so propagate");
                    return;
                }
            }
        }
    };

    const setCaret = (caret: PiCaret) => {
        switch (caret.position) {
            case PiCaretPosition.RIGHT_MOST:
                LOGGER.log("setCaretPosition RIGHT");
                setCaretToMostRight();
                textBox.caretPosition = textBox.getText().length;
                break;
            case PiCaretPosition.LEFT_MOST:
                LOGGER.log("setCaretPosition LEFT");
                setCaretToMostLeft();
                textBox.caretPosition = 0;
                break;
            case PiCaretPosition.INDEX:
                LOGGER.log("setCaretPosition INDEX");
                setCaretPosition(caret.index);
                textBox.caretPosition = caret.index;
                break;
            case PiCaretPosition.UNSPECIFIED:
                LOGGER.log("setCaretPosition UNSPECIFIED");
                break;
            default:
                LOGGER.log("setCaretPosition ERROR");
                break;
        }
        logBox("setFocus in setCaret");
        // element.focus();
    };

    const setCaretToMostLeft = () => {
        setCaretPosition(0);
    };

    const setCaretToMostRight = () => {
        LOGGER.log("setCaretPosition RIGHT: " + textBox.getText().length);
        setCaretPosition(textBox.getText().length);
    };

    const setCaretPosition = (position: number) => {
        logBox("setCaretPosition: " + position);
        if (position === -1) {
            return;
        }
        try {
            if (position > currentLength()) {
                // TODO Fix the error below
                console.error("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR; ");
                console.error("TextComponent.setCaretPosition position: " + position + " length: " + currentLength());
                position = currentLength();
            }
            clearSelection();
            const range = document.createRange();
            if (element!.childNodes[0]) {
                range.setStart(element!.childNodes[0], position);
            } else {
                range.setStart(element!, position);
            }
            range.collapse(true);
            window.getSelection().addRange(range);
            LOGGER.log("New position is: " + position);
            textBox.caretPosition = position;
        } catch (e) {
            console.error("TextComponent.setCaretPosition ERROR: " + e.toString());
        }
    };

    const clearSelection = () => {
        window.getSelection().removeAllRanges();
    };

    const onClick = async (event: MouseEvent) => {
        logBox("onClick before");
        textBox.caretPosition = getCaretPosition();
        logBox("onClick after");
    };

    function logBox(message: string) {
        LOGGER.log(message + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
    }

    /**
     * IS triggered for printable keys only,
     * @param event
     */
    const onKeyPress = async (event: KeyboardEvent) => {
        LOGGER.log("onKeyPress: " + event.key);
        isEditing = true;
        const insertionIndex = getCaretPosition();
        switch (textBox.keyPressAction(textBox.getText(), event.key, insertionIndex)) {
            case KeyPressAction.OK:
                logBox("KeyPressAction.OK");
                break;
            case KeyPressAction.NOT_OK:
                LOGGER.log("KeyPressAction.NOT_OK");
                event.preventDefault();
                event.stopPropagation();
                break;
            case KeyPressAction.GOTO_NEXT:
                LOGGER.log("KeyPressAction.GOTO_NEXT");
                editor.selectNextLeaf();
                LOGGER.log("    NEXT LEAF IS " + editor.selectedBox.role);
                if (isAliasTextBox(editor.selectedBox)) {
                    LOGGER.log("     is an alias box");
                    (editor.selectedBox.parent as AliasBox).triggerKeyPressEvent(event.key);
                } else {
                    LOGGER.log("     is NOT an alis box");
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            case KeyPressAction.GOTO_PREVIOUS:
                LOGGER.log("KeyPressAction.GOTO_PREVIOUS");
                editor.selectPreviousLeaf();
                LOGGER.log("PREVIOUS LEAF IS " + editor.selectedBox.role);
                if (isAliasTextBox(editor.selectedBox)) {
                    (editor.selectedBox.parent as AliasBox).triggerKeyPressEvent(event.key);
                }
                event.preventDefault();
                event.stopPropagation();
                break;
        }
    };

    let text: string = textBox.getText();
    let element: HTMLDivElement;
    let placeholder: string;

    const onInput = async (e: InputEvent) => {
        isEditing = true;
        let value = currentText();
        console.log("onInput data" + e.data + ":  current [" + currentText() + "] box text [" + textBox.getText() + "]");
        textBox.caretPosition = getCaretPosition();
        textBox.setText(value);
        editor.selectedPosition = PiCaret.IndexPosition(textBox.caretPosition);
        if (textBox.deleteWhenEmpty && value.length === 0) {
            EVENT_LOG.info(this, "delete empty text");
            await editor.deleteBox(textBox);
        }
        LOGGER.log("END END text [" + currentText() + "]");
    };

    afterUpdate(() => {
        UPDATE_LOGGER.log("TextComponent update [" + isEditing + "] [" + currentText() + "] getText [" + textBox.getText() + "] text [" + text + "] box [" + textBox.role + "] caret [" + textBox.caretPosition + "]");
        textBox.setFocus = setFocus;
        textBox.setCaret = setCaret;
        // If being edited, do not set the value, let the user type whatever (s)he wants
        if (!isEditing) {
            text = textBox.getText();
        }
    });

    export const getCaretPosition = (): number => {
        // TODO This causes an extra afterUpdate in Svelte, don't know why !
        // return window.getSelection().focusOffset;
        return window.getSelection().getRangeAt(0).startOffset;
    };

    let textStyle: string = "";

    autorun(() => {
        AUTO_LOGGER.log("TextComponent role " + textBox.role + " text [" + text + "] current [" + currentText() + "] textBox [" + textBox.getText() + "] innertText [" + element?.innerText + "]");
        placeholder = textBox.placeHolder;
        // If being edited, do not set the value, let the user type whatever (s)he wants
        // if (!isEditing) {
        // TODO Check whether this does not do too much now
            text = textBox.getText();
        // }
        // textStyle = ":before {" +  styleToCSS(conceptStyle(editor.style, "light", textBox.element.piLanguageConcept(), "text", textBox.style)) + "}";
        // TODO check these style calcs for each situation
        const boxType = (textBox.parent instanceof AliasBox ? "alias" : (textBox.parent instanceof SelectBox ? "select" : "text"));
        const boxStyle = (textBox.parent instanceof AliasBox ? textBox.parent.style : (textBox.parent instanceof SelectBox ? textBox.parent.style : textBox.style));
        textStyle = styleToCSS(conceptStyle(editor.style, editor.theme, textBox.element.piLanguageConcept(), boxType, textBox.style));
        // if (textBox.getText() === "appel") {
        //     textStyle += "--theme-colors-bg_text_box: lightgrey;"
        // }

        textBox.setFocus = setFocus;
    });

    // const onFocus = async (e: FocusEvent) => {
    //     FOCUS_LOGGER.log("TextComponent.onFocus for box " + textBox.role);
    // };
    // const onBlurHandler = async (e: FocusEvent) => {
    //     FOCUS_LOGGER.log("TextComponent.onBlur for box " + textBox.role);
    // };

</script>

<span class={"text"}
      style="{textStyle}"
      tabindex="0"
      data-placeholdertext={placeholder}
      on:keypress={onKeyPress}
      on:keydown={onKeyDown}
      on:click={onClick}
      on:input={onInput}
      contenteditable="true"
      bind:innerHTML={text}
      bind:this={element}
></span>

<style>
    .text:empty:before {
        content: attr(data-placeholdertext);
        color: inherit;
        background-color: inherit;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        padding: inherit;
        margin: inherit;
        display: inherit;
        white-space: inherit;
        border: inherit;
        opacity: 50%;
    }

    .text {
        /*background-color: var(--theme-colors-bg_text_box);*/
        content: attr(data-placeholdertext);
        color: var(--theme-colors-color_text_box);
        padding: 3px;
        white-space: normal;
        display: inline-block;
    }
</style>
