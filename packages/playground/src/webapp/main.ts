import { PiLogger } from "@projectit/core";
import App from './App.svelte';

// Mute or unmute logs here (in addition to elsewhere).

// PiLogger.mute("PiEditor");
PiLogger.mute("TextComponent");
PiLogger.mute("AliasComponent");
PiLogger.mute("AUTORUN");
PiLogger.mute("FOCUS")
PiLogger.mute("AFTER_UPDATE");
PiLogger.mute("MOUNT");
PiLogger.mute("SelectOptionList");
PiLogger.mute("RenderComponent");
PiLogger.mute("SelectableComponent");
PiLogger.mute("LabelComponent");
PiLogger.mute("ListComponent");
PiLogger.mute("DropdownComponent");
PiLogger.mute("DropdownItemComponent");
PiLogger.mute("X");
PiLogger.mute("BoxFactory");
// PiLogger.mute("EditorCommunication");

PiLogger.mute("ExampleScoper");

// PiLogger.muteAllLogs()

const app = new App({
	target: document.body,
});

export default app;

