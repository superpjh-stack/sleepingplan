import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

config() // .env 파일 로드

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
})
