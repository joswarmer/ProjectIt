// Generated by the Freon Language Generator: Custom Stdlib Class.
import { AST, FreNamedNode, FreStdlib } from "@freon4dsl/core";
import { AA, BB } from "../language/gen/index.js";

export class CustomTestStartStdlib implements FreStdlib {
    // add all your extra predefined instances here
    __elements: FreNamedNode[] = [];

    get elements(): FreNamedNode[] {
        if (this.__elements.length === 0) {
            AST.change( () => {
                this.__elements.push(AA.create({
                    name: "EXTRA1"
                    // skip the other props, only the name is relevant to this test
                }));
                this.__elements.push(AA.create({
                    name: "EXTRA2"
                    // skip the other props, only the name is relevant to this test
                }));
                this.__elements.push(BB.create({
                    name: "EXTRA1"
                    // skip the other props, only the name is relevant to this test
                }));
                this.__elements.push(BB.create({
                    name: "EXTRA2"
                    // skip the other props, only the name is relevant to this test
                }));
            })
        }
        return this.__elements;
    }}
