import {Writable, writable} from 'svelte/store';
import { PiNamedElement } from "@projectit/core";

// info about ProjectIt
export const versionNumber = "0.1.1";

// info about the language
export let unitTypes: Writable<string[]> = writable<string[]>([]);
export let fileExtensions: Writable<string[]> = writable<string[]>([]);
export let languageName: Writable<string> = writable<string>("");
export let projectionNames:  Writable<string[]> = writable<string[]>([]);

// attribute to know whether or not the app is still initializing
export let initializing: Writable<boolean> = writable<boolean>(true);
export let noUnitAvailable: Writable<boolean> = writable<boolean>(true);

// info about the model and model unit shown
export let currentModelName: Writable<string> = writable<string>('');
export let currentUnitName: Writable<string> = writable<string>('');

// info about all models stored on the server
export let modelNames: Writable<string[]> = writable<string[]>([]);
export let unitNames: Writable<string[]> = writable<string[]>([]);

export let units: Writable<Array<PiNamedElement[]>> = writable<Array<PiNamedElement[]>>(null);
export let toBeDeleted: Writable<PiNamedElement> = writable<PiNamedElement>(null);

// info about the error in the working of the webapp that needs to be shown to the user
// this is shown in a snackbar on top of the page, and should not be confused
// with the errors on the content of the editor
export let errorMessage: Writable<string> = writable<string>('');
export let showError: Writable<boolean> = writable<boolean>(false);

// severity can range from 0 to 4
// 0 means information
// 1 means hint
// 2 means warning
// 3 means error
export enum severityType {
    info = 0,
    hint = 1,
    warning = 2,
    error= 3
}
export let severity: Writable<number> = writable<number>(severityType.error);

export let miniWindow: Writable<boolean> = writable<boolean>(false);

export let leftPanelVisible: Writable<boolean> = writable<boolean>(false);
export let rightPanelVisible: Writable<boolean> = writable<boolean>(false);

export let openModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export let openMpsModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export let newUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export let deleteUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export let deleteModelDialogVisible: Writable<boolean> = writable<boolean>(false);





