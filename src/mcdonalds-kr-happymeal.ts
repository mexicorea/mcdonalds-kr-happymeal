import * as cheerio from 'cheerio'

import axios from 'axios'

const apiEndpoint = process.env.API_ENDPOINT as string

exports.main = async function(event: any, context: any) {
  try {
      const resp = await axios.get(`${apiEndpoint}/kor/happymeal/listContent.do?page=1&searchStatus=I`)
      const result = resp.data as Result
      const summary = parseHtml(result.list[0].mo_kor_content)
      console.log(JSON.stringify(summary))
  } catch (e) {
    console.error(e)
  }
}

const parseHtml = (html: string): Summary => {
  const $ = cheerio.load(html)
  const imgUrl = `${apiEndpoint}${$('img')?.attr('src')?.trim() ?? ''}`
  const description = $('p')?.text()?.trim() ?? ''
  return {
    imgUrl,
    description
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

interface Summary {
  imgUrl: string
  description: string
}
