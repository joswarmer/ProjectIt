<!-- --bg-panel and --divider are parameters set by the svelte-mui library -->
<Dialog style="width:var(--pi-dialog-width); --bg-panel:var(--theme-colors-inverse_color); --divider:var(--theme-colors-color)"
		bind:visible={$newUnitDialogVisible}
		on:keydown={handleKeydown}>
	<div slot="title" class="title">New unit</div>

	<Textfield
			name="unitname"
			autocomplete="off"
			bind:value={newName}
			bind:error="{localErrorMessage}"
			outlined="true"
			style="--label: var(--theme-colors-divider); --color: var(--theme-colors-color)"
	/>

	{#each get(unitTypes) as name}
		<Radio {...props} bind:group={group} value={name}>
			<span class="item-name">{name}</span>
		</Radio>
	{/each}

	<div slot="actions" class="actions center">
		<Button style="color:var(--theme-colors-secondary_button_text)" on:click={() => handleCancel()}>Cancel</Button>
		<Button style="color:var(--theme-colors-primary_button_text)" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Please enter the name of the new unit
	</div>

</Dialog>


<script lang="ts">
	import { Button, Dialog, Radio, Textfield } from 'svelte-mui';
	import { unitNames, unitTypes } from "../webapp-ts-utils/WebappStore";
	import { get } from 'svelte/store';
	import { EditorCommunication } from "../editor/EditorCommunication";
	import { newUnitDialogVisible } from "../webapp-ts-utils/WebappStore";

	// all unit names in a model must be unique
	let newName: string = "";

	// take care of the type of unit to be created
	let group: string = $unitTypes[0];

	// if something is wrong show this message
	let localErrorMessage: string = "";

	// props for all of the radio buttons
	let props = {
		right: false,
		ripple: true,
		disabled: false,
		color: "var(--theme-colors-color)"
	};

	const handleCancel = () => {
		// console.log("Cancel called");
		$newUnitDialogVisible = false;
	}

	const handleSubmit = () => {
		if ($unitNames.includes(newName)) {
			localErrorMessage = "Unit with this name already exists";
		} else if (!newName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
			// TODO this message is too long, must use wrap
			localErrorMessage = "Name may contain only characters and numbers, and must start with a character.";
		} else {
			if (newName?.length > 0) {
				EditorCommunication.getInstance().newUnit(newName, group);
			}
			newName = "";
			$newUnitDialogVisible = false;
		}
	}

	const handleKeydown = (event) => {
		switch (event.keyCode) {
			case 13: { // Enter key
				handleSubmit();
				break;
			}
		}
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
		color: var(--theme-colors-color);
	}
	.title {
		color: var(--theme-colors-inverse_color);
	}
	.item-name {
		color: var(--theme-colors-color);
	}
</style>
