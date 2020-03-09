# WHILE Quine

[![NPM Package](https://img.shields.io/npm/v/while-quine.svg)](https://www.npmjs.com/package/while-quine)

This script uses breadth-first search on possible abstract syntax trees to find a [Quine](https://en.wikipedia.org/wiki/Quine_(programming)) for the [WHILE programming language](https://github.com/alexj136/HWhile).

## Usage

`npm build`: Fetch and build the WHILE binary. Requires the [Haskell Tool Stack](https://docs.haskellstack.org/en/stable/README/).

`npm clean`: Empty the table of previous attempts in `history.csv`. Usually you do not want to run this because you do not want to recompute the whole table.

`npm start`: Start the program to undertake further attempts at finding a quine. The search tree will be built anew on each start, but all previous attempts which are saved in `history.csv` will not be executed again. The attempts will be saved to `history.csv`.

## Contributing

It would be cool if you could clone the project, run it for a few hours or days, and submit a pull request with your results :)

If you actually find the Quine with this program, you can collect 2.5£ reward from me. This presupposes that you do not before me claim the original 5£ reward.

Also, if you have any suggestions how to improve the script, your issues and pull requests are very welcome!