import React from 'react'
import Todo from  "./Todo";
const Todos = (props) => {
  let mystyle = {
    minHeight: "70vh",
    margin: "50px auto",
    
    
    
  }   
  return (
    <div className="container" style={mystyle}>
      <h3 className=" my-3">My Todos List</h3>
      {props.todos.length===0? "no todos to display":
      props.todos.map((todo) => {
        console.log(todo.sno);
        return( <Todo todo={todo} key = {todo.sno} onDelete={props.onDelete}/>
           
        )
      
      }
      )}
        
  
      
      
    </div>
  )
}

export default Todos
