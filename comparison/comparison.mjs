import fs from 'fs'
import plotly from 'plotly'

const log = fs.readFileSync('comparison/log.txt', { encoding: 'utf-8' }).match(/\d+/g)
const trans = { 0: [], 1: [], 2: [] }
for (const i in log) trans[i % 3].push(log[i])
const data = trans[0].map((_, i) => [i * 10, trans[0][i], trans[1][i], trans[2][i]])
const names = ['time in seconds', 'breadth-first search', 'uniform-cost search', 'a* search']
fs.writeFileSync(
  'comparison/data.csv',
  names.map(a => `"${a}"`).join(',') +
  data.map(n => n.join(',')).join('\n'))

plotly('davidpomerenke', 'xrqvmkQiKFJBUi2WJQZC')
  .getImage(
    {
      data: Object.keys(trans).map(a => ({
        x: Object.keys(trans[0]).map(b => b * 10),
        y: trans[a],
        name: names[parseInt(a) + 1],
        type: "scatter"
      })),
      layout: {
        xaxis: { title: 'time in seconds' },
        yaxis: { title: '# tested programs' }
      }
    },
    {
      format: 'png'
    },
    (err, imageStream) => {
      if (err) console.log(err)
      const fileStream = fs.createWriteStream('comparison/comparison.png')
      imageStream.pipe(fileStream)
    })
