tasks = []

def addTask():
    task = ("Enter the task: ")
    task.append(task)
    print("Task '{task}' added to the list. ")
    
    def listTask():
      if not task:
          print("There is no task now")
    
    def deleteTask():
        ListTasks()
        try:
            taskDelete = int(input("Enter the # to delete: "))
            if  taskDelete >= 0 and taskDelete <  len(task):
                task.pop(taskDelete)
                print("Task '{taskDelete}' has been removed")
            else:
                print("Task #{taskDelete} was not found")
        except:
            print("Invalid input")
if __name__ == "__main__":
    # loop to run the application
 print("Welcome to the to-do-list app :")
 while True:
     print("\n")
     print("Please select one of the following tasks")
     print("----------------------------------------")
     print('1.Add a new task')
     print('2.Delete a task')
     print('3.List a task')
     print('4.Quit')
     
     choice = input("Enter your choice: ")
     
     if(choice == "1"):
         addTask()
     elif(choice == "2"):
         deleteTask()
     elif(choice == "3"):
         listTask()
     elif(choice == "4"):
         break
     else:
         print("Invalid input. Please try again.")
             
         
