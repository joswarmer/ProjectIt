// For InsuranceModel:
// import ShowAnimatedGif from "./customComponents/forInsuranceModel/ShowAnimatedGif.svelte";
// import SMUI_Card_Component from "./customComponents/forInsuranceModel/SMUI_Card_Component.svelte";
// import SMUI_Accordion from "./customComponents/forInsuranceModel/SMUI_Accordion.svelte";
// import SMUI_Dialog from "./customComponents/forInsuranceModel/SMUI_Dialog.svelte";
// import DatePicker from "./customComponents/forInsuranceModel/DatePicker.svelte";
// import {InsuranceModelEnvironment} from "@freon4dsl/samples-insurance";
// For ExternalTester
// import BooleanWrapperComponent from "./customComponents/forExternalTester/BooleanWrapperComponent.svelte";
// import NumberWrapperComponent from "./customComponents/forExternalTester/NumberWrapperComponent.svelte";
// import StringWrapperComponent from "./customComponents/forExternalTester/StringWrapperComponent.svelte";
// import FragmentWrapperComponent from "./customComponents/forExternalTester/FragmentWrapperComponent.svelte";
// import ExternalStringComponent from "./customComponents/forExternalTester/ExternalStringComponent.svelte";
// import ExternalSimpleComponent from "./customComponents/forExternalTester/ExternalSimpleComponent.svelte";
// import ExternalRefListComponent from "./customComponents/forExternalTester/ExternalRefListComponent.svelte";
// import ExternalRefComponent from "./customComponents/forExternalTester/ExternalRefComponent.svelte";
// import ExternalPartListComponent from "./customComponents/forExternalTester/ExternalPartListComponent.svelte";
// import ExternalPartComponent from "./customComponents/forExternalTester/ExternalPartComponent.svelte";
// import ExternalNumberComponent from "./customComponents/forExternalTester/ExternalNumberComponent.svelte";
// import ExternalBooleanComponent from "./customComponents/forExternalTester/ExternalBooleanComponent.svelte";
// import PartWrapperComponent from "./customComponents/forExternalTester/PartWrapperComponent.svelte";
// import PartListWrapperComponent from "./customComponents/forExternalTester/PartListWrapperComponent.svelte";
// import RefWrapperComponent from "./customComponents/forExternalTester/RefWrapperComponent.svelte";
// import RefListWrapperComponent from "./customComponents/forExternalTester/RefListWrapperComponent.svelte";
// import { ExternalModelEnvironment } from "@freon4dsl/samples-external-tester";

import {setCustomComponents} from "@freon4dsl/core-svelte";
// import PersonIcon from "./customComponents/forCourseSchedule/PersonIcon.svelte";
// import PhoneButton from "./customComponents/forCourseSchedule/PhoneButton.svelte";
// import StaffAccordion from "./customComponents/forCourseSchedule/StaffAccordion.svelte";
// import Schedule from "./customComponents/forCourseSchedule/Schedule.svelte";
import DatePicker from "./customComponents/forInsurance/DatePicker.svelte";
import ShowAnimatedGif from "./customComponents/forInsurance/ShowAnimatedGif.svelte";
import SMUI_Accordion from "./customComponents/forInsurance/SMUI_Accordion.svelte";
import SMUI_Card_Component from "./customComponents/forInsurance/SMUI_Card_Component.svelte";
import SMUI_Dialog from "./customComponents/forInsurance/SMUI_Dialog.svelte";

/**
 * Configure the external components used, so Freon can find them.
 */
export function configureExternals() {
    /**
     * Make the external components known to Freon before starting the app!
     */
// For CourseSchedule:
//     setCustomComponents([
//         { component: PersonIcon, knownAs: "PersonIcon" },
//         { component: PhoneButton, knownAs: "PhoneButton" },
//         { component: StaffAccordion, knownAs: "StaffAccordion" },
//         { component: Schedule, knownAs: "Schedule" },
//     ]);
// For InsuranceModel:
setCustomComponents([
	{component: ShowAnimatedGif, knownAs: "AnimatedGif"},
	{component: SMUI_Card_Component, knownAs: "SMUI_Card"},
	{component: SMUI_Accordion, knownAs: "SMUI_Accordion"},
	{component: SMUI_Dialog, knownAs: "SMUI_Dialog"},
	{component: DatePicker, knownAs: "DatePicker"}
]);
// For ExternalTester:
// setCustomComponents([
//     { component: BooleanWrapperComponent, knownAs: "booleanWrapper" },
//     { component: FragmentWrapperComponent, knownAs: "fragmentWrapper" },
//     { component: NumberWrapperComponent, knownAs: "numberWrapper" },
//     { component: PartWrapperComponent, knownAs: "partWrapper" },
//     { component: PartListWrapperComponent, knownAs: "partListWrapper" },
//     { component: RefWrapperComponent, knownAs: "refWrapper" },
//     { component: RefListWrapperComponent, knownAs: "refListWrapper" },
//     { component: StringWrapperComponent, knownAs: "stringWrapper" },
//
//     { component: ExternalBooleanComponent, knownAs: "booleanReplacer" },
//     { component: ExternalNumberComponent, knownAs: "numberReplacer" },
//     { component: ExternalPartComponent, knownAs: "partReplacer" },
//     { component: ExternalPartListComponent, knownAs: "partListReplacer" },
//     { component: ExternalRefComponent, knownAs: "refReplacer" },
//     { component: ExternalRefListComponent, knownAs: "refListReplacer" },
//     { component: ExternalSimpleComponent, knownAs: "simple" },
//     { component: ExternalStringComponent, knownAs: "stringReplacer" },
// ]);

}

