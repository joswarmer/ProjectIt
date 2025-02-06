import {
	FreErrorSeverity,
	FreLionwebSerializer,
	FreModelSerializer,
	type FreModelUnit,
	type FreNamedNode,
	type FreNode,
	type IServerCommunication,
	isNullOrUndefined,
	type ModelUnitIdentifier
} from '@freon4dsl/core';
import FaultyJson from './model/Faulty.json';
import HealthJson from './model/Health.json';
import HealthAllJson from './model/HealthAll.json';
import HomeJson from './model/Home.json';
import HomeAllJson from './model/HomeAll.json';
import HomeAndHealthJson from './model/HomeAndHealth.json';
import HomeCheapJson from './model/HomeCheap.json';
import HomeExtraJson from './model/HomeExtra.json';
import LegalJson from './model/Legal.json';
import LegalAllJson from './model/LegalAll.json';

const modelName: string = 'ShowCase';
const unitNames: ModelUnitIdentifier[] = [
	// todo import all json files and adjust the switch in method loadModelUnit
	{ name: 'Faulty', id: 'ID-18' },
	{ name: 'Health', id: 'ID-32' },
	{ name: 'HealthAll', id: 'ID-49' },
	{ name: 'Home', id: 'ID-91' },
	{ name: 'HomeAll', id: 'ID-105' },
	{ name: 'HomeAndHealth', id: 'ID-131' },
	{ name: 'HomeCheap', id: 'ID-174' },
	{ name: 'HomeExtra', id: 'ID-191' },
	{ name: 'Legal', id: 'ID-197' },
	{ name: 'LegalAll', id: 'ID-205' }
	
];

export class MockServer implements IServerCommunication {
	static serial: FreModelSerializer = new FreModelSerializer();
	static lionweb_serial: FreLionwebSerializer = new FreLionwebSerializer();

	onError(msg: string, severity?: FreErrorSeverity): void {
		alert(msg);
		console.log(msg + ', ' + severity);
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async generateIds(quantity: number, callback: (strings: string[]) => void): Promise<string[]> {
		this.onError('generateIds not implemented.', undefined);
		return [];
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	putModelUnit(modelName: string, unitId: ModelUnitIdentifier, unit: FreNode): void {
		console.log('putModelUnit not implemented.');
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	deleteModelUnit(modelName: string, unit: ModelUnitIdentifier): void {
		this.onError('deleteModelUnit not implemented.');
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	renameModelUnit(modelName: string, oldName: string, newName: string, unit: FreNamedNode): void {
		this.onError('renameModelUnit not implemented.');
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	createModel(modelName: string) {
		this.onError('createModel not implemented.');
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	deleteModel(modelName: string): void {
		this.onError('deleteModel not implemented.');
	}
	async loadModelList(): Promise<string[]> {
		console.log('loadModelList executed');
		return [modelName];
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async loadUnitList(modelName: string): Promise<ModelUnitIdentifier[]> {
		console.log('loadUnitList executed');
		return unitNames;
	}
	async loadModelUnit(modelName: string, unit: ModelUnitIdentifier): Promise<FreNode> {
		let jsonInput;
		switch (unit.name) {
			case 'HealthAll': {
				jsonInput = HealthAllJson as object;
				break;
			}
			case 'Home': {
				jsonInput = HomeJson as object;
				break;
			}
			case 'Health': {
				jsonInput = HealthJson as object;
				break;
			}
			case 'HomeAndHealth': {
				jsonInput = HomeAndHealthJson as object;
				break;
			}
			case 'HomeAll': {
				jsonInput = HomeAllJson as object;
				break;
			}
			case 'HomeExtra': {
				jsonInput = HomeExtraJson as object;
				break;
			}
			case 'Legal': {
				jsonInput = LegalJson as object;
				break;
			}
			case 'LegalAll': {
				jsonInput = LegalAllJson as object;
				break;
			}
			case 'HomeCheap': {
				jsonInput = HomeCheapJson as object;
				break;
			}
		}
		let readUnit: FreNode | undefined = undefined;
		if (isNullOrUndefined(jsonInput)) {
			console.log('Error: json input undefined');
		} else {
			if (jsonInput['$typename'] === undefined) {
				readUnit = MockServer.lionweb_serial.toTypeScriptInstance(jsonInput);
			} else {
				readUnit = MockServer.serial.toTypeScriptInstance(jsonInput);
			}
		}
		console.log('loadModelUnit executed for ' + modelName + ', ' + unit.name);
		return readUnit;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	loadModelUnitInterface(modelName: string, unit: ModelUnitIdentifier, loadCallback: (unit: FreModelUnit) => void) {
		this.onError('loadModelUnitInterface not implemented.');
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	createModelUnit(modelName: string, unit: FreModelUnit): void {
		this.onError('createModelUnit not implemented.');
	}
}
