import React, { useState } from 'react'
const AddTodo = ({addTodo}) => {
  const [title, setTitle] = useState("");
  const [descr, setDescr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if(!title || !descr){
      alert("Titile and Descr cannot be blank.")
    }
    else{
      addTodo(title, descr);
      setTitle("");
      setDescr("");
    }
 
  }

  
  return (
    <div className="container my-3">
        <h3>Add a TodoList</h3>
      <form onSubmit = {submit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Todo Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            id="title"
            aria-describedby="emailHelp"
          />
          
        </div>
        <div className="mb-3">
          <label htmlFor="descr" className="form-label">
           Description
          </label>
          <input
            type="text"
            value={descr}
            onChange={(e) => setDescr(e.target.value)}
            className="form-control"
            id="descr"
          />
        </div>
      
        <button type="submit" className="btn btn-sm btn-success">
          Add todo
        </button>
      </form>
    </div>
  );
};

export default AddTodo;
