# Mobile App - Field Engineers & Citizens

React Native mobile application for field engineers and citizens.

## Structure

```
mobile-app/
├── src/
│   ├── screens/        # Screen components
│   │   ├── Engineer/   # Engineer-specific screens
│   │   └── Citizen/    # Citizen-specific screens
│   ├── components/    # Reusable components (to be added)
│   ├── config/         # API and Socket configuration
│   ├── store/          # Zustand state management
│   ├── utils/          # Utility functions
│   ├── navigation/     # Navigation setup (to be added)
│   └── App.js          # Main app component
├── android/            # Android native code
├── ios/                # iOS native code
└── package.json
```

## Features

### For Engineers
- Task list and details
- Map view with task locations
- Complaint resolution
- Sensor reading updates
- Real-time notifications

### For Citizens
- Complaint submission
- Bill viewing and payment
- Water supply schedule
- Complaint status tracking

## Running the Application

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Setup

```bash
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## Environment Variables

See `.env.example` for required environment variables.

## Platform Support

- iOS 13+
- Android API 21+ (Android 5.0+)
