import React from 'react'

const Todo = ({todo, onDelete}) => {
  return (
    <>
    <div>
     <h4>{todo.title}</h4>
     <p>{todo.descr}</p>
     <button className="btn btn-sm btn-danger" onClick={() => {onDelete(todo)}}>Delete</button>
    </div>
    <hr/>
    </>
  )
}

export default Todo
