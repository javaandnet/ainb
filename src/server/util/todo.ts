export type Todo = {
    id: string
    title: string
    done: boolean
  }
  
  const todos: Todo[] = []
  
  export const getTodos = () => {
    return todos
  }
  
  export const addTodo = (todo: { id: string, title: string }) => {
    todos.push({
      ...todo,
      done: false
    });
  }
  
  export const editTodo = (todo: Todo) => {
    const index = todos.indexOf(todo)
    // replace todo
    todos.splice(index, 1, todo)
  
    return todos
  }
  
  export const removeTodo = (params: {
    id: string
  }) => {
  
    const index = todos.findIndex((todo) => todo.id === params.id)
    todos.splice(index, 1)
  
    return todos
  }