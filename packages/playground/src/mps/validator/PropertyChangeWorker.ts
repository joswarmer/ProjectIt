import { TestLanguageDefaultWorker } from "../utils/gen";
import { Org_projectit_test_RootConcept, Org_projectit_test_RootConcept_Unit } from "../language/gen";
import { property } from "lodash";
import { runInAction } from "mobx";

export class PropertyChangeWorker extends TestLanguageDefaultWorker {

    id: string;
    property: string;
    value: string;

    constructor(id: string, property: string, value: string) {
        super();
        this.id = id;
        this.property = property;
        this.value = value;
        console.log("WOrker propertyType " + typeof(property) + " JSON " + JSON.stringify(property));
    }

    execAfterOrg_projectit_test_RootConcept_Unit(modelelement: Org_projectit_test_RootConcept_Unit): boolean {
        return false;
    }

    execBeforeOrg_projectit_test_RootConcept(modelelement: Org_projectit_test_RootConcept): boolean {
        console.log("WORKER ID [" + this.id + "] prop [" + this.property + "] value [" + this.value + "]")
            if (modelelement.piId() === this.id) {
                console.log("YES")
                runInAction( () => {
                    modelelement[this.property] = this.value;
                })
                return true;
            } else {
                console.log("NO")
                return false;
            }
    }

// execBeforeAccenture_study_core_Form(modelelement: Accenture_study_core_Form): boolean {
    //     if (modelelement.piId() === this.id) {
    //         modelelement[this.property] = this.value;
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    // execBeforeAccenture_study_core_Field(modelelement: Accenture_study_core_Field): boolean {
    //     if (modelelement.piId() === this.id) {
    //         modelelement[this.property] = this.value;
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
}
