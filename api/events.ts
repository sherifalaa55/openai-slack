import crypto from 'crypto'
import { sendThreadGPTResponse, sendDirectGPTResponse } from './_chat'

export const config = {
  maxDuration: 60,
}

async function isValidSlackRequest(request: Request, body: any) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET!
  const timestamp = request.headers.get('X-Slack-Request-Timestamp')!
  const slackSignature = request.headers.get('X-Slack-Signature')!
  const base = `v0:${timestamp}:${JSON.stringify(body)}`
  const hmac = crypto
    .createHmac('sha256', signingSecret)
    .update(base)
    .digest('hex')
  const computedSignature = `v0=${hmac}`
  return computedSignature === slackSignature
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const body = JSON.parse(rawBody)
  const requestType = body.type
  // console.log(requestType, process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY)
  
  if (requestType === 'url_verification') {
    return new Response(body.challenge, { status: 200 })
  }

  if (await isValidSlackRequest(request, body)) {
    if (requestType === 'event_callback') {
      const eventType = body.event.type
      console.log(eventType);
      if (eventType === 'app_mention') {
        await sendThreadGPTResponse(body.event)
        return new Response('Success!', { status: 200 })
      }
      if (eventType === 'message') {
        await sendDirectGPTResponse(body.event)
        return new Response('Success!', { status: 200 })
      }
    }
  }

  return new Response('OK', { status: 200 })
}
