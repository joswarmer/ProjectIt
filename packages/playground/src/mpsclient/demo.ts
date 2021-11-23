import {MPSServerClient} from ".";
import {GetInstancesOfConceptAnswer, ModelInfo, ModuleStatus, NodeInfo} from "./gen/messages";

const client = new MPSServerClient('ws://localhost:2905/jsonrpc');

async function core() {
    await client.connect().catch((reason: any)=> {
        console.error("unable to connect to server", reason);
        process.exit(1);
    });
    const projectName = await client.getProjectInfo();
    console.log("project name", projectName);
    const modulesStatus = await client.getModulesStatus();
    console.log("got modules status");
    for (const module of modulesStatus.modules) {
        if (module.name.startsWith("accenture.study.genß")) {
            console.log(" - got module", module.name);
            const moduleInfos = await client.getModuleInfo(module.name)
            for (const model of moduleInfos) {
                console.log("   - got model", model.qualifiedName);
                if (model.qualifiedName.endsWith("@descriptor")) {
                    console.log("     skipping descriptor")
                } else if (model.qualifiedName.endsWith("@java_stub")) {
                    console.log("     skipping java_stub")
                } else if (model.qualifiedName.endsWith("@generator")) {
                    console.log("     skipping generator")
                }  else if (model.qualifiedName.endsWith("@tests")) {
                    console.log("     skipping tests")
                } else {
                    const answer = await client.getInstancesOfConcept(model.qualifiedName,
                        "accenture.study.core.FormCollection")
                    const nodes = answer.nodes;
                    nodes.forEach((node: NodeInfo) => {
                        console.log("     APIS group", node.name);
                    })
                }
                }
        }
        }
    process.exit(0)
}
void core();
