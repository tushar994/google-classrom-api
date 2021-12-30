import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { ListenOptions } from "net";

declare const window: any;

interface IProps {
}

interface IState {
  signedIn?: boolean;
  courses?: Array<String>;
  errorText?: String;
}

class App extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      signedIn : false,
      courses : [],
      errorText : "",
    };
  }

  

  loadClientWhenGapiReady = (script : any) => {
    console.log('Trying To Load Client!');
    console.log(script)
    if(script.getAttribute('gapi_processed')){
      console.log('Client is ready! Now you can access gapi. :)');
      // return;
      if(window.location.hostname==='localhost'){
        console.log("in here\n");
        console.log(window.gapi.load('client:auth2', this.afterGapi()))
        
      }
    }
    else{
      console.log('Client wasn\'t ready, trying again in 100ms');
      setTimeout(() => {this.loadClientWhenGapiReady(script)}, 100);
    }
  }
  /**
   * Print the names of the first 10 courses the user has access to. If
   * no courses are found an appropriate message is printed.
   */
   listCourses = () => {
    console.log("reached courses!!")
    window.gapi.client.classroom.courses
      .list({
        pageSize: 10,
      })
      .then( (response) => {
        if(response.result.code == 403){
          this.setState({
            errorText : response.result.message,
          })
          console.log(response.result.message);
        }
        var courses = response.result.courses;
        let courseNames : Array<any> = [];

        if (courses.length > 0) {
          for (var i = 0; i < courses.length; i++) {
            var course = courses[i];
            courseNames.push(course.name);
          }
          // return ["", courseNames];
          // console.log("yesssss");
          this.setState({
            errorText : "",
            courses : courseNames,
          });
        } else {
          // return ["No courses found.", []];
          this.setState({
            errorText : "No courses found.",
            courses : [],
          });
        }
      }, (error) => {
        this.setState({
          errorText : error,
        });
        console.log(error);
      });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
   updateSigninStatus = (isSignedIn : boolean) => {
    if (isSignedIn) {
      this.setState({
        signedIn : true,
      });
      // authorizeButton.style.display = "none";
      // signoutButton.style.display = "block";
      this.listCourses();
      // var value : Array<any> = 
      // this.setState({
      //   errorText: value[0],
      //   courses : value[1],
      // });
    } else {
      this.setState({
        signedIn : false,
      });
      // authorizeButton.style.display = "block";
      // signoutButton.style.display = "none";
    }
  }

  

  afterGapi() {
    window.gapi.client
      .init({
        apiKey: "AIzaSyDywmi_MKWVW68Oi7Mc4vbIQNTKtbz1elc",
        clientId: "117653827535-ghtenp7m08sff64phu7h9r9uo9u87shf.apps.googleusercontent.com",
        // key: "AIzaSyDywmi_MKWVW68Oi7Mc4vbIQNTKtbz1elc",
        discoveryDocs: ["https://classroom.googleapis.com/$discovery/rest"],
        scope: ["https://www.googleapis.com/auth/classroom.coursework.me.readonly","https://www.googleapis.com/auth/classroom.courses"],
      })
      .then(() =>{
        // Listen for sign-in state changes.
        console.log("here")
        // window.gapi.auth2.getAuthInstance().signIn();
        console.log(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);
        
        // Handle the initial sign-in state.
        this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        // authorizeButton.onclick = handleAuthClick;
        // signoutButton.onclick = handleSignoutClick;
      }
      );
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  initClient() {
    const script = document.createElement("script");
    script.onload = () => {
      this.loadClientWhenGapiReady(script);
      console.log("yes")
      
    };
    script.src = "https://apis.google.com/js/client.js";
    document.body.appendChild(script);
  }

  componentDidMount () {
    this.initClient();
  }
  
  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick = () => {
    // window.gapi.auth2.getAuthInstance().signIn();
    window.gapi.auth.authorize(
      {
        apiKey: "AIzaSyDywmi_MKWVW68Oi7Mc4vbIQNTKtbz1elc",
        // clientId: "117653827535-ghtenp7m08sff64phu7h9r9uo9u87shf.apps.googleusercontent.com",
        client_id: "117653827535-ghtenp7m08sff64phu7h9r9uo9u87shf.apps.googleusercontent.com",
        // key: "AIzaSyDywmi_MKWVW68Oi7Mc4vbIQNTKtbz1elc",
        discoveryDocs: ["https://classroom.googleapis.com/$discovery/rest"],
        scope: ["https://www.googleapis.com/auth/classroom.coursework.me.readonly","https://www.googleapis.com/auth/classroom.courses"],
      },
      ).then((authResult : any) => {
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          this.updateSigninStatus(true);
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          this.updateSigninStatus(false);
        }
      });
  }

  /**
   *  Sign out the user upon button click.
   */
  // handleSignoutClick(event) {
  //   gapi.auth2.getAuthInstance().signOut();
  // }

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  // appendPre(message) {
  //   var pre = document.getElementById("content");
  //   var textContent = document.createTextNode(message + "\n");
  //   pre.appendChild(textContent);
  // }

  

  render() {
    var output :any = "";
    if(this.state.signedIn){
      if(this.state.courses==[]){
        output = <p>No courses to show</p>
      }
      else{
        if(this.state.courses != null){
          output = this.state.courses.map((item,index)=>(<li key={index}>{item}</li>))
        }
      }
    }
    return (
      <div className="App">
        
        {this.state.signedIn ? ( <p>signed in</p>
          ) : (
            <button onClick={this.handleAuthClick}>sign in</button>
          )
        }
        {output}
      </div>
    );
  }
}

export default App;