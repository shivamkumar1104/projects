import logo from './logo.svg';
import './App.css';
import Header from "./Todo_List/Header";
import Todos from  "./Todo_List/Todos";
import Footer from "./Todo_List/Footer";
import AddTodo from "./Todo_List/AddTodo";
import React, { useState, useEffect } from 'react';
import About from "./Todo_List/About"
import "./Todo_List/style.css";

import {
  BrowserRouter as Router,
  Switch,
  Route
  
} from "react-router-dom";

function App() {

  
  let initTodo;
  if(localStorage.getItem("todos") === null){
    initTodo = []; 
  }
  else{
    initTodo = JSON.parse(localStorage.getItem("todos"));
  }
  const onDelete  = (todo) => {
   console.log("i am onDelete of todo",todo);
  

  setTodos(todos.filter ((e) => {
   return e!== todo;

  }));
  console.log("deleted", todos)
  localStorage.setItem("todos", JSON.stringify(todos));

  }
  const addTodo = (title, descr) =>{
    console.log("i am adding this todo",title,descr)
    let sno;
    if(todos.length === 0){
     sno = 0;
   }
   else{  
     sno = todos[todos.length-1].sno + 1;
     }
   
    const myTodo = {
      sno: sno,
      title: title,
      descr: descr,
    }
    setTodos([...todos,myTodo]);
    console.log(myTodo);
  }

  const [todos, setTodos] = useState(initTodo);
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos])

  return (
   <>
   <Router>
    <Header className="header" title="Todos list" searchBar= {true} />
    <Switch>
          <Route exact path="/" render = {() => {
           return(
           <>
           <AddTodo addTodo={addTodo}/>
           <Todos todos ={todos} onDelete={onDelete} />
           </>)
          }}>
            
          </Route>
          <Route exact path="/about">
            <About />
          </Route>
        </Switch>
    <Footer/>
   </Router>
    
   </> 
  );
}

export default App;
