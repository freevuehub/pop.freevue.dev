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
  // opineCors,
} from './deps.ts'

const app = opine()
const PORT = parseInt(Deno.env.get('PORT') ?? '3000')
const __dirname = dirname(import.meta.url)

app.engine('.html', renderFileToString)

app
  .set('port', PORT)
  .set('views', join(__dirname, 'views'))
  .set('view engine', 'html')

app
  // .use(opineCors({ origin: `${Deno.env.get('ORIGIN')}`.split(',') ?? '' }))
  .use(serveStatic(join(__dirname, 'public')))
  .use(json())
  .use(urlencoded())

app
  .get('/', (_: Request, response: Response) => {
    response
      .set('cache-control', 'no-store')
      .render('index', {
        title: "Pop | Freevue  Toy",
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
