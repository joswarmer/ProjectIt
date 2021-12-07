import { PiEditorStyle, PiStyle } from "@projectit/core";

// const FontFamily = "Courier New";
const FontFamily = "Arial";


export const editorStyle: PiEditorStyle = {
    global: {
        light: {
            label: {
                "font-family": FontFamily,
                color: "black",
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
                "margin": "0px",
                margin: "0px"
            },
            select: {
                "font-family": FontFamily,
                margin: "0px"
            },
            alias: {
                "font-family": FontFamily,
                margin: "0px"
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
        dark: {

        }
    },
    Accenture_study_core_Form: {
        light: {
            gridcellOdd:  { "background-color": "#eee", border: "1px lightgrey solid"},
            gridcellEven:  { "background-color": "#fff", border: "1px lightgrey solid"},
            grid: { "border-color": "lightgrey", "border-width": "1px" },
            list: { "background-color": "lightgrey",
                "margin": "12px",
                "padding-bottom": "12px",
                "border-bottom": "solid",
                "border-color": "darkgrey"
            },
            text: {"background-color": "lightgrey" ,  "margin": "6px"  },
            label: {"background-color": "lightgrey", "margin": "6px"},
            // label: {"background-color": "#eee" }
        },
        dark: {
            label: {
                "font-weight": "normal",
                color: "white"
            }
        }
    },
    // For concept Attribute
    Accenture_study_core_FormCollection: {
        light: {
            text: { "background-color": "grey", "margin": "6px", color: "white"},
            label: { "background-color": "grey", "margin": "6px", color: "white", "font-weight": "bold"},
            // list: { "background-color": "grey", "margin": "6px", color: "white"},
        },
        dark: {}
    },
    Org_iets3_core_expr_base_AlternativesExpression: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"},
            grid: {
                "border-left": "1px black solid",
                "border-top": "0px lightgrey solid",
                "border-bottom": "0px lightgrey solid",
                "border-right": "1px black solid",
                "margin": "5px"
            }
        },
        dark: {}
    },
    Org_iets3_core_expr_base_AltOption: {
        light: {
            gridcellEven:  { "background-color": "transparent", border: "0px lightgrey solid"},
            gridcellOdd:  { "background-color": "transparent", border: "0px lightgrey solid"},
            text: { color: "black"},
            label: {
                "font-weight": "normal",
                color: "darkgrey"
            },
            grid: { "border-color": "lightgrey", "border-width": "1px" }
        },
        dark: {
            label: {
                "font-weight": "normal",
                color: "white"
            }
        }
    },
    Accenture_study_core_Field: {
        light: {
            gridcellEven:  { "background-color": "#eee", border: "1px lightgrey solid"},
            gridcellOdd:  { "background-color": "#fff", border: "1px lightgrey solid"},
            text: { color: "black"},
            label: {
                "font-weight": "normal",
                color: "darkgrey"
            },

            grid: { "border-color": "lightgrey", "border-width": "1px" }
        },
        dark: {
            label: {
                "font-weight": "normal",
                color: "white"
            }
        }
    },
    Accenture_study_base_Codelist: {
        light: {
            grid: { "border-color": "lightgrey", "border-width": "1px" }
        },
        dark: {

        }
    },
    Accenture_study_core_WTTextField: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"} },
        dark: {}
    },
    Accenture_study_core_WTNumberField: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"} },
        dark: {}
    },
    Accenture_study_core_WTDropdown: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"} },
        dark: {}
    },
    Accenture_study_core_WTCheckbox: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"} },
        dark: {}
    },
    Accenture_study_core_BranchExpression: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"},
                    list: { "vertical-align": "top", "horizontal-align": "start"}
        },
        dark: {}
    },
    Accenture_study_core_ExplicitBranchTarget: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"} },
        dark: {}
    },
    Accenture_study_core_ExitBranch: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"} },
        dark: {}
    },
    Accenture_study_core_GotoNext: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"} },
        dark: {}
    },
    Org_iets3_core_expr_base_AltOption: {
        light: { text: { color: "darkBlue"}, label:{ color: "darkBlue"} },
        dark: {}
    },
    Org_iets3_core_expr_simpleTypes_OtherwiseLiteral: {
        light: {
            text: { color: "darkBlue"},
            label:{ color: "darkBlue"} ,
            list:{ color: "darkBlue"} },
        dark: {}
    },
    Org_iets3_core_expr_base_PlusExpression: {
        dark: {},
        light: {
            alias: { margin: "-2px" }
        }
    },
    Org_iets3_core_expr_base_GreaterExpression: {
        dark: {},
        light: {
            alias: { margin: "-2px" }
        }
    },
    Org_iets3_core_expr_base_MulExpression: {
        dark: {},
        light: {
            alias: { margin: "-2px" }
        }
    },
    Org_iets3_core_expr_base_DivExpression: {
        dark: {},
        light: {
            alias: { margin: "-2px" }
        }
    },
    Accenture_study_base_CodelistEntry: {
        light: {
            label: { color: "#b89900" },
            text: { color: "#b89900" },
            grid: { "border-color": "lightgrey", "border-width": "1px" }
        },
        dark: {
            label: { color: "white" }
        }
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
