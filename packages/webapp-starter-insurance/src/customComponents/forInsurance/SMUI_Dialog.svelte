<script lang="ts">
    import Dialog, { Title, Content, Actions } from '@smui/dialog';
    import Button, { Label } from '@smui/button';
    import {ExternalStringBox, FreEditor} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";
    import Textfield from '@smui/textfield';
    import Icon from '@smui/textfield/icon';
    import HelperText from '@smui/textfield/helper-text';

    export let box: ExternalStringBox;
    export let editor: FreEditor;

    let open = false;
    let buttonLabel: string = 'OpenDialog';
    let value: string | number = '';
    let inputElement;

    function initialize() {
        let tmpLabel: string | undefined = box.findParam('buttonLabel');
        buttonLabel = (!!tmpLabel && tmpLabel.length > 0) ? tmpLabel : 'Open Dialog';
        let tmpValue = box.getPropertyValue();
        if (typeof tmpValue === "boolean") {
            if (tmpValue) value = "true";
            if (!!tmpValue) value = "false";
        } else {
            value = tmpValue;
        }
    }

    const onChange = () => {
        box.setPropertyValue(value);
    }

    const onKeyDown = (event) => {
        event.stopPropagation();
    }

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        if (open) {
            console.log("OPEN: setting focus to child")
            inputElement.focus();
        } else {
            console.log("CLOSED: setting focus to parent")
            box.parent.firstEditableChild.setFocus();
        }
    }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        initialize();
    };
    onMount(() => {
        initialize();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<Dialog bind:open sheet aria-describedby="sheet-content">
    <Title id="simple-title">{buttonLabel}</Title>
    <Content id="simple-content">
        <Textfield bind:value={value} on:change={onChange} bind:this={inputElement} on:keydown={onKeyDown}>
            <Icon class="material-icons" slot="leadingIcon">event</Icon>
            <HelperText slot="helper">{buttonLabel}</HelperText>
        </Textfield>
    </Content>
    <Actions>
        <Button>
            <Label>Close</Label>
        </Button>
    </Actions>
</Dialog>

<Button on:click={() => (open = true)}>
    <Label>{buttonLabel}</Label>
</Button>
