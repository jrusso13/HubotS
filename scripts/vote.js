// Description:
//   Have a voting system with hubot
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   hubot poll <thing1>,<thing2>,<thing3>,etc <time alive in miliseconds> "The max time is 300000 5m"
//   hubot vote <thing1>
//
// Author:
//   Russell Schlup

module.exports = function(robot) {

  // jQuery like .on function
  // this will set a redis variable once loaded
  robot.brain.on('loaded', function() {
    robot.brain.ballots = false
  });

  // match[x] x is what regex section is located
  // i.e.        [0]   [1]   [2]
  robot.respond(/poll (.*?) (\d+)/i, function(msg) {

    // robot.brain.ballots are false by default above
    // if it is false then you can make a poll
    if (!robot.brain.ballots) {
      
      //trims the ballots of white space
      data = msg.match[1].trim()

      // splits the string into an array by it's commas
      ballots = data.split(",")

      // set the ballots to the array created above
      robot.brain.ballots = ballots

      // The regex above (\d+) will only accept digits
      // i.e. 5000min = 5000
      // x = parseInt("10"): x = 10
      time = parseInt(msg.match[2].trim())

      // This makes the max time limit 5 mins
      // 300000 ms = 5 min
      if (time > 300000) {time = 300000}

      // objs Stores the ballots from the for loop below
      objs = {}

      // for ever ballot it will create an object
      for(var i in ballots){
        
        // voteName = {votes:0}
        objs[ballots[i]] = {votes:0}
      
      }

      // stores objs in redis by the name of votes
      robot.brain.votes = objs

      // Timer for the votes
      // setTimeout(function(){}, runTime)
      setTimeout(function(){

        // The release message
        msg.send("# ----- The Ballots are");

        // votes function requires msg
        votes(msg, robot.brain.votes)

        // This sets the ballots to false
        // so people can make a new poll
        robot.brain.ballots = false

      }, time)

    // 
    } else {

      // If ballots is not set to false
      msg.send("A vote is currently goin on");

    }
  });

  // This respond is another call for voting
  robot.respond(/vote (.*)/i, function(msg) {

    // if there are ballots and they are not blank
    if (!!robot.brain.ballots) {

      // global check variable
      check = false

      // what the user voted for
      vote = msg.match[1].trim()

      // pulls the ballots back down from redis
      ballots = robot.brain.ballots

      for(var i in ballots){

        // If what you voted for exists
        if(ballots[i]===vote){
          // set check to true
          check = true
        }

      }

      // if the check above passed
      if(check){

        // vote what you voted for
        // robot.brain.votes.ballotVoted.votes += 1
        robot.brain.votes[vote].votes++

        // feedback on what you voted for
        msg.send("You voted for "+vote);

      }else{

        // if the check fails it is not a real ballot
        msg.send("That is not a ballot");

      }

    }else{

      // feedback for if you try and vote but there is
      // nothing to vote for.
      msg.send("There is no poll going on currently");

    }
  })
};


function votes(msg,votes){

  // for every vote
  for(var key in votes){
  
    // send it's name with it's message
    msg.send(key+': '+votes[key].votes)
  
  }

}
//hubot poll there,here 10000