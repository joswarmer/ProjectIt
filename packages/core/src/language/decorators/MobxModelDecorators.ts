import {
    IObservableValue,
    IArrayWillChange,
    IArrayWillSplice,
    observable,
    intercept,
    runInAction,
    makeObservable
} from "mobx";
// import { ObservableValue } from "mobx";
import "reflect-metadata";

import { DecoratedModelElement } from "./DecoratedModelElement";
import { ModelInfo } from "./ModelInfo";
import { ChangeManager } from "./ChangeManager";

export const MODEL_PREFIX = "_PI_";
export const MODEL_PREFIX_LENGTH = MODEL_PREFIX.length;
export const MODEL_CONTAINER = MODEL_PREFIX + "Container";
export const MODEL_NAME = MODEL_PREFIX + "Name";

/**
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep a container reference.
 *
 * @param {Object} target is the prototype
 * @param {string | symbol} propertyKey
 */
export function observablereference(target: DecoratedModelElement, propertyKey: string | symbol) {
    ModelInfo.references.add(target.constructor.name, propertyKey.toString());
    // const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();
    //
    // const getter = function(this: any) {
    //     // console.log("GET observablereference observablereference observablereference observablereference");
    //     const storedObserver = this[privatePropertyKey] as ObservableValue<DecoratedModelElement>;
    //     let result: any = storedObserver ? storedObserver.get() : undefined;
    //     if (result === undefined) {
    //         result = null;
    //         this[privatePropertyKey] = observable.box(result);
    //     }
    //     return result;
    // };
    //
    // const setter = function(this: any, val: DecoratedModelElement) {
    //     console.log("SET observablereference observablereference observablereference observablereference");
    //     let storedObserver = this[privatePropertyKey] as ObservableValue<DecoratedModelElement>;
    //     const storedValue = storedObserver ? storedObserver.get() : null;
    //     // Clean container of current part
    //     if (storedValue) {
    //         storedValue.container = null;
    //         storedValue.propertyName = "";
    //         storedValue.propertyIndex = undefined;
    //     }
    //     if (storedObserver) {
    //         storedObserver.set(val);
    //     } else {
    //         this[privatePropertyKey] = observable.box(val);
    //         storedObserver = this[privatePropertyKey];
    //     }
    //     if (val !== null && val !== undefined) {
    //         if (val.container !== undefined && val.container !== null) {
    //             if (val.propertyIndex !== undefined) {
    //                 // Clean new value from its containing list
    //                 (val.container as any)[val.propertyName].splice(val.propertyIndex, 1);
    //             } else {
    //                 // Clean new value from its container
    //                 (val.container as any)[MODEL_PREFIX + val.propertyName] = null;
    //             }
    //         }
    //         // Set container
    //         val.container = this;
    //         val.propertyName = propertyKey.toString();
    //         val.propertyIndex = undefined;
    //     }
    // };
    //
    // // tslint:disable no-unused-expression
    // Reflect.deleteProperty(target, propertyKey);
    // Reflect.defineProperty(target, propertyKey, {
    //     get: getter,
    //     set: setter,
    //     configurable: true
    // });
}

/**
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep a container reference.
 *
 * @param {Object} target is the prototype
 * @param {string | symbol} propertyKey
 */
export function observablelistreference(target: DecoratedModelElement, propertyKey: string | symbol) {
    ModelInfo.listReferences.add(target.constructor.name, propertyKey.toString());
}

export function model1() {
    return (constructor: new (...args: any[]) => any) => {
        return constructor;
    };
}

interface ctor {
    new (...args: any[]): any;

    run: any;
}

export function model(target: Function) {
    ModelInfo.addClass(target.name, target);
}

/**
 *
 * This property decorator can be used to decorate properties of type ModelElement.
 * The objects in such properties will automatically keep a container reference.
 *
 * @param {Object} target
 * @param {string | symbol} propertyKey
 */
export function observablepart(target: DecoratedModelElement, propertyKey: string | symbol) {
    ModelInfo.parts.add(target.constructor.name, propertyKey.toString());
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();

    const getter = function(this: any) {
        const storedObserver = this[privatePropertyKey] as IObservableValue<DecoratedModelElement>;
        if (!!storedObserver) {
            return storedObserver.get();
        } else {
            this[privatePropertyKey] = observable.box(null);
            return this[privatePropertyKey].get();
        }
    };

    const setter = function(this: any, val: DecoratedModelElement) {
        ChangeManager.it.setPart(this, propertyKey, val);
        let storedObserver = this[privatePropertyKey] as IObservableValue<DecoratedModelElement>;
        const storedValue = storedObserver ? storedObserver.get() : null;
        // Clean container of current part
        if (!!storedValue) {
            storedValue.container = null;
            storedValue.propertyName = "";
            storedValue.propertyIndex = undefined;
        }
        if (!!storedObserver) {
            runInAction( () => {
                storedObserver.set(val);
            });
        } else {
            this[privatePropertyKey] = observable.box(val);
            storedObserver = this[privatePropertyKey];
        }
        if (val !== null && val !== undefined) {
            if (val.container !== undefined && val.container !== null) {
                if (val.propertyIndex !== undefined) {
                    // Clean new value from its containing list
                    (val.container as any)[val.propertyName].splice(val.propertyIndex, 1);
                } else {
                    // Clean new value from its container
                    (val.container as any)[MODEL_PREFIX + val.propertyName] = null;
                }
            }
            // Set container
            val.container = this;
            val.propertyName = propertyKey.toString();
            val.propertyIndex = undefined;
        }
    };

    // tslint:disable no-unused-expression
    Reflect.deleteProperty(target, propertyKey);
    Reflect.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        configurable: true
    });
}

export function observablelistpart(target: Object, propertyKey: string | symbol) {
    ModelInfo.listparts.add(target.constructor.name, propertyKey.toString());
    const privatePropertyKey = MODEL_PREFIX + propertyKey.toString();

    const getter = function(this: any) {
        let result = this[privatePropertyKey];
        if (result === undefined) {
            const array = observable.array([], { deep: false });
            result = array;
            this[privatePropertyKey] = result;
            (array as any)[MODEL_CONTAINER] = this;
            (array as any)[MODEL_NAME] = propertyKey.toString();
            // array.intercept(change => willChange(change));
            // Changed for mobx6 as follows:
            intercept(array, change => willChange(change))
            // intercept(array,
            // (change: IArrayWillChange<MobxModelElement> | IArrayWillSplice<MobxModelElement>) => willChange(change) as any);
        }
        return result;
    };

    Reflect.deleteProperty(target, propertyKey);
    Reflect.defineProperty(target, propertyKey, {
        get: getter
    });
}

/**
 * Function called when an array element is changed, will ensure
 * that the old element is removed and its container reference is cleared.
 * The new element will have its container reference set correctly.
 * @param change
 */
function willChange(
    change: IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement>
): IArrayWillChange<DecoratedModelElement> | IArrayWillSplice<DecoratedModelElement> | null {
    // console.log("willChange [" + change.type + "]");
    switch (change.type) {
        // console.log("no change");
        case "update":
            ChangeManager.it.update(change as IArrayWillChange);
            const newValue = change.newValue;
            const oldValue = change.object[change.index];
            if (newValue === oldValue) {
                // new object at index
                // TODO if there is no need to do anything, why not change the condition to this if-statement
            } else {
                if (!!newValue) {
                    if (!!newValue.container) {
                        // cleanup old container reference of new value
                        if (newValue.propertyIndex !== undefined) {
                            (newValue.container as any)[newValue.propertyName][newValue.propertyIndex] = null;
                        } else {
                            (newValue.container as any)[newValue.propertyName] = null;
                        }
                    }
                    newValue.container = oldValue.container;
                    newValue.propertyName = oldValue.propertyName;
                    newValue.propertyIndex = oldValue.propertyIndex;
                }

                // Cleanup container reference of old value
                oldValue.container = null;
                oldValue.propertyName = "";
                oldValue.propertyIndex = undefined;
            }
            break;
        case "splice":
            ChangeManager.it.splice(change as IArrayWillSplice);
            let index: number = change.index;
            const removedCount: number = change.removedCount;
            const added: DecoratedModelElement[] = change.added;
            const addedCount = added.length;
            const xxx = change.object;
            for (const i in added) {
                // cleanup old container reference of new value
                const element = added[i];
                if (!!element) {
                    if (!!element.container) {
                        if (element.propertyIndex !== undefined) {
                            (element.container as any)[element.propertyName][element.propertyIndex] = null;
                        } else {
                            (element.container as any)[element.propertyName] = null;
                        }
                    }
                    // set the container properties for inserted elements
                    element.container = (change.object as any)[MODEL_CONTAINER];
                    element.propertyName = (change.object as any)[MODEL_NAME];
                    element.propertyIndex = index + Number(i);
                }
            }
            for (let num = 0; num < removedCount; num++) {
                let rr = index + num;
                if (!(typeof index === "number")) {
                    console.trace("=====================================");
                    console.log("MOBX ARRAY change Index type " + typeof index);
                    // TODO (index as any) because of TS2407:  The right-hand side of a 'for...in' statement must be
                    //       of type 'any', an object type or a type parameter, but here has type 'never'.
                    for (const pp in index as any) {
                        console.log("        key " + pp + " type " + typeof index[pp]);
                    }
                    index = index[0];
                }
                rr = num + index;
                change.object[rr].container = null;
                change.object[rr].propertyName = "";
                change.object[rr].propertyIndex = undefined;
            }
            // Update all other indices
            for (let above = index; above < change.object.length; above++) {
                const aboveElement = change.object[above];
                if (aboveElement.propertyIndex !== undefined) {
                    aboveElement.propertyIndex += addedCount - removedCount;
                }
            }
            break;
    }
    return change;
}
