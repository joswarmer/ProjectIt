import { PiEditorStyle, PiStyle } from "@projectit/core";
export const editorStyle: PiEditorStyle = {
    global: {
        light: {
            label: {
                color: "black",
             },
            text: {
                color: "black",
                "font-weight": "normal"
            },
            // alias: {
            //     color: "red"
            // },
            list: {
                color: "magenta"
            }
            // select: { color: "orange"; }

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
    NumberLiteralExpression: {
        light: {
            text: {
                color: "blue"
            }
        },
        dark: {

        }
    },
    StringLiteralExpression: {
        light: {
            text: {
                color: "green"
            },
            label: {
                color: "green"
            }
        },
        dark: {

        }
    },
    Entity: {
        light: {
            gridcellEven:  { "background-color": "#fff"},
            gridcellOdd:  { "background-color": "#eee"},
            label: {
                color: "black"
            },
            text: {
                color: "black"
            },
            list: {
                "margin": "3px"
            }
        },
        dark: {
            gridcellEven:  { "background-color": "#fff"},
            gridcellOdd:  { "background-color": "#eee"},
            label: {
                color: "white",
                "background-color": "black"
            },
            text: {
                color: "white",
                "background-color": "black"
            },
            alias: {
                color: "white",
                "background-color": "black"
            },
            grid: {
                "background-color": "black"
            }

        }
    },
    Attribute: {
        light: {
            gridcellEven:  { "background-color": "#eee", border: "1px lightgrey solid"},
            gridcellOdd:  { "background-color": "#fff", border: "1px lightgrey solid"},
            text: { color: "black"}
        },
        dark: {
            gridcellEven:  { "background-color": "#222", border: "1px lightgrey solid"},
            gridcellOdd:  { "background-color": "#000", border: "1px lightgrey solid"}
        }
    },
    // For concept Attribute
    Method: {
        light: {
            label: {
                "font-weight": "bold",
                color: "darkmagenta"
            },
            text: {
                color: "green"
            },
            // alias: {
            //     color: "red"
            // },
            list: {
                color: "yellow"
            }
        },
        dark: {
            label: {
                "font-weight": "normal",
                color: "white"
            }
        }
    }
}

export const entityNameStyle: PiStyle = {
    "margin-top": "10px",
    "padding-top": "2px",
    "padding-bottom": "2px",
    color: "darkred",
    "background-color": "#E0E0E0",
    "font-weight": "bold",
    display: "flex",
    "align-items": "center",
    "align-content": "center",
    border: "lightgrey",
    "border-style": "solid",
};

export const entityBoxStyle: PiStyle = {
    padding: "0px",
    color: "darkred",
    "padding-bottom": "6px",
    "font-weight": "bold",
    "align-items": "center",
    "border-style": "none",
};

export const attributeHeader: PiStyle = {
    padding: "0px",
    // color: "darkred",
    "font-weight": "bold",
    "align-items": "left",
    border: "lightgrey",
    // "border-style": "solid",
    // "border-width": "1px",
    "background-color": "lightgrey"
};

export const rowStyle: PiStyle = {
};

export const attributeName: PiStyle = {
    "padding-left": "4px",
    color: "black",
    "font-weight": "normal",
};

export const attributeType: PiStyle = {
    padding: "0px",
    "font-weight": "normal",
};

export const gridCellOr: PiStyle = {
    padding: "4px",
    color: "blue",
    "font-weight": "bold",
    display: "flex",
    "align-items": "center",
    border: "lightgrey",
    "border-style": "solid",
    "border-width": "1px",
    "background-color": "lightblue"
};

export const or_gridcellFirst: PiStyle = {
    // padding: "4px",
    border: "red",
    "border-style": "solid",
    "border-width": "1px"
};

export const gridcell: PiStyle = {
    // padding: "4px",
    "border-left": "lightgrey",
    "border-left-style": "solid",
    "border-left-width": "1px",
    "border-right": "lightgrey",
    "border-right-style": "solid",
    "border-right-width": "1px",
    "border-bottom": "lightgrey",
    "border-bottom-style": "solid",
    "border-bottom-width": "1px"
};

export const gridcellLast: PiStyle = {
    padding: "4px",
    "border-left": "lightgrey",
    "border-left-style": "solid",
    "border-left-width": "1px",
    "border-right": "lightgrey",
    "border-right-style": "solid",
    "border-right-width": "1px",
    "border-bottom": "lightgrey",
    "border-bottom-style": "solid",
    "border-bottom-width": "1px",
}

 export const grid: PiStyle = {
    display: "inline-grid",
    "grid-gap": "0px",
    "align-items": "center",
    "align-content": "center",
    "justify-items": "stretch"
}

export const mygrid: PiStyle = {
    padding: "0px",
    "grid-gap": "-1px",
    border: "0px",
    "border-style": "hidden"
};

export const mycell: PiStyle = {
    display: "flex",
    // justifySelf: "stretch",
    padding: "0px",
    "grid-gap": "-1px",
    border: "0px",
    "border-style": "hidden"
};
