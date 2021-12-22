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
} from './deps.ts'

const app = opine()
const PORT = parseInt(Deno.env.get('PORT') ?? '3000')
const __dirname = dirname(import.meta.url)

app.engine('.ejs', renderFileToString)

app
  .set('port', PORT)
  .set('views', join(__dirname, 'views'))
  .set('view engine', 'ejs')

app
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
  .get('/:root', async (request: Request, response: Response) => {
    try {
      const toyFile = await Deno.readFile(`./projects/${request.params.root}/index.html`)

      response.type('html')
      response.end(toyFile)
    } catch {
      response.send('Error')
    }
  })

app.listen(Number(PORT), () => console.log(`Access it at:  http://localhost:${PORT}/ 🦕`))
