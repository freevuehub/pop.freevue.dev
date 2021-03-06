import {
  opine,
  serveStatic,
  Request,
  Response,
  join,
  dirname,
  renderFileToString,
  json,
  urlencoded,
  opineCors,
  CorsOptions,
} from './deps.ts'

const app = opine()
const PORT = parseInt(Deno.env.get('PORT') ?? '3000')
const ORIGIN = Deno.env.get('ORIGIN')
const __dirname = dirname(import.meta.url)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const loadOriginsFromDataBase = async () => {
  await sleep(100)

  return `${ORIGIN}`.split(',').map((url) => `${url.trim()}`)
};
const corsOptions: CorsOptions = {
  origin: async () => await loadOriginsFromDataBase(),
}

app.engine('.ejs', renderFileToString)

app
  .set('port', PORT)
  .set('views', join(__dirname, 'views'))
  .set('view engine', 'ejs')

app
  .use(opineCors(corsOptions))
  .use(serveStatic(join(__dirname, 'public')))
  .use(json())
  .use(urlencoded())

app
  .get('/', async (_: Request, response: Response) => {
    const dirList = []

    for await (const dir of Deno.readDir('./projects')) {
      dirList.push(dir)
    }

    response
      .set('cache-control', 'no-store')
      .render('index', {
        data: { dirList }
      })
  })
  .get('/api', async (request: Request, response: Response) => {
    const dirList = []

    for await (const dir of Deno.readDir('./projects')) {
      dirList.push(dir)
    }

    try {
      response.send({
        list: dirList.map((item) => ({
          name: item.name,
          url: `https://pop.freevue.dev/${item.name}`,
        }))
      })
    } catch {
      response
        .set('cache-control', 'no-store')
        .render('error')
    }
  })
  .get('/:root', async (request: Request, response: Response) => {
    try {
      const toyFile = await Deno.readFile(`./projects/${request.params.root}/index.html`)

      response.type('html')
      response.end(toyFile)
    } catch {
      response
        .set('cache-control', 'no-store')
        .render('error')
    }
  })

app.listen(Number(PORT), () => console.log(`Access it at:  http://localhost:${PORT}/ ????`))
