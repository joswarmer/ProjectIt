// Generated by the ProjectIt Language Generator.
// TODO Change generator

import { PiStyle } from "@projectit/core";

export const placeholdertext: PiStyle = {
    //    color: "black",
    //    opacity: "0.5",
    content: "attr(data-placeholdertext)",
    ":empty:before": {
        color: "blue",
        //        opacity: "0.5",
        content: "attr(data-placeholdertext)"
    },
    ":before": {
        color: "blue",
        //        opacity: "0.5",
        content: "attr(data-placeholdertext)"
    }
};

export const propertykeyword: PiStyle = {
    "font-weight": "normal",
    color: "blue"
};

// Used by documentation
export const numeric: PiStyle = {
    color: "green"
};

export const reference: PiStyle = {
    color: "darkorange"
};
export const stringLiteral: PiStyle = {
    color: "green"
};
export const keyword: PiStyle = {
    // "font-weight": "bold",
    color: "blue"
};

export const conceptkeyword: PiStyle = {
    // "font-weight": "bold",
    color: "darkblue"
};

export const mygrid: PiStyle = {
    padding: "0px",
    "grid-gap": "0px",
    border: "1px",
    "border-style": "solid"
};

export const mycell: PiStyle = {
    padding: "0px",
    // color: "black",
    // "font-weight": "bold",
    "align-items": "left",
    border: "darkgrey",
    "border-style": "solid",
    "border-width": "1px",
    "background-color": "white"

    // display: "flex",
    // // justifySelf: "stretch",
    // padding: "0px",
    // "grid-gap": "-1px",
    // border: "1px",
    // "border-style": "solid",
    // border: "darkgrey"
};
