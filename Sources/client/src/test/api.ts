import { http, HttpResponse, JsonBodyType } from 'msw'
import { server } from './server'

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'
export type ApiCall = { url: string; body: unknown }

// Déclare une route de l'API (préfixe /api) et enregistre les appels reçus
export const mockApi = (method: Method, path: string, response: JsonBodyType = {}, status = 200) => {
  const calls: ApiCall[] = []
  server.use(
    http[method](`*/api${path}`, async ({ request }) => {
      const text = await request.text()
      let body: unknown = text
      try {
        body = text ? JSON.parse(text) : undefined
      } catch {
        // corps binaire (photo) : on garde le texte brut
      }
      calls.push({ url: new URL(request.url).pathname, body })
      return HttpResponse.json(response, { status })
    }),
  )
  return calls
}
