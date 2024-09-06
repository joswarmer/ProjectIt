import { runInAction } from "mobx"
import { FreNode } from "../ast/index"
import { FreUndoManager } from "./FreUndoManager"

export type errorFunction = (msg: string) => void

/**
 * This class encapsulates static variables and functions.
 * This to avoid cluttering the global namespace.
 */
class AstChanger {
    constructor() {
    }

    /**
     * The function that is called when an error is thrown by the _change_ function in _astChange_.
     * @private
     */
    private error: errorFunction = (msg: string): void => {
        console.error(msg)
    }

    /**
     * Set the error handling function to _e_ 
     * @param e
     */    
    setErrorFunction(e: errorFunction) {
        this.error = e
    }
    
    private _isInChange: boolean = false
    get isInChange(): boolean {
        return this._isInChange
    }
    private set isInChange(value: boolean) {
        this._isInChange = value
    }

    /**
     * This function should always be called when a changeFunction to the nAST is made in the editor.
     * It will ensure that the full changeFunction is handled as one action in mobx, avoiding spurious UI updates, and
     * it will ensure that the full changeFunction is handled as one transaction by the undo manager so it will be undone
     * in one undo operation.
     * The changeFunction function should return a node if a new node is created, otherwise it should return null
     * @param changeFunction
     */
    change(changeFunction: () => FreNode): FreNode | null {
        // Avoid nested change calls
        if (this.isInChange) {
            return changeFunction()
        }
        // Now we have a new change() call
        this.isInChange = true
        let result: FreNode = null
        FreUndoManager.getInstance().startTransaction()
        try {
            runInAction( () => {
                result = changeFunction()
            })
        } catch(e) {
            this.error(e)
        }
        FreUndoManager.getInstance().endTransaction()
        this.isInChange = false
        return result
    }
}

export const AST = new AstChanger()
