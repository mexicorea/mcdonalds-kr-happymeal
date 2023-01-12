import * as cheerio from 'cheerio'

import { DateTime, Interval } from 'luxon'

import axios from 'axios'

const apiEndpoint = process.env.API_ENDPOINT as string
const ntfyTopic = process.env.NTFY_TOPIC as string ?? 'mcdonalds-kr-happymeal'

exports.main = async function(event: any, context: any) {
  try {
    console.log('Hola!')
    const resp = await axios.get(`${apiEndpoint}/kor/happymeal/listContent.do?page=1&searchStatus=I`)
    const content = (resp.data as Result).list?.[0]
    if (content) {
      if (isTodayValidToNotify(content)) {
        const status = await reportThruNtfy(parseHtml(content.mo_kor_content))
        console.log(status)
      } else {
        console.log('not today...')
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const isTodayValidToNotify = (content: Content): boolean => {
  const zone = 'Asia/Seoul'
  const now = DateTime.now().setZone(zone)
  const start = DateTime.fromISO(content.open_time_start.substring(0, 10), { zone })
  const end = DateTime.fromISO(content.open_time_end.substring(0, 10), { zone })

  try {
    const intervalStart = Interval.fromDateTimes(start, now).toDuration('hours').hours
    const intervalEnd = Interval.fromDateTimes(now, end).toDuration('hours').hours
    const aDay = 24
    console.log(`intervalStart=${intervalStart} intervalEnd=${intervalEnd}`)
    return ((typeof(intervalStart) === 'number' && intervalStart < aDay) || (typeof(intervalEnd) === 'number' && intervalEnd < aDay)) ? true : false
  } catch (e) {
    console.error(e)
    return false
  }
}

const reportThruNtfy = async (message: Message): Promise<number> => {
  const result = await axios.post(`https://ntfy.sh/${ntfyTopic}`, message.body, 
  { 
    headers: {
      Title: `This Month's Happy Meal Toys`,
      Click: message.imgUrl,
      Attach: message.imgUrl,
    }
  })
  return result.status
}

const parseHtml = (html: string): Message => {
  const $ = cheerio.load(html)
  const imgUrl = `${apiEndpoint}${$('img')?.attr('src')?.trim() ?? ''}`
  const body = $('p')?.text()?.trim() ?? ''
  return {
    imgUrl,
    body,
  }
}

interface Result {
  totalPage: number
  page: number
  is_ok: string
  totalCount: number
  list: Content[]
  status: string
}

interface Content {
  title: string
  open_time_start: string
  open_time_end: string
  seq: number
  mo_kor_content: string
  pc_kor_content: string
  regdate: string
  status_text: string
  view_count: number
  status: string
}

interface Message {
  imgUrl: string
  body: string
}
