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
}

class App extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loaded: false,
      signedIn: false,
      courses: [],
      errorText: "",
    };
  }

  /**
   *  loads the gapi client library when its ready to be loaded.
   */

  loadClientWhenGapiReady = (script: any) => {
    console.log("Trying To Load Client!");
    console.log(script);
    if (script.getAttribute("gapi_processed")) {
      console.log("Client is ready! Now you can access gapi. :)");
      if (window.location.hostname === "localhost") {
        console.log("in here\n");
        console.log(window.gapi.load("client:auth2", this.afterGapi()));
      }
    } else {
      console.log("Client wasn't ready, trying again in 100ms");
      setTimeout(() => {
        this.loadClientWhenGapiReady(script);
      }, 100);
    }
  };
  /**
   * Print the names of the first 10 courses the user has access to. If
   * no courses are found an appropriate message is printed.
   */
  listCourses = () => {
    console.log("reached courses!!");
    window.gapi.client.classroom.courses
      .list({
        pageSize: 10,
      })
      .then(
        (response) => {
          if (response.result.code == 403) {
            this.setState({
              errorText: response.result.message,
            });
            console.log(response.result.message);
          }
          var courses = response.result.courses;
          let courseNames: Array<any> = [];

          if (courses.length > 0) {
            for (var i = 0; i < courses.length; i++) {
              var course = courses[i];
              courseNames.push(course.name);
            }
            this.setState({
              errorText: "",
              courses: courseNames,
            });
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
          console.log(error);
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
        ],
      })
      .then(() => {
        // Listen for sign-in state changes.
        console.log("here");
        // window.gapi.auth2.getAuthInstance().signIn();
        console.log(window.gapi.auth2.getAuthInstance().isSignedIn.get());
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
      console.log("yes");
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
      if (this.state.courses == []) {
        output = <p>No courses to show</p>;
      } else {
        if (this.state.courses != null) {
          output = this.state.courses.map((item, index) => (
            <li key={index}>{item}</li>
          ));
          console.log(output);
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
      </div>
    );
  }
}

export default App;
