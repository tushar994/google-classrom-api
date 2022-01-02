# What is this?

This is a simple app that uses the google classroom api to authenticate your account and then show you all the classrooms you are a part of.

# How to run

You can clone the repository by running


Make sure you have yarn installed. If not, you can install it using npm

```shell
npm install -g yarn
```

Next, simply run

```shell
yarn install
yarn start
```
**You will also need to either have your own API_KEY and CLIENT_ID, or can mail the email given below for it**


### If using your own API key and CLIENT ID
You will need to add your own .env file to this repository, in the `google-classroom-api` folder (root folder of the repository). The file should look like this -
```
REACT_APP_API_KEY=<Your API key>
REACT_APP_CLIENT_KEY=<Your client ID>

```


And the application will run on port 3000.

**Note that the version of yarn that is being used is 1.22.15. If there are any issues running this application with yarn, try using that version of yarn. Also make sure your version for node is updated to atleast 15. You can check your node version by running `node -v`.**


**Note that to use the application with your own email using my api key and client id, you will have to be added to the project as a testing user, so please mail `tkumar994@gmail.com`, asking to be added as a testing user to the app. after being added, you will be able to log in.**
