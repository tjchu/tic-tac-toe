// Need to import these libraries to define JSX syntax and use React functions
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/*
NOTE: In React, function components are a simpler way to write components that only contain a render method and don’t have 
their own state. Instead of defining a class which extends React.Component, we can write a function that takes props as 
input and returns what should be rendered. Function components are less tedious to write than classes, and many 
components can be expressed this way.
*/

// Square component represents each square in the tic-tac-toe board
function Square(props) {
  return (
    <button 
      className={`
        square 
        ${props.winnerSquare ? "winner-square" : ""}
        ${props.winnerSquare || props.value ?  "" : "unselected-square"}
      `} 
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

/*
NOTE: In React, you use extends React.Component when you want to create a class component that manages 
its own state and/or has lifecycle methods.
*/

// Board component represents the tic-tac-toe board
class Board extends React.Component {
  // Renders a single square with the specified value
  renderSquare(i) {
    let winnerSquare = false;
    // Check if the current square is part of the winning line
    if (this.props.winnerLine && this.props.winnerLine.includes(i))
      winnerSquare = true;
    // Render the Square component with appropriate props
    return <Square 
            winnerSquare={winnerSquare}
            value={this.props.squares[i]} 
            onClick={() => this.props.onClick(i)}
            />;
  }

  // Renders the entire board with squares
  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

// Game component represents the tic-tac-toe game
class Game extends React.Component {
  // Constructor to initialize the state
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        row: null,
        col: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      winnerLine: null,
    }
  }

  // Event handler for clicking on a square
  handleClick(i) {
    let row, col;
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const [winner, winnerLine] = calculateWinner(current.squares);

    // Check if there's a winner or if the square is already filled
    if (winner || squares[i]) {
      return;
    }
    else {
      [row, col] = getRowColumn(i);
    }

    // Set the value of the clicked square based on the player
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    // Update the game state
    this.setState({
      history: history.concat([{
        squares: squares,
        row: row,
        col: col,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      winnerLine: winnerLine,
    })
  }

  // Jump to a specific step in the game history
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  // Reset the game to its initial state
  reset() {
    this.setState({
      history: [{
        squares: Array(9).fill(null),
        row: null,
        col: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      winnerLine: null,
    })
  }

  // Render the game board and status
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const [winner, winnerLine] = calculateWinner(current.squares);

    // Generate list of moves in the game history
    const moves = history.map((step, move) => {
      const desc = move ? `Go to move #${move} (${history[move].row}, ${history[move].col})` : 'Go to game start';
      return (
        <li
          className={`${this.state.stepNumber === move ? "selected-move" : ""}`}
          key={move}>
          <button id="reset" onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    // Determine game status
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    }
    else if (history.length === 10 && this.state.stepNumber === 9)
      status = "Draw" 
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    // Render the game components
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerLine={winnerLine}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button id="reset" onClick={() => this.reset()}>Reset</button>
        </div>
      </div>
    );
  }
}

// Render the Game component to the DOM
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

// Function to get row and column indices from square value
function getRowColumn(squareVal) {
  let row, col;
  const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].includes(squareVal)) {
      row = i;
      col = rows[i].indexOf(squareVal);
      break;
    }
  }
  return [row, col];
}

// Function to calculate the winner of the game
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  return [null, null];
}
