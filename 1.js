const fs=require('fs');
const Mysql=require('mysql-pro');

const db=new Mysql({
  mysql: {
    host: 'localhost',
    port: 3309,
    user: 'root',
    password: '',
    database: 'zhihu'
  }
});


const arr=JSON.parse(fs.readFileSync('.topics').toString());

let topics={}, topic_ID=1;
let authors={}, author_ID=1;
let questions={}, question_ID=1;
let answers={}, answer_ID=1;

arr.forEach(question=>{
  //topic
  question.topics=question.topices.map(json=>{
    let {title}=json;
    title=title.replace(/^\s+|\s+$/g, '');

    if(!topics[title]){
      topics[title]=topic_ID++;
    }

    return topics[title];
  }).join(',');

  //author
  [question.bestAnswer.author, ...question.answers.map(answer=>answer.author)].forEach((author,index)=>{
    let old_id=author.id;
    if(!authors[old_id]){
      authors[author.id]=author;
      author.id=question_ID++;
    }

    if(index==0){
      delete question.bestAnswer.author;
      question.bestAnswer.author_ID=author.id;
    }else{
      delete question.answers[index-1].author;
      question.answers[index-1].author_ID=author.id;
    }

    return authors[old_id];
  });

  //question
  let ID=question_ID;
  questions[question_ID++]=question;

  //answers
  [question.bestAnswer, ...question.answers].forEach(answer=>{
    answer.id=answer_ID;
    answer.question_ID=ID;
    answers[answer_ID++]=answer;
  });
});

(async()=>{
  function dataJoin(...args){
    return "('"+args.map(item=>{
      item=item||'';
      item=item.toString().replace(/'/g, '\\\'');

      return item;
    }).join("','")+"')";
  }

  //topics
  let aTopics=[];
  for(let title in topics){
    let ID=topics[title];

    aTopics.push(dataJoin(ID, title));
  }
  let topic_sql=`INSERT INTO topic_table VALUES${aTopics.join(',')}`;

  //authors
  let aAuthors=[];
  for(let id in authors){
    let author=authors[id];

    aAuthors.push(dataJoin(author.id, author.type, author.name, author.gender, author.userType, author.img_url, author.headline, author.followerCount));
  }
  let author_sql=`INSERT INTO author_table VALUES${aAuthors.join(',')}`;

  //questions
  let aQuestions=[];
  for(let ID in questions){
    let question=questions[ID];

    aQuestions.push(dataJoin(question.ID, question.title, question.question_content, question.topics, question.attention_count, question.view_count, question.bestAnswer.id));
  }
  let question_sql=`INSERT INTO question_table VALUES${aQuestions.join(',')}`;

  //answers
  let aAnswers=[];
  for(let ID in answers){
    let answer=answers[ID];

    aAnswers.push(dataJoin(ID, answer.question_ID, answer.author_ID, answer.content, answer.createdTime));
  }
  let answer_sql=`INSERT INTO answer_table VALUES${aAnswers.join(',')}`;

  //topic_sql
  await db.startTransaction();
  await db.executeTransaction(topic_sql);
  await db.executeTransaction(author_sql);
  await db.executeTransaction(question_sql);
  await db.executeTransaction(answer_sql);
  await db.stopTransaction();

  console.log('完成');
})();
