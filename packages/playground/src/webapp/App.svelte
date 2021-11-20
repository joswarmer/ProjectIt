<!-- some administration -->
<svelte:window on:resize={onResize} />

<svelte:head>
	<title>ProjectIt</title>
</svelte:head>

<!-- definitions of all components that may at some time be shown in this app -->
<!-- left and right panels -->
<LeftPanel />
<RightPanel />

<!-- dialogs and the user message snackbar -->
<OpenModelDialog />
<OpenMpsModelDialog />
<NewUnitDialog />
<DeleteUnitDialog />
<DeleteModelDialog />

<UserMessage />

<ThemeContext>
	<main class="main-window">
		<AppBar/>

		{#if ($miniWindow)}
			<div class="splitpane-container" >
				<SplitPane type='vertical' pos={80}>
					<section class="splitpane-section" slot=a>
						<div>
							<EditorGrid/>
						</div>
					</section>

					<section class="splitpane-section" slot=b>
						<ErrorList/>
					</section>
				</SplitPane>
			</div>
		{:else }
			<div class="splitpane-container" >
				<SplitPane type='vertical' pos={80}>
					<section class="splitpane-section" slot=a>
						<div class="splitpane-container" >

							<SplitPane type='horizontal' pos={20}>
								<section class="splitpane-section" slot=a>
									<Navigator/>
								</section>

								<section class="splitpane-section" slot=b>
									<div>
										<EditorGrid/>
									</div>
								</section>
							</SplitPane>
						</div>
					</section>

					<section class="splitpane-section" slot=b>
						<ErrorList/>
					</section>
				</SplitPane>
			</div>
		{/if}

		<Footer />
	</main>
</ThemeContext>

<script lang="ts">
	import { onMount } from "svelte";

	import AppBar from "./side-elements/AppBar.svelte";
	import Footer from "./side-elements/Footer.svelte";
	import LeftPanel from "./side-elements/LeftPanel.svelte";
	import RightPanel from "./side-elements/HelpPanel.svelte";
	import UserMessage from "./side-elements/UserMessage.svelte";
	import OpenModelDialog from "./menu/OpenModelDialog.svelte";
	import NewUnitDialog from "./menu/NewUnitDialog.svelte";

	import { miniWindow, modelNames, openModelDialogVisible } from "./webapp-ts-utils/WebappStore";
	import { EditorCommunication } from "./editor/EditorCommunication";
	import ThemeContext from "./theming/ThemeContext.svelte";
	import SplitPane from "./main/SplitPane.svelte";
	import Navigator from "./main/Navigator.svelte";
	import ErrorList from "./main/ErrorList.svelte";
	import EditorGrid from "./main/EditorGrid.svelte";
	import { ServerCommunication } from "./server/ServerCommunication";
	import DeleteUnitDialog from "./menu/DeleteUnitDialog.svelte";
	import DeleteModelDialog from "./menu/DeleteModelDialog.svelte";
	import OpenMpsModelDialog from "./menu/OpenMpsModelDialog.svelte";

	const MAX_WIDTH_SMALL_VIEWPORT = 600;

	// initialize defaults for the current language
	EditorCommunication.initialize();

	onMount(async () => {
		// correct layout for the size of the window
		onResize();

		// get list of models from server
		await ServerCommunication.getInstance().loadModelList((names: string[]) => {
			if (names.length > 0) {
				$modelNames = names;
			}
		});

		// open the app with the open/new model dialog
		$openModelDialogVisible = true;
	});

	async function onResize() {
		let width =
				window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

		if (width > MAX_WIDTH_SMALL_VIEWPORT) {
			miniWindow.set(false);
		} else {
			miniWindow.set(true);
		}
	}
</script>

<style>
	.main-window {
		margin-top: var(--pi-header-height);
		margin-bottom: var(--pi-footer-height);
		position: relative;
		width: 100%;
		height: calc(100% - var(--pi-header-height) - var(--pi-footer-height) - 8px);
		box-sizing: border-box;
		border: var(--theme-colors-list_divider) 1px solid;
	}
	.splitpane-container {
			position: relative;
			width: 100%;
			height: 100%;
	}
	.splitpane-section {
			position: relative;
			height: 100%;
			box-sizing: border-box;
	}
</style>
