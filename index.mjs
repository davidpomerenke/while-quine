import { SearchProblem, breadthFirstSearch } from 'aima'
import fs from 'fs'
import childProcess from 'child_process'

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
      fs.writeFileSync('test.while', state)
      console.log(state)
      const programAST = childProcess.execSync('./hwhile -u test.while', { encoding: 'utf-8' })
      const resultAST = childProcess.execSync('timeout 5 ./hwhile -La test.while nil || echo -1', { encoding: 'utf-8' })
      const normalise = a => a.replace(/\s|\n|\b/g, '')
      console.log(normalise(resultAST))
      return normalise(programAST) === normalise(resultAST)
    } else {
      return false
    }
  },
  stepCost: (state, action) => 1
})

const nonterminal = /<[^>]+>/
const variables = state => state.match(/X\d+/g)

console.log(breadthFirstSearch(whileQuineProblem))
