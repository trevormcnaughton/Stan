'use strict'

exports.handle = (client) => {
  const handleGreeting = client.createStep({
    satisfied() {return false},
    prompt() {
      client.addTextResponse('👋 Howdy!')
      client.expect('collectStandup', 'begin_standup')
      client.done()
    }
  })

  const handleYesterdayStep = client.createStep({
    satisfied() { return false },
    prompt() {
      client.addResponse('request_update/yesterday')
      client.updateConversationState({
        stepOne: {
          completed: true,
          content: client.getMessagePart().content,
        }
      })
      client.done()
    }
  })

  const handleTodayStep = client.createStep({
    satisfied() { return client.getConversationState().stepOne.completed },

    prompt() {
      client.addResponse('request_update/today')
      client.updateConversationState({
        stepTwo: {
          completed: true,
          content: client.getMessagePart().content,
        }
      })
      client.done()
    }
  })

  const handleBlockerStep = client.createStep({
    satisfied() {
      return client.getConversationState.stepTwo.completed
    },

    prompt() {
      client.addResponse('request_update/today')
      client.updateConversationState({
        stepThree: {
          completed: true,
          content: client.getMessagePart().content,
        }
      })
      client.done()
    }
  })

  const untrained = client.createStep({
    satisfied() {return false},
    prompt() {
      client.addTextResponse('Could you rephrse? I didn\' understand that')
      client.done()
    }
  })

  client.runFlow({
    classifications: {
      'greeting': 'handleGreeting',
      'provide_update/yesterday': 'handleYesterdayStep',
      'provide_update/today': 'handleTodayStep',
      'provide_update/blockers': 'handleBlockerStep',
    },
    streams: {
      main: ['handleGreeting', 'collectStandup'],
      collectStandup: [handleYesterdayStep, handleTodayStep, handleBlockerStep],
      handleYesterdayStep: handleYesterdayStep,
      handleTodayStep: handleTodayStep,
      handleBlockerStep: handleBlockerStep,
      handleGreeting: handleGreeting,
      end: [untrained],
    },
  })
}
