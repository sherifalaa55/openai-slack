import { WebClient } from '@slack/web-api'
import { getGPTResponse, generatePromptFromThread } from './_google'

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

type Event = {
  channel: string
  ts: string
  thread_ts?: string
}

export async function sendThreadGPTResponse(event: Event) {
  const { channel, ts, thread_ts } = event
  console.log(channel, ts, thread_ts)
  try {
    const thread = await slack.conversations.replies({
      channel,
      ts: thread_ts ?? ts,
      inclusive: true,
    })

    const prompts = await generatePromptFromThread(thread)
    const message = prompts.pop()?.parts[0].text;
    console.log(prompts, message);
    const gptResponse = await getGPTResponse(prompts, message)

    await slack.chat.postMessage({
      channel,
      thread_ts: ts,
      // text: `${gptResponse.choices[0].message.content}`,
      text: `${gptResponse.response.text()}`,
    })
  } catch (error) {
    if (error instanceof Error) {
      await slack.chat.postMessage({
        channel,
        thread_ts: ts,
        text: `<@${process.env.SLACK_ADMIN_MEMBER_ID}> Error: ${error.message}`,
      })
    }
  }
}

export async function sendDirectGPTResponse(event: Event) {
  const { channel, ts, thread_ts } = event
  console.log(channel, ts, thread_ts)
  try {
    const thread = await slack.conversations.replies({
      channel,
      ts: thread_ts ?? ts,
      inclusive: true,
    })
    console.log(thread);
    const prompts = await generatePromptFromThread(thread)
    const message = prompts.pop()?.parts[0].text;
    console.log(prompts, message);
    const gptResponse = await getGPTResponse(prompts, message)

    await slack.chat.postMessage({
      channel,
      // text: `${gptResponse.choices[0].message.content}`,
      text: `${gptResponse.response.text()}`,
    })
  } catch (error) {
    if (error instanceof Error) {
      await slack.chat.postMessage({
        channel,
        text: `<@${process.env.SLACK_ADMIN_MEMBER_ID}> Error: ${error.message}`,
      })
    }
  }
}
