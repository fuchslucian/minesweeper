import Head from 'next/head'
import { useState} from "react"

const getSorroundedBombs = (board, i, y) => {
  //R, C = len(M), len(M[0])
  let surrounded = 0
  let row_start = i === 0 ? 0 : i-1
  let row_end = i === board.length-1 ? board.length-1 : i+1
  let col_start = y === 0 ? 0 : y-1
  let col_end = y === board[0].length-1 ? board[0].length-1 : y+1
  for (let x = row_start; x <= row_end; x++) {
    for (let z = col_start; z <= col_end; z++){
      if (board[x][z].bomb){
        surrounded += 1
      }
    }
  }
  return surrounded
}
// Celle in Board soll so aussehen {status: clicked, notclicked or flagged, bomb: true or false, surroundings: 0-8}
export const getStaticProps = async () => {
  let board = []
  let width = 20
  let height = 20
  let bombs = 20

  for (let i = 0; i < height; i++) {
    let row = []
    for (let y = 0; y < width; y++){
      row.push({status: "covered", bomb: false, surroundings: 0})
    }
    board.push(row)
  }
  for (let i = 0; i < bombs; i++){
    let ran_i = Math.floor(Math.random() * (height-1 - 0 + 1)) + 0;
    let ran_y = Math.floor(Math.random() * (width-1 - 0 + 1)) + 0;
    while (board[ran_i][ran_y].bomb){
      ran_i = Math.floor(Math.random() * (height-1 - 0 + 1)) + 0;
      ran_y = Math.floor(Math.random() * (width-1 - 0 + 1)) + 0;
    }
    board[ran_i][ran_y].bomb = "bomb"
  }
  for (let i = 0; i < height; i++){
    for (let y = 0; y < width; y++){
      if (!board[i][y].bomb){
        board[i][y].surroundings = await getSorroundedBombs(board, i, y)
      }
    }
  }
  return {
    props: {
      board: board,
      width: width,
      height: height,
      bombs: bombs
    }
  }

}

export default function Minesweeper(props) {
  const [board, setBoard] = useState(props.board)
  const [width, setWidth] = useState(props.width)
  const [newWidth, setNewWidth] = useState(props.width)
  const [height, setHeight] = useState(props.height)
  const [newHeight, setNewHeight] = useState(props.height)
  const [bombs, setBombs] = useState(props.bombs)
  const [newBombs, setNewBombs] = useState(props.bombs)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lost, setLost] = useState(false)
  const [won, setWon] = useState(false)


  const searchEmptySurroundingCells = (i,y) => {
    let visited = [[i,y]]
    let new_board = JSON.parse(JSON.stringify(board));
    let queue = [[i,y]]
    while (queue.length > 0){
      let e = queue.shift()
      i = e[0]
      y = e[1]
      new_board[i][y].status = "clicked"
      if (i-1 >= 0){
        if (new_board[i-1][y].surroundings === 0 && !JSON.stringify(visited).includes(JSON.stringify([i-1,y]))){
          queue.push([i-1,y])
          visited.push([i-1,y])
        }
        new_board[i-1][y].status = "clicked"
      }
      if (i+1 < new_board.length){
        if (new_board[i+1][y].surroundings === 0 && !JSON.stringify(visited).includes(JSON.stringify([i+1,y]))){
          queue.push([i+1, y])
          visited.push([i+1,y])
        }
        new_board[i+1][y].status = "clicked"
      }
      if (y-1 >= 0){
        if (new_board[i][y-1].surroundings === 0 && !JSON.stringify(visited).includes(JSON.stringify([i,y-1]))){
          queue.push([i, y-1])
          visited.push([i,y-1])
        }
        new_board[i][y-1].status = "clicked"
      }
      if (y+1 < new_board[0].length){
        if (new_board[i][y+1].surroundings === 0 && !JSON.stringify(visited).includes(JSON.stringify([i,y+1]))){
          queue.push([i, y+1])
          visited.push([i,y+1])
        }
        new_board[i][y+1].status = "clicked"
      }
      if (i+1 < new_board.length && y+1 < new_board[0].length){
        if (new_board[i+1][y+1].surroundings === 0 && !JSON.stringify(visited).includes(JSON.stringify([i+1,y+1]))){
          queue.push([i+1, y+1])
          visited.push([i+1,y+1])
        }
        new_board[i+1][y+1].status = "clicked"
      }
      if (i-1 >= 0 && y-1 >= 0){
        if (new_board[i-1][y-1].surroundings === 0 && !JSON.stringify(visited).includes(JSON.stringify([i-1,y-1]))){
          queue.push([i-1, y-1])
          visited.push([i-1,y-1])
        }
        new_board[i-1][y-1].status = "clicked"
      }
      if (i+1 < new_board.length && y-1 >= 0){
        if (new_board[i+1][y-1].surroundings === 0 && !JSON.stringify(visited).includes(JSON.stringify([i+1,y-1]))){
          queue.push([i+1, y-1])
          visited.push([i+1,y-1])
        }
        new_board[i+1][y-1].status = "clicked"
      }
      if (i-1 >= 0 && y+1 < new_board[0].length){
        if (new_board[i-1][y+1].surroundings === 0 && !JSON.stringify(visited).includes(JSON.stringify([i-1,y+1]))){
          queue.push([i-1, y+1])
          visited.push([i-1,y+1])
        }
        new_board[i-1][y+1].status = "clicked"
      }
      

    }
    setBoard(new_board)
  }
  const checkWin = (new_board) => {
    let flagged = 0
    for (let i = 0; i < new_board.length; i++) {
      for (let y = 0; y < new_board[0].length; y++){
        if (new_board[i][y].bomb){
          if (new_board[i][y].status != "flagged"){
            return false
          }
        }
        if (new_board[i][y].status === "flagged"){
          flagged += 1
        }
      }
    }
    return flagged === bombs
  }

  const handleLoss = (x, z) => {
    setLost(true)
    let new_board = JSON.parse(JSON.stringify(board));
    for (let i = 0; i < new_board.length; i++){
      for (let y = 0; y < new_board[0].length; y++){
        if (new_board[i][y].bomb){
          if (i === x && y === z){
            new_board[i][y].bomb = "redbomb"
          }
          new_board[i][y].status = "clicked"
        }
      }
    }
    setBoard(new_board)
  }

  const generateNewBoard = async () => {
    if (isGenerating){
      return
    }
    if (newBombs === 0){
      window.alert("There must be more Bombs than 0")
      return
    }
    if (newWidth === 0 || newHeight === 0){
      window.alert("Height and Width must be greater than 0")
      return
    }
    setIsGenerating(true)
    let new_board = []
    for (let i = 0; i < newHeight; i++) {
      let row = []
      for (let y = 0; y < newWidth; y++){
        row.push({status: "covered", bomb: false, surroundings: 0})
      }
      new_board.push(row)
    }
    for (let i = 0; i < newBombs; i++){
      let ran_i = Math.floor(Math.random() * (newHeight-1 - 0 + 1)) + 0;
      let ran_y = Math.floor(Math.random() * (newWidth-1 - 0 + 1)) + 0;
      while (new_board[ran_i][ran_y].bomb){
        ran_i = Math.floor(Math.random() * (newHeight-1 - 0 + 1)) + 0;
        ran_y = Math.floor(Math.random() * (newWidth-1 - 0 + 1)) + 0;
      }
      new_board[ran_i][ran_y].bomb = "bomb"
    }
    for (let i = 0; i < newHeight; i++){
      for (let y = 0; y < newWidth; y++){
        if (!new_board[i][y].bomb){
          new_board[i][y].surroundings = await getSorroundedBombs(new_board, i, y)
        }
      }
    }
    setBoard(new_board)
    setHeight(newHeight)
    setWidth(newWidth)
    setBombs(newBombs)
    setIsGenerating(false)
    setLost(false)
    setWon(false)
  }
  
  const handleHeightChange = (new_height) => {
    if (new_height.match(/^[0-9]+$/) != null){
      if (parseInt(new_height) < 100){
        setNewHeight(parseInt(new_height))
      }
      if (newBombs > parseInt(new_height)*newWidth){
        setNewBombs(parseInt(new_height)*newWidth)
      }
    }if (new_height === ""){
      setNewHeight(0)
      setNewBombs(0)
    }
  }
  const handleWidthChange = (new_width) => {
    if (new_width.match(/^[0-9]+$/) != null){
      if (parseInt(new_width) < 100){
        setNewWidth(parseInt(new_width))
      }
      if (newBombs > parseInt(new_width)*newHeight){
        setNewBombs(parseInt(new_width)*newHeight)
      }
    }if (new_width === ""){
      setNewWidth(0)
      setNewBombs(0)
    }
  }
  const handleBombsChange = (new_bombs) => {
    if (new_bombs.match(/^[0-9]+$/) != null){
      if (parseInt(new_bombs) <= newHeight*newWidth){
        setNewBombs(parseInt(new_bombs))
      }
    }if (new_bombs === ""){
      setNewBombs(0)
    }
  }

  const handleClick = (i,y) => {
    if (isGenerating || lost || won){
      return
    }
    let new_board = JSON.parse(JSON.stringify(board));
    new_board[i][y].status = "clicked"
    if (new_board[i][y].bomb){
      handleLoss(i,y)
    }else if (new_board[i][y].surroundings != 0){
      setBoard(new_board)
    }else if (new_board[i][y].surroundings === 0){
      searchEmptySurroundingCells(i,y)
    }
  }

  const handleRightClick = (i,y) => {
    if (isGenerating || lost || won){
      return
    }
    let new_board = JSON.parse(JSON.stringify(board));
    if (new_board[i][y].status == "flagged"){
      new_board[i][y].status = "covered"
    }else{
      new_board[i][y].status = "flagged"
    }
    setBoard(new_board)
    if (checkWin(new_board)){
      setWon(true)
    }
  }
  return (
    <div>
      <Head>
        <title>minesweeper</title>
      </Head>
      <h1>Minesweeper Clone</h1>
      <div>
        <div>
          <label htmlFor="width">Width: </label>
          <input value={newWidth} onChange={(e)=>{handleWidthChange(e.target.value)}} id="width"/>
        </div>
        <div>
          <label htmlFor="hight">Height: </label>
          <input value={newHeight} onChange={(e)=>{handleHeightChange(e.target.value)}}/>
        </div>
        <div>
          <label htmlFor="bombs">Bombs: </label>
          <input value={newBombs} onChange={(e)=>{handleBombsChange(e.target.value)}}/>
        </div>
        <div>
          <button onClick={()=>{generateNewBoard()}}>create new board</button>
        </div>
      </div>
      {lost && <h1>You Lost</h1>}
      {won && <h1>You Won</h1>}
      <div className="board" style={{"height" : (height*20)+"px", "width" : (width*20)+"px", "gridTemplateRows": `repeat(1fr, ${height})`, "gridTemplateColumns": `repeat(1fr, ${width})`}}>
        {board.map((row, i) => row.map((cell, y) => {
          return(
          <Cell status={cell.status} bomb={cell.bomb} surroundings={cell.surroundings} i={i+1} y={y+1} handleClick={handleClick} handleRightClick={handleRightClick} key={i+"/"+y}/>
          )
          }))}
      </div>
    </div>
  )
}

const Cell = (props) => {
  //props = status, bomb, surroundings, i, y
  //console.log(props.i,props.y)
  //{status: clicked, covered or flagged, bomb: true or false, surroundings: 1-8}

  if (props.status === "clicked"){
    if (props.bomb){
      return (
        <div style={{"gridRow": `${props.i}`, "gridColumn": `${props.y}`}} className={`cell _${props.bomb}`}>
        </div>
      )
    }
    return (
      <div style={{"gridRow": `${props.i}`, "gridColumn": `${props.y}`}} className={`cell _${+props.surroundings}`}>
      </div>
    )
  }
  if (props.status === "flagged"){
    return (
      <div style={{"gridRow": `${props.i}`, "gridColumn": `${props.y}`}} className="cell _flagged" onContextMenu={(e)=>{
        e.preventDefault()
        return(props.handleRightClick(props.i-1,props.y-1))}}>
      </div>
    )
  }
  return (
    <div style={{"gridRow": `${props.i}`, "gridColumn": `${props.y}`}} className="cell _covered" onClick={()=>{props.handleClick(props.i-1,props.y-1)}} onContextMenu={(e)=>{
      e.preventDefault()
      return(props.handleRightClick(props.i-1,props.y-1))}}>
    </div>
  )
}

/*
<div>
        <fieldset>
            <legend>Height</legend>
            <input value={newHeight} onChange={(e)=>{handleHeightChange(e.target.value)}}/>
        </fieldset>
        <fieldset>
          <legend>Width</legend>
              <input value={newWidth} onChange={(e)=>{handleWidthChange(e.target.value)}}/>
        </fieldset>
        <fieldset>
          <legend>Bombs</legend>
              <input value={newBombs} onChange={(e)=>{handleBombsChange(e.target.value)}}/>
        </fieldset>
      </div> */
