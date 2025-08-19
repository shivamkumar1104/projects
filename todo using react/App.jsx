import React , { useState, useEffect }from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Todos from  "./Todos";
import Footer from "./Footer";
import AddTodo from "./AddTodo";
import About from "./About";
import "./style.css";


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
    <Routes>
  <Route path="/" element={
    <>
      <AddTodo addTodo={addTodo} />
      <Todos todos={todos} onDelete={onDelete} />
    </>
  } />
  <Route path="/about" element={<About />} />
</Routes>
    <Footer/>
   </Router>
    
   </> 
  );
}


export default App;
