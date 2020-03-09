import { SearchProblem, breadthFirstSearch } from 'aima'
import sha3 from 'crypto-js/sha3.js'
import fs from 'fs'
import childProcess from 'child_process'

const config = {
  timeout: 5, // seconds to wait for program termination
  verbose: true // log program codes
}

const hashHistory = fs.readFileSync('history.csv', { encoding: 'utf-8' }).match(/(?<=\n")(\d|[a-z])+/g) || []
let i = 0

export const whileQuineProblem = new SearchProblem({
  initialState: 'test read IgnoreInput <BLOCK> write X1',
  actions: state => state.match(nonterminal)
    ? {
      '<EXPRESSION>': [
        'nil',
        'cons <EXPRESSION> <EXPRESSION>',
        'hd <EXPRESSION>',
        'tl <EXPRESSION>',
        '<VARIABLE>'
      ],
      '<BLOCK>': [
        '{}',
        '{<STATEMENT-LIST>}'
      ],
      '<STATEMENT-LIST>': [
        '<COMMAND>',
        '<COMMAND>; <STATEMENT-LIST>'
      ],
      '<COMMAND>': [
        '<VARIABLE> := <EXPRESSION>',
        'if <EXPRESSION> <BLOCK> else <BLOCK>',
        'while <EXPRESSION> <BLOCK>'
      ],
      '<VARIABLE>': [
        ...variables(state),
        'X' + (variables(state).length + 1)
      ]
    }[state.match(nonterminal)[0]]
    : [],
  result: (state, action) => state.replace(nonterminal, action),
  goalTest: state => {
    if (!state.match(nonterminal)) {
      const hash = sha3(state).toString()
      if (hashHistory.includes(hash)) {
        if (config.verbose) console.log('Skipping previously tested programs ... ' + i++)
        return false
      } else {
        fs.writeFileSync('test.while', state)
        if (config.verbose) console.log(state)
        const exec = a => childProcess.execSync(a, { encoding: 'utf-8' }).replace(/\s|\n|\b/g, '')
        const programAST = exec('./hwhile -u test.while')
        const resultAST = exec(`timeout ${config.timeout} ./hwhile -La test.while nil || echo "timeout:${config.timeout}s"`)
        hashHistory.push(hash)
        fs.appendFileSync('history.csv', '"' + hash + '","' + state + '","' + programAST + '","' + resultAST + '"\n')
        return programAST === resultAST
      }
    } else {
      return false
    }
  },
  stepCost: (state, action) => 1
})

const nonterminal = /<[^>]+>/
const variables = state => state.match(/X\d+/g)

console.log(breadthFirstSearch(whileQuineProblem))
