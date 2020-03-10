import { breadthFirstSearch } from 'aima'
import { whileQuineProblem } from '../index.mjs'

breadthFirstSearch(whileQuineProblem({ historyFileName: 'comparison/bfs_history', tempFileName: 'bfs_test' }))
