import type { FreEnvironment, FreErrorSeverity } from "@freon4dsl/core";
import { setUserMessage } from "../components/stores/UserMessageStore";
import { LanguageInitializer } from "../language/LanguageInitializer";
import type { IServerCommunication } from "../server/IServerCommunication";
import { ServerCommunication } from "../server/ServerCommunication";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import { ExampleEnvironment } from "../../Example/config/gen/ExampleEnvironment";
export const editorEnvironment: FreEnvironment = ExampleEnvironment.getInstance();
LanguageInitializer.initialize();

/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// Initialize server:
serverCommunication.onError = (msg: string, severity: FreErrorSeverity): void => {
    setUserMessage(msg, severity);
}
// serverCommunication.
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
