let express = require("express");
let DB = null;
let app = express();
app.use(express.json());
let isValid = require("date-fns/isValid");
let format = require("date-fns/format");
module.exports = app;
let sqlite3 = require("sqlite3");
let { open } = require("sqlite");
let path = require("path");
let DBpath = path.join(__dirname, "todoApplication.db");
let initializing = async () => {
  try {
    DB = await open({
      filename: DBpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running Properly");
    });
  } catch (e) {
    console.log("error Message");
    process.exit(1);
  }
};
initializing();
var categoryAndStatus = (requestObject) => {
  let { category, status } = requestObject;
  if (category !== undefined && status !== undefined) {
    return true;
  } else {
    return false;
  }
};
var categoryAndPriority = (requestObject) => {
  let { category, priority } = requestObject;
  if (category !== undefined && priority !== undefined) {
    return true;
  } else {
    return false;
  }
};
var category = (requestObject) => {
  console.log("Loose");
  let { category } = requestObject;
  if (
    category !== undefined &&
    (category === "WORK" || category === "HOME" || category === "LEARNING")
  ) {
    return true;
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

var hasTodo = (requestObject) => {
  let { todo } = requestObject;
  if (todo !== undefined) {
    return true;
  }
};

var hasPriority = (requestObject) => {
  let { priority } = requestObject;
  if (
    priority !== undefined &&
    (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
  ) {
    return true;
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};
var hasStatus = (requestObject) => {
  let { status } = requestObject;
  console.log(status);
  if (
    status !== undefined &&
    (status === "TO DO" || status == "IN PROGRESS" || status === "DONE")
  ) {
    return true;
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};
var hasStatusAndPriority = (requestObject) => {
  let { status, priority } = requestObject;
  if (status !== undefined && priority !== undefined) {
    return true;
  } else {
    return false;
  }
};
app.get("/todos/", async (request, response) => {
  let {
    priority = "",
    category = "",
    due_date = "",
    search_q = "",
    status = "",
  } = request.query;
  console.log(search_q);
  let data = "";
  let finalresult = null;
  switch (true) {
    case categoryAndStatus(request.query):
      data = `select * from
           todo where category
            like "${category}" and status like "${status}";`;
      break;
    case categoryAndPriority(request.query):
      data = `select * from todo where category like "${category}"
                and priority like "${priority}";`;
      break;
    case category(request.query):
      console.log("win");
      data = `select * from todo where category like "${category}";`;
      break;

    case hasStatusAndPriority(request.query):
      data = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND todo.status like '${status}'
    AND todo.priority like '${priority}';`;
      break;
    case hasPriority(request.query):
      data = `
           select 
           *
           from 
           todo 
          where todo.priority like "${priority}" ;  
             `;
      break;
    case hasStatus(request.query):
      data = `
             select 
                *
              from 
              todo 
              where 
            status like "${status}";   
               `;
      break;

    default:
      console.log(search_q);
      data = `select 
                        *
                      from 
                     todo 
                    where 
                todo 
                like "%${search_q}%" ; `;
      break;
  }

  finalresult = await DB.all(data);
  response.send(finalresult);
});

app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let data = `select * from todo where todo.id=${todoId}`;
  let finalresult = await DB.get(data);
  response.send(finalresult);
});
app.get("/agenda/", async (request, response) => {
  let { date } = request.query;
  let formatDate = format(date, "yyyy-MM-dd");
  console.log(formatDate);
  if (isValid(formatDate)) {
    let data = `select * from todo where due_date=${date}`;
    let finalresult = await DB.get(data);
    response.send(finalresult);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;
  let formatDate = format(dueDate, "yyyy-MM-dd");
  console.log(formatDate);
  if (isValid(formatDate)) {
    let data = `insert into todo (id,todo,priority,status,category,due_date)
    values
    (${id},"${todo}","${priority}","${status}","${category}",${dueDate});`;
    let finalresult = await DB.run(data);
    response.send("Todo Successfully Added");
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  let {
    status = "",
    priority = "",
    todo = "",
    dueDate = "",
    category = "",
  } = request.body;
  let { todoId } = request.params;
  let data = "";
  let finalresult = "";
  switch (true) {
    case hasStatus(request.body):
      data = `update todo
            set status ="${status}"
            where id= ${todoId};`;
      finalresult = await DB.run(data);
      response.send("Status Updated");
      break;
    case hasPriority(request.body):
      data = `update todo
            set priority ="${priority}"
            where id =${todoId};`;
      finalresult = await DB.run(data);
      response.send("Priority Updated");
      break;

    case hasTodo(request.body):
      data = `update todo
            set todo ="${todo}"
            where id =${todoId};`;
      finalresult = await DB.run(data);
      response.send("Todo Updated");
      break;
    case category(request.body):
      console.log("ravi");
      data = ` update todo set category ="${category}" where id=${todoId};`;
      finalresult = await DB.run(data);
      response.send("Category Updated");
      break;
    default:
      let { dueDate } = request.body;
      let formatDate = format(dueDate, "yyyy-MM-dd");
      if (isValid(formatDate)) {
        let data = `update todo set due_date=${dueDate} where id=${todoId};`;
        let finalresult = await DB.run(data);
        response.send(finalresult);
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let data = `delete from todo where todo.id=${todoId}`;
  let finalresult = await DB.run(data);
  response.send("Todo Deleted");
});
