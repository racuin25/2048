import React, { Component } from "react";
import "./App.css";
import { Swipeable } from "react-swipeable";
import {
  ParentContainer,
  BtnGroup,
  OuterBox,
  ScoreContainer,
  ActualScore
} from "./Styles";

const objBoardSize = {
  4: "_default",
  5: "_grande",
  6: "_tall",
  8: "_venti"
};

class App extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      game: {
        size: "_default"
      },
      matrix: [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]
      ],
      prev: [],
      score: 0,
      gridChange: false,
      optedForRestart: false
    };
  }

  componentDidMount() {
    this.startOver(4);
  };

  componentWillMount() {
    window.removeEventListener("beforeunload", this.onUnload);
  }

  changeGrid = num => {
    if (objBoardSize[num] !== this.state.game.size) {
      this.startOver(num);
    }
    this.setState({
      gridChange: false
    });
  };

  startOver = sizeArg => {
    let size = sizeArg ? sizeArg : this.state.game.size;
    console.log("didmount");

    let m = [];
    let t = Array(size).fill(null);
    for (let i = 0; i < size; i++) {
      m.push(t.slice());
    }

    this.insertNew(m, true);
    this.insertNew(m, true);
    this.setState({
      matrix: m,
      prev: m,
      score: 0,
      game: {
        ...this.state.game,
        size: objBoardSize[size]
      },
      optedForRestart: false,
      isGameWon: false,
      continue: false
    });
    console.log(size);
    this.myRef.current.focus();
  };

  insertNew = (m, init = false) => {
    const maxValue = m.length - 1;
    let flag = init
      ? true
      : JSON.stringify(m) !== JSON.stringify(this.state.matrix);
    if (flag) {
      if (this.containsNull(m)) {
        let value = Math.random() < 0.9 ? 2 : 4;

        let rowIndex = this.random(0, maxValue);
        let colIndex = this.random(0, maxValue);
        while (m[rowIndex][colIndex]) {
          rowIndex = this.random(0, maxValue);
          colIndex = this.random(0, maxValue);
        }

        m[rowIndex][colIndex] = value;
      }
    }
  };

  move = (m, el, dir) => {
    const maxValue = m.length - 1;

    let r = el.rIndex; //row
    let c = el.cIndex; //column

    if (dir === "up" && r !== 0) {
      while (r !== 0 && !m[r - 1][c]) {
        m[r - 1][c] = m[r][c];
        m[r][c] = null;
        r = r - 1;
      }
    }

    if (dir === "down" && r !== maxValue) {
      while (r !== maxValue && !m[r + 1][c]) {
        m[r + 1][c] = m[r][c];
        m[r][c] = null;
        r = r + 1;
      }
    }

    if (dir === "right" && c !== maxValue) {
      while (c !== maxValue && !m[r][c + 1]) {
        m[r][c + 1]  = m[r][c];
        m[r][c] = null;
        c = c + 1;
      }
    }

    if (dir === "left") {
      while (c !== 0 && !m[r][c -1]) {
        m[r][c - 1] = m[r][c];
        m[r][c] = null;
        c = c - 1;
      }
    }
  };

  merge = (mat, ind, dir) => {
    let m = mat.slice();
    let arrIndices = [];
    let t = [];
    let score = this.state.score;
    const maxValue = mat.length - 1;

    if (dir === "up" || dir === "down") {
      ind.map((currEl, i) => {
        if (!arrIndices.includes(i)) {
          t = ind.filter((x, j) => {
            if (currEl.cIndex === x.cIndex) {
              arrIndices.push(j);
              return currEl.cIndex === x.cIndex;
            }
        });

        if (dir === "up") {
          let index = 0;
          let lastIndex;
          t.map((currEl, i)  => {
            let next = t[i + 1];
            if (i !== lastIndex) {
              if (next) {
                if (currEl.value === next.value) {
                  m[index][currEl.cIndex] = 2 * currEl.value;
                  m[currEl.rIndex][currEl.cIndex] = 2 * currEl.value;
                  if (2 * currEl.value === 2048){
                    this.setState({
                      isGameWon: true
                    });
                  }
                  score = score + 2 * currEl.value;
                  m[next.rIndex][next.cIndex] = null;
                  m[index + 1][currEl.cIndex] = null;
                  index = index + 1;
                  lastIndex = i + 1;
                } else {
                  m[index + 1][currEl.cIndex] = null;
                  m[currEl.rIndex][currEl.cIndex] = null;
                  m[index][currEl.cIndex] = currEl.value;
                  index = index + 1;
                }
              } else {
                m[currEl.rIndex][currEl.cIndex] = null;
                m[index][currEl.cIndex] = currEl.value;

                if (m[index + 1]) {
                  m[index + 1][currEl.cIndex] = null;
                }

                index = index + 1;
                lastIndex = null;
              }
            }
          });
        } else if (dir === "down") {
          let index = maxValue;
          let lastIndex;

          t.map((currEl, i) => {
            let next = t[i + 1];
            if (next) {
              if (i !== lastIndex) {
                if (currEl.value === next.value) {
                    m[index][currEl.cIndex] = 2 * currEl.value;
                    score = score + 2 * currEl.value;
                    if (2 * currEl.value === 2048) {
                      this.setState({
                        isGameWon: true
                      });
                    }
                    m[next.rIndex][next.cIndex] = null;
                    m[index - 1][currEl.cIndex] = null;
                    index = index - 1;
                    lastIndex = i + 1;
                  } else {
                    m[index][currEl.cIndex] = currEl.value;

                    m[index - 1][currEl.cIndex] = null;
                    index = index - 1;
                  }
                }
              } else {
                if (i !== lastIndex) {
                  console.log("YAY"  + currEl.rIndex, currEl.cIndex);
                  m[currEl.rIndex][currEl.cIndex] = null;
                  m[index][currEl.cIndex] = currEl.value;
                  if (m[index - 1]) {
                    m[index - 1][currEl.cIndex] = null;
                  }

                  index = index - 1;
                }
              }
            });
          }
        }
      });
    } else if (dir === "right" || dir === "left") {
      if (dir === "right") {
        for (let i = 0; i < m.length; i++) {
          for (let j = m[i].length - 1; j>= 0; j--) {
            if (j !== 0 && m[i][j]) {
              if (m[i][j] === m[i][j - 1]) {
                if (2 * m[i][j] === 2048) {
                  this.setState({
                    isGameWon: true
                  });
                }
                m[i][j] = 2 * m[i][j];
                score = score + 2 * m[i][j];
                m[i][j - 1] = null;
              }
            }
          }
        }
      

      for (let i = 0; i < m.length; i++) {
        for (let j = m[i].length - 1; j >= 0; j--) {
          if (j !== 0) {
            if (!m[i][j] && m[i][j - 1]) {
              m[i][j] = m[i][j - 1];
              m[i][j - 1] = null;
            }
          }
        }
      }

    } else {
      for (let i = 0; i < m.length; i++) {
        for (let j = 0; j <= m[i].length - 1; j++) {
          if (j !== m[i].length && m[i][j]) {
            if (m[i][j] === m[i][j + 1]) {
              if (2 * m[i][j] === 2048) {
                this.setState({
                  isGameWon: true
                });
              }
              m[i][j] = 2 * m[i][j];
              score = score + 2 * m[i][j];
              m[i][j + 1] = null;
            }
          }
        }
      }

      for (let i = 0; i < m.length; i++) {
        for (let j = 0; j <= m[i].length - 1; j++) {
          if (j !== m[i].length - 1) {
            if (!m[i][j] && m[i][j + 1]) {
              m[i][j] = m[i][j + 1];
              m[i][j + 1] = null;
              }
            }
          }
        }
      }

    }
    return score;
  };

  undoAction = () => {
    this.setState({
      matrix: this.state.prev
    });
    this.myRef.current.focus();
  };

  swipeToKeyboardEmulator = e => {
    const dir = e.dir.toLowerCase();
    if (dir === "left"){
      this.handleKeyDown({ key: "ArrowLeft" });
    } else if (dir === "right") {
      this.handleKeyDown({ key: "ArrowRight" });
    } else if (dir === "up") {
      this.handleKeyDown({ key: "ArrowUp" });
    } else if (dir === "down") {
      this.handleKeyDown({ key: "ArrowDown" });
    }
  };

  handleKeyDown = async e => {
    const { key } = e;
    let score;
    if (
      key === "ArrowLeft" ||
      key === "ArrowRight" ||
      key === "ArrowUp" ||
      key === "ArrowDown"
    ) {
      let ind = [];

      const clone = items =>
        items.map(item => (Array.isArray(item) ? clone(item) : item));

      let m = clone(this.state.matrix);

      m.map((row, i) => {
        row.map((element, j) => {
          if (element !== null) {
            ind.push({ rIndex: i, cIndex: j, value: element });
          }
        });
      });

      let hasMatrixChange;

      if (key === "ArrowLeft") {
        ind.map(s => {
          this.move(m, s, "left");
        });
        
        score = this.merge(m, ind, "left");

        hasMatrixChange =
          JSON.stringify(m) !== JSON.stringify(this.state.matrix);

        if (hasMatrixChange) {
          this.insertNew(m);
        }
      } else if (key === "ArrowUp") {
        ind.map(s => {
          this.move(m, s, "up");
        });

        score = this.merge(m, ind, "up");
        hasMatrixChange =
          JSON.stringify(m) !== JSON.stringify(this.state.matrix);

        if (hasMatrixChange) {
          this.insertNew(m);
        }
      } else if (key === "ArrowRight") {
        let colSorted = ind.slice().sort((a, b) => {
          if (a.cIndex > b.cIndex) {
            return -1;
          }else if (a.cIndex < b.cIndex) {
            return 1;
          }
        });

        colSorted.map(s => {
          this.move(m, s, "right");
        });

        score = this.merge(m, colSorted, "right");

        hasMatrixChange =
          JSON.stringify(m) !== JSON.stringify(this.state.matrix);

        if (hasMatrixChange) {
          this.insertNew(m);
        }
      } else if (key === "ArrowDown") {
        ind
          .slice()
          .reverse()
          .map(s => {
            this.move(m, s, "down");
          });

        score = this.merge(m, ind.slice().reverse(), "down");

        hasMatrixChange =
          JSON.stringify(m) !== JSON.stringify(this.state.matrix);

        if (hasMatrixChange) {
          this.insertNew(m);
        }
      }

      if (hasMatrixChange) {
        this.setState({
          prev: this.state.matrix,
          matrix: m,
          score
        });
      }
    }
  };

  containsNull = array => {
    let arr = array.map(subArray => {
      let res;
      res = subArray.some(value => {
        return !value;
      });
      return res;
    });
    if (arr.includes(true)) {
      return true;
    } else {
      return false;
    }
  };

  random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  onUnload = e => {
    e.preventDefault();
    e.returnValue = "";
  };

  render() {
    return (
      <>
        <ParentContainer onFocus={() => this.myRef.current.focus()}>
          <BtnGroup>
            <button
              onClick={this.undoAction}
              className="game-btn undo-btn"
              title="Undo last move"
            >
            </button>
            <button
              onClick={() =>
                this.setState({
                  optedForRestart: !this.state.optedForRestart,
                  gridChange: false
                })
              }
              className="game-btn refresh-btn"
              title="Reset the game"
            >
            </button>
            <button
              onClick={() =>
                this.setState({
                  optedForRestart: false,
                  gridChange: !this.state.gridChange
                })
              }
              className="game-btn grid-btn"
              title="Change grid size"
            >
            </button>
          </BtnGroup>

          <Swipeable
            onSwiped={eventData => this.swipeToKeyboardEmulator(eventData)}
            prevebtDefaultTouchmoveEvent={true}
          >

            <OuterBox
              ref={this.myRef}
              onBlur={() => this.setState({ focus: false })}
              onKeyDown={e => this.handleKeyDown(e)}
              tabIndex="0"
            >
              {this.state.isGameWon && !this.state.continue && (
                <div className="game-won">
                  <div>Game Won!</div>
                  <div
                    className="game-reset option"
                    onClick={() => this.setState({ continue: true })}
                    style={{ fontSize: "20px", fontWeight: "600" }}
                  >
                    Continue
                  </div>
                </div>
              )}

              {this.state.isGameOver && (
                <div className="game-won">Game Over!</div>
              )}

              {this.state.optedForRestart && (
                <div className="game-won" style={{ flexDirection: "column" }}>
                  Restart?
                  <div
                    style={{
                      display: "flex",
                      fontSize: "50px",
                      width: "inherit",
                      justifyContent: "space-around"
                    }}  
                  >
                    <div
                      className="game-reset option"
                      onClick={() => this.startOver(4)}
                    >
                      Yes
                    </div>
                    <div
                      className="game-reset option"
                      onClick={() => this.setState({ optedForRestart:false })}
                    >
                      No
                    </div>

                  </div>
                </div>
              )}

              {this.state.gridChange && (
                <div>
                  <div className="change-grid">
                    <div className="box">
                      <div
                        className={
                          `option` +
                          (this.state.game.size === "_default"
                            ? ` selected`
                            : ``)
                        }
                        onClick={() => this.changeGrid(4)}
                      >
                        Default <br />
                        (4x4)
                      </div>
                    </div>
                    <div className="box">
                      <div
                        className={
                          `option` +
                          (this.state.game.size === "_grande" ? ` selected` : ``)
                        }
                        onClick={() => this.changeGrid(5)}
                      >
                        Grande <br />
                        (5x5)
                      </div>
                    </div>
                    <div className="box">
                      <div
                        className={
                          `option` +
                          (this.state.game.size === "_tall"
                            ? ` selected`
                            : ``)
                        }
                        onClick={() => this.changeGrid(6)}
                      >
                        Tall <br />
                        (6x6)
                      </div>
                    </div>
                    <div className="box">
                      <div
                        className={
                          `option` +
                          (this.state.game.size === "_venti" ? ` selected` : ``)
                        }
                        onClick={() => this.changeGrid(8)}
                      >
                        Venti <br />
                        (8x8)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {this.state.matrix.map((row, i) =>
                row.map((element, j) => (
                  <div
                    key={i + "-" + j}
                    className={
                      `block ` +
                      (element !== null ? `exists ` : ``) +
                      this.state.game.size
                    }
                  >
                    <div
                      className={
                        `inner _` +
                        (this.state.matrix[i][j] !== null
                          ? this.state.matrix[i][j]
                          : ``)
                      }
                    >
                      {this.state.matrix[i][j]}
                    </div>
                  </div>
                ))
              )}
            </OuterBox>
            {}
          </Swipeable>

          <ScoreContainer>
            <ActualScore>
              SCORE
              <h3 style={{ margin: 0 }}>{this.state.score}</h3>
            </ActualScore>
          </ScoreContainer>
        </ParentContainer>
        {!this.state.focus && (
          <p
            style={{ textAlign: "center" }}
          >
            Tap on any block to continue playing
          </p>
        )}
      </>
    );
  }
}
export default App;