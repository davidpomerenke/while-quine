import { aStarSearch } from 'aima'
import { whileQuineProblem } from '../index.mjs'

aStarSearch(whileQuineProblem({ historyFileName: 'comparison/ass_history', tempFileName: 'ass_test' }))
