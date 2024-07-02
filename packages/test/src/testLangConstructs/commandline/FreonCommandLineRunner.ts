// Generated by the Freon Language Generator.
// Run this as the main program.
import { AllEnvironment } from "../config/gen/AllEnvironment";
import { FreonCommandLine } from "./FreonCommandLine";
import { DummyAction } from "./DummyAction";

// ensure language is initialized
const tmp = AllEnvironment.getInstance();

// Create the command line object
const cli: FreonCommandLine = new FreonCommandLine();

// Add specific actions to the command line tool
// REPLACE WITH YOUR OWN
cli.addAction(new DummyAction());

// Run it
cli.execute();
