import { time } from "console";
import { StudyConfiguration } from "../../../playground/src/StudyConfiguration/language/gen";
import { ScheduledStudyConfiguration } from "../timeline/ScheduledStudyConfiguration";
import { Simulator } from "../timeline/Simulator";
import { EventInstance, EventInstanceState, Timeline } from "../timeline/Timeline";
import * as utils from "./Utils";

describe ("Access to simulation data", () => {
    // var simulator;
    var studyConfiguration: StudyConfiguration;
    var scheduledStudyConfiguration: ScheduledStudyConfiguration;
  
  beforeEach(() => {
    studyConfiguration = utils.setupEnvironment();
    // simulator = new Simulator(studyConfiguration);
    utils.setupEnvironment();
  });


  describe ("Check for the correct Events scheduled just using 'StartDay + #'", () => {
    
      beforeEach(() => {
        studyConfiguration = utils.addAPeriodAndTwoEvents(studyConfiguration, "Screening", "Visit 1", 1, "Visit 2", 7);
        scheduledStudyConfiguration = new ScheduledStudyConfiguration(studyConfiguration);

      });
    
      it ("can access to the first period of the trial" , () => {
        // GIVEN a scheduled study configuration with one period and two events
        // See beforeAll()

        // WHEN the Scheduled Study Configuration is asked for the first scheduled period 
        let scheduledPeriod = scheduledStudyConfiguration.getFirstScheduledPeriod();

        // Then the first scheduled Period is Screening
        expect(scheduledPeriod.configuredPeriod.name).toEqual("Screening");
      });

      it ("can access to the first event of the first period of the trial" , () => {
        // GIVEN a scheduled study configuration with one period and two events
        // See beforeAll()

        // WHEN the Scheduled Study Configuration is asked for the first scheduled period 
        let scheduledEvent = scheduledStudyConfiguration.getFirstEvent();

        // Then the first scheduled Period is Screening
        if (scheduledEvent) {
          expect(scheduledEvent.configuredEvent.name).toEqual("Visit 1");
        } else {
          throw new Error("No scheduled event found");
        }
      });

      it ("can access all the events in a period of the trial" , () => {
        // GIVEN a scheduled study configuration with one period and two events
        // See beforeAll()

        // WHEN the Scheduled Study Configuration is asked for the first scheduled period 
        let scheduledPeriod = scheduledStudyConfiguration.getFirstScheduledPeriod();
        let scheduledEvents = scheduledStudyConfiguration.getAllEventsInAScheduledPeriod(scheduledPeriod);

        // Then the first scheduled Period is Screening
        if (scheduledEvents) {
          expect(scheduledEvents.length).toEqual(2);
          expect(scheduledEvents[0].configuredEvent.name).toEqual("Visit 1");
          expect(scheduledEvents[1].configuredEvent.name).toEqual("Visit 2");
        } else {
          throw new Error("No scheduled events found");
        }
      });

      it ("can get the next event based on days from StartDay" , () => {
        // GIVEN a timeline with the Visit 1 event completed
        // AND a scheduled study configuration with a Visit 2 event starting 7 days after the Visit 1 event
        // AND it's day 8
        let scheduledEvent = scheduledStudyConfiguration.getFirstEvent();
        if (!scheduledEvent) {
          throw new Error("No scheduled event found");
        } else {
          let timeline = new Timeline();
          let eventInstance = new EventInstance(scheduledEvent,1);
          eventInstance.status = EventInstanceState.Completed;
          timeline.addEvent(eventInstance);
          timeline.setCurrentDay(8);

          // WHEN the schedule is checked 
          let readyEvents = scheduledStudyConfiguration.getReadyEvents(timeline);

          // THEN the next event is Visit 2
          console.log("readyEvents #: " + readyEvents.length);
          console.log("readyEvents: " + readyEvents[0].configuredEvent.name);
          expect(readyEvents.length).toEqual(1);
        }
      });

    });

    describe ("Check for the correct Events scheduled just using 'Completed-Event + #'", () => {

      it.only ("can get next event based on reference to completed event" , () => {
        // GIVEN a scheduled study configuration with an event + 7 days from the first event
        studyConfiguration = utils.addEventScheduledOffCompletedEvent(studyConfiguration, "Screening", "Visit 1", 1, "Visit 2", 7);
        scheduledStudyConfiguration = new ScheduledStudyConfiguration(studyConfiguration);

        // WHEN the Scheduled Study Configuration is asked for the first scheduled period 
        let scheduledEvent = scheduledStudyConfiguration.getFirstEvent();
        if (!scheduledEvent) {
          throw new Error("No scheduled event found");
        } else { 
          let timeline = new Timeline();
          let eventInstance = new EventInstance(scheduledEvent,1);
          eventInstance.status = EventInstanceState.Completed;
          timeline.addEvent(eventInstance);
          timeline.setCurrentDay(8);

          // WHEN the schedule is checked 
          let readyEvents = scheduledStudyConfiguration.getReadyEvents(timeline);

          // THEN the next event is Visit 2
          expect(readyEvents.length).toEqual(1);
        }
          
      });

    });

  });