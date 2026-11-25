# When Expo Releases a new SDK version that breaks older versions

After Expo released SDK 58, older projects that were built on SDK 57 could no longer launch on mobile phones.  The solution was to upgrade both the Expo SDK and all of the dependencies in the project.  These were the commands that were used:

`npm install expo^__.0.0`
- Where __ is the major SDK version number

Next, you'll need to delete the project's old `node_modules` folder and `package-lock.json` file.

Then, use this command to upgrade the dependencies:

`npx expo install --fix`

[Expo also recommends using a different app to ensure your dependencies work](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/#upgrade-dependencies) although we found this wasn't necessary:

`npx expo-doctor`