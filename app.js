require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

async function main () {
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
   }
   
   try {
    // await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", connectionOptions);
    await mongoose.connect('mongodb://127.0.0.1:27017/InternQuizDB', connectionOptions);
    console.log(`Connected to MongoDB`)
   } catch (err) {
    console.log(`Couldn't connect: ${err}`)
   }
}

main();


const questionsSchema = new mongoose.Schema({
  Ques: {
    type: String,
    unique: false
  },
  Options: [String],
  RightAns: String,

})

const quizSchema = new mongoose.Schema({
  Title: {
    type: String,
    unique: true
  },
  StartDate: {
    time: String,
    date: String
  },
  EndDate: {
    time: String,
    date: String
  },
  questions : [questionsSchema]
})

const Quiz = mongoose.model('Quizzes', quizSchema);
const Question = mongoose.model('Questions', questionsSchema);


async function findI(Id)
{
  try {
    const res = await Post.findOne({ _id: Id });
    return res;
  }
  catch (err)
  {
    console.log(err);
    redirect('/');
  }
}

async function findN(postName)
{
  try {
    const res = await Post.findOne({ PostTitle: postName });
    return res;
  }
  catch (err)
  {
    console.log(err);
    redirect('/');
  }
}

async function find(SchemaName)
{
  try {
    // let today = new Date().toLocaleString('EN-US', { timeZone: 'Asia/Kolkata' })
    // let date = new Date();
    let today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    
    const date= yyyy + '-' + mm + '-'+dd ;
    console.log(date);
    const res = await SchemaName.find({ "$and": [{ "StartDate.date": { $lte: date } } ,{"EndDate.date": { $gte: date } } ]});
    return res;
  } catch (err)
  {
    return(err);
  }
}
async function findO(quiz)
{
  try {
    const res = await Quiz.findOne({ Title: quiz.Title });
    if (res==null)
    {
      const res = await Quiz.create(quiz);
      if (res.modifiedCount !== 0)
        console.log(`Added Successfully in ${quiz.Title}`);
      return res;
    }
    else
    {
      return res;
    }
  }
  catch (err)
  {
    console.log(err);
  }
}
let response = [];

app.get('/', function (req, res)
{
  Quiz.find().then(result => {
    res.render("home", { Page: 'Home',Content: homeStartingContent, Quizzes : result, flag: 1});
    }).catch((err) => { console.log(err) });
})
app.get('/contact', function (req, res)
{
  res.render('contact', { Content: contactContent });
})
app.get('/about', function (req, res)
{
  res.render('about', { Content: aboutContent });
})
app.get('/create', function (req, res)
{
  res.render('compose', {flag:1});
})


//Confirm
app.post('/quizzes', function (req, res) { 

  const StartDate = {
    time: req.body.StartTime,
    date: req.body.StartDate
  }
  const EndDate = {
    time: req.body.EndTime,
    date: req.body.EndDate
  }
  const Title = _.capitalize(req.body.Title);
  console.log(StartDate, EndDate);
  const quiz = new Quiz({
    Title: Title,
    StartDate: StartDate,
    EndDate:EndDate
  })

  findO(quiz).then(result => {
    result.save();
    setTimeout(function () {
      res.redirect('/'+Title);
    }, 200);
  });
  }
)
app.post('/', function (req, res) { 
  const ques = req.body.ques;
  let Options = [];
  const Title = _.capitalize(req.body.Title);
  console.log(Title);
  Options.push( req.body.Option1);
  Options.push(req.body.Option2 );
  Options.push( req.body.Option3 );
  Options.push(req.body.Option4 );
  const RightAns = req.body.RightAns;

  const question = new Question ({
    Ques : ques,
    Options: Options,
    RightAns: RightAns,
  })
  question.save();
  Quiz.findOne({ Title: Title }).then(result => {
    console.log(result);
    result.questions.push(question);
    result.save();
  });

  if (req.body.btnMsg2 !== 'Publish') {
      setTimeout(function () {
        res.redirect('/'+Title);
      }, 200);
  }
  else {
      setTimeout(function () {
        res.redirect('/');
      }, 200);
  }
}
)
app.get('/:Title', function (req, res) {

  const Title = _.capitalize(req.params.Title);
  console.log('Hi 1', Title);
  res.render("compose", { Title: Title, flag: 0 });

});


app.get('/quizzes/active', function (req, res)
{
  find(Quiz).then(result => { 
    console.log(result);
    res.render("home", { Page: 'Live Quizzes',Content: contactContent, Quizzes : result, flag: 1});
  });
})
app.post('/failure', function (req, res)
{
    res.redirect("/");
})

app.get('/quizzes/active/:Title', function (req, res)
{
  const Title = _.capitalize(req.params.Title);
  Quiz.findOne({ Title: Title }).then(result => {
    res.render('post', { Quiz:result});
    // res.render('quiz', { Title: result.Title, Question: result.questions[0], Options: result.questions[0].Options, i:0});
  });
})

// app.post(':Title/:i', function (req, res) {
//   response.push(req.body.btn)
//   res.render('quiz', { Title: result.Title, Question: result.questions[i], Options: result.questions[i].Options, i:i});
// })

app.get('/quizes/:Id', function (req, res) {
  const Id = _.capitalize(req.params.Id);
  findI(Id).then(result => {
    const _id = _.capitalize(result._id);
    if (Id == _id)
      res.render('post', { Post: result });
    else
      res.redirect('/');
  })
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
