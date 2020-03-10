import { SearchProblem, breadthFirstSearch, uniformCostSearch, aStarSearch } from 'aima'
import editDistance from 'fast-levenshtein'
import sha3 from 'crypto-js/sha3.js'
import parseCSV from 'csv-parse/lib/sync.js'
import fs from 'fs'
import childProcess from 'child_process'

export const whileQuineProblem = (config = {}) => {
  config = {
    historyFileName: 'history', // .csv
    tempFileName: 'test', // .while
    timeout: 10, // seconds to wait for program termination
    verbose: true, // log program codes
    ...config
  }
  // read precomputed data from file
  const history = config.historyFileName
    ? new Map(
      parseCSV(fs.readFileSync(config.historyFileName + '.csv', { encoding: 'utf-8', flag: 'a+' }))
        .map(a => [a[0], a.slice(1)]))
    : new Map()
  const nonterminal = /<[^>]+>/ // matches the first empty place
  const variables = state => state.match(/X\d+/g) // list of all variables in code
  // compute abstract syntax tree of code and its generated output
  // or load from table if already computed before
  const AST = code => {
    const hash = sha3(code).toString()
    if (history.has(hash)) {
      return history.get(hash)
    } else {
      if (config.verbose) console.log(code)
      // compute results by calling the hwhile interpreter
      fs.writeFileSync(config.tempFileName + '.while', code)
      const exec = a => childProcess.execSync(a, { encoding: 'utf-8' }).replace(/\s|\n|\b/g, '')
      const programAST = exec(`./hwhile -u ${config.tempFileName}.while`)
      const outputAST = exec(`timeout ${config.timeout} ./hwhile -La ${config.tempFileName}.while nil || echo "timeout:${config.timeout}s"`)
      // store results
      const result = [programAST, outputAST]
      history.set(hash, result)
      fs.appendFileSync(config.historyFileName + '.csv', [hash, ...result].map(a => `"${a}"`).join(',') + '\n')
      return result
    }
  }
  return new SearchProblem({
    initialState: { 
      code: config.tempFileName + ' read IgnoreInput {<BLOCK>} write X1',
      programAST: '[0,[],1]',
      outputAST: '0'
    },
    actions: state => state.code.match(nonterminal)
      ? { // simplified grammar, e. g., empty blocks are omitted
        '<EXPRESSION>': [
          'nil',
          'cons <EXPRESSION> <EXPRESSION>',
          'hd <EXPRESSION>',
          'tl <EXPRESSION>',
          '<VARIABLE>'
        ],
        '<BLOCK>': [
          '<COMMAND>',
          '<COMMAND>; <BLOCK>'
        ],
        '<COMMAND>': [
          '<VARIABLE> := <EXPRESSION>',
          'if <EXPRESSION> {<BLOCK>}',
          'if <EXPRESSION> {<BLOCK>} else {<BLOCK>}',
          'while <EXPRESSION> {<BLOCK>}'
        ],
        '<VARIABLE>': [
          ...variables(state.code),
          'X' + (variables(state.code).length + 1)
        ]
      }[state.code.match(nonterminal)[0]]
      : [],
    result: (state, action) => {
      const code = state.code.replace(nonterminal, action)
      // fill all empty places and get abstract syntax tree of program and output
      const [programAST, outputAST] = AST(
        state.code
          .replace(/<BLOCK>/g, '<COMMAND>')
          .replace(/<COMMAND>/g, '<VARIABLE> := <EXPRESSION>')
          .replace(/<VARIABLE>/g, 'X1')
          .replace(/<EXPRESSION>/g, 'nil'))
      return { code: code, programAST: programAST, outputAST: outputAST }
    },
    goalTest: state => state.programAST === state.outputAST,
    stepCost: (state, action) => (action.match(new RegExp(nonterminal.source, 'g')) || []).length, // number of empty places
    heuristic: state => editDistance.get(state.programAST, state.outputAST)
  })
}
