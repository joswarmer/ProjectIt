import { observable, makeObservable, action } from "mobx";

import { PiUtils } from "../../util";
import { Box} from "./Box";
import { PiElement } from "../../ast";

export enum ListDirection {
    HORIZONTAL = "Horizontal",
    VERTICAL = "Vertical"
}

export abstract class ListBox extends Box {
    protected direction: ListDirection = ListDirection.HORIZONTAL;
    protected _children: Box[] = [];
    trueList: boolean; // TODO trueList is a temp hack to distinguish list properties from the model from layout lists

    protected constructor(element: PiElement, role: string, children?: Box[], initializer?: Partial<ListBox>) {
        super(element, role);
        makeObservable<ListBox, "_children">(this, {
           _children: observable,
            insertChild: action,
            addChild: action,
            clearChildren: action,
            addChildren: action,
        });
        PiUtils.initializeObject(this, initializer);
        if (!!children) {
            children.forEach(b => this.addChild(b));
        }
        this.kind = "ListBox";
    }

    get children(): ReadonlyArray<Box> {
        return this._children as ReadonlyArray<Box>;
    }

    clearChildren(): void {
        this._children.splice(0, this._children.length);
    }

    addChild(child: Box | null): ListBox {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
        }
        return this;
    }

    insertChild(child: Box | null): ListBox {
        if (!!child) {
            this._children.splice(0, 0, child);
            child.parent = this;
        }
        return this;
    }

    addChildren(children?: Box[]): ListBox {
        if (!!children) {
            children.forEach(child => this.addChild(child));
        }
        return this;
    }

    nextSibling(box: Box): Box | null {
        const index = this.children.indexOf(box);
        if (index !== -1) {
            if (index + 1 < this.children.length) {
                return this.children[index + 1];
            }
        }
        return null;
    }

    previousSibling(box: Box): Box | null {
        const index = this.children.indexOf(box);
        if (index > 0) {
            return this.children[index - 1];
        }
        return null;
    }

    getDirection(): ListDirection {
        return this.direction;
    }

    toString() {
        let result: string = "List: " + this.role + " " + this.direction.toString() + "<";
        for (const child of this.children) {
            result += "\n    " + child.toString();
        }
        result += ">";
        return result;
    }
}

export class HorizontalListBox extends ListBox {
    kind = "HorizontalListBox";

    constructor(element: PiElement, role: string, children?: (Box | null)[], initializer?: Partial<HorizontalListBox>) {
        super(element, role, children, initializer);
        this.direction = ListDirection.HORIZONTAL;
    }
}

export class VerticalListBox extends ListBox {
    kind = "VerticalListBox";

    constructor(element: PiElement, role: string, children?: Box[], initializer?: Partial<HorizontalListBox>) {
        super(element, role, children, initializer);
        this.direction = ListDirection.VERTICAL;
    }
}

export function isHorizontalBox(b: Box): b is HorizontalListBox {
    return b.kind === "HorizontalListBox" && !(b as HorizontalListBox).trueList; // b instanceof HorizontalListBox;
}

// TODO reorganise these functions
export function isHorizontalList(b: Box): b is HorizontalListBox {
    // TODO trueList is a temp hack to distinguish list properties from the model from layout lists
    return b.kind === "HorizontalListBox" && (b as HorizontalListBox).trueList; // b instanceof HorizontalListBox;
}

export function isVerticalBox(b: Box): b is VerticalListBox {
    return b.kind === "VerticalListBox" && !(b as VerticalListBox).trueList; // b instanceof VerticalListBox;
}

export function isVerticalList(b: Box): b is VerticalListBox {
    // TODO trueList is a temp hack to distinguish list properties from the model from layout lists
    return b.kind === "VerticalListBox" && (b as VerticalListBox).trueList; // b instanceof VerticalListBox;
}

// TODO trueList is a temp hack to distinguish list properties from the model from layout lists
export function isLayoutBox(b: Box): boolean {
    return (b.kind === "HorizontalListBox" || b.kind === "VerticalListBox") && !(b as ListBox).trueList;
}

export function isListBox(b: Box): boolean {
    return (b.kind === "HorizontalListBox" || b.kind === "VerticalListBox") && (b as ListBox).trueList;
}
