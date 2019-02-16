const Alexa = require('ask-sdk');
const GloSDK = require('@axosoft/glo-sdk')

let skill;
let boards = [];

async function getBoards(authToken) {
	await GloSDK(authToken).boards.getAll().then(res => boards = res);
	return boards;
}

const GetBoardsHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'GetBoardsIntent';
	},
	async handle(handlerInput) {
		const authToken = handlerInput.requestEnvelope.context.System.user.accessToken;

		await getBoards(authToken).then(res => {
			console.log(res);
		});

		let speechText = 'You have ' + boards.length + ' boards: ';

		if (boards.length == 1) {
			speechText += 'Your only board is ' + boards[0]['name'] + ' ';
		} else if (boards.length > 1) {
			speechText += 'Your boards are, ';
			for (i = 0; i < boards.length; i++) {
				if (i != (boards.length - 1)) {
					speechText += boards[i]['name'] + ', ';
				} else {
					speechText += 'and ' + boards[i]['name'] + '.';
				}
			}
		}

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard(speechText, speechText)
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
		return skill.invoke(event, context);
	}

} else {

	// Development environment - we are on our local node server
	const express = require('express');
	const bodyParser = require('body-parser');
	const app = express();

	app.use(bodyParser.json());
	app.post('/', function (req, res) {

		console.log(req.body.context.System.user.accessToken);

		if (!skill) {

			skill = Alexa.SkillBuilders.custom()
				.addRequestHandlers(
					GetBoardsHandler
				)
				.create();

		}

		skill.invoke(req.body)
			.then(function (responseBody) {
				res.json(responseBody);
			})
			.catch(function (error) {
				console.log(error);
				res.status(500).send('Error during the request');
			});

	});

	app.listen(3000, function () {
		console.log('Development endpoint listening on port 3000!');
	});

}
