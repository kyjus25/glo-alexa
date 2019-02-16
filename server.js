const Alexa = require('ask-sdk');
const GloSDK = require('@axosoft/glo-sdk')

let skill;

const GetBoardsHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetBoardsIntent';
  },
  handle(handlerInput) {
    const speechText = 'Get Boards!';
    const authToken = handlerInput.requestEnvelope.context.System.user.accessToken;

    GloSDK(authToken).boards.getAll().then(res => {
      console.log(res);
    });

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Get Boards with token', speechText)
      .getResponse();
  }
};

if (process.env.NODE_ENV === 'production') {

  exports.handler = async function (event, context) {
    if (!skill) {
      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
          GetBoardsHandler
        )
        .create();
    }
    return skill.invoke(event,context);
  }

} else {

  // Development environment - we are on our local node server
  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();

  app.use(bodyParser.json());
  app.post('/', function(req, res) {

    if (!skill) {

      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(
          GetBoardsHandler
        )
        .create();

    }

    skill.invoke(req.body)
      .then(function(responseBody) {
        res.json(responseBody);
      })
      .catch(function(error) {
        console.log(error);
        res.status(500).send('Error during the request');
      });

  });

  app.listen(3000, function () {
    console.log('Development endpoint listening on port 3000!');
  });

}
