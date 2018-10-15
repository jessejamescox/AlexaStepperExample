/**
    Created 2016 Jesse Cox All Rights Reserved.
    Example demonstration only. Open Source under GNU License standard.  
    No warranties, or protection implied with the use of this example.
*/
/////////////////////////////////////////////////////
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
//Environment Configuration
var config = {};
config.IOT_BROKER_ENDPOINT      = "a1234567-ats.iot.us-west-2.amazonaws.com".toLowerCase();
//config.IOT_BROKER_REGION        = "us-west-2";
config.IOT_THING_NAME           = "WAGO_ALEXA";
/////////////////////////////////////////////////////
//Loading AWS SDK libraries
var AWS = require('aws-sdk');
AWS.config.region = config.IOT_BROKER_REGION;

//Initializing client for IoT
var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});
/////////////////////////////////////////////////////
// create the parameters for the send object.  
var iotThingShadow = {
            topic:"$aws/things/WAGO_ALEXA/shadow/update",
            payload: {},
            qos:0
        };
// create the payload object to send to device
var payloadObj={ "state":
                    { "desired":
                        {
                            "mode" :"",
                            "position": ""
                          }
                     }
                };
/////////////////////////////////////////////////////
// create the voice response 
var speechOutput = "";
/////////////////////////////////////////////////////

// * The AlexaSkill prototype and helper functions
var AlexaSkill = require('./AlexaSkill');

// main function container
var AlexaStepperMotorControl = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AlexaStepperMotorControl.prototype = Object.create(AlexaSkill.prototype);
AlexaStepperMotorControl.prototype.constructor = AlexaStepperMotorControl;

AlexaStepperMotorControl.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("AlexaStepperMotorControl onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

AlexaStepperMotorControl.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("AlexaStepperMotorControl onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

AlexaStepperMotorControl.prototype.intentHandlers = {
    // register custom intent handlers
    "MoveAbsoluteIntent": function (intent, session, response) {
        //Set the payload for the device as an object ** processes as string to MQTT
        var responses = ['Cool, I sent the stepper to ', 'You got it, see you at ', 'Sure thing, sending stepper to '];

        var pulseCommand = 0;

        console.log(intent.slots);
        payloadObj.state.desired.mode = 'absolute';

        if ((intent.slots.metric.value == 'rotations') || (intent.slots.metric.value == 'turns')  || (intent.slots.metric.value == 'revolutions'))
        {
            payloadObj.state.desired.position = (parseInt(intent.slots.position.value) * 12800);
        }
        else if (intent.slots.position.value == null)
        {
            payloadObj.state.desired.position = 0;
        }
        else    
        {
            payloadObj.state.desired.position = parseInt(intent.slots.position.value);
        }

        iotThingShadow.payload = JSON.stringify(payloadObj);

        console.log(iotThingShadow);

        iotData.publish(iotThingShadow, function(err, data) {
              if (err){
                //handle the error here
                console.log("MQTT Error" + data);
              }
              else {
                //console.log(data);
                //console.log(iotThingShadow.payload);
                //response.tell(speechOutput);
                console.log(payloadObj);
                var preText = responses[Math.floor((Math.random() * 3))];
                var speechOutput = (preText + payloadObj.state.desired.position.toString() + ' pulses');
                response.tell(speechOutput);
              }
        });
    }
};
/////////////////////////////////////////////////////
// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the AlexaStepperMotorControl skill.
    var alexaAtWork = new AlexaStepperMotorControl();
    alexaAtWork.execute(event, context);
};