// import { NodeData, WsCommunication, NodeReference } from "webeditkit";


import { MPSServerClient } from "../../mpsclient";
import { NodeInfo, NodeInfoDetailed } from "../../mpsclient/gen/messages";

export class MpsServer {
    static MODEL_NAME = "org.projectit.mps.structure.to.ast.example.model1";

    public static the = new MpsServer();

    private constructor() {
    }

    client: MPSServerClient = new MPSServerClient('ws://localhost:2905/jsonrpc');
    connected: boolean = false;
    async core() {
        if (!this.connected) {
            await this.client.connect().catch((reason: any) => {
                console.error("unable to connect to server", reason);
                process.exit(1);
            });
            this.connected = true;
        }
    }

    async getInfo() {
        const projectName = await this.client.getProjectInfo();
        console.log("project name", projectName);
        const modulesStatus = await this.client.getModulesStatus();
        console.log("got modules status");
        for (const module of modulesStatus.modules) {
            if (module.name.startsWith("accenture.study.gen")) {
                console.log(" - got module", module.name);
                const moduleInfos = await this.client.getModuleInfo(module.name)
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
                        const answer = await this.client.getInstancesOfConcept(model.qualifiedName,
                            "accenture.study.WebSocketsAPIsGroup")
                        const nodes = answer.nodes;
                        nodes.forEach((node: NodeInfo) => {
                            console.log("     APIS group", node.name);
                        })
                    }
                }
            }
        }

    }

    public async getReferenceName(modelFQN: string, regularId: string): Promise<string> {
        console.log("getReferenceName for " + regularId);
        // await this.core();
        // this.getInfo();
        const nodeDetail: NodeInfoDetailed = await this.client.getNode( {model: MpsServer.MODEL_NAME, id: {"regularId": regularId}});
        console.log("NODE DETAIL " + (!!nodeDetail ? nodeDetail.name : "NULL") );
        return nodeDetail.name;
    }
}
