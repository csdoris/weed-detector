# Weed Detector

This is a mobile app to simulate a IoT solution for detecting weed seedlings in a farm.

The user can either take a photo of a seedling, or select a photo from the mobile, and then upload it for classification.

The photo will be sent to Microsoft Azure cloud and classified into either crop or weed, based on a pre-trained machine learning algorithm for classifying images by using the Azure Custom Vision service.

The app will then alert the farmer immediately if a weed is detected so that immediate actions can be taken.