import { PiEditorStyle, PiStyle } from "@projectit/core";

// const FontFamily = "Courier New";
const FontFamily = "Arial";


export const editorStyle: PiEditorStyle = {
    global: {
        light: {
            label: {
                "font-family": FontFamily,
                color: "darkmagenta",
                margin: "0px"
            },
            text: {
                "font-family": FontFamily,
                color: "black",
                "font-weight": "normal",
                margin: "0px"
            },
            list: {
                color: "magenta",
                "margin": "0px"
            },
            select: {
                "font-family": FontFamily,
                margin: "0px"
            },
            alias: {
                "font-family": FontFamily,
                // margin: "0px"
            },
            grid: {
                "border-color": "darkgrey",
                margin: "0px"
            }

        },
        dark: {
            label: {
                color: "white",
                "font-weight": "bold"
            },
            text: {
                color: "yellow",
                "font-weight": "normal"
            }
        }
    },

    Org_iets3_core_expr_simpleTypes_NumberLiteral: {
        light: {
            text: {
                color: "darkMagenta"
            },
            label: {
                color: "magenta"
            }
        },
        dark: {}
    }
}

export const attributeHeader: PiStyle = {
    padding: "0px",
    color: "black",
    "font-weight": "bold",
    "align-items": "left",
    border: "darkgrey",
    // "border-style": "solid",
    // "border-width": "1px",
    "background-color": "lightgrey"
};


export const mycell: PiStyle = {
    // display: "flex",
    // // justifySelf: "stretch",
    // padding: "0px",
    // "grid-gap": "-1px",
    border: "1px",
    "border-style": "solid",
    "border-color": "lightgrey"
};
export const altcell: PiStyle = {
    // display: "flex",
    // // justifySelf: "stretch",
    // padding: "0px",
    // "grid-gap": "-1px",
    // border: "1px",
    // "border-style": "solid",
    // "border-color": "lightgrey"
};
