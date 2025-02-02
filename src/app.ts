import { Hono } from 'hono'
import { timeout } from 'hono/timeout'
import { embedding } from './routes/embedding'
import { search } from './routes/search'

export const app = new Hono().basePath('/api/v0')

app.use('*', timeout(60 * 60 * 10 ** 3))

app.route('/embedding', embedding)
app.route('/search', search)
