import { uniformCostSearch } from 'aima'
import { whileQuineProblem } from '../index.mjs'

uniformCostSearch(whileQuineProblem({ historyFileName: 'comparison/ucs_history', tempFileName: 'ucs_test' }))
