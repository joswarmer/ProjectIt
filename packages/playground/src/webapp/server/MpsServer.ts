import { DecoratedModelElement, Language, PiElement } from "@projectit/core";
import { ErrorsForModelReport, MPSServerClient, NodeAdded, NodeRemoved } from "mpssserver-client";
import type {
    ErrorsForNodeReport,
    NodeInfo,
    NodeInfoDetailed,
    NodeReference,
    PropertyChange,
    ReferenceChanged, RegularNodeIDInfo
} from "mpssserver-client/dist/gen/messages";
import { PropertyChangeWorker } from "../../mps/validator/PropertyChangeWorker";
import { StudyWalker } from "../../mps/utils/gen";
import { editorEnvironment } from "../WebappConfiguration";

export class MpsServer {
    static MODEL_NAME = "accenture.stud.gendemo.helloGenerator";

    public static the = new MpsServer();

    private constructor() {
    }

    client: MPSServerClient = new MPSServerClient('ws://localhost:2904/jsonrpc');
    connected: boolean = false;

    async tryToConnect() {
        console.log("MpsServer.tryToConnect 1")
        if (!this.connected) {
            console.log("MpsServer.tryToConnect not connected");
            await this.client.connect().catch((reason: any) => {
                console.error("unable to connect to server", reason);
                process.exit(1);
            });
            const name = await this.client.introduceSelf("example");
            console.log("CLIENT CONNECTED");
            this.client.registerForChanges(MpsServer.MODEL_NAME, {
                onPropertyChange:  (event: PropertyChange) => {
                    console.log("INCOMING PROPERTY CHANGE [" + event.propertyName + "] := " + event.propertyValue + " by " + event.author);
                    console.log("Node Reference " + JSON.stringify(event.node));
                    // if (typeof event.propertyValue === "string") {
                    //     const propChanger = new PropertyChangeWorker(event.node.id.regularId as string, event.propertyName, (event.propertyValue) as any as string);
                    //     const walker = new StudyWalker();
                    //     walker.myWorkers.push(propChanger);
                    //     walker.walk(editorEnvironment.editor.rootElement);
                    // } else {
                    //     console.log("NOT A STRING");
                    // }
                },
                onNodeRemoved:  (event: NodeRemoved ) => { console.log("INCOMING NODE REMOVED CHANGE [" + event.relationName + "]")},
                onNodeAdded:  (event: NodeAdded) => { console.log("INCOMING NODE ADDED CHANGE [" + event.relationName + "] := " + event.child.name)},
                onReferenceChanged:  (event: ReferenceChanged) => { console.log("INCOMING REFERENCE CHANGE [" + event.referenceName + "] := " + event.referenceValue)},
                onErrorsForNodeReport:  (event: ErrorsForNodeReport) => { console.log("INCOMING ERRORS FOR NODE [" + event.issues + "]")},
                onErrorsForModelReport:  (event: ErrorsForModelReport) => { console.log("INCOMING ERRORS FOR MODEL [" + event.issues + "]" )}
            })
            console.log("MpsServer.tryToConnect subscribed to changes")
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

    // TODO Shoulc be connectet
    public async changedPrimitiveProperty(node: PiElement, propertyName: string, value: string) {
        const nodeid: NodeReference = { model: MpsServer.MODEL_NAME, id: { regularId: node.piId()}};
        await this.client.requestForPropertyChange(nodeid, propertyName, value );
    }

    public async changedPartProperty(parent: PiElement, propertyName: string, value: DecoratedModelElement) {
        // const parentid: NodeReference = this.mpsid(parent);
        // await this.client.setChild(parentid, propertyName, Language.getInstance().concept(parent.piLanguageConcept()).typeName, null );
    }

    public async addChild(parent: PiElement, propertyName: string, conceptName: string) {
        const parentid: NodeReference = this.mpsid(parent);
        // await this.client.addChild(parentid, propertyName, conceptName, 0);
    }

    private mpsid(elem: PiElement): NodeReference {
        return { model: MpsServer.MODEL_NAME, id: { regularId: elem.piId()}}
    }
    private regularNodeId(elem: PiElement): RegularNodeIDInfo {
        return { regularId: Number.parseInt(elem.piId())}
    }
}
