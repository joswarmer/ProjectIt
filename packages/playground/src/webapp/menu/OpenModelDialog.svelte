<!-- --bg-panel and --divider are parameters set by the svelte-mui library -->
<Dialog style="width:var(--pi-dialog-width); --bg-panel: var(--theme-colors-inverse_color); --divider:var(--theme-colors-color)"
		bind:modal={modal}
		bind:visible={$openModelDialogVisible}
		on:keydown={handleKeydown}>
	<div slot="title" class="title">Open or new model:</div>

	<Textfield
			name="modelname"
			autocomplete="off"
			bind:value={newName}
			bind:error="{localErrorMessage}"
			outlined="true"
			style="--label: var(--theme-colors-divider); --color: var(--theme-colors-color)"
			placeholder="name of new model"
			class="content"
	/>
	{#each $modelNames as name}
		<Radio {...props} disabled={newName} bind:group={internalSelected} value={name}>
			<span class="item-name">{name}</span>
		</Radio>
	{/each}

	<div slot="actions" class="actions">
		<Button style="color:var(--theme-colors-secondary_button_text)" on:click={() => handleCancel()}>Cancel</Button>
		<Button style="color:var(--theme-colors-primary_button_text)" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Which model would you like to open?
	</div>
</Dialog>

<script lang="ts">
	import {Button, Radio, Dialog, Textfield} from 'svelte-mui';
	import {
		modelNames,
		openModelDialogVisible,
		initializing
	} from "../webapp-ts-utils/WebappStore";
	import {EditorCommunication} from "../editor/EditorCommunication";

	let modal: boolean = true; // TODO from FileMenu modal must be set to false
	let internalSelected: string = "";
	let newName: string = "";
	let localErrorMessage: string = "";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
		color: "var(--theme-colors-color)"
	};
	const handleCancel = () => {
		console.log("Cancel called, model selected: " + internalSelected);
		// only close when a model has been selected
		if (!$initializing) {
			$modelNames = [];
			resetVariables();
		} else {
			localErrorMessage = "You must select or create a model!";
		}
	}

	const handleSubmit = async () => {
		let comm = EditorCommunication.getInstance();
		if (newNameOk()) {
			comm.newModel(newName);
			resetVariables();
		} else if (internalSelected?.length > 0) {
			comm.openModel(internalSelected);
			resetVariables();
		}
	}

	const handleKeydown = (event) => {
		switch (event.keyCode) {
			case 13: { // on Enter key try to submit
				event.stopPropagation();
				event.preventDefault();
				handleSubmit();
				break;
			}
		}
	}

	function newNameOk(): boolean {
		if (newName.length > 0) {
			if ($modelNames.includes(newName)) {
				localErrorMessage = "Model with this name already exists";
			} else if (!newName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
				// TODO this message is too long, must use wrap
				localErrorMessage = "Name may contain only characters and numbers, and must start with a character.";
			} else {
				return true;
			}
		}
		return false;
	}

	function resetVariables() {
		if ($initializing) {
			$initializing = false;
		}
		$modelNames = [];
		$openModelDialogVisible = false;
		newName = "";
		internalSelected = "";
		localErrorMessage = "";
	}

</script>

<svelte:window on:keydown={handleKeydown}/>

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
