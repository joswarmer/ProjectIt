import { FreonLayout, WebappConfigurator, setDevelopment } from "@freon4dsl/webapp-lib";
import { MockServer } from "./demo/MockServer.js";
import { configureExternals } from "./externals.js";
import { configureLoggers } from "./loggers.js";
import { LanguageEnvironment } from "@freon4dsl/samples-insurance";
// import { ServerCommunication} from "@freon4dsl/core";

/**
 * Initialize everything
 */
WebappConfigurator.getInstance().setEditorEnvironment(LanguageEnvironment.getInstance());
WebappConfigurator.getInstance().setServerCommunication(new MockServer());
WebappConfigurator.getInstance().isDemo = true;
setDevelopment(false)
configureExternals()
configureLoggers()
/**
 * Now start the app ...
 */
const app = new FreonLayout({
    target: document.body,
});
export default app;
