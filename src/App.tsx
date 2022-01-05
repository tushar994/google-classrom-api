import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { ListenOptions } from "net";

declare const window: any;

const API_KEY = process.env.REACT_APP_API_KEY;
const CLIENT_ID = process.env.REACT_APP_CLIENT_KEY;

interface IProps {}

interface IState {
  loaded ?: boolean;
  signedIn?: boolean;
  courses?: Array<String>;
  errorText?: String;
  coursesWithWork ?: { [key: string] : Array<string> };
}

class App extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loaded: false,
      signedIn: false,
      courses: [],
      errorText: "",
      coursesWithWork : {},
    };
  }

  /**
   *  loads the gapi client library when its ready to be loaded.
   */

  loadClientWhenGapiReady = (script: any) => {
    if (script.getAttribute("gapi_processed")) {
      if (window.location.hostname === "localhost") {
        window.gapi.load("client:auth2", this.afterGapi())
      }
    } else {
      console.log("Gapi client wasn't ready, trying again in 100ms");
      setTimeout(() => {
        this.loadClientWhenGapiReady(script);
      }, 100);
    }
  };
  /**
   * Print the names of the first 10 courses the user has access to. If
   * no courses are found an appropriate message is printed.
   */
  listCourses =  () => {
    this.setState({
      loaded:false,
      errorText:"",
    })
    window.gapi.client.classroom.courses
      .list({
        pageSize: 10,
      })
      .then(
        async (response) => {
          if (response.result.code == 403) {
            this.setState({
              errorText: response.result.message,
            });
          }
          var courses = response.result.courses;
          let courseNames: Array<any> = [];
          let coursesWithWork : {[key: string] : Array<string> } = {};
          if (courses.length > 0) {
            for (var i = 0; i < courses.length; i++) {
              var course = courses[i];
              coursesWithWork[course.name] = [];

              await window.gapi.client.classroom.courses.courseWork.list({courseId: course.id, pageSize : 10}).then((response2)=>{
                if (response.result.code == 403) {
                  this.setState({
                    errorText: response.result.message,
                  });
                }
                else{
                  var courseWork = response2.result.courseWork;
                  if(courseWork != null){
                    for (var i = 0; i < courseWork.length; i++) {
                      coursesWithWork[course.name].push(courseWork[i].title);
                    }
                  }
                }
              })
              courseNames.push(course.name);
            }

            this.setState({
              loaded:true,
              coursesWithWork:coursesWithWork,
            })
            
          } else {
            this.setState({
              errorText: "No courses found.",
              courses: [],
            });
          }
        },
        (error) => {
          this.setState({
            errorText: error,
          });
        }
      );
  };

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSigninStatus = (isSignedIn: boolean) => {
    if (isSignedIn) {
      this.setState({
        signedIn: true,
      });

      this.listCourses();
    } else {
      this.setState({
        signedIn: false,
      });
    }
  };

  /**
   *  After the gapi client library is ready, we initialise the api
   */

  afterGapi() {
    window.gapi.client
      .init({
        apiKey: API_KEY,
        clientId:
          CLIENT_ID,
        discoveryDocs: ["https://classroom.googleapis.com/$discovery/rest"],
        scope: [
          "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
          "https://www.googleapis.com/auth/classroom.courses",
          "https://www.googleapis.com/auth/classroom.coursework.me",
          "https://www.googleapis.com/auth/classroom.coursework.students"
        ],
      })
      .then(() => {
        // Listen for sign-in state changes.
        window.gapi.auth2.getAuthInstance().isSignedIn.get();
        window.gapi.auth2
          .getAuthInstance()
          .isSignedIn.listen(this.updateSigninStatus);

        // Handle the initial sign-in state.
        this.updateSigninStatus(
          window.gapi.auth2.getAuthInstance().isSignedIn.get()
        );
      });
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  initClient() {
    const script = document.createElement("script");
    script.onload = () => {
      this.loadClientWhenGapiReady(script);
      this.setState({
        loaded: true,
      });
    };
    script.src = "https://apis.google.com/js/client.js";
    document.body.appendChild(script);
  }

  componentDidMount() {
    this.initClient();
    
  }

  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick = () => {
    window.gapi.auth
      .authorize({
        apiKey: API_KEY,
        client_id:
          CLIENT_ID,
        discoveryDocs: ["https://classroom.googleapis.com/$discovery/rest"],
        scope: [
          "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
          "https://www.googleapis.com/auth/classroom.courses",
          "https://www.googleapis.com/auth/classroom.coursework.me",
          "https://www.googleapis.com/auth/classroom.coursework.students"
        ],
      })
      .then((authResult: any) => {
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          this.updateSigninStatus(true);
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          this.updateSigninStatus(false);
        }
      });
  };

  render() {
    var output: any = "";

    if(!this.state.loaded){
      return ( <p>loading</p>);
    }

    if (this.state.signedIn) {
      if(this.state.courses == []){
        output = <p>No courses to display</p>;
      }
      else {
        if (this.state.coursesWithWork != null) {
          output = [];
          var index : number = 0;
          Object.keys(this.state.coursesWithWork).map((key) => {
            output.push(<h3>Course is </h3>)
            output.push(<li key={index} style={{color: "blue"}}>{key}</li>);
            var out : any = [];
            index +=1;
            if (this.state.coursesWithWork != null && this.state.coursesWithWork[key].length!=0) {

              output.push(<h4>CourseWork for above course is</h4>)
              out = this.state.coursesWithWork[key].map((item2,index2) => {
                output.push(<li key={index} style={{color: "red"}}>{item2}</li>)
                index+=1;
              });
            }
          })
          output.unshift(<h2>Your Classes are</h2>);
        }
      }
    }
    return (
      <div className="App">
        <script src="https://apis.google.com/js/platform.js?onload=init" async defer></script>
        {this.state.signedIn ? (
          <p>signed in</p>
        ) : (
          <button onClick={this.handleAuthClick}>sign in</button>
        )}

        {output}
        {this.state.errorText}
      </div>
    );
  }
}

export default App;
