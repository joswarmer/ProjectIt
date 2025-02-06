<script lang="ts">

    import {FragmentWrapperBox, FreEditor} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";

    let src1 = '/cats-kittens.gif';
    let name1 = 'Two kittens licking';
    let src2 = '/rick-roll-rick-rolled.gif';
    let name2 = 'Rick Astley dancing';
    let src3 = '/lenny-confetti-hired-kitten.gif';
    let name3 = 'Staring kitten';

    // Freon expects both of these to be present, even if they are not used.
    export let box: FragmentWrapperBox;
    export let editor: FreEditor;

    let src: string = src1;
    let name: string = name1;

    function getSrc() {
        let nrOfSrc: number = Number.parseInt(box.findParam("number"));
        switch (nrOfSrc) {
            case 1: {
                src = src1;
                name = name1;
                break;
            }
            case 2: {
                src = src2;
                name = name2;
                break;
            }
            case 3: {
                src = src3;
                name = name3;
                break;
            }
        }
    }
    // execute this function to set the initial values
    getSrc();

    // The following four functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    // If this element is not focusable, then do not use this function. Freon will direct
    // the focus to the parent of this component.
    // async function setFocus(): Promise<void> {
    // }
    const refresh = (why?: string): void => {
        // do whatever needs to be done to refresh the elements that show information from the model
        getSrc();
    };
    onMount(() => {
        getSrc();
        // box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        // box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
</script>

<!-- {src} is short for src={src} -->
<img {src} alt="{name}" />
